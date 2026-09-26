import { createFileRoute } from "@tanstack/react-router";
import { bearerFrom, callJaguar, statusFromPayload } from "@/lib/mobile-server";

async function handler({ request, params }: { request: Request; params: { _splat?: string } }) {
  const splat = String(params._splat || "").replace(/^\/+/, "");
  if (!splat) return Response.json({ ok: false, code: "NOT_FOUND", message: "Rota inválida" }, { status: 404 });

  const incoming = new URL(request.url);
  const query = incoming.search || "";
  const headers = new Headers({ Accept: "application/json", "X-Jaguar-Client": "android" });
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  const token = bearerFrom(request);
  if (token && splat !== "auth/login") headers.set("Authorization", `Bearer ${token}`);
  const userAgent = request.headers.get("user-agent");
  if (userAgent) headers.set("User-Agent", userAgent);
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) headers.set("X-Forwarded-For", forwardedFor);

  const method = request.method.toUpperCase();
  const body = method === "GET" || method === "HEAD" ? undefined : await request.text();

  try {
    const { upstream, payload } = await callJaguar(`${splat}${query}`, { method, headers, body });
    return Response.json(payload, {
      status: statusFromPayload(payload, upstream.status),
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Jaguar mobile proxy error", error);
    return Response.json({ ok: false, code: "BACKEND_UNAVAILABLE", message: "Não foi possível comunicar com o backend Jaguar." }, { status: 502 });
  }
}

export const Route = createFileRoute("/api/mobile/jaguar/$")({
  server: { handlers: { GET: handler, POST: handler, PATCH: handler, DELETE: handler } },
});
