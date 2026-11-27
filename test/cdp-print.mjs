// 打印/PDF 流程 CDP 实测（修订 4：WYSIWYG 预览 + 不分页长页导出）—— 零依赖（Node 22+ 内置 WebSocket + 本机 Chrome/Edge）
// 用法: node test/cdp-print.mjs
// 自包含：自启 node server.js（PORT=3998，只读真实数据）→ headless Chrome → 断言 → 自停
//
// 覆盖（契约 docs/specs/2026-11-25-print-fix.md 修订 4，C17–C26）：
//   P1   bug 前置条件复现：未滚动时下方元素残留内联 opacity:0（GSAP 入场动画未触发）
//   C13  打印按钮 → 版式对话框（居中坐标 + 双选项并排 + 「另存为 PDF」提示 + Esc 关闭）
//   C17* 双打印按钮统一绑定（.js-print 数量 = 2）
//   C18* window.__coverSvg 模块加载后即可用 + 封面图 404 → SVG 占位
//   C19* WYSIWYG 预览：纸张 210/297mm + 白边 26/16mm + 工具条 + 无页卡/分页线 + 选方向不直接打印
//   C20* 不分页长页导出：printToPDF 恰好 1 页（竖 210×3293mm / 横 297×2512mm，±50mm）
//   C21* 总高测量：@page 稳定轮询定稿 210/297mm × H（H≈3293/2512mm）
//   C23* 直接 Ctrl+P 一致性：beforeprint 注入竖版长页 → 1 页，afterprint 清理
//   C24* 预览关闭与状态清理：类/工具条/@page 清除 + 幂等
//   C14/C15 打印媒体回归：动画残留覆盖 + 单/双列布局 + 封面定高
//   全程无未捕获 JS 异常
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
const MM_PT = 2.83465; // 1mm = 2.83465pt

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
      const m = buf.match(/DevTools listening on (ws:\/\/[^^\s]+)/);
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

// ---- 修订 4 辅助：PDF 信息 / 预览状态 / 长页定稿等待 ----
function pdfInfo(buf) {
  const txt = buf.toString('latin1');
  const pages = (txt.match(/\/Type\s*\/Page[^s]/g) || []).length;
  const mb = txt.match(/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/);
  return { size: buf.length, pages, wPt: mb ? parseFloat(mb[1]) : null, hPt: mb ? parseFloat(mb[2]) : null };
}

async function previewState(page) {
  return page.eval(`(() => {
    const html = document.documentElement;
    const body = document.body;
    const bar = document.getElementById('previewBar');
    const st = document.getElementById('print-orient-style');
    const dlg = document.getElementById('printDialog');
    const bcs = getComputedStyle(body);
    const br = bar ? bar.getBoundingClientRect() : null;
    return {
      htmlCls: html.className,
      bodyOn: body.classList.contains('preview-on'),
      bar: !!bar,
      barTop: br ? br.top : null,
      barH: br ? br.height : null,
      style: st ? st.textContent : null,
      dialogHidden: dlg ? dlg.hidden : null,
      bodyW: body.getBoundingClientRect().width,
      padT: bcs.paddingTop,
      padL: bcs.paddingLeft,
      pvExport: !!document.getElementById('pvExport'),
      pvClose: !!document.getElementById('pvClose'),
      pageCards: document.querySelectorAll('.page-card, #pvPages').length,
      htmlBg: getComputedStyle(html).backgroundColor,
      navbarDisplay: getComputedStyle(document.querySelector('.navbar')).display,
    };
  })()`);
}

function isClean(st) {
  return !!st && st.htmlCls === '' && !st.bodyOn && !st.bar && (st.style === '' || st.style == null);
}

