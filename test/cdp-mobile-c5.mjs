// C5 滚动隐藏/停止显示 + 背景虚化验证
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const BASE = 'http://127.0.0.1:3999/ai';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let passed = 0, failed = 0; const results = [];
function check(name, cond, detail = '') { if (cond) { passed++; results.push('  ✓ ' + name); } else { failed++; results.push('  ✗ ' + name + '  ' + detail); } }
let chromeProc = null, chromeDir = null;
process.on('exit', () => { try { if (chromeProc) spawnSync('taskkill', ['/pid', String(chromeProc.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {} try { if (chromeDir) rmSync(chromeDir, { recursive: true, force: true, maxRetries: 3 }); } catch {} });
function findChrome() { const env = process.env.CHROME_PATH || process.env.PUPPETEER_EXECUTABLE_PATH; if (env && existsSync(env)) return env; const pf = process.env.PROGRAMFILES || 'C:\\Program Files'; const pf86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)'; const local = process.env.LOCALAPPDATA || ''; for (const c of [join(pf,'Google/Chrome/Application/chrome.exe'),join(pf86,'Google/Chrome/Application/chrome.exe'),join(local,'Google/Chrome/Application/chrome.exe'),join(pf86,'Microsoft/Edge/Application/msedge.exe'),join(pf,'Microsoft/Edge/Application/msedge.exe')]) if (c && existsSync(c)) return c; return null; }
async function launchChrome() { const exe = findChrome(); if (!exe) throw new Error('no chrome'); chromeDir = mkdtempSync(join(tmpdir(), 'resume-c5-')); chromeProc = spawn(exe, ['--headless=new','--remote-debugging-port=0',`--user-data-dir=${chromeDir}`,'--no-first-run','--no-default-browser-check','--mute-audio','--hide-scrollbars','--disable-background-timer-throttling','--disable-renderer-backgrounding','--force-color-profile=srgb','--window-size=1440,900','about:blank'], { stdio: ['ignore','ignore','pipe'] }); return new Promise((resolve, reject) => { let buf=''; const t=setTimeout(()=>reject(new Error('timeout')),20000); chromeProc.stderr.on('data',d=>{buf+=d.toString();const m=buf.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(m){clearTimeout(t);resolve(m[1]);}}); chromeProc.on('exit',c=>{clearTimeout(t);reject(new Error('exit '+c));}); }); }
class CDP { static async connect(wsUrl){const ws=new WebSocket(wsUrl);await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=()=>rej(new Error('fail'));});const c=new CDP();c.ws=ws;c.nextId=1;c.pending=new Map();c.listeners=new Map();ws.onmessage=(ev)=>{const msg=JSON.parse(typeof ev.data==='string'?ev.data:Buffer.from(ev.data).toString());if(msg.id&&c.pending.has(msg.id)){const{resolve,reject,timer}=c.pending.get(msg.id);clearTimeout(timer);c.pending.delete(msg.id);if(msg.error)reject(new Error(msg.error.message));else resolve(msg.result);}};return c;} send(method,params={},sessionId,timeoutMs=30000){const id=this.nextId++;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error('timeout '+method));},timeoutMs);this.pending.set(id,{resolve,reject,timer});this.ws.send(JSON.stringify(sessionId?{id,method,params,sessionId}:{id,method,params}));});} on(sessionId,method,fn){const k=(sessionId||'')+'|'+method;if(!this.listeners.has(k))this.listeners.set(k,new Set());this.listeners.get(k).add(fn);return()=>this.listeners.get(k)?.delete(fn);} }
async function newPage(cdp){const {targetId}=await cdp.send('Target.createTarget',{url:'about:blank',newWindow:true});const {sessionId}=await cdp.send('Target.attachToTarget',{targetId,flatten:true});const page={targetId,sessionId,jsErrors:[]};cdp.on(sessionId,'Runtime.exceptionThrown',(p)=>{page.jsErrors.push((p.exceptionDetails?.exception?.description||p.exceptionDetails?.text||'').slice(0,200));});page.send=(method,params={},t=30000)=>cdp.send(method,params,sessionId,t);await page.send('Page.enable');await page.send('Runtime.enable');page.eval=async(exp,t=30000)=>{const r=await page.send('Runtime.evaluate',{expression:exp,awaitPromise:true,returnByValue:true},t);if(r.exceptionDetails)throw new Error('eval: '+(r.exceptionDetails.exception?.description||r.exceptionDetails.text));return r.result?.value;};page.goto=async(url)=>{const loaded=new Promise((res)=>{const off=cdp.on(sessionId,'Page.loadEventFired',()=>{off();res();});});await page.send('Page.navigate',{url}).catch(()=>{});await Promise.race([loaded,sleep(20000)]);await sleep(1500);};page.setViewport=async(w,h)=>{await page.send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:2,mobile:true});};page.click=async(sel)=>{await page.eval(`document.querySelector('${sel}').click()`);};return page;}

