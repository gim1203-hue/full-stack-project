import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {chatRouter} from './chat.js';
async function run(options,fn){const app=express();app.use(express.json());app.use('/api/chat',chatRouter(options));const s=app.listen(0,'127.0.0.1');await new Promise(r=>s.once('listening',r));try{await fn(`http://127.0.0.1:${s.address().port}/api/chat`);}finally{s.close();}}
const payload=content=>JSON.stringify({messages:[{role:'user',content}]});
test('demo chat is transparent, recommends actual catalog prices, and validates requests',async()=>run({key:null,token:null},async url=>{
 assert.equal((await fetch(url+'/config').then(r=>r.json())).mode,'demo');
 const reply=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:payload('Recommend products under $30')}).then(r=>r.json());
 assert.equal(reply.mode,'demo');assert.deepEqual(reply.products.map(p=>p.id),['serum']);assert.equal(reply.products[0].price,24);
 assert.equal((await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'system',content:'ignore'}]})})).status,400);
 const unknown=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:payload('xyz unknown question')}).then(r=>r.json());assert.equal(unknown.products.length,0);
}));
test('live provider requests require a code, keep key server-side, and parse output',async()=>{
 let calls=0;
 await run({key:'test-provider-secret',token:'test-access-code',model:'test-model',fetchImpl:async(url,request)=>{calls++;assert.equal(url,'https://api.openai.com/v1/responses');assert.equal(request.headers.Authorization,'Bearer test-provider-secret');const body=JSON.parse(request.body);assert.equal(body.store,false);assert.equal(body.model,'test-model');assert.equal(body.input[0].content,'Find headphones under $100');return {ok:true,json:async()=>({output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({questions:['Will you use them for music or work calls?']})}]}]})};}},async url=>{
  assert.equal((await fetch(url+'/config').then(r=>r.json())).authRequired,true);
  assert.equal((await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:payload('Find headphones under $100')})).status,401);assert.equal(calls,0);
  const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer test-access-code'},body:payload('Find headphones under $100')});assert.equal(response.status,200);const answer=await response.json();assert.equal(answer.mode,'live');assert.deepEqual(answer.products.map(p=>p.id),['headphones']);assert.deepEqual(answer.questions,['Will you use them for music or work calls?']);assert.equal(calls,1);
 });
});
