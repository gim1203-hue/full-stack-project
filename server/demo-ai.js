import {products} from './products.js';
const types=[
 ['headphones',/\b(headphones?|headsets?)\b/i],['chair',/\b(chairs?|seating)\b/i],
 ['backpack',/\b(backpacks?|bags?)\b/i],['camera',/\b(cameras?|photography)\b/i],
 ['sneakers',/\b(sneakers?|shoes?|footwear)\b/i],['lamp',/\b(lamps?|desk light|reading light)\b/i],
 ['serum',/\b(serums?|skincare|skin care)\b/i],['yoga',/\b(yoga|exercise mats?|yoga mats?)\b/i]
];
const categories=[['Electronics',/\belectronics?\b/i],['Home & Living',/\b(home|living room|furniture)\b/i],['Fashion',/\b(fashion|clothing)\b/i],['Beauty',/\bbeauty\b/i],['Sports',/\bsports?\b/i]];
const offTopic=/\b(write|poem|poetry|joke|coding|programming|react|node\.?js|javascript|linkedin|politics|weather|president|capital of|recipe|homework)\b/i;
export function demoReply(messages){
 const users=messages.filter(m=>m.role==='user').map(m=>m.content.trim());
 const text=users.at(-1),q=text.toLowerCase();
 const base={mode:'demo',products:[],questions:[],eligible:true};
 if(offTopic.test(q))return {...base,eligible:false,reply:'I only help you find store products and understand shopping problems. What product are you looking for, or what problem should it help with?'};
 if(/\b(order|delivery|damaged|broken|refund|return|shipping|wrong item|missing item)\b/i.test(q)&&!/\b(buy|replace|new|replacement)\b/i.test(q))return {...base,eligible:false,reply:'I can help clarify the product or order problem.',questions:['Is the item damaged, missing, incorrect, or not working as expected?','Do you need a replacement product or help with an existing item?'],support:true};
 if(!types.some(([,re])=>re.test(q))&&/\b(laptops?|phones?|tablets?|televisions?|dresses?|watches?|books?|earbuds?|speakers?)\b/.test(q))return {...base,eligible:false,reply:'That product type is not in this sample catalog. I won’t substitute unrelated items.',questions:['Would you like to look for a different product type?']};
 const shoppingContext=types.some(([,re])=>re.test(q))||categories.some(([,re])=>re.test(q))||/\b(products?|recommend|buy|find|shopping|budget|under|below|above|over|within|up to|at most|maximum|minimum|noisy|noise|quiet|dark|lighting|reading|carry|commut\w*|walking|stretch\w*|work|music|travel|size|inch|iphone|android|windows|mac|yes|no)\b|\$\s*\d|^\s*\d+(?:\.\d+)?\s*$/.test(q);
 if(!shoppingContext)return {...base,eligible:false,reply:'I can only help with products and customer shopping problems. What product do you need, or what should it help you do?'};
 let ids=[],category=null,budget=null,minimum=null,strict=false;
 for(const message of users){
  if(offTopic.test(message))continue;
  const matches=types.filter(([,re])=>re.test(message)).map(([id])=>id);
  if(matches.length){ids=matches;category=null;}
  else {const cat=categories.find(([,re])=>re.test(message));if(cat){category=cat[0];ids=[];}}
  const max=message.match(/(?:under|below|less than|up to|at most|maximum|budget(?:\s+of)?|within)\s*\$?\s*(\d+(?:\.\d+)?)/i)||(!/(?:over|above|at least|minimum)\s*\$?\s*\d/i.test(message)&&message.match(/\$\s*(\d+(?:\.\d+)?)\s*(?:max|budget)?/i))||message.match(/^\s*(\d+(?:\.\d+)?)\s*(?:dollars)?\s*$/i);
  if(max){budget=Number(max[1]);strict=/^(under|below|less than)/i.test(max[0]);}
  const min=message.match(/(?:over|above|at least|minimum)\s*\$?\s*(\d+(?:\.\d+)?)/i);if(min)minimum=Number(min[1]);
 }
 if(!ids.length&&!category){
  const problem=users.join(' ');
  if(/\b(noisy|noise|concentrat\w*|quiet)\b/i.test(problem))ids=['headphones'];
  else if(/\b(dark|lighting|read at night)\b/i.test(problem))ids=['lamp'];
  else if(/\b(carry|commut\w*)\b/i.test(problem))ids=['backpack'];
  else if(/\b(walking|walks|running)\b/i.test(problem))ids=['sneakers'];
  else if(/\b(stretch\w*|floor exercise)\b/i.test(problem))ids=['yoga'];
 }
 const searchAll=/\b(all products|show products|recommend products|browse products|anything|any product)\b/i.test(q);
 if(!ids.length&&!category&&!searchAll)return {...base,reply:'What product are you looking for, or what problem would you like it to solve?',questions:[budget!==null?`What kind of product do you need within $${budget.toFixed(2)}?`:'For example: reducing noise, carrying work essentials, or lighting a dark desk.']};
 const excluded=types.filter(([,re])=>{const m=q.match(re);return m&&/\b(no|not|avoid|exclude|without|don.t want)\s+(?:any\s+)?$/.test(q.slice(0,m.index));}).map(([id])=>id);
 const found=products.filter(p=>(!ids.length||ids.includes(p.id))&&(!category||p.category===category)&&!excluded.includes(p.id)&&(budget===null||(strict?p.price<budget:p.price<=budget))&&(minimum===null||p.price>=minimum));
 if(!found.length)return {...base,reply:'No products in this store match those requirements. I won’t show unrelated items.',questions:[budget!==null?'Would you like to change the budget or product type?':'Would you like to try a different product type?']};
 const questions=[];
 if(budget===null)questions.push('What is the most you would like to spend?');
 const useQuestions={headphones:'Will you mainly use them for work calls, music, or reducing surrounding noise?',chair:'Where will you use the chair, and how much space do you have?',backpack:'What do you need to carry, and what size is your laptop?',camera:'Will you mainly take travel photos, everyday photos, or video?',sneakers:'Will you use the shoes for everyday walking or another activity?',lamp:'Is the light for reading, desk work, or general room lighting?',serum:'What are you looking for in a skincare product, and are there ingredients you avoid?',yoga:'Will you use the mat for yoga, stretching, or floor workouts?'};
 if(ids.length===1&&!/\b(for work|work calls|for music|for reading|for yoga|for travel|for walking|laptop|floor workouts)\b/i.test(users.join(' ')))questions.push(useQuestions[ids[0]]);
 if(!ids.length&&category)questions.push(`What kind of ${category.toLowerCase()} product would solve your problem?`);
 return {...base,reply:found.length===1?'Here is the matching product from our sample catalog.':'These products match your request in our sample catalog.',products:found.map(({id,name,price,image,features,category})=>({id,name,price,image,features,category})),questions:questions.slice(0,2)};
}
