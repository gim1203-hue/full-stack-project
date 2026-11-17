import test from 'node:test';
import assert from 'node:assert/strict';
import {demoReply} from './demo-ai.js';
import {products} from './products.js';
import {searchCatalog} from './catalog.js';
const ask=(...texts)=>demoReply(texts.map(content=>({role:'user',content})));
test('expanded catalog gives full category pages and relevant multiword search',()=>{
 assert.equal(products.length,80);assert.equal(new Set(products.map(p=>p.id)).size,80);
 for(const category of new Set(products.map(p=>p.category)))assert.equal(searchCatalog({category}).length,16);
 const matches=searchCatalog({q:'headphones wireless'});assert.ok(matches.length>=4);assert.ok(matches.every(p=>p.kind==='headphones'));
 assert.equal(searchCatalog({q:'not-a-real-product'}).length,0);
});
test('only matching product types and prices are returned',()=>{
 const headphones=ask('Headphones under $100').products;assert.ok(headphones.length>=5);assert.ok(headphones.every(p=>p.kind==='headphones'&&p.price<100));
 assert.equal(ask('Headphones under $10').products.length,0);
 const electronics=ask('Show me electronics under $100').products;assert.ok(electronics.length>=5);assert.ok(electronics.every(p=>p.category==='Electronics'&&p.price<100));
 assert.equal(ask('Show me lamps under $19.99').products.length,0);
 assert.ok(ask('Show me lamps up to $58').products.some(p=>p.id==='lamp'));
 assert.ok(ask('Headphones not cameras under $100').products.every(p=>p.kind==='headphones'));
 assert.ok(ask('Show all products above $100').products.every(p=>p.price>=100));
});
test('customer problems and follow-up budget answers keep the product context',()=>{
 const response=ask('I need headphones','under $100');assert.ok(response.products.length>=5);assert.ok(response.products.every(p=>p.kind==='headphones'));assert.ok(response.questions.some(q=>q.includes('work calls')));
 assert.equal(ask('I need headphones','under $10').products.length,0);
 assert.ok(ask('I need headphones','100').products.every(p=>p.kind==='headphones'&&p.price<=100));
 assert.equal(ask('My desk is too dark for reading').products.length,8);
 assert.ok(ask('My office is noisy','under $100').products.every(p=>p.kind==='headphones'));
 const support=ask('My headphones arrived broken');assert.equal(support.products.length,0);assert.ok(support.questions.some(q=>q.includes('not working')));
});
test('unrelated requests never generate general answers or random products',()=>{
 for(const q of ['Write me a poem','Explain React','Tell me the weather','Make a LinkedIn post']){const answer=ask(q);assert.equal(answer.eligible,false);assert.equal(answer.products.length,0);assert.match(answer.reply,/only help/);}
 for(const q of ['Write me a poem','What is gravity?','Find a laptop'])assert.equal(ask('Headphones under $100',q).products.length,0);
 assert.equal(ask('I need a laptop').products.length,0);
});
