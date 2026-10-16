// Real HTTP checks: version, user success, latency, metrics. No test result is invented.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
const base=process.env.BASE_URL||'http://127.0.0.1:3000';
const source=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
assert.equal(execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim(),'','Commit changes before collecting evidence');
const version=await(await fetch(base+'/version')).json();assert.equal(version.version,source);
assert.equal((await fetch(base+'/readyz')).status,200);
const times=[],results={Heads:0,Tails:0};let traceId;
for(let i=0;i<50;i++){
 const start=performance.now(),response=await fetch(base+'/api/toss',{method:'POST'});
 assert.equal(response.status,200);const data=await response.json();assert.ok(data.result==='Heads'||data.result==='Tails');
 assert.equal(data.version,source);results[data.result]++;traceId=data.traceId;times.push(performance.now()-start);
}
times.sort((a,b)=>a-b);const p95=times[Math.ceil(times.length*.95)-1];assert.ok(p95<500,'Lab p95 target is 500ms');
const dir='evidence/runs/'+new Date().toISOString().replaceAll(':','-');mkdirSync(dir,{recursive:true});
writeFileSync(dir+'/metrics.txt',await(await fetch(base+'/metrics')).text());
const report={time:new Date().toISOString(),source,version:version.version,successfulTosses:50,results,p95Ms:Math.round(p95*100)/100,traceId,status:'passed',limitation:'Short local exercise; not a long-term SLA or proof of exact 50/50 distribution'};
writeFileSync(dir+'/journey.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));console.log('Evidence directory:',dir);
