import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/auth/AuthContext";

export const Route = createFileRoute("/alterar-senha")({ component: ChangePasswordPage });

function ChangePasswordPage() {
  const { changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (next.length < 8) return setError("A nova senha deve ter pelo menos 8 caracteres.");
    if (next !== confirm) return setError("A confirmação da nova senha não confere.");
    setLoading(true);
    try {
      await changePassword(current, next);
      toast.success("Senha alterada. Entre novamente com a nova senha.");
      await logout();
      await navigate({ to: "/login", replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível alterar a senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <form className="panel w-full max-w-md space-y-4 p-6" onSubmit={submit}>
        <h1 className="text-xl font-semibold">Alterar senha</h1>
        <p className="text-sm text-muted-foreground">Defina sua nova senha para continuar usando o sistema.</p>
        <Input required type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Senha atual" />
        <Input required minLength={8} type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="Nova senha (mín. 8 caracteres)" />
        <Input required minLength={8} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirmar nova senha" />
        {error && <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>}
        <Button className="w-full" disabled={loading}>{loading ? "Salvando..." : "Salvar nova senha"}</Button>
      </form>
    </div>
  );
}
