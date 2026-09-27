const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const file=path.join(__dirname,'../src/routes/api/mobile/jaguar/$.ts');
const source=fs.readFileSync(file,'utf8');let calls=[];
const mockMobile={
 bearerFrom:()=>null,statusFromPayload:()=>200,
 callJaguar:async(pathname)=>{calls.push(pathname);return{upstream:{ok:true,status:200},payload:{ok:true,items:[{id:'p2',code:'NOVO-002',description:'Produto 2',brand:'Marca'}]}}}
};
const ctx={exports:{},console,URLSearchParams,setTimeout:(fn)=>{fn();return 1},clearTimeout:()=>{},require:name=>name==='@tanstack/react-router'?{createFileRoute:()=>()=>({})}:name==='@/lib/mobile-server'?mockMobile:{}};
vm.runInNewContext(ts.transpileModule(source,{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,ctx);
(async()=>{const r=await ctx.exports.recoverCreatedProduct('token',JSON.stringify({code:'NOVO-002',description:'Produto 2',brand:'Marca'}));assert.deepEqual(JSON.parse(JSON.stringify(r)),{ok:true,id:'p2',recovered:true});assert.equal(calls.length,1);assert.match(calls[0],/^products\?/);const noCode=await ctx.exports.recoverCreatedProduct('token',JSON.stringify({description:'Sem código'}));assert.equal(noCode,null);console.log('PASS: product-create incerto recupera somente o SKU exato e não cria uma segunda tentativa.');})().catch(e=>{console.error(e);process.exitCode=1});
