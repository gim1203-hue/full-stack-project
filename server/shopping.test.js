import test from 'node:test';
import assert from 'node:assert/strict';
import {demoReply} from './demo-ai.js';
const ask=(...texts)=>demoReply(texts.map(content=>({role:'user',content})));
test('only matching product types and prices are returned',()=>{
 assert.deepEqual(ask('Headphones under $100').products.map(p=>p.id),['headphones']);
 assert.equal(ask('Headphones under $70').products.length,0);
 assert.deepEqual(ask('Show me electronics under $100').products.map(p=>p.id),['headphones']);
 assert.equal(ask('Show me lamps under $58').products.length,0);
 assert.deepEqual(ask('Show me lamps up to $58').products.map(p=>p.id),['lamp']);
 assert.deepEqual(ask('Headphones not cameras under $100').products.map(p=>p.id),['headphones']);
 assert.deepEqual(ask('Show all products above $100').products.map(p=>p.id),['chair','camera']);
});
test('customer problems and follow-up budget answers keep the product context',()=>{
 const response=ask('I need headphones','under $100');assert.deepEqual(response.products.map(p=>p.id),['headphones']);assert.ok(response.questions.some(q=>q.includes('work calls')));
 assert.equal(ask('I need headphones','under $40').products.length,0);
 assert.deepEqual(ask('I need headphones','100').products.map(p=>p.id),['headphones']);
 assert.deepEqual(ask('My desk is too dark for reading').products.map(p=>p.id),['lamp']);
 assert.deepEqual(ask('My office is noisy','under $100').products.map(p=>p.id),['headphones']);
 const support=ask('My headphones arrived broken');assert.equal(support.products.length,0);assert.ok(support.questions.some(q=>q.includes('not working')));
});
test('unrelated requests never generate general answers or random products',()=>{
 for(const q of ['Write me a poem','Explain React','Tell me the weather','Make a LinkedIn post']){const answer=ask(q);assert.equal(answer.eligible,false);assert.equal(answer.products.length,0);assert.match(answer.reply,/only help/);}
 assert.equal(ask('Headphones under $100','Write me a poem').products.length,0);
 assert.equal(ask('Headphones under $100','What is gravity?').products.length,0);
 assert.equal(ask('Headphones under $100','Find a laptop').products.length,0);
 assert.equal(ask('I need a laptop').products.length,0);
});
