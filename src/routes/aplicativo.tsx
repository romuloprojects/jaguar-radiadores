import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { CheckCircle2, Download, ExternalLink, FileDown, Info, LockKeyhole, QrCode, ShieldCheck, Smartphone } from "lucide-react";
import QRCode from "qrcode";
import { InternalPage } from "@/components/InternalPage";
import { PageHeader } from "@/components/ui-helpers";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/aplicativo")({ component: AndroidAppPage });

type ApkStatus = { available: boolean; version: string; qr?: string };

function AndroidAppPage() {
  const [status, setStatus] = useState<ApkStatus>({ available: false, version: "1.0.0" });
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const response = await fetch("/api/mobile/apk", { method: "HEAD", cache: "no-store" });
        const version = response.headers.get("x-jaguar-app-version") || "1.0.0";
        const url = `${window.location.origin}/api/mobile/apk`;
        const qr = response.ok ? await QRCode.toDataURL(url, { width: 260, margin: 1 }) : undefined;
        if (alive) setStatus({ available: response.ok, version, qr });
      } catch {
        if (alive) setStatus({ available: false, version: "1.0.0" });
      }
    })();
    return () => { alive = false; };
  }, []);

  return <InternalPage>
    <PageHeader title="Aplicativo Android" subtitle="Aplicativo operacional da Jaguar para OS, clientes, estoque e câmera." icon={Smartphone} />

    <section className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
      <div className="panel p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary"><Smartphone className="h-4 w-4"/> APK PRIVADO JAGUAR</div>
            <h2 className="text-2xl font-extrabold tracking-tight">Jaguar Radiadores Mobile</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Use o celular na oficina para cadastrar clientes, abrir OS, consultar peças, movimentar estoque e fotografar produtos reais. Os dados são os mesmos do sistema web.</p>
          </div>
          <div className="rounded-2xl border bg-background/50 px-4 py-3 text-right"><small className="block text-xs uppercase tracking-wider text-muted-foreground">Versão publicada</small><b className="mt-1 block text-lg">{status.available ? status.version : "—"}</b></div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[['OS e atendimentos','document-text'],['Clientes e veículos','users'],['Estoque e câmera','camera'],['PDF e PIX','file']].map(([title])=><div key={title} className="rounded-2xl border bg-card/50 p-4"><CheckCircle2 className="h-5 w-5 text-[var(--accent-green)]"/><b className="mt-3 block text-sm">{title}</b></div>)}
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          {status.available ? <Button asChild size="lg"><a href="/api/mobile/apk"><Download className="mr-2 h-4 w-4"/>Baixar APK v{status.version}</a></Button> : <Button size="lg" disabled><FileDown className="mr-2 h-4 w-4"/>APK ainda não publicado</Button>}
          <Button variant="outline" asChild><a href="#como-instalar"><Info className="mr-2 h-4 w-4"/>Como instalar</a></Button>
        </div>
        {!status.available && <p className="mt-3 text-xs text-muted-foreground">O aplicativo já pode ser testado pelo Expo Go. O botão de download será habilitado automaticamente quando o APK assinado for publicado no servidor.</p>}
      </div>

      <aside className="panel flex min-h-[310px] flex-col items-center justify-center p-6 text-center">
        {status.qr ? <img src={status.qr} className="h-48 w-48 rounded-2xl bg-white p-2" alt="QR Code para baixar o APK"/> : <div className="grid h-48 w-48 place-items-center rounded-2xl border border-dashed bg-background/40"><QrCode className="h-16 w-16 text-muted-foreground"/></div>}
        <h3 className="mt-4 font-bold">Instale direto no Android</h3>
        <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">Abra esta página no celular ou leia o QR Code quando o APK estiver publicado.</p>
      </aside>
    </section>

    <section id="como-instalar" className="panel mt-4 p-6 sm:p-8">
      <div className="mb-6"><span className="text-xs font-extrabold uppercase tracking-[.18em] text-primary">Instalação segura</span><h2 className="mt-1 text-xl font-extrabold">Como instalar o APK no Android</h2></div>
      <div className="grid gap-4 lg:grid-cols-4">
        <InstallStep n="1" title="Baixe o APK">Toque em <b>Baixar APK</b> nesta página e aguarde o download terminar.</InstallStep>
        <InstallStep n="2" title="Abra o arquivo">Abra a notificação de download ou localize o APK em <b>Meus Arquivos / Downloads</b>.</InstallStep>
        <InstallStep n="3" title="Autorize esta fonte">Se o Android bloquear, toque em <b>Configurações</b> e ative <b>Permitir desta fonte</b> para o navegador ou gerenciador de arquivos usado.</InstallStep>
        <InstallStep n="4" title="Instale e abra">Volte para o APK, toque em <b>Instalar</b> e depois em <b>Abrir</b>. Após a instalação, você pode desativar novamente a permissão de fonte desconhecida.</InstallStep>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <Tip icon={ShieldCheck} title="APK assinado">Atualizações futuras devem usar a mesma assinatura para instalar por cima da versão existente.</Tip>
        <Tip icon={LockKeyhole} title="Mesma conta Jaguar">O aplicativo usa os mesmos usuários e permissões do sistema web.</Tip>
        <Tip icon={ExternalLink} title="Sem Google Play">A distribuição é privada; não depende de publicação ou aprovação na Play Store.</Tip>
      </div>
    </section>
  </InternalPage>;
}

function InstallStep({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return <div className="rounded-2xl border bg-card/40 p-5"><span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-sm font-black text-primary-foreground">{n}</span><h3 className="mt-4 font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{children}</p></div>;
}
function Tip({ icon: Icon, title, children }: { icon: typeof ShieldCheck; title: string; children: ReactNode }) {
  return <div className="flex gap-3 rounded-2xl border bg-background/35 p-4"><Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary"/><div><b className="text-sm">{title}</b><p className="mt-1 text-xs leading-5 text-muted-foreground">{children}</p></div></div>;
}
