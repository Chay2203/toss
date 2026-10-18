// One HTTP server. No database, framework, or third-party application packages.
import http from 'node:http';
import { randomInt, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
const version=process.env.APP_VERSION||'development';
const assets=new Map(['index.html','app.js','style.css'].map(name=>[
 name==='index.html'?'/':'/'+name,readFileSync(new URL('../public/'+name,import.meta.url))
]));
const requests=new Map();
const bounds=[0.005,0.01,0.025,0.05,0.1,0.25,0.5,1];
const duration={count:0,sum:0,buckets:bounds.map(()=>0)};
const tosses={Heads:0,Tails:0};
let draining=false;
const id=bytes=>randomBytes(bytes).toString('hex');
const log=data=>console.log(JSON.stringify({time:new Date().toISOString(),version,...data}));
const send=(res,status,data,type='application/json')=>{
 res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store'});
 res.end(type==='application/json'?JSON.stringify(data):data);
};
function metrics(){
 const lines=['# TYPE coin_toss_http_requests_total counter'];
 for(const [key,count] of requests){const [route,status]=key.split('|');lines.push(`coin_toss_http_requests_total{route="${route}",status="${status}"} ${count}`);}
 lines.push('# TYPE coin_toss_results_total counter');
 for(const [result,count] of Object.entries(tosses))lines.push(`coin_toss_results_total{result="${result}"} ${count}`);
 lines.push('# TYPE coin_toss_http_duration_seconds histogram');
 bounds.forEach((bound,i)=>lines.push(`coin_toss_http_duration_seconds_bucket{le="${bound}"} ${duration.buckets[i]}`));
 lines.push(`coin_toss_http_duration_seconds_bucket{le="+Inf"} ${duration.count}`,`coin_toss_http_duration_seconds_count ${duration.count}`,`coin_toss_http_duration_seconds_sum ${duration.sum}`);
 return lines.join('\n')+'\n';
}
const server=http.createServer({maxHeaderSize:8192,requestTimeout:10000,headersTimeout:10000},(req,res)=>{
 const start=performance.now(),traceId=id(16),httpSpan=id(8);
 const route=['/api/toss','/healthz','/readyz','/metrics','/version','/','/app.js','/style.css'].includes(req.url)?req.url:'unknown';
 res.setHeader('X-Trace-Id',traceId);
 res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Content-Security-Policy',"default-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
 // A request log and a timed HTTP span share the trace ID with the coin-flip child span.
 res.on('finish',()=>{
  if(['/healthz','/readyz','/metrics'].includes(route))return;
  const seconds=(performance.now()-start)/1000,key=route+'|'+res.statusCode;
  requests.set(key,(requests.get(key)||0)+1);
  duration.count++;duration.sum+=seconds;
  bounds.forEach((bound,i)=>{if(seconds<=bound)duration.buckets[i]++;});
  log({event:'request',route,status:res.statusCode,duration_ms:Math.round(seconds*100000)/100,trace_id:traceId});
  log({event:'span',name:'http.request',trace_id:traceId,span_id:httpSpan,parent_span_id:null,duration_ms:seconds*1000});
 });
 req.resume(); // No endpoint needs a request body.
 try{
  if(req.method==='GET'&&route==='/healthz')return send(res,200,{status:'alive'});
  if(req.method==='GET'&&route==='/readyz')return send(res,draining?503:200,{status:draining?'draining':'ready'});
  if(req.method==='GET'&&route==='/version')return send(res,200,{name:'Coin Toss',version});
  if(req.method==='GET'&&route==='/metrics')return send(res,200,metrics(),'text/plain; version=0.0.4');
  if(draining)return send(res,503,{error:'Shutting down'});
  if(req.method==='POST'&&route==='/api/toss'){
   const coinStart=performance.now();
   const result=randomInt(2)===0?'Heads':'Tails';
   tosses[result]++;
   log({event:'span',name:'coin.flip',trace_id:traceId,span_id:id(8),parent_span_id:httpSpan,duration_ms:performance.now()-coinStart});
   return send(res,200,{result,version,traceId});
  }
  if(req.method==='GET'&&assets.has(route))return send(res,200,assets.get(route),route==='/'?'text/html; charset=utf-8':route.endsWith('.css')?'text/css; charset=utf-8':'text/javascript; charset=utf-8');
  send(res,404,{error:'Not found'});
 }catch{send(res,500,{error:'Internal error'});}
});
server.listen(Number(process.env.PORT||3000),process.env.HOST||'0.0.0.0',()=>log({event:'started',port:server.address().port}));
function shutdown(){draining=true;server.close(()=>process.exit(0));setTimeout(()=>process.exit(1),5000).unref();}
process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
