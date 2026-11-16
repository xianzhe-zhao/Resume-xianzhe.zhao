// 验证跨越断点时 startViewTransition 被调用
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
async function launchChrome() { const exe = findChrome(); if (!exe) throw new Error('no chrome'); chromeDir = mkdtempSync(join(tmpdir(), 'resume-bpvt-')); chromeProc = spawn(exe, ['--headless=new','--remote-debugging-port=0',`--user-data-dir=${chromeDir}`,'--no-first-run','--no-default-browser-check','--mute-audio','--hide-scrollbars','--disable-background-timer-throttling','--disable-renderer-backgrounding','--force-color-profile=srgb','--window-size=1440,900','about:blank'], { stdio: ['ignore','ignore','pipe'] }); return new Promise((resolve, reject) => { let buf=''; const t=setTimeout(()=>reject(new Error('timeout')),20000); chromeProc.stderr.on('data',d=>{buf+=d.toString();const m=buf.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(m){clearTimeout(t);resolve(m[1]);}}); chromeProc.on('exit',c=>{clearTimeout(t);reject(new Error('exit '+c));}); }); }
class CDP { static async connect(wsUrl){const ws=new WebSocket(wsUrl);await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=()=>rej(new Error('fail'));});const c=new CDP();c.ws=ws;c.nextId=1;c.pending=new Map();c.listeners=new Map();ws.onmessage=(ev)=>{const msg=JSON.parse(typeof ev.data==='string'?ev.data:Buffer.from(ev.data).toString());if(msg.id&&c.pending.has(msg.id)){const{resolve,reject,timer}=c.pending.get(msg.id);clearTimeout(timer);c.pending.delete(msg.id);if(msg.error)reject(new Error(msg.error.message));else resolve(msg.result);}};return c;} send(method,params={},sessionId,timeoutMs=30000){const id=this.nextId++;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error('timeout '+method));},timeoutMs);this.pending.set(id,{resolve,reject,timer});this.ws.send(JSON.stringify(sessionId?{id,method,params,sessionId}:{id,method,params}));});} on(sessionId,method,fn){const k=(sessionId||'')+'|'+method;if(!this.listeners.has(k))this.listeners.set(k,new Set());this.listeners.get(k).add(fn);return()=>this.listeners.get(k)?.delete(fn);} }
async function newPage(cdp){const {targetId}=await cdp.send('Target.createTarget',{url:'about:blank',newWindow:true});const {sessionId}=await cdp.send('Target.attachToTarget',{targetId,flatten:true});const page={targetId,sessionId,jsErrors:[]};cdp.on(sessionId,'Runtime.exceptionThrown',(p)=>{page.jsErrors.push((p.exceptionDetails?.exception?.description||p.exceptionDetails?.text||'').slice(0,200));});page.send=(method,params={},t=30000)=>cdp.send(method,params,sessionId,t);await page.send('Page.enable');await page.send('Runtime.enable');page.eval=async(exp,t=30000)=>{const r=await page.send('Runtime.evaluate',{expression:exp,awaitPromise:true,returnByValue:true},t);if(r.exceptionDetails)throw new Error('eval: '+(r.exceptionDetails.exception?.description||r.exceptionDetails.text));return r.result?.value;};page.goto=async(url)=>{const loaded=new Promise((res)=>{const off=cdp.on(sessionId,'Page.loadEventFired',()=>{off();res();});});await page.send('Page.navigate',{url}).catch(()=>{});await Promise.race([loaded,sleep(20000)]);await sleep(1500);};return page;}

async function main() {
  const wsUrl = await launchChrome();
  const cdp = await CDP.connect(wsUrl);
  const page = await newPage(cdp);
  // 桌面 1440 加载
  await page.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await page.goto(BASE);

  // 劫持 startViewTransition 计数
  await page.eval(`window.__vtCount = 0; var orig = document.startViewTransition; document.startViewTransition = function(cb) { window.__vtCount++; return orig.call(document, cb); };`);

  // 跨越 1000 断点：1440 → 950（桌面→平板）
  await page.send('Emulation.setDeviceMetricsOverride', { width: 950, height: 900, deviceScaleFactor: 1, mobile: false });
  await sleep(600);
  const vt1 = await page.eval('window.__vtCount');
  check('跨越 1000 断点（1440→950）触发 startViewTransition', vt1 >= 1, 'count=' + vt1);

  // 同断点内移动不触发：950 → 850（都在 ≤1000）
  await page.send('Emulation.setDeviceMetricsOverride', { width: 850, height: 900, deviceScaleFactor: 1, mobile: false });
  await sleep(400);
  const vt2 = await page.eval('window.__vtCount');
  check('同断点内移动（950→850）不额外触发', vt2 === vt1, 'count=' + vt2 + ' vs ' + vt1);

  // 跨越 760 断点：850 → 700（平板→手机）
  await page.send('Emulation.setDeviceMetricsOverride', { width: 700, height: 900, deviceScaleFactor: 2, mobile: true });
  await sleep(600);
  const vt3 = await page.eval('window.__vtCount');
  check('跨越 760 断点（850→700）触发 startViewTransition', vt3 >= vt2 + 1, 'count=' + vt3);

  // 跨越 560 断点：700 → 500
  await page.send('Emulation.setDeviceMetricsOverride', { width: 500, height: 900, deviceScaleFactor: 2, mobile: true });
  await sleep(600);
  const vt4 = await page.eval('window.__vtCount');
  check('跨越 560 断点（700→500）触发 startViewTransition', vt4 >= vt3 + 1, 'count=' + vt4);

  // 回到桌面：500 → 1440（跨越多个断点）
  await page.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await sleep(600);
  const vt5 = await page.eval('window.__vtCount');
  check('回到桌面（500→1440）触发 startViewTransition', vt5 >= vt4 + 1, 'count=' + vt5);

  check('全程无 JS 异常', page.jsErrors.length === 0, page.jsErrors.join(' | '));

  console.log('\n' + '='.repeat(56));
  console.log(results.join('\n'));
  console.log('='.repeat(56));
  console.log(`断点 View Transitions 验证：通过 ${passed}   失败 ${failed}   总计 ${passed + failed}`);
  console.log('='.repeat(56));
  try { await cdp.send('Browser.close', {}, undefined, 3000); } catch {}
  try { cdp.ws.close(); } catch {}
  process.exit(failed === 0 ? 0 : 1);
}
main().catch((e) => { console.error('测试异常:', e.message); process.exit(1); });
