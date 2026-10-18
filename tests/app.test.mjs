import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
let child,base,logs='';
before(async()=>{
 child=spawn(process.execPath,['app/server.mjs'],{env:{...process.env,PORT:'0',HOST:'127.0.0.1',APP_VERSION:'test-version'},stdio:['ignore','pipe','inherit']});
 child.stdout.on('data',data=>{logs+=data;});
 base=await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(Error('Startup timeout')),5000);
  child.stdout.on('data',data=>{for(const line of data.toString().trim().split('\n')){const event=JSON.parse(line);if(event.event==='started'){clearTimeout(timer);resolve('http://127.0.0.1:'+event.port);}}});
  child.on('error',reject);
 });
});
after(async()=>{if(child?.exitCode===null){const exited=once(child,'exit');child.kill('SIGTERM');await exited;}});
test('coin toss user journey, version and correlated request spans',async()=>{
 const response=await fetch(base+'/api/toss',{method:'POST'});assert.equal(response.status,200);
 const data=await response.json();assert.ok(['Heads','Tails'].includes(data.result));assert.equal(data.version,'test-version');
 assert.equal(data.traceId,response.headers.get('x-trace-id'));
 await new Promise(resolve=>setTimeout(resolve,30));
 const events=logs.trim().split('\n').map(JSON.parse).filter(e=>e.trace_id===data.traceId);
 const root=events.find(e=>e.name==='http.request'),childSpan=events.find(e=>e.name==='coin.flip');
 assert.ok(events.find(e=>e.event==='request'));assert.equal(childSpan.parent_span_id,root.span_id);
});
test('health, HTTP boundaries, browser security and request metrics',async()=>{
 for(const path of ['/healthz','/readyz','/'])assert.equal((await fetch(base+path)).status,200);
 assert.equal((await fetch(base+'/api/toss')).status,404);
 assert.equal((await fetch(base+'/../../etc/passwd')).status,404);
 const page=await fetch(base+'/');assert.match(page.headers.get('content-security-policy'),/default-src 'self'/);
 assert.equal(page.headers.get('x-content-type-options'),'nosniff');
 const metrics=await(await fetch(base+'/metrics')).text();assert.match(metrics,/coin_toss_results_total/);assert.match(metrics,/coin_toss_http_duration_seconds_bucket/);
 assert.equal((await(await fetch(base+'/version')).json()).version,'test-version');
});
