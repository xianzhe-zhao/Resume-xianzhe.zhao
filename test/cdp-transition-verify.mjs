// C1+C2 验证：CSS transition 声明 + View Transitions 语言切换 + 既有功能不破坏
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
async function launchChrome() { const exe = findChrome(); if (!exe) throw new Error('no chrome'); chromeDir = mkdtempSync(join(tmpdir(), 'resume-trans-')); chromeProc = spawn(exe, ['--headless=new','--remote-debugging-port=0',`--user-data-dir=${chromeDir}`,'--no-first-run','--no-default-browser-check','--mute-audio','--hide-scrollbars','--disable-background-timer-throttling','--disable-renderer-backgrounding','--force-color-profile=srgb','--window-size=1440,900','about:blank'], { stdio: ['ignore','ignore','pipe'] }); return new Promise((resolve, reject) => { let buf=''; const t=setTimeout(()=>reject(new Error('timeout')),20000); chromeProc.stderr.on('data',d=>{buf+=d.toString();const m=buf.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(m){clearTimeout(t);resolve(m[1]);}}); chromeProc.on('exit',c=>{clearTimeout(t);reject(new Error('exit '+c));}); }); }
class CDP { static async connect(wsUrl){const ws=new WebSocket(wsUrl);await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=()=>rej(new Error('fail'));});const c=new CDP();c.ws=ws;c.nextId=1;c.pending=new Map();c.listeners=new Map();ws.onmessage=(ev)=>{const msg=JSON.parse(typeof ev.data==='string'?ev.data:Buffer.from(ev.data).toString());if(msg.id&&c.pending.has(msg.id)){const{resolve,reject,timer}=c.pending.get(msg.id);clearTimeout(timer);c.pending.delete(msg.id);if(msg.error)reject(new Error(msg.error.message));else resolve(msg.result);}};return c;} send(method,params={},sessionId,timeoutMs=30000){const id=this.nextId++;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error('timeout '+method));},timeoutMs);this.pending.set(id,{resolve,reject,timer});this.ws.send(JSON.stringify(sessionId?{id,method,params,sessionId}:{id,method,params}));});} on(sessionId,method,fn){const k=(sessionId||'')+'|'+method;if(!this.listeners.has(k))this.listeners.set(k,new Set());this.listeners.get(k).add(fn);return()=>this.listeners.get(k)?.delete(fn);} }
async function newPage(cdp){const {targetId}=await cdp.send('Target.createTarget',{url:'about:blank',newWindow:true});const {sessionId}=await cdp.send('Target.attachToTarget',{targetId,flatten:true});const page={targetId,sessionId,jsErrors:[]};cdp.on(sessionId,'Runtime.exceptionThrown',(p)=>{page.jsErrors.push((p.exceptionDetails?.exception?.description||p.exceptionDetails?.text||'').slice(0,200));});page.send=(method,params={},t=30000)=>cdp.send(method,params,sessionId,t);await page.send('Page.enable');await page.send('Runtime.enable');page.eval=async(exp,t=30000)=>{const r=await page.send('Runtime.evaluate',{expression:exp,awaitPromise:true,returnByValue:true},t);if(r.exceptionDetails)throw new Error('eval: '+(r.exceptionDetails.exception?.description||r.exceptionDetails.text));return r.result?.value;};page.goto=async(url)=>{const loaded=new Promise((res)=>{const off=cdp.on(sessionId,'Page.loadEventFired',()=>{off();res();});});await page.send('Page.navigate',{url}).catch(()=>{});await Promise.race([loaded,sleep(20000)]);await sleep(1500);};page.setViewport=async(w,h,mobile=false)=>{await page.send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:mobile?2:1,mobile});};page.click=async(sel)=>{await page.eval(`document.querySelector('${sel}').click()`);};return page;}

