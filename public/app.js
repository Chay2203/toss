const $=selector=>document.querySelector(selector);
const counts={Heads:0,Tails:0};
$('#toss').addEventListener('click',async()=>{
 const button=$('#toss');button.disabled=true;$('#coin').classList.add('tossing');
 try{
  const response=await fetch('/api/toss',{method:'POST'});
  if(!response.ok)throw Error('The toss failed. Please try again.');
  const data=await response.json();counts[data.result]++;
  $('#result').textContent=data.result;$('#coin').textContent=data.result==='Heads'?'H':'T';
  $('#coin').classList.toggle('tails',data.result==='Tails');
  $('#heads').textContent=counts.Heads;$('#tails').textContent=counts.Tails;$('#total').textContent=counts.Heads+counts.Tails;
  $('#status').textContent='The coin has spoken. Toss again?';
 }catch(error){$('#status').textContent=error.message;}
 finally{button.disabled=false;$('#coin').classList.remove('tossing');}
});
fetch('/version').then(r=>r.json()).then(data=>{$('#version').textContent='Build '+data.version.slice(0,8);}).catch(()=>{$('#version').textContent='Offline';});
