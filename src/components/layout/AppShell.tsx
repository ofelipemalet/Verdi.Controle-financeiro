import { Link } from "@tanstack/react-router";
import { HardDrive } from "lucide-react";
import type { ReactNode } from "react";

import { Brand } from "./Brand";
import { NAV_ITEMS } from "./navigation";

function SidebarNav() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 md:flex">
      <div className="px-2">
        <Brand />
      </div>
      <nav aria-label="Navegação principal" className="mt-10 flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: true }}
            className="press flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[status=active]:bg-sidebar-primary data-[status=active]:text-sidebar-primary-foreground"
          >
            <Icon className="h-[18px] w-[18px]" aria-hidden />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto flex gap-2.5 rounded-2xl bg-muted p-3 text-xs text-muted-foreground">
        <HardDrive className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <p>Seus dados ficam salvos somente neste navegador.</p>
      </div>
    </aside>
  );
}

function BottomNav() {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: true }}
              className="group press flex flex-col items-center gap-1 px-2 pb-2.5 pt-2 text-[11px] font-semibold text-muted-foreground data-[status=active]:text-primary"
            >
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
        <header className="sticky top-0 z-30 flex items-center border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:hidden">
          <Brand />
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 md:px-8 md:pb-12 md:pt-10">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
