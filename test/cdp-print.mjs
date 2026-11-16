// 打印/PDF 流程 CDP 实测（C13/C14/C15）—— 零依赖（Node 22+ 内置 WebSocket + 本机 Chrome/Edge）
// 用法: node test/cdp-print.mjs
// 自包含：自启 node server.js（PORT=3998，只读真实数据）→ headless Chrome → 断言 → 自停
//
// 覆盖：
//   P1  bug 前置条件复现：未滚动时下方元素残留内联 opacity:0（GSAP 入场动画未触发）
//   C13 打印按钮 → 版式对话框（居中坐标断言 + 双选项并排 + 「另存为 PDF」提示 + Esc 关闭）
//   C14 打印媒体下动画残留被覆盖（opacity=1 / visible / transform=none，真实浏览器 computed style）
//   C15 竖版/横版：html 类 + 动态 @page 注入 + window.print 调用 + printToPDF 纸张方向（A4 595×842 / 842×595pt）+ 页数 ≥2
//   布局：竖版单列（stats 2 列 / hero 1 列）、横版双列（stats 4 列 / hero 2 列）
//   无未捕获 JS 异常
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const PORT = 3998;
const BASE = `http://127.0.0.1:${PORT}`;
const NODE = process.env.NODE_EXE || 'node';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let passed = 0, failed = 0;
const results = [];
function check(name, cond, detail = '') {
  if (cond) { passed++; results.push('  ✓ ' + name); }
  else { failed++; results.push('  ✗ ' + name + '  ' + detail); }
}

// ---- 进程级兜底清理：任何退出路径（含未捕获异常）都杀掉测试服务器与 Chrome ----
let serverProc = null, chromeProc = null, chromeDir = null;
process.on('exit', () => {
  try { if (chromeProc) spawnSync('taskkill', ['/pid', String(chromeProc.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {}
  try { if (chromeDir) rmSync(chromeDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  try { if (serverProc) serverProc.kill(); } catch {}
});

function findChrome() {
  const env = process.env.CHROME_PATH || process.env.PUPPETEER_EXECUTABLE_PATH;
  if (env && existsSync(env)) return env;
  const pf = process.env.PROGRAMFILES || 'C:\\Program Files';
  const pf86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)';
  const local = process.env.LOCALAPPDATA || '';
  const candidates = [
    join(pf, 'Google/Chrome/Application/chrome.exe'),
    join(pf86, 'Google/Chrome/Application/chrome.exe'),
    join(local, 'Google/Chrome/Application/chrome.exe'),
    join(pf86, 'Microsoft/Edge/Application/msedge.exe'),
    join(pf, 'Microsoft/Edge/Application/msedge.exe'),
  ];
  for (const c of candidates) if (c && existsSync(c)) return c;
  return null;
}

async function launchChrome() {
  const exe = findChrome();
  if (!exe) throw new Error('未找到 Chrome/Edge，可设 CHROME_PATH 环境变量');
  chromeDir = mkdtempSync(join(tmpdir(), 'resume-cdp-'));
  const args = [
    '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${chromeDir}`,
    '--no-first-run', '--no-default-browser-check', '--mute-audio', '--hide-scrollbars',
    '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
    '--force-color-profile=srgb', '--window-size=1440,900', 'about:blank',
  ];
  chromeProc = spawn(exe, args, { stdio: ['ignore', 'ignore', 'pipe'] });
  const wsUrl = await new Promise((resolve, reject) => {
    let buf = '';
    const t = setTimeout(() => reject(new Error('Chrome 20s 未启动')), 20000);
    chromeProc.stderr.on('data', (d) => {
      buf += d.toString();
      const m = buf.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (m) { clearTimeout(t); resolve(m[1]); }
    });
    chromeProc.on('exit', (code) => { clearTimeout(t); reject(new Error('Chrome 提前退出 code=' + code + '\n' + buf.slice(-400))); });
  });
  return wsUrl;
}

class CDP {
  static async connect(wsUrl) {
    const ws = new WebSocket(wsUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('CDP socket failed')); });
    const c = new CDP();
    c.ws = ws; c.nextId = 1; c.pending = new Map(); c.listeners = new Map();
    ws.onmessage = (ev) => {
      const msg = JSON.parse(typeof ev.data === 'string' ? ev.data : Buffer.from(ev.data).toString());
      if (msg.id && c.pending.has(msg.id)) {
        const { resolve, reject, timer } = c.pending.get(msg.id);
        clearTimeout(timer); c.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message)); else resolve(msg.result);
      } else if (msg.method) {
        const fns = c.listeners.get((msg.sessionId || '') + '|' + msg.method);
        if (fns) for (const fn of [...fns]) fn(msg.params);
      }
    };
    return c;
  }
  send(method, params = {}, sessionId, timeoutMs = 30000) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error('CDP timeout: ' + method)); }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      this.ws.send(JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params }));
    });
  }
  on(sessionId, method, fn) {
    const k = (sessionId || '') + '|' + method;
    if (!this.listeners.has(k)) this.listeners.set(k, new Set());
    this.listeners.get(k).add(fn);
    return () => this.listeners.get(k)?.delete(fn);
  }
}

