import express from 'express';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {access} from 'node:fs/promises';
import {createApp} from './app.js';
const root=fileURLToPath(new URL('../',import.meta.url));
try { process.loadEnvFile(resolve(root,'.env')); } catch(e) { if(e.code!=='ENOENT') throw e; }
const production=process.argv.includes('--production')||process.env.NODE_ENV==='production';
const port=process.env.PORT===undefined?3000:Number(process.env.PORT);
if(!Number.isInteger(port)||port<1||port>65535)throw Error('PORT must be an integer between 1 and 65535.');
const host=process.env.HOST||(production?'0.0.0.0':'127.0.0.1');
const allowedOrigins=(process.env.ALLOWED_ORIGINS||'').split(',').map(s=>s.trim()).filter(Boolean);
for(const origin of allowedOrigins){if(new URL(origin).origin!==origin)throw Error('ALLOWED_ORIGINS must contain origins without paths or trailing slashes.');}
const app=await createApp(resolve(process.env.DATA_DIR||resolve(root,'data'),'orders.json'),{allowedOrigins});
let vite;
if(production){
 const index=resolve(root,'dist/index.html');
 try{await access(index);}catch{throw Error('Missing React production build. Run npm run build before npm start.');}
 app.use(express.static(resolve(root,'dist')));
 app.get('/{*path}',(_q,r)=>r.sendFile(index));
}else{
 const {createServer}=await import('vite');
 vite=await createServer({configFile:resolve(root,'vite.config.js'),server:{middlewareMode:true},appType:'spa'});
 app.use(vite.middlewares);
}
const server=app.listen(port,host,()=>console.log(`Market Lane running at http://${host}:${port}`));
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?`Port ${port} is already in use. Set PORT to another number.`:e.message);process.exitCode=1;void vite?.close();});
let stopping=false;
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{
 if(stopping)return;stopping=true;
 const timeout=setTimeout(()=>process.exit(1),10000);timeout.unref();
 server.close(async()=>{await vite?.close();clearTimeout(timeout);});
 server.closeIdleConnections();
});
