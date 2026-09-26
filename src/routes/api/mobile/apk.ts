import { createFileRoute } from "@tanstack/react-router";
import { MOBILE_APK_PATH, readApk } from "@/lib/mobile-server";

function apkVersion() { return process.env.JAGUAR_ANDROID_APP_VERSION || "1.0.0"; }
function remoteUrl() { return (process.env.JAGUAR_ANDROID_APK_URL || "").trim(); }

async function GET() {
  const external = remoteUrl();
  if (external) return Response.redirect(external, 302);
  try {
    const apk = await readApk();
    return new Response(apk.bytes, {
      headers: {
        "Content-Type": "application/vnd.android.package-archive",
        "Content-Disposition": `attachment; filename="Jaguar-Radiadores-v${apkVersion()}.apk"`,
        "Content-Length": String(apk.size),
        "Cache-Control": "private, no-cache",
        "X-Jaguar-App-Version": apkVersion(),
      },
    });
  } catch {
    return Response.json({ ok: false, code: "APK_NOT_PUBLISHED", message: `APK ainda não publicado em ${MOBILE_APK_PATH}` }, { status: 404 });
  }
}

async function HEAD() {
  const external = remoteUrl();
  if (external) return new Response(null, { status: 200, headers: { "X-Jaguar-App-Version": apkVersion(), "X-Jaguar-App-Source": "external" } });
  try {
    const apk = await readApk();
    return new Response(null, { status: 200, headers: { "Content-Length": String(apk.size), "X-Jaguar-App-Version": apkVersion(), "X-Jaguar-App-Source": "local" } });
  } catch {
    return new Response(null, { status: 404 });
  }
}

export const Route = createFileRoute("/api/mobile/apk")({ server: { handlers: { GET, HEAD } } });
