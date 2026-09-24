import { createFileRoute } from "@tanstack/react-router";

const SESSION_COOKIE = "jaguar_session";

function getCookie(request: Request, name: string) {
  const raw = request.headers.get("cookie");
  if (!raw) return null;
  for (const part of raw.split(/;\s*/)) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    if (part.slice(0, eq) === name) return decodeURIComponent(part.slice(eq + 1));
  }
  return null;
}

function cookieHeader(token: string, expiresAt?: string | null) {
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  if (expiresAt) {
    const maxAge = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
    parts.push(`Max-Age=${maxAge}`);
  }
  return parts.join("; ");
}

function clearCookieHeader() {
  return [
    `${SESSION_COOKIE}=`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    "Max-Age=0",
    ...(process.env.NODE_ENV === "production" ? ["Secure"] : []),
  ].join("; ");
}

function statusFromPayload(payload: any, upstreamStatus: number) {
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
    case "INVALID_STATE":
      return 409;
    default:
      return 400;
  }
}

async function handler({ request, params }: { request: Request; params: { _splat?: string } }) {
  const splat = String(params._splat || "").replace(/^\/+/, "");
  if (!splat) return Response.json({ ok: false, code: "NOT_FOUND", message: "Rota inválida" }, { status: 404 });

  const base = (process.env.JAGUAR_N8N_WEBHOOK_BASE_URL || "https://n8n.facilities-ai.com.br/webhook").replace(/\/$/, "");
  const incoming = new URL(request.url);
  const upstreamUrl = `${base}/jaguar/${splat}${incoming.search}`;
  const headers = new Headers();
  headers.set("Accept", "application/json");
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  const token = getCookie(request, SESSION_COOKIE);
  if (token && splat !== "auth/login") headers.set("Authorization", `Bearer ${token}`);
  const userAgent = request.headers.get("user-agent");
  if (userAgent) headers.set("User-Agent", userAgent);
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) headers.set("X-Forwarded-For", forwardedFor);

  const method = request.method.toUpperCase();
  const body = method === "GET" || method === "HEAD" ? undefined : await request.text();

  try {
    const upstream = await fetch(upstreamUrl, {
      method,
      headers,
      body,
      redirect: "manual",
    });
    const text = await upstream.text();
    let payload: any;
    try {
      payload = text ? JSON.parse(text) : { ok: upstream.ok };
    } catch {
      payload = { ok: false, code: "INVALID_UPSTREAM_RESPONSE", message: text || "Resposta inválida do n8n" };
    }

    const responseHeaders = new Headers({
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "private, no-store",
    });

    if (splat === "auth/login" && payload?.ok && payload?.token) {
      responseHeaders.append("Set-Cookie", cookieHeader(payload.token, payload.expiresAt));
      const { token: _token, ...safePayload } = payload;
      payload = safePayload;
    }
    if (splat === "auth/logout") responseHeaders.append("Set-Cookie", clearCookieHeader());
    if (payload?.code === "UNAUTHORIZED") responseHeaders.append("Set-Cookie", clearCookieHeader());

    return new Response(JSON.stringify(payload), {
      status: statusFromPayload(payload, upstream.status),
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Jaguar n8n proxy error", error);
    return Response.json(
      { ok: false, code: "BACKEND_UNAVAILABLE", message: "Não foi possível comunicar com o backend Jaguar." },
      { status: 502, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}

export const Route = createFileRoute("/api/jaguar/$")({
  server: {
    handlers: {
      GET: handler,
      POST: handler,
      PATCH: handler,
    },
  },
});