async function newPage(cdp) {
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank', newWindow: true });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const page = { targetId, sessionId, jsErrors: [] };
  cdp.on(sessionId, 'Runtime.exceptionThrown', (p) => {
    page.jsErrors.push((p.exceptionDetails?.exception?.description || p.exceptionDetails?.text || '').slice(0, 200));
  });
  page.send = (method, params = {}, timeoutMs = 30000) => cdp.send(method, params, sessionId, timeoutMs);
  await page.send('Page.enable');
  await page.send('Runtime.enable');
  await page.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  page.eval = async (expression, timeoutMs = 30000) => {
    const r = await page.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, timeoutMs);
    if (r.exceptionDetails) throw new Error('page eval: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
    return r.result?.value;
  };
  page.goto = async (url) => {
    const loaded = new Promise((resolve) => {
      const off = cdp.on(sessionId, 'Page.loadEventFired', () => { off(); resolve(); });
    });
    await page.send('Page.navigate', { url }).catch(() => {});
    await Promise.race([loaded, sleep(20000)]);
    await sleep(1800); // 等 GSAP 初始化完成
  };
  return page;
}

async function waitServer() {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(BASE + '/api/data');
      if (r.status === 200) return true;
    } catch {}
    await sleep(300);
  }
  return false;
}

