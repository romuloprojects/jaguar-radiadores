// Real HTTP binary upload + legacy multipart fallback + filesystem; upstream DB workflow is a local test server.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const root=path.resolve(import.meta.dirname,'..');
const temporary=await fs.mkdtemp(path.join(os.tmpdir(),'jaguar-photo-test-'));
const store=path.join(temporary,'persistent','uploads');
const patches=[];let linkFails=false;let upstream,app;
const listen=server=>new Promise(resolve=>server.listen(0,'127.0.0.1',()=>resolve(`http://127.0.0.1:${server.address().port}`)));
const stop=server=>new Promise(resolve=>server?server.close(resolve):resolve());
async function compile(relative,name,handlers){
 let source=await fs.readFile(path.join(root,relative),'utf8');
 if(handlers){source=source.replace(/import \{ createFileRoute \} from "@tanstack\/react-router";\s*/,'').replace('"@/lib/mobile-server"','"./mobile-server.mjs"');source=source.slice(0,source.indexOf('export const Route'))+`export {${handlers}};`;}
 await fs.writeFile(path.join(temporary,name),ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText);
 return import(pathToFileURL(path.join(temporary,name)).href);
}
try{
 upstream=http.createServer(async(req,res)=>{
  res.setHeader('Content-Type','application/json');
  if(req.headers.authorization!=='Bearer test-session'){res.writeHead(401);res.end(JSON.stringify({ok:false,code:'UNAUTHORIZED'}));return;}
  if(req.url==='/jaguar/auth/session'){res.end(JSON.stringify({ok:true,user:{id:'test'}}));return;}
  if(req.url==='/jaguar/product-update'){
   const chunks=[];for await(const chunk of req)chunks.push(chunk);patches.push(JSON.parse(Buffer.concat(chunks).toString()));
   res.writeHead(linkFails?500:200);res.end(JSON.stringify(linkFails?{ok:false,code:'DB_UNAVAILABLE'}:{ok:true}));return;
  }
  res.writeHead(404);res.end('{}');
 });
 process.env.JAGUAR_N8N_WEBHOOK_BASE_URL=await listen(upstream);process.env.JAGUAR_UPLOAD_DIR=store;
 const storage=await compile('src/lib/mobile-server.ts','mobile-server.mjs');
 const {POST,GET,HEAD}=await compile('src/routes/api/mobile/media/product-image.ts','upload.mjs','POST,GET,HEAD');
 app=http.createServer(async(req,res)=>{
  try{
   const url=`http://${req.headers.host}${req.url}`;let response;
   if(req.method==='POST'){
    const chunks=[];for await(const chunk of req)chunks.push(chunk);
    response=await POST({request:new Request(url,{method:'POST',headers:req.headers,body:Buffer.concat(chunks)})});
   }else if(new URL(url).pathname==='/api/mobile/media/product-image' && req.method==='HEAD'){
    response=await HEAD({request:new Request(url,{method:'HEAD',headers:req.headers})});
   }else if(new URL(url).pathname==='/api/mobile/media/product-image' && req.method==='GET'){
    response=await GET({request:new Request(url,{method:'GET',headers:req.headers})});
   }else response=await storage.tryServeProductImageRequest(new Request(url,{method:req.method,headers:req.headers}));
   if(!response)response=Response.json({ok:false,code:'NOT_FOUND'},{status:404});
   res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
  }catch(error){res.writeHead(500);res.end(String(error));}
 });
 const origin=await listen(app);
 const jpeg=await fs.readFile(path.join(root,'public/images/jaguar-logo-source.jpg'));
 const png=await fs.readFile(path.join(root,'public/favicon.png'));
 async function uploadBinary(bytes=jpeg,mime='image/jpeg',name='S24.jpg',token='test-session',extraHeaders={}){
  const response=await fetch(origin+'/api/mobile/media/product-image?productId=product-test',{method:'POST',headers:{...(token?{Authorization:`Bearer ${token}`}:{ }),'Content-Type':mime,'X-Jaguar-Filename':encodeURIComponent(name),...extraHeaders},body:bytes});
  return {status:response.status,data:await response.json(),headers:response.headers};
 }
 async function uploadMultipart(bytes=jpeg,mime='image/jpeg',name='legacy.jpg',token='test-session'){
  const body=new FormData();body.append('productId','product-test');body.append('image',new Blob([bytes],{type:mime}),name);
  const response=await fetch(origin+'/api/mobile/media/product-image',{method:'POST',headers:token?{Authorization:`Bearer ${token}`}:{},body});
  return {status:response.status,data:await response.json(),headers:response.headers};
 }
 let first;
 for(const [mime,name] of [['image/jpeg','S24.JPG'],['image/jpg','S24.JPG'],['application/octet-stream','S24.JPG']]){
  const result=await uploadBinary(jpeg,mime,name);assert.equal(result.status,200,JSON.stringify(result.data));assert.equal(result.data.mimeType,'image/jpeg');assert.equal(result.data.transport,'binary');assert.equal(result.headers.get('cache-control'),'private, no-store');
  const served=await fetch(result.data.imageUrl);assert.equal(served.status,200);assert.equal(served.headers.get('content-type'),'image/jpeg');assert.deepEqual(Buffer.from(await served.arrayBuffer()),jpeg);first??=result.data;
 }
 assert.equal((await uploadBinary(png,'image/png','photo.png')).status,200);
 const webp=Buffer.from('UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA','base64');
 assert.equal((await uploadBinary(webp,'image/webp','photo.webp')).status,200);
 const legacy=await uploadMultipart(jpeg,'image/jpeg','legacy.jpg');assert.equal(legacy.status,200);assert.equal(legacy.data.transport,'multipart');
 assert.equal((await uploadBinary(Buffer.from('not an image'),'image/jpeg')).status,415);
 assert.equal((await uploadBinary(jpeg,'image/png','photo.png')).status,415);
 assert.equal((await uploadBinary(new Uint8Array(8*1024*1024+1))).status,413);
 assert.equal((await uploadBinary(new Uint8Array())).status,400);
 assert.equal((await uploadBinary(jpeg,'image/jpeg','photo.jpg','')).status,401);
 assert.equal((await uploadBinary(jpeg,'image/jpeg','photo.jpg','invalid')).status,401);
 const noProduct=await fetch(origin+'/api/mobile/media/product-image',{method:'POST',headers:{Authorization:'Bearer test-session','Content-Type':'image/jpeg'},body:jpeg});assert.equal(noProduct.status,400);
 assert.ok(patches.every(p=>Object.keys(p).sort().join(',')==='id,imageUrl'));assert.ok(patches.every(p=>p.id==='product-test'));
 linkFails=true;const failedLink=await uploadBinary();assert.equal(failedLink.status,500);assert.equal(failedLink.data.code,'DB_UNAVAILABLE');linkFails=false;
 const backup=path.join(store,'products-backup');await fs.rename(storage.MOBILE_PRODUCT_DIR,backup);await fs.writeFile(storage.MOBILE_PRODUCT_DIR,'blocked');
 const failedFs=await uploadBinary();assert.equal(failedFs.status,503);assert.equal(failedFs.data.code,'UPLOAD_FILESYSTEM_ERROR');await fs.unlink(storage.MOBILE_PRODUCT_DIR);await fs.rename(backup,storage.MOBILE_PRODUCT_DIR);
 assert.equal(storage.safeProductImagePath('../outside.jpg'),null);
 const persisted=path.join(storage.MOBILE_PRODUCT_DIR,first.fileName);
 await stop(app);app=null;
 const size=execFileSync(process.execPath,['-e','process.stdout.write(String(require("fs").readFileSync(process.argv[1]).length))',persisted],{encoding:'utf8'});
 assert.equal(Number(size),jpeg.length);
 console.log('PASS: upload binário + fallback multipart + GET/HEAD na rota exata product-image, JPEG/PNG/WebP, 400/401/413/415/503, vínculo URL, origem pública e persistência. Sem S24+/HTTPS/volume de produção.');
}finally{
 await stop(app);await stop(upstream);
 const resolved=path.resolve(temporary),parent=path.resolve(os.tmpdir());
 if(path.dirname(resolved)===parent&&path.basename(resolved).startsWith('jaguar-photo-test-'))await fs.rm(resolved,{recursive:true,force:true});
}
