import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Boxes,
  ChevronDown,
  FileText,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  Truck,
  Users,
  WalletCards,
  Warehouse,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";

const nav = [
  { to: "/", label: "Visão Geral", icon: LayoutDashboard },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/orcamentos", label: "Orçamentos", icon: FileText },
  { to: "/estoque", label: "Estoque", icon: Warehouse },
  { to: "/financeiro", label: "Financeiro", icon: WalletCards },
  { to: "/fornecedores", label: "Fornecedores", icon: Truck },
  { to: "/relatorios", label: "Relatórios", icon: Boxes },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <>
      {nav.map(({ to, label, icon: Icon }) => {
        const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
        return (
          <Link key={to} to={to} onClick={onNavigate} className={`jaguar-nav__link ${active ? "is-active" : ""}`}>
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Link>
        );
      })}
    </>
  );
}

export function JaguarHeader() {
  const { session, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="jaguar-header">
      <div className="jaguar-header__inner">
        <Link to="/" className="jaguar-brand" aria-label="Jaguar Radiadores">
          <img src="/images/jaguar-logo-source.jpg" alt="Jaguar Radiadores" />
        </Link>

        <nav className="jaguar-nav hidden xl:flex" aria-label="Navegação principal"><NavLinks /></nav>

        <div className="jaguar-header__actions">
          <div className="jaguar-global-search hidden lg:flex">
            <Search className="h-4 w-4" />
            <Input placeholder="Buscar cliente, telefone, orçamento..." aria-label="Busca global" />
          </div>
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl text-white/70 hover:bg-white/10 hover:text-white">
            <Bell className="h-4 w-4" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="jaguar-user">
                <span className="jaguar-user__avatar">{(session?.user.displayName || "U").slice(0, 1).toUpperCase()}</span>
                <span className="hidden text-left md:block"><b>{session?.user.displayName ?? "Usuário"}</b><small>Administrador</small></span>
                <ChevronDown className="hidden h-4 w-4 md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link to="/configuracoes"><Settings className="mr-2 h-4 w-4" />Configurações</Link></DropdownMenuItem>
              <DropdownMenuItem onClick={() => void logout()}>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-white hover:bg-white/10 xl:hidden"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[310px] p-0">
              <SheetHeader className="border-b p-5"><SheetTitle>Jaguar Radiadores</SheetTitle></SheetHeader>
              <div className="p-3"><div className="jaguar-nav flex flex-col"><NavLinks onNavigate={() => setMobileOpen(false)} /></div></div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
