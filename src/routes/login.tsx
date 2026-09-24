import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound, Wrench, Warehouse, WalletCards } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Acesso | Jaguar Radiadores" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("demo");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!username.trim() || !password) return setError("Informe usuário e senha.");
    setLoading(true);
    try {
      await login(username.trim(), password, remember);
      await navigate({ to: "/", replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível entrar.");
    } finally { setLoading(false); }
  }

  return (
    <main className="jaguar-login">
      <section className="jaguar-login__hero">
        <img src="/images/jaguar-login-hero.jpg" alt="Jaguar Radiadores" className="jaguar-login__hero-image" />
        <div className="jaguar-login__overlay" />
        <div className="jaguar-login__hero-content">
          <img src="/images/jaguar-logo-source.jpg" alt="Jaguar Radiadores" className="jaguar-login__logo" />
          <div className="jaguar-login__copy">
            <span>GESTÃO INTEGRADA</span>
            <h1>Da oficina ao financeiro,<br/>tudo em um só lugar.</h1>
            <p>Atendimentos, peças, estoque, fornecedores e caixa conectados para uma rotina mais simples.</p>
          </div>
          <div className="jaguar-login__features">
            <div><Wrench/><span><b>Atendimentos</b><small>Orçamentos e serviços</small></span></div>
            <div><Warehouse/><span><b>Estoque</b><small>Peças e movimentações</small></span></div>
            <div><WalletCards/><span><b>Financeiro</b><small>Receber, pagar e fluxo</small></span></div>
          </div>
        </div>
      </section>

      <section className="jaguar-login__access">
        <form className="jaguar-login__card" onSubmit={submit}>
          <div className="jaguar-login__mobile-brand"><img src="/images/jaguar-logo-source.jpg" alt="Jaguar Radiadores" /></div>
          <div>
            <span className="jaguar-login__eyebrow">JAGUAR RADIADORES</span>
            <h2>Bem-vindo(a)</h2>
            <p>Acesse o ambiente de gestão da empresa.</p>
          </div>

          <label className="jaguar-field">
            <span>Usuário ou e-mail</span>
            <div><UserRound/><Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Digite seu usuário" /></div>
          </label>
          <label className="jaguar-field">
            <span>Senha</span>
            <div><LockKeyhole/><Input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Digite sua senha" />
              <button type="button" onClick={() => setShow(v => !v)}>{show ? <EyeOff/> : <Eye/>}</button>
            </div>
          </label>

          <div className="flex items-center justify-between gap-3 text-xs">
            <label className="flex items-center gap-2 text-muted-foreground"><Checkbox checked={remember} onCheckedChange={(v) => setRemember(v === true)} />Manter conectado</label>
            <button type="button" className="font-medium text-primary">Esqueci minha senha</button>
          </div>

          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}
          <Button type="submit" className="h-11 w-full rounded-xl text-sm font-semibold" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</Button>
          <div className="jaguar-login__security"><ShieldCheck/><span>Protótipo de homologação · dados mockados</span></div>
        </form>
      </section>
    </main>
  );
}
