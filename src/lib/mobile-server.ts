import { mkdir, readFile, stat, writeFile, rename, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const MOBILE_UPLOAD_ROOT = process.env.JAGUAR_UPLOAD_DIR || "/data/jaguar/uploads";
export const MOBILE_PRODUCT_DIR = path.join(MOBILE_UPLOAD_ROOT, "products");
export const MOBILE_APK_PATH = process.env.JAGUAR_ANDROID_APK_PATH || "/data/jaguar/releases/jaguar-radiadores.apk";

export function n8nBase() {
  return (process.env.JAGUAR_N8N_WEBHOOK_BASE_URL || "https://n8n.facilities-ai.com.br/webhook").replace(/\/$/, "");
}

export function bearerFrom(request: Request) {
  const value = request.headers.get("authorization") || "";
  const match = value.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export function statusFromPayload(payload: any, upstreamStatus: number) {
  if (upstreamStatus >= 400) return upstreamStatus;
  if (payload?.ok !== false) return 200;
  switch (payload?.code) {
    case "UNAUTHORIZED":
    case "INVALID_CREDENTIALS":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "NOT_FOUND":
      return 404;
    case "DUPLICATE":
    case "DUPLICATE_PAYMENT":
    case "HAS_PAYMENTS":
    case "HAS_DEPENDENCIES":
    case "INVALID_STATE":
      return 409;
    default:
      return 400;
  }
}

export async function callJaguar(pathname: string, init: RequestInit = {}) {
  const upstream = await fetch(`${n8nBase()}/jaguar/${pathname.replace(/^\/+/, "")}`, {
    ...init,
    redirect: "manual",
  });
  const text = await upstream.text();
  let payload: any;
  try {
    payload = text ? JSON.parse(text) : { ok: upstream.ok };
  } catch {
    payload = { ok: false, code: "INVALID_UPSTREAM_RESPONSE", message: text || "Resposta inválida do n8n" };
  }
  return { upstream, payload };
}

export async function validateMobileSession(token: string) {
  const { upstream, payload } = await callJaguar("auth/session", {
    method: "GET",
    headers: { Accept: "application/json", Authorization: `Bearer ${token}`, "X-Jaguar-Client": "android" },
  });
  return { ok: upstream.ok && payload?.ok !== false, payload, status: statusFromPayload(payload, upstream.status) };
}

export class ProductImageError extends Error {
  code: string; status: number;
  constructor(code: string, status: number) { super(code); this.code=code; this.status=status; }
}
export function productImageMime(type: string, name: string, bytes: Uint8Array) {
  let mime=type.split(';')[0].trim().toLowerCase();
  if(mime==='image/jpg')mime='image/jpeg';
  if(!mime||mime==='application/octet-stream')mime=mimeFromName(name);
  let signature='';
  if(bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)signature='image/jpeg';
  else if([137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))signature='image/png';
  else if(bytes.length>=12&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP')signature='image/webp';
  if(!signature||mime!==signature)throw new ProductImageError('UNSUPPORTED_IMAGE',415);
  return mime;
}
export async function saveProductImage(file: File) {
  if(file.size<=0)throw new ProductImageError('EMPTY_IMAGE',400);
  if(file.size>8*1024*1024)throw new ProductImageError('IMAGE_TOO_LARGE',413);
  const bytes=new Uint8Array(await file.arrayBuffer());
  if(bytes.byteLength<=0)throw new ProductImageError('EMPTY_IMAGE',400);
  if(bytes.byteLength>8*1024*1024)throw new ProductImageError('IMAGE_TOO_LARGE',413);
  const mime=productImageMime(file.type,file.name,bytes);
  const ext=({'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp'} as Record<string,string>)[mime];
  const fileName=`${Date.now()}-${randomUUID()}${ext}`;
  const target=path.join(MOBILE_PRODUCT_DIR,fileName);const temporary=target+'.tmp';
  try{
    await mkdir(MOBILE_PRODUCT_DIR,{recursive:true});
    await writeFile(temporary,bytes,{flag:'wx'});
    await rename(temporary,target);
  }catch(error:any){
    await unlink(temporary).catch(()=>{});
    console.error('Jaguar photo filesystem',{code:error?.code,directory:MOBILE_PRODUCT_DIR,fileName});
    throw new ProductImageError(error?.code==='ENOSPC'?'UPLOAD_STORAGE_FULL':'UPLOAD_FILESYSTEM_ERROR',error?.code==='ENOSPC'?507:503);
  }
  return {fileName,bytes:bytes.byteLength,mime,target};
}

export function safeProductImagePath(name: string) {
  const safe = path.basename(name);
  if (!/^[a-zA-Z0-9._-]+$/.test(safe) || safe !== name) return null;
  return path.join(MOBILE_PRODUCT_DIR, safe);
}

export function mimeFromName(name: string) {
  const ext = path.extname(name).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

export async function readApk() {
  const info = await stat(MOBILE_APK_PATH);
  if (!info.isFile()) throw new Error("APK_NOT_FOUND");
  return { bytes: await readFile(MOBILE_APK_PATH), size: info.size };
}
