export function normalizeProductImageUrl(value?: string | null) {
  const input = String(value || "").trim();
  if (!input) return null;

  const legacyMarker = "/api/mobile/media/products/";
  const legacyIndex = input.indexOf(legacyMarker);
  if (legacyIndex < 0) return input;

  const rawTail = input.slice(legacyIndex + legacyMarker.length);
  const rawName = rawTail.split(/[?#]/, 1)[0] || "";
  if (!rawName || rawName.includes("/")) return input;

  let fileName = rawName;
  try {
    fileName = decodeURIComponent(rawName);
  } catch {
    // Mantém o valor bruto caso uma URL legada tenha escape inválido.
  }

  const originPrefix = input.slice(0, legacyIndex);
  return `${originPrefix}/api/mobile/media/product-image?file=${encodeURIComponent(fileName)}`;
}
