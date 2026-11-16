// Step 4 测试：C1-C4 坐标断言 + 桌面端不变性 + 既有回归冒烟
// 用法: node test/cdp-mobile-verify.mjs
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = 'http://127.0.0.1:3999/ai';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let passed = 0, failed = 0;
const results = [];
function check(name, cond, detail = '') { if (cond) { passed++; results.push('  ✓ ' + name); } else { failed++; results.push('  ✗ ' + name + '  ' + detail); } }

let chromeProc = null, chromeDir = null;
process.on('exit', () => { try { if (chromeProc) spawnSync('taskkill', ['/pid', String(chromeProc.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {} try { if (chromeDir) rmSync(chromeDir, { recursive: true, force: true, maxRetries: 3 }); } catch {} });
function findChrome() { const env = process.env.CHROME_PATH || process.env.PUPPETEER_EXECUTABLE_PATH; if (env && existsSync(env)) return env; const pf = process.env.PROGRAMFILES || 'C:\\Program Files'; const pf86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)'; const local = process.env.LOCALAPPDATA || ''; for (const c of [join(pf,'Google/Chrome/Application/chrome.exe'),join(pf86,'Google/Chrome/Application/chrome.exe'),join(local,'Google/Chrome/Application/chrome.exe'),join(pf86,'Microsoft/Edge/Application/msedge.exe'),join(pf,'Microsoft/Edge/Application/msedge.exe')]) if (c && existsSync(c)) return c; return null; }
async function launchChrome() { const exe = findChrome(); if (!exe) throw new Error('no chrome'); chromeDir = mkdtempSync(join(tmpdir(), 'resume-verify-')); chromeProc = spawn(exe, ['--headless=new','--remote-debugging-port=0',`--user-data-dir=${chromeDir}`,'--no-first-run','--no-default-browser-check','--mute-audio','--hide-scrollbars','--disable-background-timer-throttling','--disable-renderer-backgrounding','--force-color-profile=srgb','--window-size=1440,900','about:blank'], { stdio: ['ignore','ignore','pipe'] }); return new Promise((resolve, reject) => { let buf=''; const t=setTimeout(()=>reject(new Error('timeout')),20000); chromeProc.stderr.on('data',d=>{buf+=d.toString();const m=buf.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(m){clearTimeout(t);resolve(m[1]);}}); chromeProc.on('exit',c=>{clearTimeout(t);reject(new Error('exit '+c));}); }); }
class CDP { static async connect(wsUrl){const ws=new WebSocket(wsUrl);await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=()=>rej(new Error('fail'));});const c=new CDP();c.ws=ws;c.nextId=1;c.pending=new Map();c.listeners=new Map();ws.onmessage=(ev)=>{const msg=JSON.parse(typeof ev.data==='string'?ev.data:Buffer.from(ev.data).toString());if(msg.id&&c.pending.has(msg.id)){const{resolve,reject,timer}=c.pending.get(msg.id);clearTimeout(timer);c.pending.delete(msg.id);if(msg.error)reject(new Error(msg.error.message));else resolve(msg.result);}};return c;} send(method,params={},sessionId,timeoutMs=30000){const id=this.nextId++;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error('timeout '+method));},timeoutMs);this.pending.set(id,{resolve,reject,timer});this.ws.send(JSON.stringify(sessionId?{id,method,params,sessionId}:{id,method,params}));});} on(sessionId,method,fn){const k=(sessionId||'')+'|'+method;if(!this.listeners.has(k))this.listeners.set(k,new Set());this.listeners.get(k).add(fn);return()=>this.listeners.get(k)?.delete(fn);} }
async function newPage(cdp){const {targetId}=await cdp.send('Target.createTarget',{url:'about:blank',newWindow:true});const {sessionId}=await cdp.send('Target.attachToTarget',{targetId,flatten:true});const page={targetId,sessionId,jsErrors:[]};cdp.on(sessionId,'Runtime.exceptionThrown',(p)=>{page.jsErrors.push((p.exceptionDetails?.exception?.description||p.exceptionDetails?.text||'').slice(0,200));});page.send=(method,params={},t=30000)=>cdp.send(method,params,sessionId,t);await page.send('Page.enable');await page.send('Runtime.enable');page.eval=async(exp,t=30000)=>{const r=await page.send('Runtime.evaluate',{expression:exp,awaitPromise:true,returnByValue:true},t);if(r.exceptionDetails)throw new Error('eval: '+(r.exceptionDetails.exception?.description||r.exceptionDetails.text));return r.result?.value;};page.goto=async(url)=>{const loaded=new Promise((res)=>{const off=cdp.on(sessionId,'Page.loadEventFired',()=>{off();res();});});await page.send('Page.navigate',{url}).catch(()=>{});await Promise.race([loaded,sleep(20000)]);await sleep(1500);};page.setViewport=async(w,h,mobile=true)=>{await page.send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:2,mobile});};page.click=async(sel)=>{await page.eval(`document.querySelector('${sel}').click()`);};return page;}

