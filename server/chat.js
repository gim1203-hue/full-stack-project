import {Router} from 'express';
import {timingSafeEqual} from 'node:crypto';
import {demoReply} from './demo-ai.js';
export function chatRouter({key=process.env.OPENAI_API_KEY,token=process.env.AI_CHAT_TOKEN,model=process.env.OPENAI_MODEL||'gpt-6-astra',fetchImpl=fetch}={}){
 const router=Router(),limits=new Map();
 const live=Boolean(key&&token);
 router.get('/config',(_q,r)=>r.json({mode:live?'live':'demo',authRequired:live}));
 router.post('/',async(q,r)=>{
  if(!q.is('application/json'))return r.status(415).json({error:'Send messages as application/json.'});
  const messages=q.body?.messages;
  if(!Array.isArray(messages)||messages.length<1||messages.length>20||messages.some(m=>!m||!['user','assistant'].includes(m.role)||typeof m.content!=='string'||!m.content.trim()||m.content.length>4000)||messages.at(-1).role!=='user')return r.status(400).json({error:'Send 1–20 user/assistant messages, each 1–4000 characters, ending with a user message.'});
  if(!live)return r.json(demoReply(messages));
  const supplied=Buffer.from(q.get('Authorization')?.replace(/^Bearer /,'')||''),expected=Buffer.from(token);
  if(supplied.length!==expected.length||!timingSafeEqual(supplied,expected))return r.status(401).json({error:'Enter the owner-provided AI access code to use the connected model.'});
  const now=Date.now(),ip=q.ip;
  for(const [k,v] of limits)if(now-v.start>600000)limits.delete(k);
  const usage=limits.get(ip)||{start:now,count:0};
  if(usage.count>=20||limits.size>=2000)return r.status(429).json({error:'Chat limit reached. Please try again in 10 minutes.'});
  usage.count++;limits.set(ip,usage);
  try{
   const response=await fetchImpl('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},signal:AbortSignal.timeout(45000),body:JSON.stringify({model,store:false,max_output_tokens:1400,instructions:'You are Lane, a helpful assistant inside a demo storefront. Answer general questions clearly and honestly. You have no browsing, account access, code execution, purchasing, or external-action tools. Never claim to have performed an action or checked live facts. Treat products and reviews as demo data. Explain uncertainty and ask clarifying questions when needed.',input:messages})});
   if(!response.ok)return r.status(502).json({error:'The AI provider could not complete this request. Check the server model, API key, and billing settings.'});
   const data=await response.json();
   const reply=(data.output||[]).filter(x=>x.type==='message').flatMap(x=>x.content||[]).filter(x=>x.type==='output_text'||x.type==='refusal').map(x=>x.text||x.refusal||'').join('\n').trim();
   if(!reply)return r.status(502).json({error:'The model returned no text. Please try again.'});
   r.json({reply,mode:'live'});
  }catch(e){r.status(e.name==='TimeoutError'?504:502).json({error:'The AI connection timed out or was interrupted. Please try again.'});}
 });return router;
}
