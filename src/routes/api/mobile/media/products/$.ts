import { createFileRoute } from "@tanstack/react-router";
import { tryServeProductImageRequest } from "@/lib/mobile-server";

async function GET({ request }: { request: Request }) {
  return (await tryServeProductImageRequest(request))
    ?? Response.json({ ok: false, code: "NOT_FOUND", message: "Imagem não encontrada" }, { status: 404 });
}

export const Route = createFileRoute("/api/mobile/media/products/$")({ server: { handlers: { GET } } });
