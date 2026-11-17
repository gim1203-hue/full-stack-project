import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp} from './app.js';
test('catalog filters and order validation, server pricing, and persistence',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'market-lane-'));const file=join(dir,'orders.json');const server=(await createApp(file)).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base=`http://127.0.0.1:${server.address().port}`;
 const post=items=>fetch(base+'/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items,total:0})});
 try{
  const products=await fetch(base+'/api/products').then(r=>r.json());assert.equal(products.length,8);
  const found=await fetch(base+'/api/products?category=Electronics&q=headphones').then(r=>r.json());assert.equal(found.length,1);assert.equal(found[0].id,'headphones');
  const sorted=await fetch(base+'/api/products?sort=price-asc').then(r=>r.json());assert.deepEqual(sorted.map(p=>p.price),products.map(p=>p.price).sort((a,b)=>a-b));
  assert.equal((await fetch(base+'/api/products/missing')).status,404);
  for(const invalid of [[],[null],[{id:'missing',quantity:1}],[{id:'headphones',quantity:0}],[{id:'headphones',quantity:1.5}],[{id:'headphones',quantity:999}],[{id:'headphones',quantity:1},{id:'headphones',quantity:1}]])assert.equal((await post(invalid)).status,400);
  const result=await post([{id:'headphones',quantity:2,price:.01}]);assert.equal(result.status,201);const order=await result.json();assert.equal(order.subtotal,159.98);assert.equal(order.shipping,0);assert.equal(order.total,159.98);assert.equal(order.status,'demo-confirmed');
  const small=await post([{id:'serum',quantity:1}]).then(r=>r.json());assert.equal(small.shipping,4.99);assert.equal(small.total,28.99);
  const saved=JSON.parse(await readFile(file,'utf8'));assert.equal(saved.length,2);assert.equal(saved[0].id,order.id);
  const second=(await createApp(file)).listen(0,'127.0.0.1');await new Promise(r=>second.once('listening',r));try{const r=await fetch(`http://127.0.0.1:${second.address().port}/api/orders`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[{id:'lamp',quantity:1}]})});assert.equal(r.status,201);assert.equal(JSON.parse(await readFile(file,'utf8')).length,3);}finally{second.close();}
 }finally{server.close();await rm(dir,{recursive:true,force:true});}
});
