import type { ReactNode } from "react";
import { JaguarHeader } from "@/components/JaguarHeader";
import { Toaster } from "@/components/ui/sonner";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell min-h-svh bg-background text-foreground">
      <JaguarHeader />
      <main className="dashboard-main mx-auto w-full max-w-[1800px] px-4 py-5 sm:px-5 lg:px-6 2xl:px-8">{children}</main>
      <Toaster />
    </div>
  );
}
