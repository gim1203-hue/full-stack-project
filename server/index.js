import express from 'express';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {createApp} from './app.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const app=await createApp(resolve(root,'data/orders.json'));
if(process.argv.includes('--production')){app.use(express.static(resolve(root,'dist')));app.get('/{*path}',(_q,r)=>r.sendFile(resolve(root,'dist/index.html')));}else{const {createServer}=await import('vite');const vite=await createServer({configFile:resolve(root,'vite.config.js'),server:{middlewareMode:true},appType:'spa'});app.use(vite.middlewares);}
const port=Number(process.env.PORT)||3000;app.listen(port,process.env.HOST||'127.0.0.1',()=>console.log(`Market Lane running at http://localhost:${port}`));

