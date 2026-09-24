import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  UserRound,
  Wrench,
  Warehouse,
  WalletCards,
  ArrowRight,
} from "lucide-react";
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="jaguar-login">
      <section className="jaguar-login__brand-panel">
        <div className="jaguar-login__brand-content">
          <div className="jaguar-login__brand-top">
            <img
              src="/images/jaguar-logo-source.jpg"
              alt="Jaguar Radiadores"
              className="jaguar-login__brand-logo"
            />
            <span className="jaguar-login__brand-tag">PLATAFORMA DE GESTÃO</span>
          </div>

          <div className="jaguar-login__brand-message">
            <h1>
              Controle que move
              <br />
              <em>o seu negócio</em>
            </h1>
            <p>
              Gerencie vendas, orçamentos, clientes, estoque e financeiro. Tudo em um só lugar, com
              mais agilidade, controle e resultados.
            </p>
          </div>

          <div className="jaguar-login__features">
            <div>
              <Wrench />
              <span>
                <b>Atendimentos</b>
                <small>Orçamentos e serviços</small>
              </span>
            </div>
            <div>
              <Warehouse />
              <span>
                <b>Estoque</b>
                <small>Peças e movimentações</small>
              </span>
            </div>
            <div>
              <WalletCards />
              <span>
                <b>Financeiro</b>
                <small>Receber, pagar e fluxo</small>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="jaguar-login__access">
        <form className="jaguar-login__card" onSubmit={submit}>
          <div className="jaguar-login__mobile-brand">
            <img src="/images/jaguar-logo-source.jpg" alt="Jaguar Radiadores" />
          </div>
          <div>
            <span className="jaguar-login__eyebrow">JAGUAR RADIADORES</span>
            <h2>Acesse sua conta</h2>
            <p>Bem-vindo à plataforma Jaguar Radiadores.</p>
          </div>

          <label className="jaguar-field">
            <span>Usuário ou e-mail</span>
            <div>
              <UserRound />
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
              />
            </div>
          </label>
          <label className="jaguar-field">
            <span>Senha</span>
            <div>
              <LockKeyhole />
              <Input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
              />
              <button
                type="button"
                aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                onClick={() => setShow((v) => !v)}
              >
                {show ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </label>

          <div className="flex items-center justify-between gap-3 text-xs">
            <label className="flex items-center gap-2 text-muted-foreground">
              <Checkbox checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
              Manter conectado
            </label>
            <button type="button" className="font-semibold text-primary">
              Esqueci minha senha
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
            >
              {error}
            </div>
          )}
          <Button
            type="submit"
            className="jaguar-login__submit w-full font-semibold"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
            <ArrowRight className="ml-3" />
          </Button>
          <div className="jaguar-login__security">
            <ShieldCheck />
            <span>Protótipo de homologação · dados mockados</span>
          </div>
        </form>
      </section>
    </main>
  );
}