async function main() {
  const wsUrl = await launchChrome();
  const cdp = await CDP.connect(wsUrl);
  const page = await newPage(cdp);
  await page.setViewport(390, 844);
  await page.goto(BASE);

  // ========== C5: 滚动隐藏/停止显示 ==========
  console.log('=== C5 滚动隐藏/停止显示 ===');

  // 顶部时常驻
  const top = await page.eval(`document.getElementById('navbar').getAttribute('data-state')`);
  check('C5 顶部时导航栏 visible', top === 'visible', 'state=' + top);

  // 向下滚动 → 隐藏（立即检查，不等兜底恢复计时器）
  await page.eval(`window.scrollTo({top: 800, behavior: 'instant'})`);
  await sleep(150);
  const scrolledDown = await page.eval(`document.getElementById('navbar').getAttribute('data-state')`);
  check('C5 下滑后导航栏 hidden', scrolledDown === 'hidden', 'state=' + scrolledDown);

  // 停止滚动 700ms+ → 显示（等兜底恢复计时器到期）
  await sleep(700);
  const stopped = await page.eval(`document.getElementById('navbar').getAttribute('data-state')`);
  check('C5 停止滚动后导航栏恢复 visible', stopped === 'visible', 'state=' + stopped);

  // 向上滚动 → 显示
  await page.eval(`window.scrollTo({top: 800, behavior: 'instant'})`); await sleep(400);
  await page.eval(`window.scrollTo({top: 400, behavior: 'instant'})`);
  await sleep(400);
  const scrolledUp = await page.eval(`document.getElementById('navbar').getAttribute('data-state')`);
  check('C5 上滑后导航栏 visible', scrolledUp === 'visible', 'state=' + scrolledUp);

  // 回到顶部 → 常驻
  await page.eval(`window.scrollTo({top: 0, behavior: 'instant'})`); await sleep(400);
  const backTop = await page.eval(`document.getElementById('navbar').getAttribute('data-state')`);
  check('C5 回到顶部导航栏 visible', backTop === 'visible', 'state=' + backTop);

  // 面板展开时滚动不隐藏（C2 锁定优先）
  await page.eval(`window.scrollTo({top: 0, behavior: 'instant'})`); await sleep(300);
  await page.click('#navBurger'); await sleep(400);
  await page.eval(`window.scrollTo({top: 600, behavior: 'instant'})`); await sleep(500);
  const panelOpenScroll = await page.eval(`(() => {
    const nb = document.getElementById('navbar');
    const panel = document.getElementById('navPanel');
    return { navState: nb.getAttribute('data-state'), panelOpen: panel.getAttribute('data-open') };
  })()`);
  check('C5 面板展开时滚动不隐藏导航栏', panelOpenScroll.navState === 'visible' && panelOpenScroll.panelOpen === 'true', JSON.stringify(panelOpenScroll));
  await page.click('#navBurger'); // 收起
  await sleep(300);

  // ========== 背景虚化 ==========
  console.log('\n=== 背景虚化 ===');
  await page.eval(`window.scrollTo({top: 0, behavior: 'instant'})`); await sleep(300);
  await page.click('#navBurger'); await sleep(500);
  const blur = await page.eval(`(() => {
    const ov = document.querySelector('.nav-panel-overlay');
    const cs = getComputedStyle(ov);
    return { open: ov.getAttribute('data-open'), backdropFilter: cs.backdropFilter, webkitBackdropFilter: cs.webkitBackdropFilter, bg: cs.backgroundColor };
  })()`);
  check('背景虚化: overlay data-open=true', blur.open === 'true', blur.open);
  check('背景虚化: backdropFilter 含 blur', blur.backdropFilter.includes('blur') || blur.webkitBackdropFilter.includes('blur'), JSON.stringify(blur));
  check('背景虚化: 遮罩有半透明背景色', blur.bg !== 'rgba(0, 0, 0, 0)', 'bg=' + blur.bg);

  // 收起后解除虚化
  await page.click('#navBurger'); await sleep(400);
  const blurOff = await page.eval(`(() => {
    const ov = document.querySelector('.nav-panel-overlay');
    const cs = getComputedStyle(ov);
    return { open: ov.getAttribute('data-open'), backdropFilter: cs.backdropFilter };
  })()`);
  check('收起后解除虚化: overlay data-open=false', blurOff.open === 'false', blurOff.open);

  // ========== 桌面端不变性：仍用 hover/2秒隐藏 ==========
  console.log('\n=== 桌面端 hover 机制不变 ===');
  await page.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await page.goto(BASE);
  // 桌面端滚动不应触发方向隐藏（isMobile=false）
  await page.eval(`window.scrollTo({top: 800, behavior: 'instant'})`); await sleep(500);
  const deskScroll = await page.eval(`document.getElementById('navbar').getAttribute('data-state')`);
  check('桌面端滚动不触发方向隐藏（仍 visible 或由 hover 计时控制）', deskScroll === 'visible', 'state=' + deskScroll);

  check('全程无 JS 异常', page.jsErrors.length === 0, page.jsErrors.join(' | '));

  console.log('\n' + '='.repeat(56));
  console.log(results.join('\n'));
  console.log('='.repeat(56));
  console.log(`C5+虚化验证：通过 ${passed}   失败 ${failed}   总计 ${passed + failed}`);
  console.log('='.repeat(56));
  try { await cdp.send('Browser.close', {}, undefined, 3000); } catch {}
  try { cdp.ws.close(); } catch {}
  process.exit(failed === 0 ? 0 : 1);
}
main().catch((e) => { console.error('测试异常:', e.message); process.exit(1); });