async function main() {
  // ---- 自启测试服务器（3998，只读） ----
  let serverOut = '';
  serverProc = spawn(NODE, ['server.js'], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(PORT), ADMIN_PASSWORD: 'testpass123' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  serverProc.stdout.on('data', (d) => (serverOut += d));
  serverProc.stderr.on('data', (d) => (serverOut += d));

  let cdp = null, page = null;
  try {
    if (!(await waitServer())) throw new Error('测试服务器启动失败:\n' + serverOut.slice(-500));

    console.log('='.repeat(56));
    console.log('打印/PDF 流程 CDP 实测（端口 3998 · headless Chrome）');
    console.log('='.repeat(56));

    const wsUrl = await launchChrome();
    cdp = await CDP.connect(wsUrl);
    page = await newPage(cdp);
    await page.goto(BASE + '/ai');

    // ---- P1: C6 修复后，未滚动时下方元素不再残留内联 opacity:0（immediateRender:false） ----
    const pre = await page.eval(`(() => {
      const el = document.querySelector('.skills .sec-head');
      return { opacity: el.style.opacity, visibility: el.style.visibility, transform: el.style.transform };
    })()`);
    check('P1 C6 修复：未滚动时下方元素无内联 opacity:0', pre.opacity !== '0' && pre.visibility !== 'hidden', JSON.stringify(pre));

    // ---- C13 打印按钮 → 对话框 ----
    await page.eval(`document.getElementById('printBtn').click()`);
    await sleep(250);
    const dlg = await page.eval(`(() => {
      const d = document.getElementById('printDialog');
      const card = d.querySelector('.pd-card');
      const r = card.getBoundingClientRect();
      const opts = [...d.querySelectorAll('.pd-opt')].map(o => { const b = o.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, orient: o.dataset.orient }; });
      return { hidden: d.hidden, card: { x: r.x, y: r.y, w: r.width, h: r.height }, opts,
               hint: d.querySelector('.pd-hint').textContent, title: d.querySelector('.pd-title').textContent };
    })()`);
    check('C13 对话框出现（非 hidden）', dlg.hidden === false);
    check('C13 对话框卡片水平居中（偏差≤20px）', Math.abs((dlg.card.x + dlg.card.w / 2) - 720) <= 20, JSON.stringify(dlg.card));
    check('C13 竖版/横版选项并排（同 y）', dlg.opts.length === 2 && dlg.opts[0].x < dlg.opts[1].x && Math.abs(dlg.opts[0].y - dlg.opts[1].y) < 5, JSON.stringify(dlg.opts));
    check('C13 选项顺序 portrait/landscape', dlg.opts[0].orient === 'portrait' && dlg.opts[1].orient === 'landscape', JSON.stringify(dlg.opts));
    check('C13 提示含「另存为 PDF」指引', dlg.hint.includes('另存为 PDF'), dlg.hint);
    check('C13 标题为「选择打印版式」', dlg.title === '选择打印版式', dlg.title);

    // ---- C13 Esc 关闭，不触发打印 ----
    await page.eval(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))`);
    await sleep(200);
    check('C13 Esc 关闭对话框', (await page.eval(`document.getElementById('printDialog').hidden`)) === true);

    // ---- C13/C15 选竖版 → 类 + @page + window.print ----
    await page.eval(`window.__printCalls = []; window.print = function () { window.__printCalls.push({ cls: document.documentElement.className, page: (document.getElementById('print-orient-style') || {}).textContent || '' }); };`);
    await page.eval(`document.getElementById('printBtn').click()`);
    await sleep(200);
    await page.eval(`document.querySelector('.pd-opt[data-orient="portrait"]').click()`);
    await sleep(250);
    const pc1 = await page.eval(`window.__printCalls`);
    check('C13 选竖版触发 window.print 一次', pc1.length === 1, JSON.stringify(pc1));
    check('C15 html.print-portrait 类注入', pc1[0] && pc1[0].cls === 'print-portrait', JSON.stringify(pc1[0]));
    check('C15 动态 @page A4 portrait 注入', pc1[0] && pc1[0].page.includes('A4 portrait'), JSON.stringify(pc1[0]));
    check('C13 选择后对话框关闭', (await page.eval(`document.getElementById('printDialog').hidden`)) === true);

    // ---- C14/C15 模拟 print 媒体：动画残留覆盖 + 竖版单列布局（v1.3.0：8 区结构）----
    await page.send('Emulation.setEmulatedMedia', { media: 'print' });
    await sleep(300);
    const pcss = await page.eval(`(() => {
      const cs = getComputedStyle(document.querySelector('.skills .sec-head'));
      return { opacity: cs.opacity, visibility: cs.visibility, transform: cs.transform,
               skillCardsCols: getComputedStyle(document.querySelector('.skill-cards')).gridTemplateColumns,
               heroCols: getComputedStyle(document.querySelector('.hero-inner')).gridTemplateColumns,
               navbarDisplay: getComputedStyle(document.querySelector('.navbar')).display,
               bodyBg: getComputedStyle(document.body).backgroundColor,
               appBg: getComputedStyle(document.getElementById('app')).backgroundColor };
    })()`);
    check('C14 print 媒体：opacity 覆盖为 1', pcss.opacity === '1', pcss.opacity);
    check('C14 print 媒体：visibility=visible', pcss.visibility === 'visible', pcss.visibility);
    check('C14 print 媒体：transform=none', pcss.transform === 'none', pcss.transform);
    check('C15 竖版：技能卡片 2 列', pcss.skillCardsCols.trim().split(/\s+/).length === 2, pcss.skillCardsCols);
    check('C15 竖版：hero 单列', pcss.heroCols.trim().split(/\s+/).length === 1, pcss.heroCols);
    check('C15 print：导航栏隐藏', pcss.navbarDisplay === 'none', pcss.navbarDisplay);
    check('C15 竖版：body 白底 + #app 奶油底内缩', pcss.bodyBg === 'rgb(255, 255, 255)' && pcss.appBg === 'rgb(250, 245, 236)', 'body=' + pcss.bodyBg + ' app=' + pcss.appBg);
    await page.send('Emulation.setEmulatedMedia', { media: '' });

    // ---- C15 printToPDF 竖版（preferCSSPageSize → 用 CSS @page） ----
    const pdfP = await page.send('Page.printToPDF', { preferCSSPageSize: true, printBackground: true, displayHeaderFooter: false });
    const bufP = Buffer.from(pdfP.data, 'base64');
    const txtP = bufP.toString('latin1');
    const pagesP = (txtP.match(/\/Type\s*\/Page[^s]/g) || []).length;
    check('C15 竖版 PDF 生成（>10KB）', bufP.length > 10000, 'size=' + bufP.length);
    check('C15 竖版 PDF 页数 ≥2（多页）', pagesP >= 2, 'pages=' + pagesP);
    const mbP = txtP.match(/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/);
    check('C15 竖版 PDF 纸张 A4 portrait（595×842pt）', mbP && Math.abs(parseFloat(mbP[1]) - 595) < 3 && Math.abs(parseFloat(mbP[2]) - 842) < 3, mbP ? mbP[1] + 'x' + mbP[2] : 'no MediaBox');

    // ---- C15 横版流程 ----
    await page.goto(BASE + '/ai');
    await page.eval(`window.__printCalls = []; window.print = function () { window.__printCalls.push({ cls: document.documentElement.className, page: (document.getElementById('print-orient-style') || {}).textContent || '' }); };`);
    await page.eval(`document.getElementById('printBtn').click()`);
    await sleep(200);
    await page.eval(`document.querySelector('.pd-opt[data-orient="landscape"]').click()`);
    await sleep(250);
    const pc2 = await page.eval(`window.__printCalls`);
    check('C15 选横版触发 window.print 一次', pc2.length === 1, JSON.stringify(pc2));
    check('C15 html.print-landscape 类注入', pc2[0] && pc2[0].cls === 'print-landscape', JSON.stringify(pc2[0]));
    check('C15 动态 @page A4 landscape 注入', pc2[0] && pc2[0].page.includes('A4 landscape'), JSON.stringify(pc2[0]));

    await page.send('Emulation.setEmulatedMedia', { media: 'print' });
    await sleep(300);
    const pcss2 = await page.eval(`(() => ({
      skillCardsCols: getComputedStyle(document.querySelector('.skill-cards')).gridTemplateColumns,
      heroCols: getComputedStyle(document.querySelector('.hero-inner')).gridTemplateColumns,
      bodyBg: getComputedStyle(document.body).backgroundColor,
      appBg: getComputedStyle(document.getElementById('app')).backgroundColor,
    }))()`);
    check('C15 横版：技能卡片 3 列', pcss2.skillCardsCols.trim().split(/\s+/).length === 3, pcss2.skillCardsCols);
    check('C15 横版：hero 双列', pcss2.heroCols.trim().split(/\s+/).length === 2, pcss2.heroCols);
    check('C15 横版：body 白底 + #app 奶油底内缩', pcss2.bodyBg === 'rgb(255, 255, 255)' && pcss2.appBg === 'rgb(250, 245, 236)', 'body=' + pcss2.bodyBg + ' app=' + pcss2.appBg);
    await page.send('Emulation.setEmulatedMedia', { media: '' });

    const pdfL = await page.send('Page.printToPDF', { preferCSSPageSize: true, printBackground: true, displayHeaderFooter: false });
    const bufL = Buffer.from(pdfL.data, 'base64');
    const txtL = bufL.toString('latin1');
    const pagesL = (txtL.match(/\/Type\s*\/Page[^s]/g) || []).length;
    check('C15 横版 PDF 页数 ≥2（多页）', pagesL >= 2, 'pages=' + pagesL);
    const mbL = txtL.match(/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/);
    check('C15 横版 PDF 纸张 A4 landscape（842×595pt）', mbL && Math.abs(parseFloat(mbL[1]) - 842) < 3 && Math.abs(parseFloat(mbL[2]) - 595) < 3, mbL ? mbL[1] + 'x' + mbL[2] : 'no MediaBox');

    // ---- 无未捕获 JS 异常 ----
    check('全程无未捕获 JS 异常', page.jsErrors.length === 0, page.jsErrors.join(' | '));

    console.log(results.join('\n'));
    console.log('='.repeat(56));
    console.log(`CDP 打印实测：通过 ${passed}   失败 ${failed}   总计 ${passed + failed}`);
    console.log('='.repeat(56));
  } finally {
    try { if (cdp) await cdp.send('Browser.close', {}, undefined, 3000); } catch {}
    try { if (cdp) cdp.ws.close(); } catch {}
  }
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => { console.error('CDP 测试异常:', e.message); process.exit(1); });
