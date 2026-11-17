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
  const products=await fetch(base+'/api/products').then(r=>r.json());assert.equal(products.length,80);
  const found=await fetch(base+'/api/products?category=Electronics&q=headphones').then(r=>r.json());assert.equal(found.length,8);assert.ok(found.every(p=>p.kind==='headphones'));
  const sorted=await fetch(base+'/api/products?sort=price-asc').then(r=>r.json());assert.deepEqual(sorted.map(p=>p.price),products.map(p=>p.price).sort((a,b)=>a-b));
  assert.equal((await fetch(base+'/api/products/missing')).status,404);
  for(const invalid of [[],[null],[{id:'missing',quantity:1}],[{id:'headphones',quantity:0}],[{id:'headphones',quantity:1.5}],[{id:'headphones',quantity:999}],[{id:'headphones',quantity:1},{id:'headphones',quantity:1}]])assert.equal((await post(invalid)).status,400);
  const result=await post([{id:'headphones',quantity:2,price:.01}]);assert.equal(result.status,201);const order=await result.json();assert.equal(order.subtotal,159.98);assert.equal(order.shipping,0);assert.equal(order.total,159.98);assert.equal(order.status,'demo-confirmed');
  const small=await post([{id:'serum',quantity:1}]).then(r=>r.json());assert.equal(small.shipping,4.99);assert.equal(small.total,28.99);
  const saved=JSON.parse(await readFile(file,'utf8'));assert.equal(saved.length,2);assert.equal(saved[0].id,order.id);
  const second=(await createApp(file)).listen(0,'127.0.0.1');await new Promise(r=>second.once('listening',r));try{const r=await fetch(`http://127.0.0.1:${second.address().port}/api/orders`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[{id:'lamp',quantity:1}]})});assert.equal(r.status,201);assert.equal(JSON.parse(await readFile(file,'utf8')).length,3);}finally{second.close();}
 }finally{server.close();await rm(dir,{recursive:true,force:true});}
});

test('browser CORS preflight and malformed checkout requests',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'market-lane-cors-'));
 const allowedOrigin='https://gim1203-hue.github.io';
 const server=(await createApp(join(dir,'orders.json'),{allowedOrigins:[allowedOrigin]})).listen(0,'127.0.0.1');
 await new Promise(r=>server.once('listening',r));
 const base=`http://127.0.0.1:${server.address().port}/api`;
 try {
  const preflight=await fetch(base+'/orders',{method:'OPTIONS',headers:{Origin:allowedOrigin,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type'}});
  assert.equal(preflight.status,204);
  assert.equal(preflight.headers.get('access-control-allow-origin'),allowedOrigin);
  assert.match(preflight.headers.get('access-control-allow-methods'),/POST/);
  const rejected=await fetch(base+'/orders',{method:'OPTIONS',headers:{Origin:'https://unlisted.example','Access-Control-Request-Method':'POST'}});
  assert.equal(rejected.status,403);
  assert.equal(rejected.headers.get('access-control-allow-origin'),null);
  const catalog=await fetch(base+'/products',{headers:{Origin:allowedOrigin}});
  assert.equal(catalog.status,200);assert.equal(catalog.headers.get('access-control-allow-origin'),allowedOrigin);
  assert.equal((await fetch(base+'/orders',{method:'POST'})).status,415);
  assert.equal((await fetch(base+'/orders',{method:'POST',headers:{'Content-Type':'text/plain'},body:'not json'})).status,415);
  for(const body of ['null','[','{}','[]'])assert.equal((await fetch(base+'/orders',{method:'POST',headers:{'Content-Type':'application/json'},body})).status,400);
  const placed=await fetch(base+'/orders',{method:'POST',headers:{Origin:allowedOrigin,'Content-Type':'application/json'},body:JSON.stringify({items:[{id:'serum',quantity:1}]})});
  assert.equal(placed.status,201);assert.equal(placed.headers.get('access-control-allow-origin'),allowedOrigin);assert.equal((await placed.json()).total,28.99);
  const concurrent=await Promise.all(Array.from({length:4},()=>fetch(base+'/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[{id:'headphones',quantity:1}]})})));
  assert.ok(concurrent.every(r=>r.status===201));
  assert.equal(JSON.parse(await readFile(join(dir,'orders.json'),'utf8')).length,5);
 }finally{server.close();await rm(dir,{recursive:true,force:true});}
});
