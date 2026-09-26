import { createFileRoute } from "@tanstack/react-router";
import { bearerFrom, callJaguar, saveProductImage, statusFromPayload, validateMobileSession } from "@/lib/mobile-server";

async function POST({ request }: { request: Request }) {
  const token = bearerFrom(request);
  if (!token) return Response.json({ ok: false, code: "UNAUTHORIZED", message: "Sessão não informada" }, { status: 401 });
  const auth = await validateMobileSession(token);
  if (!auth.ok) return Response.json(auth.payload, { status: auth.status });

  try {
    const form = await request.formData();
    const file = form.get("image");
    const productId = String(form.get("productId") || "").trim();
    if (!(file instanceof File)) return Response.json({ ok: false, code: "VALIDATION", message: "Imagem não informada" }, { status: 400 });
    if (!productId) return Response.json({ ok: false, code: "VALIDATION", message: "Produto não informado" }, { status: 400 });

    const saved = await saveProductImage(file);
    const origin = new URL(request.url).origin;
    const imageUrl = `${origin}/api/mobile/media/products/${encodeURIComponent(saved.fileName)}`;
    const { upstream, payload } = await callJaguar("product-update", {
      method: "PATCH",
      headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}`, "X-Jaguar-Client": "android" },
      body: JSON.stringify({ id: productId, imageUrl }),
    });
    if (!upstream.ok || payload?.ok === false) {
      return Response.json(payload, { status: statusFromPayload(payload, upstream.status) });
    }
    return Response.json({ ok: true, productId, imageUrl, fileName: saved.fileName, size: saved.bytes, mimeType: saved.mime });
  } catch (error: any) {
    const code = String(error?.message || "");
    if (code === "UNSUPPORTED_IMAGE") return Response.json({ ok: false, code, message: "Formato de imagem não suportado. Use JPEG, PNG ou WebP." }, { status: 400 });
    if (code === "IMAGE_TOO_LARGE") return Response.json({ ok: false, code, message: "A imagem ultrapassa 8 MB." }, { status: 413 });
    console.error("Jaguar product image upload error", error);
    return Response.json({ ok: false, code: "UPLOAD_FAILED", message: "Não foi possível salvar a foto do produto." }, { status: 500 });
  }
}

export const Route = createFileRoute("/api/mobile/media/product-image")({ server: { handlers: { POST } } });
