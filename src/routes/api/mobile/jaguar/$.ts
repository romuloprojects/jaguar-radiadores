import { createFileRoute } from "@tanstack/react-router";
import { bearerFrom, callJaguar, statusFromPayload } from "@/lib/mobile-server";

function num(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function recoverCreatedQuote(token: string, bodyText?: string) {
  if (!bodyText) return null;
  let body: any;
  try { body = JSON.parse(bodyText); } catch { return null; }

  const expectedCustomer = String(body?.customerId || "");
  const expectedIssue = String(body?.issueReported || "").trim();
  const expectedItems = Array.isArray(body?.items) ? body.items : [];
  const expectedSubtotal = expectedItems.reduce((sum: number, item: any) => sum + num(item?.quantity) * num(item?.unitPrice), 0);
  const discountType = String(body?.discountType || "none");
  const discountValue = num(body?.discountValue);
  const expectedTotal =
    discountType === "amount"
      ? Math.max(0, expectedSubtotal - discountValue)
      : discountType === "percent"
        ? Math.max(0, expectedSubtotal - expectedSubtotal * Math.min(discountValue, 100) / 100)
        : expectedSubtotal;

  try {
    await new Promise((resolve) => setTimeout(resolve, 350));
    const authHeaders = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "X-Jaguar-Client": "android-recovery",
    };
    const { upstream, payload } = await callJaguar("quotes?limit=20", { method: "GET", headers: authHeaders });
    if (!upstream.ok || payload?.ok === false || !Array.isArray(payload?.items)) return null;

    const cutoff = Date.now() - 3 * 60 * 1000;
    const candidates = payload.items
      .filter((item: any) =>
        String(item?.customerId || "") === expectedCustomer &&
        Math.abs(num(item?.total) - expectedTotal) < 0.02 &&
        Date.parse(String(item?.date || "")) >= cutoff
      )
      .slice(0, 5);

    for (const candidate of candidates) {
      const detailResult = await callJaguar(`quote-detail?id=${encodeURIComponent(String(candidate.id))}`, {
        method: "GET",
        headers: authHeaders,
      });
      const quote = detailResult.payload?.quote;
      if (!detailResult.upstream.ok || detailResult.payload?.ok === false || !quote) continue;

      const issueMatches = String(quote?.issueReported || "").trim() === expectedIssue;
      const actualItems = Array.isArray(quote?.items) ? quote.items : [];
      const itemsMatch = actualItems.length === expectedItems.length && expectedItems.every((expected: any) =>
        actualItems.some((actual: any) =>
          String(actual?.description || "").trim() === String(expected?.description || "").trim() &&
          Math.abs(num(actual?.quantity) - num(expected?.quantity)) < 0.001 &&
          Math.abs(num(actual?.unitPrice) - num(expected?.unitPrice)) < 0.02
        )
      );

      if (issueMatches && itemsMatch) {
        return { ...detailResult.payload, recovered: true };
      }
    }
  } catch (recoveryError) {
    console.error("Jaguar quote-create recovery failed", recoveryError);
  }
  return null;
}


export async function recoverCreatedProduct(token: string, bodyText?: string) {
  if (!bodyText) return null;
  let body: any;
  try { body = JSON.parse(bodyText); } catch { return null; }

  const expectedCode = String(body?.code || "").trim();
  const expectedDescription = String(body?.description || body?.name || "").trim();
  const expectedBrand = String(body?.brand || "").trim();
  if (!expectedCode) return null;

  try {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const authHeaders = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "X-Jaguar-Client": "android-product-recovery",
    };
    const query = new URLSearchParams({ search: expectedCode, limit: "20" });
    const { upstream, payload } = await callJaguar(`products?${query.toString()}`, { method: "GET", headers: authHeaders });
    if (!upstream.ok || payload?.ok === false || !Array.isArray(payload?.items)) return null;

    const norm = (value: unknown) => String(value || "").trim().toLocaleLowerCase("pt-BR");
    const candidates = payload.items.filter((item: any) => norm(item?.code) === norm(expectedCode));
    if (candidates.length !== 1) return null;
    const product = candidates[0];
    if (expectedDescription && norm(product?.description) !== norm(expectedDescription)) return null;
    if (expectedBrand && norm(product?.brand) !== norm(expectedBrand)) return null;
    return { ok: true, id: String(product.id), recovered: true };
  } catch (recoveryError) {
    console.error("Jaguar product-create recovery failed", recoveryError);
    return null;
  }
}

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
    if (splat === "product-create" && method === "POST" && token && (upstream.status >= 500 || payload?.code === "BACKEND_UNAVAILABLE")) {
      const recovered = await recoverCreatedProduct(token, body);
      if (recovered) {
        return Response.json(recovered, {
          status: 200,
          headers: { "Cache-Control": "private, no-store", "X-Jaguar-Recovered": "product-create" },
        });
      }
    }
    return Response.json(payload, {
      status: statusFromPayload(payload, upstream.status),
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Jaguar mobile proxy error", { splat, method, error });

    if (splat === "quote-create" && method === "POST" && token) {
      const recovered = await recoverCreatedQuote(token, body);
      if (recovered) {
        return Response.json(recovered, {
          status: 200,
          headers: {
            "Cache-Control": "private, no-store",
            "X-Jaguar-Recovered": "quote-create",
          },
        });
      }
    }
    if (splat === "product-create" && method === "POST" && token) {
      const recovered = await recoverCreatedProduct(token, body);
      if (recovered) {
        return Response.json(recovered, {
          status: 200,
          headers: {
            "Cache-Control": "private, no-store",
            "X-Jaguar-Recovered": "product-create",
          },
        });
      }
    }

    return Response.json({
      ok: false,
      code: "BACKEND_UNAVAILABLE",
      message: splat === "quote-create"
        ? "O backend demorou para responder. Verifique Atendimentos antes de tentar novamente para evitar uma OS duplicada."
        : splat === "product-create"
          ? "O backend demorou para responder. Atualize o Estoque antes de tentar novamente."
          : "Não foi possível comunicar com o backend Jaguar.",
    }, { status: 502 });
  }
}

export const Route = createFileRoute("/api/mobile/jaguar/$")({
  server: { handlers: { GET: handler, POST: handler, PATCH: handler, DELETE: handler } },
});
