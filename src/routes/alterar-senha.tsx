import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/auth/AuthContext";

export const Route = createFileRoute("/alterar-senha")({ component: ChangePasswordPage });

function ChangePasswordPage() {
  const { changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <form className="panel w-full max-w-md space-y-4 p-6" onSubmit={async (e) => { e.preventDefault(); await changePassword(current, next); await logout(); await navigate({ to: "/login" }); }}>
        <h1 className="text-xl font-semibold">Alterar senha</h1>
        <p className="text-sm text-muted-foreground">Tela preservada para a futura autenticação real.</p>
        <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Senha atual" />
        <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="Nova senha" />
        <Button className="w-full">Salvar</Button>
      </form>
    </div>
  );
}
