import { createFileRoute } from "@tanstack/react-router";
import { bearerFrom, callJaguar, saveProductImage, statusFromPayload, ProductImageError } from "@/lib/mobile-server";

function json(body: unknown, status=200) {
  return Response.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
}
async function POST({ request }: { request: Request }) {
  let stage='auth';let diagnostic:Record<string,unknown>={};
  try {
    const token=bearerFrom(request);
    if(!token)return json({ok:false,code:'HTTP_401',message:'Sessão não informada.'},401);
    const auth=await callJaguar('auth/session',{method:'GET',signal:AbortSignal.timeout(20000),headers:{Accept:'application/json',Authorization:`Bearer ${token}`,'X-Jaguar-Client':'android'}});
    if(!auth.upstream.ok||auth.payload?.ok===false)return json({ok:false,code:auth.payload?.code||'UNAUTHORIZED',message:'Não foi possível autorizar o envio.'},statusFromPayload(auth.payload,auth.upstream.status));
    stage='multipart';
    if(Number(request.headers.get('content-length'))>9*1024*1024)throw new ProductImageError('IMAGE_TOO_LARGE',413);
    let form:FormData;
    try{form=await request.formData()}catch{throw new ProductImageError('INVALID_MULTIPART',400)}
    const file=form.get('image');const productId=String(form.get('productId')||'').trim();
    if(!(file instanceof File)||!productId)return json({ok:false,code:'VALIDATION',message:'Informe o produto e a foto.'},400);
    diagnostic={productId,mime:file.type,size:file.size,name:file.name.slice(0,120)};
    stage='filesystem';const saved=await saveProductImage(file);
    const imageUrl=`${new URL(request.url).origin}/api/mobile/media/products/${encodeURIComponent(saved.fileName)}`;
    stage='product-link';
    const {upstream,payload}=await callJaguar('product-update',{
      method:'PATCH',signal:AbortSignal.timeout(20000),
      headers:{Accept:'application/json','Content-Type':'application/json',Authorization:`Bearer ${token}`,'X-Jaguar-Client':'android'},
      // Only the URL is sent to the existing database workflow; no image bytes/base64.
      body:JSON.stringify({id:productId,imageUrl}),
    });
    if(!upstream.ok||payload?.ok===false){
      const status=statusFromPayload(payload,upstream.status);
      console.error('Jaguar photo link',{...diagnostic,status,code:payload?.code,stage});
      return json({ok:false,code:payload?.code||'IMAGE_LINK_FAILED',message:'O produto existe, mas não foi possível vincular a foto.'},status);
    }
    return json({ok:true,productId,imageUrl,fileName:saved.fileName,size:saved.bytes,mimeType:saved.mime});
  }catch(error:any){
    const status=error instanceof ProductImageError?error.status:error?.name==='TimeoutError'?504:stage==='auth'||stage==='product-link'?502:500;
    const code=error instanceof ProductImageError?error.code:error?.name==='TimeoutError'?'UPSTREAM_TIMEOUT':status===502?'UPSTREAM_UNAVAILABLE':'UPLOAD_FAILED';
    console.error('Jaguar photo upload',{...diagnostic,stage,status,code,cause:error?.code});
    const message=code==='IMAGE_TOO_LARGE'?'A foto ultrapassa o limite de 8 MB.':code==='UNSUPPORTED_IMAGE'?'Use uma foto JPEG, PNG ou WebP válida.':code.startsWith('UPLOAD_')&&stage==='filesystem'?'O armazenamento de fotos está indisponível.':'Não foi possível enviar a foto. O produto permanece cadastrado.';
    return json({ok:false,code,message},status);
  }
}

export const Route = createFileRoute("/api/mobile/media/product-image")({ server: { handlers: { POST } } });
