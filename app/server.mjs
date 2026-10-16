import http from 'node:http';
import { randomInt } from 'node:crypto';
import { readFileSync } from 'node:fs';
const server=http.createServer((req,res)=>{
 if(req.url==='/api/toss'&&req.method==='POST'){
  res.writeHead(200,{'Content-Type':'application/json'});
  res.end(JSON.stringify({result:randomInt(2)===0?'Heads':'Tails'}));
 }else if(req.url==='/'&&req.method==='GET'){
  res.writeHead(200,{'Content-Type':'text/html'});
  res.end(readFileSync(new URL('../public/index.html',import.meta.url)));
 }else{res.writeHead(404);res.end('Not found');}
});
server.listen(Number(process.env.PORT||3000),'0.0.0.0');
