import express from 'express';
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {dirname} from 'node:path';
import {randomUUID} from 'node:crypto';
import {products} from './products.js';
export async function createApp(file){
 const app=express();app.use(express.json({limit:'20kb'}));let orders=[];
 try{orders=JSON.parse(await readFile(file,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
 let queue=Promise.resolve();
 app.get('/api/health',(_q,r)=>r.json({status:'ok'}));
 app.get('/api/products',(q,r)=>{const term=String(q.query.q||'').toLowerCase(),cat=String(q.query.category||'All');let found=products.filter(p=>(cat==='All'||p.category===cat)&&(p.name+' '+p.category+' '+p.description).toLowerCase().includes(term));if(q.query.sort==='price-asc')found.sort((a,b)=>a.price-b.price);if(q.query.sort==='price-desc')found.sort((a,b)=>b.price-a.price);if(q.query.sort==='rating')found.sort((a,b)=>b.rating-a.rating);r.json(found);});
 app.get('/api/products/:id',(q,r)=>{const p=products.find(p=>p.id===q.params.id);p?r.json(p):r.status(404).json({error:'Product not found'});});
 app.post('/api/orders',async(q,r,next)=>{try{const {items}=q.body;if(!Array.isArray(items)||!items.length||items.length>30)return r.status(400).json({error:'Add between 1 and 30 products.'});const seen=new Set(),lines=[];for(const item of items){const p=products.find(p=>p.id===item?.id);if(!p||seen.has(item.id)||!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>p.stock)return r.status(400).json({error:'Invalid product or quantity. Please check available stock.'});seen.add(p.id);lines.push({id:p.id,name:p.name,price:p.price,quantity:item.quantity});}const subtotal=Math.round(lines.reduce((s,p)=>s+p.price*p.quantity,0)*100)/100,shipping=subtotal>=50?0:4.99;const order={id:'ML-'+randomUUID().slice(0,8).toUpperCase(),createdAt:new Date().toISOString(),items:lines,subtotal,shipping,total:Math.round((subtotal+shipping)*100)/100,status:'demo-confirmed'};const pending=queue.then(async()=>{const updated=[...orders,order];await mkdir(dirname(file),{recursive:true});await writeFile(file+'.tmp',JSON.stringify(updated,null,2));await rename(file+'.tmp',file);orders=updated;});queue=pending.catch(()=>{});await pending;r.status(201).json(order);}catch(e){next(e);}});
 app.use('/api',(_q,r)=>r.status(404).json({error:'API route not found'}));app.use((e,_q,r,_n)=>{console.error(e.message);r.status(e.status||500).json({error:e.status===400?'Invalid JSON body':'Could not complete your request. Please try again.'});});return app;
}