async function waitForPageSettle(page, orient, timeoutMs = 12000) {
  const wMm = (orient === 'portrait') ? 210 : 297;
  const re = new RegExp('@page \\{ size: ' + wMm + 'mm (\\d+)mm; margin: 0; \\}');
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const style = await page.eval(`(() => { const st = document.getElementById('print-orient-style'); return st ? st.textContent : ''; })()`);
    const m = (style || '').match(re);
    if (m) return { settled: true, hMm: parseInt(m[1], 10) };
    await sleep(200);
  }
  return { settled: false, hMm: null };
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
    console.log('打印/PDF 流程 CDP 实测（修订 4 · 端口 3998 · headless Chrome）');
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

    // ---- C17* 双打印按钮统一绑定（2026-11-25 spec）----
    const jsPrintCount = await page.eval(`document.querySelectorAll('.js-print').length`);
    check('C17* .js-print 按钮数量 = 2（导航 + hero）', jsPrintCount === 2, 'count=' + jsPrintCount);
    const heroDlg = await page.eval(`(() => {
      const b = document.querySelector('.btn.ghost.js-print');
      if (!b) return { found: false };
      b.click();
      return { found: true, hidden: document.getElementById('printDialog').hidden };
    })()`);
    check('C17* hero 按钮点击打开版式对话框', heroDlg.found === true && heroDlg.hidden === false, JSON.stringify(heroDlg));
    if (heroDlg.found && heroDlg.hidden === false) {
      await page.eval(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))`);
      await sleep(200);
    }

    // ---- C18* window.__coverSvg 模块加载后即可用（2026-11-25 spec）----
    const svgFn = await page.eval(`(() => {
      if (typeof window.__coverSvg !== 'function') return { fn: false };
      const s = window.__coverSvg('rms');
      return { fn: true, isSvg: typeof s === 'string' && s.includes('<svg') };
    })()`);
    check('C18* window.__coverSvg 模块加载后即可用（返回 SVG）', svgFn.fn === true && svgFn.isSvg === true, JSON.stringify(svgFn));

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
    await page.eval(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))`);
    await sleep(200);
    check('C13 Esc 关闭对话框', (await page.eval(`document.getElementById('printDialog').hidden`)) === true);

    // ============ 竖版流程（C19*/C20*/C21*/C24*）============
    await page.eval(`window.__printCalls = []; window.print = function () { window.__printCalls.push(document.documentElement.className); };`);
    await page.eval(`document.getElementById('printBtn').click()`);
    await sleep(200);
    await page.eval(`document.querySelector('.pd-opt[data-orient="portrait"]').click()`);
    await sleep(300);
    const pc1 = await page.eval(`window.__printCalls`);
    check('C19* 选竖版不直接触发 window.print（WYSIWYG 延迟打印）', pc1.length === 0, JSON.stringify(pc1));
    const pv1 = await previewState(page);
    check('C19* html.print-portrait preview-mode pv-long 类注入', pv1.htmlCls === 'print-portrait preview-mode pv-long', pv1.htmlCls);
    check('C19* body.preview-on 类注入', pv1.bodyOn === true, String(pv1.bodyOn));
    check('C19* #previewBar 工具条可见', pv1.bar === true, String(pv1.bar));
    check('C19* 纸张宽 210mm（≈793.7px）', Math.abs(pv1.bodyW - 793.7) <= 2, 'bodyW=' + pv1.bodyW);
    check('C19* 白边 上 26mm / 左 16mm（≈98.4px / ≈60.5px）', Math.abs(parseFloat(pv1.padT) - 98.425) <= 1 && Math.abs(parseFloat(pv1.padL) - 60.472) <= 1, 'padT=' + pv1.padT + ' padL=' + pv1.padL);
    check('C19* 工具条固定顶部（top=0，高度>0）', pv1.barTop === 0 && pv1.barH > 0, 'top=' + pv1.barTop + ' h=' + pv1.barH);
    check('C19* 工具条含「导出 PDF」+「关闭预览」按钮', pv1.pvExport === true && pv1.pvClose === true, 'export=' + pv1.pvExport + ' close=' + pv1.pvClose);
    check('C19* 无页卡（#pvPages/.page-card 不存在）', pv1.pageCards === 0, 'cards=' + pv1.pageCards);
    check('C19* 屏幕背景纸张色（rgb(233,228,218)）', pv1.htmlBg === 'rgb(233, 228, 218)', pv1.htmlBg);
    check('C19* 预览期导航栏隐藏', pv1.navbarDisplay === 'none', pv1.navbarDisplay);
    const settle1 = await waitForPageSettle(page, 'portrait');
    check('C21* @page 稳定轮询定稿 210mm × H', settle1.settled === true, JSON.stringify(settle1));
    check('C21* 竖版总高 H ≈ 3293mm（±50mm）', settle1.settled && Math.abs(settle1.hMm - 3293) <= 50, 'hMm=' + settle1.hMm);

    // ---- C14/C15/C19*/C20* 打印媒体回归（竖版）----
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
    const coverHp = await page.eval(`(() => [...document.querySelectorAll('.cover-img')].map(i => Math.round(i.getBoundingClientRect().height)))()`);
    check('C19* 竖版：11 张封面图定高 240px', coverHp.length === 11 && coverHp.every(h => Math.abs(h - 240) <= 1), JSON.stringify(coverHp));
    const pbreaks = await page.eval(`(() => ({
      footer: getComputedStyle(document.querySelector('.footer')).breakInside,
      secHeadOk: [...document.querySelectorAll('.sec-head-wrap')].every(w => getComputedStyle(w).breakAfter === 'avoid'),
      appMargin: (() => { const am = getComputedStyle(document.getElementById('app')); return { t: am.marginTop, r: am.marginRight, b: am.marginBottom, l: am.marginLeft }; })()
    }))()`);
    check('C19* .footer break-inside: avoid（不被拆分）', pbreaks.footer === 'avoid', pbreaks.footer);
    check('C19* .sec-head-wrap break-after: avoid（无滞留标题）', pbreaks.secHeadOk === true, '');
    const amOk = Math.abs(parseFloat(pbreaks.appMargin.t)) < 0.5 && Math.abs(parseFloat(pbreaks.appMargin.b)) < 0.5
      && Math.abs(parseFloat(pbreaks.appMargin.r) - 37.7953) < 0.5 && Math.abs(parseFloat(pbreaks.appMargin.l) - 37.7953) < 0.5;
    check('C20* #app 打印内缩 margin: 0 10mm（上下 0、左右 ≈37.8px）', amOk, JSON.stringify(pbreaks.appMargin));
    await page.send('Emulation.setEmulatedMedia', { media: '' });

    // ---- C20* 导出按钮 + printToPDF 竖版长页 ----
    await page.eval(`window.__printCalls = [];`);
    await page.eval(`(() => { const b = document.getElementById('pvExport'); if (b) { b.click(); return 'clicked'; } return 'no-btn'; })()`);
    await sleep(200);
    const pc1b = await page.eval(`window.__printCalls`);
    check('C20* pvExport 点击触发 window.print 一次', pc1b.length === 1, JSON.stringify(pc1b));
    const pdfP = await page.send('Page.printToPDF', { preferCSSPageSize: true, printBackground: true, displayHeaderFooter: false });
    const infoP = pdfInfo(Buffer.from(pdfP.data, 'base64'));
    check('C20* 竖版 PDF 恰好 1 页', infoP.pages === 1, 'pages=' + infoP.pages);
    check('C20* 竖版 PDF 纸宽 210mm（≈595.28pt，±3pt）', infoP.wPt !== null && Math.abs(infoP.wPt - 595.28) <= 3, 'wPt=' + infoP.wPt);
    check('C20* 竖版 PDF 纸高 ≈3293mm（≈9334.6pt，±141.7pt）', infoP.hPt !== null && Math.abs(infoP.hPt - 3293 * MM_PT) <= 141.7, 'hPt=' + infoP.hPt);
    const clean1 = await previewState(page);
    check('C24* 导出后状态清理（类/工具条/@page 清除）', isClean(clean1), JSON.stringify(clean1));
    // ============ 横版流程（C19*/C20*/C21*/C24*）============
    await page.goto(BASE + '/ai');
    await page.eval(`window.__printCalls = []; window.print = function () { window.__printCalls.push(document.documentElement.className); };`);
    await page.eval(`document.getElementById('printBtn').click()`);
    await sleep(200);
    await page.eval(`document.querySelector('.pd-opt[data-orient="landscape"]').click()`);
    await sleep(300);
    const pv2 = await previewState(page);
    check('C19* html.print-landscape preview-mode pv-long 类注入', pv2.htmlCls === 'print-landscape preview-mode pv-long', pv2.htmlCls);
    check('C19* 横版纸张宽 297mm（≈1122.5px）', Math.abs(pv2.bodyW - 1122.5) <= 2, 'bodyW=' + pv2.bodyW);
    const settle2 = await waitForPageSettle(page, 'landscape');
    check('C21* @page 稳定轮询定稿 297mm × H', settle2.settled === true, JSON.stringify(settle2));
    check('C21* 横版总高 H ≈ 2512mm（±50mm）', settle2.settled && Math.abs(settle2.hMm - 2512) <= 50, 'hMm=' + settle2.hMm);

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
    const coverHl = await page.eval(`(() => [...document.querySelectorAll('.cover-img')].map(i => Math.round(i.getBoundingClientRect().height)))()`);
    check('C19* 横版：11 张封面图高度 ≤ 460px（无截断）', coverHl.length === 11 && coverHl.every(h => h <= 460), JSON.stringify(coverHl));
    await page.send('Emulation.setEmulatedMedia', { media: '' });

    const pdfL = await page.send('Page.printToPDF', { preferCSSPageSize: true, printBackground: true, displayHeaderFooter: false });
    const infoL = pdfInfo(Buffer.from(pdfL.data, 'base64'));
    check('C20* 横版 PDF 恰好 1 页', infoL.pages === 1, 'pages=' + infoL.pages);
    check('C20* 横版 PDF 纸宽 297mm（≈841.89pt，±3pt）', infoL.wPt !== null && Math.abs(infoL.wPt - 841.89) <= 3, 'wPt=' + infoL.wPt);
    check('C20* 横版 PDF 纸高 ≈2512mm（≈7120.6pt，±141.7pt）', infoL.hPt !== null && Math.abs(infoL.hPt - 2512 * MM_PT) <= 141.7, 'hPt=' + infoL.hPt);
    const clean2 = await previewState(page);
    check('C24* 导出后状态清理（类/工具条/@page 清除）', isClean(clean2), JSON.stringify(clean2));

    // ============ C23* 直接 Ctrl+P（未经预览，beforeprint 注入竖版长页）============
    await page.goto(BASE + '/ai');
    const pdfC = await page.send('Page.printToPDF', { preferCSSPageSize: true, printBackground: true, displayHeaderFooter: false });
    const infoC = pdfInfo(Buffer.from(pdfC.data, 'base64'));
    check('C23* 直接 Ctrl+P 输出 1 页长页（beforeprint 注入）', infoC.pages === 1, 'pages=' + infoC.pages);
    check('C23* 竖版长页纸张（≈595.28 × ≈9334.6pt，±容差）', infoC.wPt !== null && infoC.hPt !== null && Math.abs(infoC.wPt - 595.28) <= 3 && Math.abs(infoC.hPt - 3293 * MM_PT) <= 141.7, 'wPt=' + infoC.wPt + ' hPt=' + infoC.hPt);
    const cleanC = await previewState(page);
    check('C23* afterprint 清理（类/工具条/@page 清除）', isClean(cleanC), JSON.stringify(cleanC));

    // ============ C24* 关闭预览幂等（开→关→开→关）============
    await page.eval(`document.getElementById('printBtn').click()`);
    await sleep(200);
    await page.eval(`document.querySelector('.pd-opt[data-orient="portrait"]').click()`);
    await sleep(300);
    const pv3 = await previewState(page);
    check('C24* 打开预览 → 工具条可见', pv3.bar === true, String(pv3.bar));
    await waitForPageSettle(page, 'portrait');
    await page.eval(`(() => { const b = document.getElementById('pvClose'); if (b) { b.click(); return 'clicked'; } return 'no-bar'; })()`);
    await sleep(200);
    const clean3 = await previewState(page);
    check('C24* 关闭预览 → 状态清理', isClean(clean3), JSON.stringify(clean3));
    await page.eval(`document.getElementById('printBtn').click()`);
    await sleep(200);
    await page.eval(`document.querySelector('.pd-opt[data-orient="portrait"]').click()`);
    await sleep(300);
    const pv4 = await previewState(page);
    check('C24* 重开预览 → 工具条可见', pv4.bar === true, String(pv4.bar));
    await waitForPageSettle(page, 'portrait');
    await page.eval(`(() => { const b = document.getElementById('pvClose'); if (b) { b.click(); return 'clicked'; } return 'no-bar'; })()`);
    await sleep(200);
    const clean4 = await previewState(page);
    check('C24* 再关闭预览 → 状态清理（幂等）', isClean(clean4), JSON.stringify(clean4));

    // ---- C18* 封面图 404 → onerror 注入 SVG 占位（2026-11-25 spec：不出现空白封面）----
    const c404 = await page.eval(`new Promise(res => {
      const img = document.querySelector('.cover-img');
      if (!img) { res({ err: 'no cover-img' }); return; }
      const parent = img.parentElement;
      img.src = '/img/__404_test__.jpg';
      const t0 = Date.now();
      const iv = setInterval(() => {
        const imgGone = !parent.contains(img);
        if (imgGone || Date.now() - t0 > 8000) {
          clearInterval(iv);
          res({ imgGone, svgInjected: !!parent.querySelector('svg'), snippet: parent.innerHTML.slice(0, 120) });
        }
      }, 200);
    })`, 12000);
    check('C18* 封面图 404 → onerror 注入 __coverSvg SVG 占位（无空白封面）', c404.imgGone === true && c404.svgInjected === true, JSON.stringify(c404));

    // ---- 无未捕获 JS 异常 ----
    check('全程无未捕获 JS 异常', page.jsErrors.length === 0, page.jsErrors.join(' | '));

    console.log(results.join('\n'));
    console.log('='.repeat(56));
    console.log(`CDP 打印实测（修订 4）：通过 ${passed}   失败 ${failed}   总计 ${passed + failed}`);
    console.log('='.repeat(56));
  } finally {
    try { if (cdp) await cdp.send('Browser.close', {}, undefined, 3000); } catch {}
    try { if (cdp) cdp.ws.close(); } catch {}
  }
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => { console.error('CDP 测试异常:', e.message); process.exit(1); });
