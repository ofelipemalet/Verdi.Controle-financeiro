import { Link } from "@tanstack/react-router";
import { HardDrive } from "lucide-react";
import type { ReactNode } from "react";

import { GuillochePattern } from "@/components/common/GuillochePattern";

import { Brand } from "./Brand";
import { NAV_ITEMS } from "./navigation";

function SidebarNav() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col overflow-hidden bg-sidebar px-4 py-6 text-sidebar-foreground md:flex">
      <GuillochePattern className="absolute -bottom-6 left-0 h-56 w-full text-sidebar-foreground/[0.06]" />
      <div className="relative px-2">
        <Brand tone="inverse" />
      </div>
      <p className="relative mt-10 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/50">
        Menu
      </p>
      <nav aria-label="Navegação principal" className="relative mt-2 flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: true }}
            className="press flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground data-[status=active]:bg-sidebar-primary data-[status=active]:text-sidebar-primary-foreground data-[status=active]:shadow-float"
          >
            <Icon className="h-[18px] w-[18px]" aria-hidden />
            {label}
          </Link>
        ))}
      </nav>
      <div className="relative mt-auto flex gap-2.5 rounded-2xl border border-sidebar-border bg-sidebar-accent p-3 text-xs text-sidebar-foreground/75 backdrop-blur-sm">
        <HardDrive className="mt-0.5 h-4 w-4 shrink-0 text-hero-accent" aria-hidden />
        <p>Seus dados ficam salvos somente neste navegador.</p>
      </div>
    </aside>
  );
}

function BottomNav() {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-16px_var(--color-overlay)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: true }}
              className="group press relative flex flex-col items-center gap-1 px-2 pb-2.5 pt-2 text-[11px] font-semibold text-muted-foreground data-[status=active]:text-primary"
            >
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 mx-auto h-0.5 w-8 rounded-full bg-primary opacity-0 transition-opacity group-data-[status=active]:opacity-100"
              />
              <span className="inline-flex h-8 w-14 items-center justify-center rounded-full transition-colors group-data-[status=active]:bg-primary-soft">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh md:flex">
      <SidebarNav />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 overflow-hidden bg-hero pt-[env(safe-area-inset-top)] text-hero-foreground md:hidden">
          <GuillochePattern className="absolute inset-0 h-full w-full text-hero-foreground/[0.07]" />
          <div className="relative flex items-center justify-between px-4 py-3">
            <Brand tone="inverse" />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-hero-foreground/15 bg-hero-foreground/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-hero-muted">
              <HardDrive className="h-3 w-3 text-hero-accent" aria-hidden />
              Neste aparelho
            </span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 md:px-8 md:pb-12 md:pt-10">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
