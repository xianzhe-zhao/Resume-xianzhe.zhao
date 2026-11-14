/* 简历系统服务端 —— 纯 Node.js，无第三方依赖
   启动：node server.js   （默认端口 3000，可用 PORT 环境变量修改）
   管理密码：必须设置环境变量 ADMIN_PASSWORD，禁止使用默认密码 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

// 读取 .env 文件（如果存在）
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8').split('\n').forEach(function (line) {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    var eq = line.indexOf('=');
    if (eq > 0) {
      var key = line.substring(0, eq).trim();
      var val = line.substring(eq + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  });
}

const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '127.0.0.1'; // 默认只监听本地，通过反向代理暴露
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const DATA_FILE = path.join(__dirname, 'data', 'resume.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

// 安全检查：必须设置强密码
if (!ADMIN_PASSWORD || ADMIN_PASSWORD === 'admin123') {
  console.error('[FATAL] 必须设置环境变量 ADMIN_PASSWORD，且不能为默认密码 admin123');
  console.error('  启动方式: ADMIN_PASSWORD=你的强密码 node server.js');
  process.exit(1);
}

const VERSIONS = ['ai', 'it', 'test', 'erp'];
const DEFAULT_VERSION = 'ai';

const sessions = {}; // 内存会话，重启失效
const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 小时过期
const MAX_BODY_SIZE = 1024 * 1024; // 1MB 请求体限制
const loginAttempts = {}; // IP 登录尝试记录
const LOGIN_MAX_ATTEMPTS = 5; // 5 次失败后锁定
const LOGIN_LOCK_TIME = 15 * 60 * 1000; // 锁定 15 分钟
const LOGIN_ATTEMPTS_MAX_KEYS = 10000; // 防 XFF 伪造导致的内存膨胀上限

// 安全响应头（所有响应统一添加）
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// 数据校验：保存时验证 JSON 结构
function validateResumeData(data) {
  if (!data || typeof data !== 'object') return '数据必须是对象';
  if (!data.base || typeof data.base !== 'object') return '缺少 base 字段';
  if (!data.versions || typeof data.versions !== 'object') return '缺少 versions 字段';
  // 检查每个版本的结构
  for (const key of Object.keys(data.versions)) {
    const v = data.versions[key];
    if (!v || typeof v !== 'object') return '版本 ' + key + ' 格式错误';
  }
  // 检查 base 中必要字段
  if (!data.base.name || typeof data.base.name !== 'string') return '缺少姓名';
  // 检查字段值中不含危险内容（防存储型 XSS，纵深防御：黑名单 + 前端 esc 双保险）
  function checkString(obj, path) {
    if (typeof obj === 'string') {
      const dangerous = ['</script', '<script', '<iframe', '<object', '<embed', 'javascript:'];
      for (const d of dangerous) {
        if (obj.includes(d)) {
          return '字段 ' + path + ' 包含不允许的内容（' + d + '）';
        }
      }
    } else if (obj && typeof obj === 'object') {
      for (const key of Object.keys(obj)) {
        const result = checkString(obj[key], path + '.' + key);
        if (result) return result;
      }
    }
    return null;
  }
  return checkString(data, 'root');
}

// HTML 转义：防止 XSS
function escapeForScript(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/'/g, '\\u0027')
    .replace(/"/g, '\\u0022');
}

/* ---------- 工具 ---------- */
function loadData() { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
function saveData(data) {
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, DATA_FILE); // 原子写
}
function getSession(req) {
  const cookie = req.headers.cookie || '';
  const m = cookie.match(/resume_session=([^;]+)/);
  return m && sessions[m[1]] ? m[1] : null;
}
function sendJSON(res, code, obj, headers) {
  const h = Object.assign({}, SECURITY_HEADERS, { 'Content-Type': 'application/json; charset=utf-8' }, headers || {});
  res.writeHead(code, h);
  res.end(JSON.stringify(obj));
}
function readBody(req) {
  return new Promise(function (resolve, reject) {
    const chunks = []; // 以 Buffer 收集，最后统一解码，防止多字节 UTF-8 跨块损坏
    let size = 0;
    req.on('data', function (c) {
      size += c.length;
      if (size > MAX_BODY_SIZE) {
        reject(new Error('请求体过大（限 1MB）'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', function () { resolve(Buffer.concat(chunks).toString('utf8')); });
    req.on('error', function (e) { reject(e); });
  });
}

// 获取客户端 IP（支持反向代理）
// 注意取值顺序与 XFF 解析方向：
//   - cf-connecting-ip 由 Cloudflare 边缘强制覆盖，客户端无法伪造（优先）
//   - X-Forwarded-For 链中客户端可伪造前段，真实 IP 在末段，取 LAST 而非 FIRST
function getClientIP(req) {
  const cf = req.headers['cf-connecting-ip'];
  if (cf) return String(cf).trim();
  const xff = req.headers['x-forwarded-for'];
  if (xff) {
    const parts = String(xff).split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    if (parts.length) return parts[parts.length - 1]; // 末段 = 最近一跳追加的真实 IP
  }
  const real = req.headers['x-real-ip'];
  if (real) return String(real).trim();
  return (req.connection && req.connection.remoteAddress) || 'unknown';
}

// 检查登录限流
function checkLoginRate(ip) {
  const now = Date.now();
  if (!loginAttempts[ip]) loginAttempts[ip] = { count: 0, lockUntil: 0 };
  const record = loginAttempts[ip];
  
  // 解锁过期
  if (record.lockUntil && now > record.lockUntil) {
    record.count = 0;
    record.lockUntil = 0;
  }
  
  // 检查是否锁定
  if (record.lockUntil && now < record.lockUntil) {
    return false; // 仍被锁定
  }
  
  return true;
}

// 清理过期会话（每小时执行一次）；顺带清理登录尝试记录，防伪造 IP 无限堆积
const ATTEMPT_TTL = 24 * 60 * 60 * 1000; // 失败记录 24 小时后过期
function cleanExpiredSessions() {
  const now = Date.now();
  let cleaned = 0;
  for (const token in sessions) {
    if (now - sessions[token] > SESSION_TTL) {
      delete sessions[token];
      cleaned++;
    }
  }
  if (cleaned > 0) console.log('[SESSION] 清理过期会话 ' + cleaned + ' 个');
  let cleanedAttempts = 0;
  for (const ip in loginAttempts) {
    const r = loginAttempts[ip];
    const expired = (r.lockUntil && now > r.lockUntil) || (now - (r.lastFail || 0) > ATTEMPT_TTL);
    if (expired) { delete loginAttempts[ip]; cleanedAttempts++; }
  }
  if (cleanedAttempts > 0) console.log('[SECURITY] 清理过期登录尝试记录 ' + cleanedAttempts + ' 条');
}
setInterval(cleanExpiredSessions, 60 * 60 * 1000);

// 记录登录失败
function recordLoginFailure(ip) {
  if (!loginAttempts[ip]) loginAttempts[ip] = { count: 0, lockUntil: 0, lastFail: 0 };
  loginAttempts[ip].count++;
  loginAttempts[ip].lastFail = Date.now();
  // 硬上限：防伪造 IP 伪装出无限计数桶（极端情况下整体重置，牺牲计数保可用性）
  if (Object.keys(loginAttempts).length > LOGIN_ATTEMPTS_MAX_KEYS) {
    console.warn('[SECURITY] 登录尝试记录超上限，整体重置');
    for (const k in loginAttempts) delete loginAttempts[k];
  }
  if (loginAttempts[ip].count >= LOGIN_MAX_ATTEMPTS) {
    loginAttempts[ip].lockUntil = Date.now() + LOGIN_LOCK_TIME;
    console.warn('[SECURITY] IP ' + ip + ' 登录失败 ' + LOGIN_MAX_ATTEMPTS + ' 次，锁定 15 分钟');
  }
}
// 安全静态文件服务：严格路径校验
function safeStatic(p) {
  try {
    // 解码 URL 编码，防止 %2e%2e 绕过；畸形编码（如 %ZZ）抛 URIError 时按 404 处理
    const decoded = decodeURIComponent(p);
    // 规范化路径，解析所有 .. 和 .
    const normalized = path.normalize(decoded);
    // 构建完整路径
    const fp = path.resolve(PUBLIC_DIR, '.' + normalized);
    // 严格检查：必须在 PUBLIC_DIR 内
    if (!fp.startsWith(PUBLIC_DIR + path.sep) && fp !== PUBLIC_DIR) {
      return null;
    }
    // 检查文件是否存在且是文件
    const stat = fs.statSync(fp);
    return stat.isFile() ? fp : null;
  } catch (e) {
    return null; // 畸形 URL / 不存在的路径统一 404
  }
}
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };

/* ---------- 启动时解压 vendored 库（.gz -> .js） ----------
   公司防火墙拦截 >35KB 的上传，gsap/ScrollTrigger 以 .gz 形式入库，
   服务器启动时自动解压为 .js（已存在则跳过）。零依赖，仅用内置 zlib。 */
function unpackVendored() {
  let names;
  try { names = fs.readdirSync(PUBLIC_DIR); } catch (e) { return; }
  for (const name of names) {
    if (!name.endsWith('.gz')) continue;
    const gzPath = path.join(PUBLIC_DIR, name);
    const outPath = path.join(PUBLIC_DIR, name.slice(0, -3));
    if (fs.existsSync(outPath)) continue; // 已解压则跳过
    try {
      fs.writeFileSync(outPath, zlib.gunzipSync(fs.readFileSync(gzPath)));
      console.log('[unpack] ' + name + ' -> ' + path.basename(outPath));
    } catch (e) {
      console.error('[unpack] 失败 ' + name + ': ' + e.message);
    }
  }
}
unpackVendored();

/* ---------- 公共页面（注入数据）---------- */
function servePublicPage(res, version) {
  const data = loadData();
  const realVer = data.versions[version] ? version : DEFAULT_VERSION;
  const payload = JSON.stringify({ base: data.base, version: data.versions[realVer], versionKey: realVer, allVersions: Object.keys(data.versions), en: data.en || null });
  
  // 转义 JSON 中的危险字符，防止 </script> 突破
  const safePayload = payload
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

  let html = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html'), 'utf8');
  // 用函数形式替换，防数据内容含 $& / $' / $` 等 replace 特殊模式被错误展开
  html = html.replace('/*__RESUME_DATA__*/', function () { return 'window.RESUME = ' + safePayload + ';'; });
  
  const h = Object.assign({}, SECURITY_HEADERS, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Security-Policy': "default-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'"
  });
  res.writeHead(200, h);
  res.end(html);
}

// 密码常量时间比较（防时序侧信道）：先 SHA-256 归一长度，再 timingSafeEqual
function safePasswordCompare(input, expected) {
  try {
    const a = crypto.createHash('sha256').update(String(input), 'utf8').digest();
    const b = crypto.createHash('sha256').update(String(expected), 'utf8').digest();
    return crypto.timingSafeEqual(a, b);
  } catch (e) {
    return false;
  }
}

/* ---------- 路由 ---------- */
const server = http.createServer(async function (req, res) {
  try {
    await handleRequest(req, res);
  } catch (e) {
    // 兜底：任何未捕获异常（含畸形 URL 的 URIError）不得终止进程
    console.error('[ERROR] 请求处理异常 ' + req.url + ': ' + e.message);
    if (!res.headersSent) {
      res.writeHead(500, Object.assign({}, SECURITY_HEADERS, { 'Content-Type': 'text/plain; charset=utf-8' }));
    }
    try { res.end('500 Internal Server Error'); } catch (e2) { /* 已断开 */ }
  }
});

async function handleRequest(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname;

  // API
  if (p === '/api/data' && req.method === 'GET') {
    // 公开 API：返回脱敏数据（隐藏手机号、微信等隐私信息）
    const data = loadData();
    const publicData = {
      base: Object.assign({}, data.base),
      versions: data.versions,
      en: data.en || null
    };
    // 脱敏：隐藏手机号和微信
    if (publicData.base.phone) publicData.base.phone = publicData.base.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    if (publicData.base.wechat) publicData.base.wechat = publicData.base.wechat.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    return sendJSON(res, 200, publicData);
  }

  // 完整数据 API（需登录）
  if (p === '/api/data/full' && req.method === 'GET') {
    if (!getSession(req)) return sendJSON(res, 401, { ok: false, error: '未登录' });
    return sendJSON(res, 200, loadData());
  }

  if (p === '/api/login' && req.method === 'POST') {
    const ip = getClientIP(req);
    
    // 检查登录限流
    if (!checkLoginRate(ip)) {
      const remaining = Math.ceil((loginAttempts[ip].lockUntil - Date.now()) / 60000);
      return sendJSON(res, 429, { ok: false, error: '登录尝试过多，请 ' + remaining + ' 分钟后再试' });
    }
    
    let body;
    try { body = await readBody(req); }
    catch (e) { return sendJSON(res, 413, { ok: false, error: e.message }); }
    
    try {
      const obj = JSON.parse(body || '{}');
      if (safePasswordCompare(obj.password, ADMIN_PASSWORD)) {
        // 登录成功，清除失败记录
        delete loginAttempts[ip];
        const token = crypto.randomBytes(16).toString('hex');
        sessions[token] = Date.now();
        console.log('[LOGIN] 登录成功 IP: ' + ip);
        return sendJSON(res, 200, { ok: true }, { 'Set-Cookie': 'resume_session=' + token + '; HttpOnly; Path=/; SameSite=Lax; Secure' });
      }
      // 登录失败，记录
      recordLoginFailure(ip);
      const attempts = loginAttempts[ip]?.count || 0;
      const remaining = LOGIN_MAX_ATTEMPTS - attempts;
      console.warn('[LOGIN] 登录失败 IP: ' + ip + ' 剩余尝试: ' + remaining);
      return sendJSON(res, 401, { ok: false, error: '密码错误' + (remaining <= 3 ? '（剩余 ' + remaining + ' 次尝试）' : '') });
    } catch (e) { return sendJSON(res, 400, { ok: false, error: '请求格式错误' }); }
  }

  if (p === '/api/logout' && req.method === 'POST') {
    const sid = getSession(req); if (sid) delete sessions[sid];
    res.writeHead(200, Object.assign({}, SECURITY_HEADERS, {
      'Content-Type': 'application/json; charset=utf-8',
      'Set-Cookie': 'resume_session=; HttpOnly; Path=/; Max-Age=0'
    }));
    return res.end('{"ok":true}');
  }

  if (p === '/api/check' && req.method === 'GET') return sendJSON(res, 200, { authed: !!getSession(req) });

  if (p === '/api/save' && req.method === 'POST') {
    if (!getSession(req)) return sendJSON(res, 401, { ok: false, error: '未登录' });
    let body;
    try { body = await readBody(req); }
    catch (e) { return sendJSON(res, 413, { ok: false, error: e.message }); }
    try {
      const data = JSON.parse(body);
      // 数据校验：防止写入恶意内容
      const validationError = validateResumeData(data);
      if (validationError) {
        console.warn('[SECURITY] 数据校验失败: ' + validationError);
        return sendJSON(res, 400, { ok: false, error: '数据校验失败: ' + validationError });
      }
      saveData(data);
      console.log('[SAVE] 数据已更新 by session');
      return sendJSON(res, 200, { ok: true });
    }
    catch (e) { return sendJSON(res, 400, { ok: false, error: '数据格式错误: ' + e.message }); }
  }

  // 头像上传（需登录）：接收 base64 图片，存到 public/uploads/，返回可访问路径
  if (p === '/api/upload' && req.method === 'POST') {
    if (!getSession(req)) return sendJSON(res, 401, { ok: false, error: '未登录' });
    let body;
    try { body = await readBody(req); }
    catch (e) { return sendJSON(res, 413, { ok: false, error: e.message }); }
    try {
      const obj = JSON.parse(body);
      if (!obj.data || !obj.data.startsWith('data:image/')) return sendJSON(res, 400, { ok: false, error: '非图片数据' });
      // 解析 data:image/png;base64,xxxx
      const m = obj.data.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!m) return sendJSON(res, 400, { ok: false, error: '图片格式不支持' });
      // 验证扩展名白名单（禁止 SVG，防止 XSS）
      const allowedExt = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
      const ext = m[1].toLowerCase();
      if (!allowedExt.includes(ext)) return sendJSON(res, 400, { ok: false, error: '图片类型不支持: ' + ext });
      const safeExt = ext === 'jpeg' ? 'jpg' : ext;
      const buf = Buffer.from(m[2], 'base64');
      if (buf.length > 2 * 1024 * 1024) return sendJSON(res, 400, { ok: false, error: '图片过大（限 2MB）' });
      // 验证图片魔数（magic bytes），防止伪装扩展名；超短 buffer 也拒绝（不能跳过校验）
      const magicBytes = {
        png: [0x89, 0x50, 0x4E, 0x47],
        jpg: [0xFF, 0xD8, 0xFF],
        gif: [0x47, 0x49, 0x46, 0x38],
        webp: [0x52, 0x49, 0x46, 0x46]
      };
      const expectedMagic = magicBytes[safeExt];
      if (!expectedMagic || buf.length < expectedMagic.length) {
        return sendJSON(res, 400, { ok: false, error: '图片内容验证失败（文件过短）' });
      }
      const actualMagic = buf.slice(0, expectedMagic.length);
      if (!actualMagic.equals(Buffer.from(expectedMagic))) {
        console.warn('[SECURITY] 上传文件魔数不匹配: 期望 ' + safeExt + ', 实际内容不符');
        return sendJSON(res, 400, { ok: false, error: '图片内容验证失败' });
      }
      // webp 需进一步校验 RIFF 头后的 WEBP 标识（RIFF 也用于 WAV/AVI 等）
      if (safeExt === 'webp' && (buf.length < 12 || buf.slice(8, 12).toString('ascii') !== 'WEBP')) {
        console.warn('[SECURITY] 上传文件非 WEBP（RIFF 容器内容不符）');
        return sendJSON(res, 400, { ok: false, error: '图片内容验证失败' });
      }
      const uploadsDir = path.join(PUBLIC_DIR, 'uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      const fname = 'avatar.' + safeExt;
      fs.writeFileSync(path.join(uploadsDir, fname), buf);
      console.log('[UPLOAD] 头像已更新: ' + fname);
      return sendJSON(res, 200, { ok: true, path: '/uploads/' + fname });
    } catch (e) { return sendJSON(res, 400, { ok: false, error: '上传失败: ' + e.message }); }
  }

  // 页面路由
  if (p === '/') { res.writeHead(302, { Location: '/' + DEFAULT_VERSION }); return res.end(); }
  if (VERSIONS.includes(p.slice(1))) return servePublicPage(res, p.slice(1));
  if (p === '/admin') {
    const html = fs.readFileSync(path.join(PUBLIC_DIR, 'admin.html'), 'utf8');
    const h = Object.assign({}, SECURITY_HEADERS, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': "default-src 'self' 'unsafe-inline'; img-src 'self' data:;"
    });
    res.writeHead(200, h);
    return res.end(html);
  }

  // 静态文件（Cache-Control: no-cache 确保浏览器每次验证，避免打印 CSS 改动不生效）
  const fp = safeStatic(p);
  if (fp) {
    const h = Object.assign({}, SECURITY_HEADERS, {
      'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.writeHead(200, h);
    return res.end(fs.readFileSync(fp));
  }

  res.writeHead(404, Object.assign({}, SECURITY_HEADERS, { 'Content-Type': 'text/plain; charset=utf-8' }));
  res.end('404 Not Found');
}

server.listen(PORT, HOST, function () {
  console.log('Resume server running at http://' + HOST + ':' + PORT);
  console.log('Default: /' + DEFAULT_VERSION + '   Admin: /admin');
  console.log('Password: (set via ADMIN_PASSWORD env)');
  console.log('[SECURITY] 建议通过反向代理（如 Cloudflare Tunnel）暴露服务，不要直接对外');
});
