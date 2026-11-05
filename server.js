/* 简历系统服务端 —— 纯 Node.js，无第三方依赖
   启动：node server.js   （默认端口 3000，可用 PORT 环境变量修改）
   管理密码：默认 admin123，请用环境变量 ADMIN_PASSWORD 修改 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const DATA_FILE = path.join(__dirname, 'data', 'resume.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

const VERSIONS = ['ai', 'it', 'test', 'erp'];
const DEFAULT_VERSION = 'ai';

const sessions = {}; // 内存会话，重启失效

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
  res.writeHead(code, Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, headers || {}));
  res.end(JSON.stringify(obj));
}
function readBody(req) {
  return new Promise(function (resolve) {
    let b = ''; req.on('data', c => b += c); req.on('end', () => resolve(b));
  });
}
function safeStatic(p) {
  const fp = path.join(PUBLIC_DIR, path.normalize(p).replace(/^(\.\.[/\\])+/, ''));
  return fp.startsWith(PUBLIC_DIR) && fs.existsSync(fp) && fs.statSync(fp).isFile() ? fp : null;
}
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

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
  let html = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html'), 'utf8');
  html = html.replace('/*__RESUME_DATA__*/', 'window.RESUME = ' + payload + ';');
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

/* ---------- 路由 ---------- */
const server = http.createServer(async function (req, res) {
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname;

  // API
  if (p === '/api/data' && req.method === 'GET') return sendJSON(res, 200, loadData());

  if (p === '/api/login' && req.method === 'POST') {
    const body = await readBody(req);
    try {
      const obj = JSON.parse(body || '{}');
      if (obj.password === ADMIN_PASSWORD) {
        const token = crypto.randomBytes(16).toString('hex');
        sessions[token] = Date.now();
        return sendJSON(res, 200, { ok: true }, { 'Set-Cookie': 'resume_session=' + token + '; HttpOnly; Path=/; SameSite=Lax' });
      }
      return sendJSON(res, 401, { ok: false, error: '密码错误' });
    } catch (e) { return sendJSON(res, 400, { ok: false, error: '请求格式错误' }); }
  }

  if (p === '/api/logout' && req.method === 'POST') {
    const sid = getSession(req); if (sid) delete sessions[sid];
    res.writeHead(200, { 'Set-Cookie': 'resume_session=; HttpOnly; Path=/; Max-Age=0' });
    return res.end('{"ok":true}');
  }

  if (p === '/api/check' && req.method === 'GET') return sendJSON(res, 200, { authed: !!getSession(req) });

  if (p === '/api/save' && req.method === 'POST') {
    if (!getSession(req)) return sendJSON(res, 401, { ok: false, error: '未登录' });
    const body = await readBody(req);
    try { saveData(JSON.parse(body)); return sendJSON(res, 200, { ok: true }); }
    catch (e) { return sendJSON(res, 400, { ok: false, error: '数据格式错误: ' + e.message }); }
  }

  // 头像上传（需登录）：接收 base64 图片，存到 public/uploads/，返回可访问路径
  if (p === '/api/upload' && req.method === 'POST') {
    if (!getSession(req)) return sendJSON(res, 401, { ok: false, error: '未登录' });
    const body = await readBody(req);
    try {
      const obj = JSON.parse(body);
      if (!obj.data || !obj.data.startsWith('data:image/')) return sendJSON(res, 400, { ok: false, error: '非图片数据' });
      // 解析 data:image/png;base64,xxxx
      const m = obj.data.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!m) return sendJSON(res, 400, { ok: false, error: '图片格式不支持' });
      const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
      const buf = Buffer.from(m[2], 'base64');
      if (buf.length > 2 * 1024 * 1024) return sendJSON(res, 400, { ok: false, error: '图片过大（限 2MB）' });
      const uploadsDir = path.join(PUBLIC_DIR, 'uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      const fname = 'avatar.' + ext;
      fs.writeFileSync(path.join(uploadsDir, fname), buf);
      return sendJSON(res, 200, { ok: true, path: '/uploads/' + fname });
    } catch (e) { return sendJSON(res, 400, { ok: false, error: '上传失败: ' + e.message }); }
  }

  // 页面路由
  if (p === '/') { res.writeHead(302, { Location: '/' + DEFAULT_VERSION }); return res.end(); }
  if (VERSIONS.includes(p.slice(1))) return servePublicPage(res, p.slice(1));
  if (p === '/admin') {
    const html = fs.readFileSync(path.join(PUBLIC_DIR, 'admin.html'), 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(html);
  }

  // 静态文件（Cache-Control: no-cache 确保浏览器每次验证，避免打印 CSS 改动不生效）
  const fp = safeStatic(p);
  if (fp) { res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); return res.end(fs.readFileSync(fp)); }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 Not Found');
});

server.listen(PORT, function () {
  console.log('Resume server running at http://localhost:' + PORT);
  console.log('Default: /' + DEFAULT_VERSION + '   Admin: /admin');
  console.log('Password: ' + (ADMIN_PASSWORD === 'admin123' ? 'admin123 (default, change via ADMIN_PASSWORD env)' : '(set via env)'));
});
