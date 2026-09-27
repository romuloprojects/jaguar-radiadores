export async function fetchProductImageObjectUrl(sourceUrl: string, signal?: AbortSignal) {
  const response = await fetch(sourceUrl, {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
    signal,
  });

  if (!response.ok) {
    throw new Error(`PRODUCT_IMAGE_HTTP_${response.status}`);
  }

  const contentType = (response.headers.get("content-type") || "")
    .split(";", 1)[0]
    .trim()
    .toLowerCase();

  if (!contentType.startsWith("image/")) {
    throw new Error("PRODUCT_IMAGE_INVALID_CONTENT_TYPE");
  }

  const blob = await response.blob();
  if (blob.size <= 0) {
    throw new Error("PRODUCT_IMAGE_EMPTY");
  }

  if (blob.type && !blob.type.toLowerCase().startsWith("image/")) {
    throw new Error("PRODUCT_IMAGE_INVALID_BLOB");
  }

  return URL.createObjectURL(blob);
}