async function main() {
  const wsUrl = await launchChrome();
  const cdp = await CDP.connect(wsUrl);
  const page = await newPage(cdp);

  // ========== 390px 手机端：C1-C4 ==========
  console.log('=== 390px 手机端 C1-C4 ===');
  await page.setViewport(390, 844);
  await page.goto(BASE);

  // C1: featured 单列
  const c1 = await page.eval(`(() => {
    const it = document.querySelector('.proj-item.featured');
    const info = it.querySelector('.proj-info');
    const cover = it.querySelector('.proj-cover');
    const cs = getComputedStyle(it);
    const cols = cs.gridTemplateColumns.trim().split(/\\s+/).length;
    return { cols, gridCols: cs.gridTemplateColumns, infoW: Math.round(info.getBoundingClientRect().width), coverH: Math.round(cover.getBoundingClientRect().height), itemH: Math.round(it.getBoundingClientRect().height) };
  })()`);
  check('C1 featured 单列（列数=1）', c1.cols === 1, JSON.stringify(c1));
  check('C1 featured info 宽≥300px', c1.infoW >= 300, 'infoW=' + c1.infoW);
  check('C1 featured 卡片高度<1500px（不再 2126px）', c1.itemH < 1500, 'itemH=' + c1.itemH);

  // C2: 汉堡菜单
  const c2a = await page.eval(`(() => {
    const menu = document.querySelector('.nav-menu');
    const burger = document.querySelector('.nav-burger');
    const panel = document.querySelector('.nav-panel');
    const br = burger.getBoundingClientRect();
    return { menuDisplay: getComputedStyle(menu).display, burgerDisplay: getComputedStyle(burger).display, burgerH: Math.round(br.height), burgerW: Math.round(br.width), panelExists: !!panel, panelOpen: panel ? panel.getAttribute('data-open') : null };
  })()`);
  check('C2 nav-menu 隐藏（display=none）', c2a.menuDisplay === 'none', c2a.menuDisplay);
  check('C2 nav-burger 显示（display≠none）', c2a.burgerDisplay !== 'none', c2a.burgerDisplay);
  check('C2 nav-burger 高度≥44px', c2a.burgerH >= 44, 'h=' + c2a.burgerH);
  check('C2 nav-panel 存在', c2a.panelExists, '');

  // C2: 点击 burger 展开
  await page.click('#navBurger');
  await sleep(400);
  const c2b = await page.eval(`(() => {
    const panel = document.querySelector('.nav-panel');
    const overlay = document.querySelector('.nav-panel-overlay');
    const links = [...panel.querySelectorAll('.nav-panel-link')];
    const pr = panel.getBoundingClientRect();
    return { open: panel.getAttribute('data-open'), overlayOpen: overlay.getAttribute('data-open'), linkCount: links.length, panelW: Math.round(pr.width), panelVisible: pr.height > 10, linkHs: links.map(l => Math.round(l.getBoundingClientRect().height)) };
  })()`);
  check('C2 点击 burger 后面板展开（data-open=true）', c2b.open === 'true', c2b.open);
  check('C2 面板含 7 项', c2b.linkCount === 7, 'count=' + c2b.linkCount);
  check('C2 面板可见（height>10）', c2b.panelVisible, '');
  check('C2 菜单项高度≥48px', c2b.linkHs.every(h => h >= 48), JSON.stringify(c2b.linkHs));

  // C2: 点击菜单项跳转 + 收起
  await page.click('.nav-panel-link[href="#projects"]');
  await sleep(800);
  const c2c = await page.eval(`(() => {
    const panel = document.querySelector('.nav-panel');
    const projTop = document.querySelector('#projects').getBoundingClientRect().top;
    return { panelOpen: panel.getAttribute('data-open'), projTop: Math.round(projTop) };
  })()`);
  check('C2 点击菜单项后面板收起（data-open=false）', c2c.panelOpen === 'false', c2c.panelOpen);
  check('C2 跳转到 projects（projTop 在 projects 区域内）', c2c.projTop < 400, 'projTop=' + c2c.projTop);

  // C3: 触摸目标
  const c3 = await page.eval(`(() => {
    const m = {};
    ['.lang-btn','.nav-print','.nav-burger','.fc-links a','.proj-link'].forEach(sel => {
      const el = document.querySelector(sel);
      if (el && getComputedStyle(el).display !== 'none') m[sel] = Math.round(el.getBoundingClientRect().height);
    });
    return m;
  })()`);
  Object.entries(c3).forEach(([sel, h]) => {
    check('C3 ' + sel + ' 高度≥44px', h >= 44, 'h=' + h);
  });

  // C4: proj-metric 字号
  const c4 = await page.eval(`(() => {
    const m = document.querySelector('.proj-metric');
    const fs = parseFloat(getComputedStyle(m).fontSize);
    const cover = document.querySelector('.proj-cover').getBoundingClientRect().width;
    const mw = m.getBoundingClientRect().width;
    return { fontSize: fs, ratio: Math.round(mw / cover * 100) };
  })()`);
  check('C4 proj-metric 字号≤36px', c4.fontSize <= 36, 'fontSize=' + c4.fontSize);
  check('C4 metric 占 cover 宽≤30%（原 38%）', c4.ratio <= 30, 'ratio=' + c4.ratio + '%');

  // 无横向溢出
  const overflow = await page.eval(`document.documentElement.scrollWidth > window.innerWidth`);
  check('390px 无横向滚动', overflow === false, 'scrollWidth=' + (await page.eval('document.documentElement.scrollWidth')));

  // ========== 1440px 桌面端：不变性 ==========
  console.log('\n=== 1440px 桌面端不变性 ===');
  await page.setViewport(1440, 900, false);
  await page.goto(BASE);
  const desk = await page.eval(`(() => {
    const feat = document.querySelector('.proj-item.featured');
    const menu = document.querySelector('.nav-menu');
    const burger = document.querySelector('.nav-burger');
    const panel = document.querySelector('.nav-panel');
    const metric = document.querySelector('.proj-metric');
    return {
      featCols: getComputedStyle(feat).gridTemplateColumns.trim().split(/\\s+/).length,
      featGridCols: getComputedStyle(feat).gridTemplateColumns,
      menuDisplay: getComputedStyle(menu).display,
      burgerDisplay: getComputedStyle(burger).display,
      panelDisplay: getComputedStyle(panel).display,
      metricFontSize: getComputedStyle(metric).fontSize,
    };
  })()`);
  check('桌面 featured 仍双列', desk.featCols === 2, JSON.stringify(desk.featGridCols));
  check('桌面 nav-menu 仍可见（display≠none）', desk.menuDisplay !== 'none', desk.menuDisplay);
  check('桌面 nav-burger 隐藏（display=none）', desk.burgerDisplay === 'none', desk.burgerDisplay);
  check('桌面 nav-panel 不显示（display=none）', desk.panelDisplay === 'none', desk.panelDisplay);
  check('桌面 proj-metric 字号仍 clamp 下限 40px', parseFloat(desk.metricFontSize) >= 40, 'fontSize=' + desk.metricFontSize);

  // ========== 768px 平板：断点边界 ==========
  console.log('\n=== 768px 平板断点 ===');
  await page.setViewport(768, 1024);
  await page.goto(BASE);
  const tab = await page.eval(`(() => {
    const feat = document.querySelector('.proj-item.featured');
    const menu = document.querySelector('.nav-menu');
    const burger = document.querySelector('.nav-burger');
    return { featCols: getComputedStyle(feat).gridTemplateColumns.trim().split(/\\s+/).length, menuDisplay: getComputedStyle(menu).display, burgerDisplay: getComputedStyle(burger).display };
  })()`);
  check('768px featured 单列（≤1000px 生效）', tab.featCols === 1, 'cols=' + tab.featCols);
  check('768px nav-menu 仍可见（>760px）', tab.menuDisplay !== 'none', tab.menuDisplay);
  check('768px nav-burger 隐藏（>760px）', tab.burgerDisplay === 'none', tab.burgerDisplay);

  // ========== 无 JS 异常 ==========
  check('全程无未捕获 JS 异常', page.jsErrors.length === 0, page.jsErrors.join(' | '));

  console.log('\n' + '='.repeat(56));
  console.log(results.join('\n'));
  console.log('='.repeat(56));
  console.log(`C1-C4 坐标断言：通过 ${passed}   失败 ${failed}   总计 ${passed + failed}`);
  console.log('='.repeat(56));

  try { await cdp.send('Browser.close', {}, undefined, 3000); } catch {}
  try { cdp.ws.close(); } catch {}
  process.exit(failed === 0 ? 0 : 1);
}
main().catch((e) => { console.error('测试异常:', e.message); process.exit(1); });
