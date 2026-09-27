import { createFileRoute } from "@tanstack/react-router";
import { bearerFrom, callJaguar, publicRequestOrigin, saveProductImage, saveProductImageBytes, serveProductImageFile, statusFromPayload, ProductImageError } from "@/lib/mobile-server";

function json(body: unknown, status=200) {
  return Response.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
}
function decodeFileName(value:string|null){
  if(!value)return 'produto.jpg';
  try{return decodeURIComponent(value).replace(/[^a-zA-Z0-9._-]/g,'_').slice(0,120)||'produto.jpg'}catch{return 'produto.jpg'}
}
async function POST({ request }: { request: Request }) {
  let stage='auth';let diagnostic:Record<string,unknown>={};
  try {
    const token=bearerFrom(request);
    if(!token)return json({ok:false,code:'HTTP_401',message:'Sessão não informada.'},401);
    const auth=await callJaguar('auth/session',{method:'GET',signal:AbortSignal.timeout(20000),headers:{Accept:'application/json',Authorization:`Bearer ${token}`,'X-Jaguar-Client':'android'}});
    if(!auth.upstream.ok||auth.payload?.ok===false)return json({ok:false,code:auth.payload?.code||'UNAUTHORIZED',message:'Não foi possível autorizar o envio.'},statusFromPayload(auth.payload,auth.upstream.status));

    const contentLength=Number(request.headers.get('content-length')||0);
    if(contentLength>8*1024*1024)throw new ProductImageError('IMAGE_TOO_LARGE',413);
    const contentType=(request.headers.get('content-type')||'').toLowerCase();
    let productId='';let saved:{fileName:string;bytes:number;mime:string;target:string};

    // Protocolo V1.8.2 / mobile V1.0.3: corpo binário direto.
    // Mantemos multipart como fallback para APKs antigos durante a transição.
    if(contentType.startsWith('multipart/form-data')){
      stage='multipart';
      let form:FormData;
      try{form=await request.formData()}catch{throw new ProductImageError('INVALID_MULTIPART',400)}
      const file=form.get('image');productId=String(form.get('productId')||'').trim();
      if(!(file instanceof File)||!productId)return json({ok:false,code:'VALIDATION',message:'Informe o produto e a foto.'},400);
      diagnostic={transport:'multipart',productId,mime:file.type,size:file.size,name:file.name.slice(0,120)};
      stage='filesystem';saved=await saveProductImage(file);
    }else{
      stage='binary';
      productId=new URL(request.url).searchParams.get('productId')?.trim()||'';
      if(!productId)return json({ok:false,code:'VALIDATION',message:'Informe o produto.'},400);
      const mime=(request.headers.get('content-type')||'application/octet-stream').split(';')[0].trim();
      const name=decodeFileName(request.headers.get('x-jaguar-filename'));
      const bytes=new Uint8Array(await request.arrayBuffer());
      diagnostic={transport:'binary',productId,mime,size:bytes.byteLength,name};
      stage='filesystem';saved=await saveProductImageBytes(bytes,mime,name);
    }

    const imageUrl=`${publicRequestOrigin(request)}/api/mobile/media/product-image?file=${encodeURIComponent(saved.fileName)}`;
    stage='product-link';
    const {upstream,payload}=await callJaguar('product-update',{
      method:'PATCH',signal:AbortSignal.timeout(20000),
      headers:{Accept:'application/json','Content-Type':'application/json',Authorization:`Bearer ${token}`,'X-Jaguar-Client':'android'},
      body:JSON.stringify({id:productId,imageUrl}),
    });
    if(!upstream.ok||payload?.ok===false){
      const status=statusFromPayload(payload,upstream.status);
      console.error('Jaguar photo link',{...diagnostic,status,code:payload?.code,stage});
      return json({ok:false,code:payload?.code||'IMAGE_LINK_FAILED',message:'O produto existe, mas não foi possível vincular a foto.'},status);
    }
    return json({ok:true,productId,imageUrl,fileName:saved.fileName,size:saved.bytes,mimeType:saved.mime,transport:diagnostic.transport});
  }catch(error:any){
    const status=error instanceof ProductImageError?error.status:error?.name==='TimeoutError'?504:stage==='auth'||stage==='product-link'?502:500;
    const code=error instanceof ProductImageError?error.code:error?.name==='TimeoutError'?'UPSTREAM_TIMEOUT':status===502?'UPSTREAM_UNAVAILABLE':'UPLOAD_FAILED';
    console.error('Jaguar photo upload',{...diagnostic,stage,status,code,cause:error?.code});
    const message=code==='IMAGE_TOO_LARGE'?'A foto ultrapassa o limite de 8 MB.':code==='UNSUPPORTED_IMAGE'?'Use uma foto JPEG, PNG ou WebP válida.':code==='EMPTY_IMAGE'?'A foto recebida está vazia.':code.startsWith('UPLOAD_')&&stage==='filesystem'?'O armazenamento de fotos está indisponível.':'Não foi possível enviar a foto. O produto permanece cadastrado.';
    return json({ok:false,code,message},status);
  }
}

async function serveFromExactRoute(request: Request) {
  const fileName = new URL(request.url).searchParams.get("file")?.trim() || "";
  if (!fileName) {
    return json({ ok: false, code: "NOT_FOUND", message: "Imagem não encontrada" }, 404);
  }
  return serveProductImageFile(fileName, request.method);
}

async function GET({ request }: { request: Request }) {
  return serveFromExactRoute(request);
}

async function HEAD({ request }: { request: Request }) {
  return serveFromExactRoute(request);
}

export const Route = createFileRoute("/api/mobile/media/product-image")({
  server: { handlers: { POST, GET, HEAD } },
});
