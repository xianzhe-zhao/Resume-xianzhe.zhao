// 模拟 resize 在三宽度间切换，检查切换瞬间是否有 opacity:0 空白
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const BASE = 'http://127.0.0.1:3999/ai';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let chromeProc = null, chromeDir = null;
process.on('exit', () => { try { if (chromeProc) spawnSync('taskkill', ['/pid', String(chromeProc.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {} try { if (chromeDir) rmSync(chromeDir, { recursive: true, force: true, maxRetries: 3 }); } catch {} });
function findChrome() { const env = process.env.CHROME_PATH || process.env.PUPPETEER_EXECUTABLE_PATH; if (env && existsSync(env)) return env; const pf = process.env.PROGRAMFILES || 'C:\\Program Files'; const pf86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)'; const local = process.env.LOCALAPPDATA || ''; for (const c of [join(pf,'Google/Chrome/Application/chrome.exe'),join(pf86,'Google/Chrome/Application/chrome.exe'),join(local,'Google/Chrome/Application/chrome.exe'),join(pf86,'Microsoft/Edge/Application/msedge.exe'),join(pf,'Microsoft/Edge/Application/msedge.exe')]) if (c && existsSync(c)) return c; return null; }
async function launchChrome() { const exe = findChrome(); if (!exe) throw new Error('no chrome'); chromeDir = mkdtempSync(join(tmpdir(), 'resume-resize-')); chromeProc = spawn(exe, ['--headless=new','--remote-debugging-port=0',`--user-data-dir=${chromeDir}`,'--no-first-run','--no-default-browser-check','--mute-audio','--hide-scrollbars','--disable-background-timer-throttling','--disable-renderer-backgrounding','--force-color-profile=srgb','--window-size=1440,900','about:blank'], { stdio: ['ignore','ignore','pipe'] }); return new Promise((resolve, reject) => { let buf=''; const t=setTimeout(()=>reject(new Error('timeout')),20000); chromeProc.stderr.on('data',d=>{buf+=d.toString();const m=buf.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(m){clearTimeout(t);resolve(m[1]);}}); chromeProc.on('exit',c=>{clearTimeout(t);reject(new Error('exit '+c));}); }); }
class CDP { static async connect(wsUrl){const ws=new WebSocket(wsUrl);await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=()=>rej(new Error('fail'));});const c=new CDP();c.ws=ws;c.nextId=1;c.pending=new Map();c.listeners=new Map();ws.onmessage=(ev)=>{const msg=JSON.parse(typeof ev.data==='string'?ev.data:Buffer.from(ev.data).toString());if(msg.id&&c.pending.has(msg.id)){const{resolve,reject,timer}=c.pending.get(msg.id);clearTimeout(timer);c.pending.delete(msg.id);if(msg.error)reject(new Error(msg.error.message));else resolve(msg.result);}};return c;} send(method,params={},sessionId,timeoutMs=30000){const id=this.nextId++;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error('timeout '+method));},timeoutMs);this.pending.set(id,{resolve,reject,timer});this.ws.send(JSON.stringify(sessionId?{id,method,params,sessionId}:{id,method,params}));});} on(sessionId,method,fn){const k=(sessionId||'')+'|'+method;if(!this.listeners.has(k))this.listeners.set(k,new Set());this.listeners.get(k).add(fn);return()=>this.listeners.get(k)?.delete(fn);} }
async function newPage(cdp){const {targetId}=await cdp.send('Target.createTarget',{url:'about:blank',newWindow:true});const {sessionId}=await cdp.send('Target.attachToTarget',{targetId,flatten:true});const page={targetId,sessionId};page.send=(method,params={},t=30000)=>cdp.send(method,params,sessionId,t);await page.send('Page.enable');await page.send('Runtime.enable');page.eval=async(exp,t=30000)=>{const r=await page.send('Runtime.evaluate',{expression:exp,awaitPromise:true,returnByValue:true},t);if(r.exceptionDetails)throw new Error('eval: '+(r.exceptionDetails.exception?.description||r.exceptionDetails.text));return r.result?.value;};page.goto=async(url)=>{const loaded=new Promise((res)=>{const off=cdp.on(sessionId,'Page.loadEventFired',()=>{off();res();});});await page.send('Page.navigate',{url}).catch(()=>{});await Promise.race([loaded,sleep(20000)]);await sleep(1500);};return page;}

async function countHidden(page) {
  return await page.eval(`(() => {
    let c = 0; const sels = ['.about .sec-head','.about .bubble','.experience .sec-head','.experience .exp-item','.projects .sec-head','.projects .proj-item','.skills .sec-head','.skills .skill-card','.edu-honors .sec-head','.edu-honors .eh-card','.off-duty .sec-head','.off-duty .od-item','.footer-main > *','.hero-card','.hero-text > *'];
    sels.forEach(sel => { document.querySelectorAll(sel).forEach(el => { const cs = getComputedStyle(el); if (cs.opacity === '0' || cs.visibility === 'hidden') c++; }); });
    return c;
  })()`);
}

async function main() {
  const wsUrl = await launchChrome();
  const cdp = await CDP.connect(wsUrl);
  const page = await newPage(cdp);
  // 先桌面加载
  await page.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await page.goto(BASE);
  console.log('桌面 1440 加载后 hidden:', await countHidden(page));

  // 模拟来回切换：1440 → 768 → 1440 → 390 → 1440 → 1024 → 390 → 1440
  const seq = [768, 1440, 390, 1440, 1024, 390, 1440, 768, 1440];
  for (const w of seq) {
    await page.send('Emulation.setDeviceMetricsOverride', { width: w, height: 900, deviceScaleFactor: 2, mobile: w <= 1024 });
    await sleep(300); // 切换后立即检查（捕捉空白瞬间）
    const h1 = await countHidden(page);
    await sleep(800); // 等 matchMedia 重新初始化
    const h2 = await countHidden(page);
    // 手动调用 gsap.set 看是否能清除
    await page.eval(`(() => {
      if (typeof gsap === 'undefined') return 'no gsap';
      var vh = window.innerHeight;
      var all = document.querySelectorAll('.about .sec-head,.about .bubble,.experience .sec-head,.experience .exp-item,.projects .sec-head,.projects .proj-item,.skills .sec-head,.skills .skill-card,.edu-honors .sec-head,.edu-honors .eh-card,.off-duty .sec-head,.off-duty .od-item,.footer-main > *');
      var setCount = 0;
      all.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < vh * 0.82 && r.bottom > 0) { gsap.set(el, { autoAlpha: 1, y: 0 }); setCount++; } });
      return 'set ' + setCount + ' elements';
    })()`);
    await sleep(200);
    const h3 = await countHidden(page);
    // 再检查 gsap.set 后的内联 style
    const sampleStyle = await page.eval(`(() => {
      var el = document.querySelector('.about .sec-head');
      return { opacity: el.style.opacity, visibility: el.style.visibility, gsapOpacity: el._gsap ? el._gsap.opacity : 'no _gsap' };
    })()`);
    console.log(`切换到 ${w}px: 瞬间=${h1}, 800ms后=${h2}, gsap.set后=${h3}, sample=${JSON.stringify(sampleStyle)}`);
  }

  try { await cdp.send('Browser.close', {}, undefined, 3000); } catch {}
  try { cdp.ws.close(); } catch {}
  process.exit(0);
}
main().catch((e) => { console.error('异常:', e.message); process.exit(1); });