async function main() {
  const wsUrl = await launchChrome();
  const cdp = await CDP.connect(wsUrl);
  const page = await newPage(cdp);

  // ========== C1: CSS transition 声明存在 ==========
  console.log('=== C1 CSS transition ===');
  await page.setViewport(1440, 900);
  await page.goto(BASE);
  const c1 = await page.eval(`(() => {
    const item = document.querySelector('.proj-item');
    const sec = document.querySelector('.projects');
    const metric = document.querySelector('.proj-metric');
    return {
      itemTransition: getComputedStyle(item).transition,
      secTransition: getComputedStyle(sec).transition,
      metricTransition: getComputedStyle(metric).transition,
    };
  })()`);
  check('C1 proj-item transition 含 grid-template-columns', c1.itemTransition.includes('grid-template-columns'), c1.itemTransition);
  check('C1 projects section transition 含 padding', c1.secTransition.includes('padding'), c1.secTransition);
  check('C1 proj-metric transition 含 font-size', c1.metricTransition.includes('font-size'), c1.metricTransition);

  // ========== C2: View Transitions 语言切换 ==========
  console.log('=== C2 View Transitions ===');
  // 检查 startViewTransition 是否存在
  const hasVT = await page.eval(`typeof document.startViewTransition === 'function'`);
  check('C2 浏览器支持 startViewTransition', hasVT, 'headless Chrome 应支持');

  if (hasVT) {
    // 劫持 startViewTransition 验证调用
    await page.eval(`window.__vtCalled = 0; var origVT = document.startViewTransition.bind(document); document.startViewTransition = function(cb) { window.__vtCalled++; return origVT(cb); };`);
    await page.click('#langBtn');
    await sleep(800);
    const vtResult = await page.eval(`(() => ({ called: window.__vtCalled, lang: document.documentElement.lang, title: document.title }))()`);
    check('C2 语言切换调用了 startViewTransition', vtResult.called === 1, 'called=' + vtResult.called);
    check('C2 语言切换成功（lang 变为 en）', vtResult.lang === 'en', vtResult.lang);
    check('C2 标题切换为英文', vtResult.title.includes('Resume'), vtResult.title);

    // 切回中文
    await page.click('#langBtn');
    await sleep(800);
    const back = await page.eval(`(() => ({ called: window.__vtCalled, lang: document.documentElement.lang }))()`);
    check('C2 切回中文（第二次 startViewTransition）', back.called === 2, 'called=' + back.called);
    check('C2 lang 回到 zh-CN', back.lang === 'zh-CN', back.lang);
  }

  // ========== 既有功能不破坏 ==========
  console.log('=== 既有功能 ===');
  // 手机端 featured 单列
  await page.setViewport(390, 844, true);
  await page.goto(BASE);
  const feat = await page.eval(`getComputedStyle(document.querySelector('.proj-item.featured')).gridTemplateColumns.trim().split(/\\s+/).length`);
  check('手机端 featured 仍单列', feat === 1, 'cols=' + feat);

  // 桌面端 featured 双列
  await page.setViewport(1440, 900);
  await page.goto(BASE);
  const featDesk = await page.eval(`getComputedStyle(document.querySelector('.proj-item.featured')).gridTemplateColumns.trim().split(/\\s+/).length`);
  check('桌面端 featured 仍双列', featDesk === 2, 'cols=' + featDesk);

  check('全程无 JS 异常', page.jsErrors.length === 0, page.jsErrors.join(' | '));

  console.log('\n' + '='.repeat(56));
  console.log(results.join('\n'));
  console.log('='.repeat(56));
  console.log(`过渡动画验证：通过 ${passed}   失败 ${failed}   总计 ${passed + failed}`);
  console.log('='.repeat(56));
  try { await cdp.send('Browser.close', {}, undefined, 3000); } catch {}
  try { cdp.ws.close(); } catch {}
  process.exit(failed === 0 ? 0 : 1);
}
main().catch((e) => { console.error('测试异常:', e.message); process.exit(1); });
