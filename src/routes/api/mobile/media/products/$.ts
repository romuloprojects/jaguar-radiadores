import { readFile } from "node:fs/promises";
import { createFileRoute } from "@tanstack/react-router";
import { mimeFromName, safeProductImagePath } from "@/lib/mobile-server";

async function GET({ params }: { params: { _splat?: string } }) {
  const name = String(params._splat || "");
  const filePath = safeProductImagePath(name);
  if (!filePath) return Response.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
  try {
    const bytes = await readFile(filePath);
    return new Response(bytes, {
      headers: {
        "Content-Type": mimeFromName(name),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return Response.json({ ok: false, code: "NOT_FOUND", message: "Imagem não encontrada" }, { status: 404 });
  }
}

export const Route = createFileRoute("/api/mobile/media/products/$")({ server: { handlers: { GET } } });
