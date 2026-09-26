import { createFileRoute } from "@tanstack/react-router";
import QRCode from "qrcode";

async function GET({ request }: { request: Request }) {
  const url = new URL(request.url);
  const payload = url.searchParams.get("payload") || "";
  if (!payload || payload.length > 1024) return Response.json({ ok: false, code: "VALIDATION", message: "Payload PIX inválido" }, { status: 400 });
  try {
    const png = await QRCode.toBuffer(payload, { type: "png", width: 320, margin: 1, errorCorrectionLevel: "M" });
    return new Response(png, { headers: { "Content-Type": "image/png", "Cache-Control": "private, max-age=300" } });
  } catch {
    return Response.json({ ok: false, code: "QR_FAILED", message: "Não foi possível gerar o QR Code" }, { status: 500 });
  }
}
export const Route = createFileRoute("/api/mobile/pix-qr")({ server: { handlers: { GET } } });
