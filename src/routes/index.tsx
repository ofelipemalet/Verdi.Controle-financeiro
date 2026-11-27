import { useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  ChartPie,
  Lock,
  LogOut,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { GuillochePattern } from "@/components/common/GuillochePattern";
import { Brand } from "@/components/layout/Brand";
import { Button } from "@/components/ui/button";
import { signOutUser } from "@/features/auth/auth-actions";
import { usePublicAuthSession } from "@/features/auth/use-auth-session";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Verdi — Controle financeiro pessoal" },
      {
        name: "description",
        content:
          "Organize receitas, despesas, saldo disponível e análises financeiras na sua conta privada protegida com Google.",
      },
      { property: "og:title", content: "Verdi — Controle financeiro pessoal" },
      {
        property: "og:description",
        content:
          "Organize receitas, despesas, saldo disponível e análises financeiras na sua conta privada protegida com Google.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PresentationPage,
});

const HIGHLIGHTS = [
  {
    icon: Wallet,
    title: "Saldo e fluxo sempre claros",
    description:
      "Veja em segundos o saldo disponível, total de entradas, saídas e quanto conseguiu economizar no período.",
  },
  {
    icon: ChartPie,
    title: "Análises por categoria e mês",
    description:
      "Entenda para onde vai cada real com gráficos interativos, comparação mensal e indicadores financeiros.",
  },
  {
    icon: Smartphone,
    title: "Na palma da mão e sincronizado",
    description:
      "Registre receitas e despesas pelo celular ou computador com seus dados salvos na nuvem na sua conta.",
  },
] as const;

const PRIVACY_PILLARS = [
  {
    title: "Cada conta vê apenas os próprios dados",
    description:
      "Suas receitas e despesas ficam isoladas no banco de dados e nunca se misturam com as de outros usuários.",
  },
  {
    title: "Login seguro com Google",
    description:
      "Entre com a sua conta Google sem precisar criar ou guardar senhas extras no aplicativo.",
  },
  {
    title: "Validação de ponta a ponta",
    description:
      "Todas as movimentações passam por verificação autenticada no servidor antes de serem salvas.",
  },
] as const;

function PresentationPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, isLoading } = usePublicAuthSession();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOutUser({
        queryClient,
        navigateToAuth: () => navigate({ to: "/", replace: true }),
      });
    } catch {
      toast.error("Não foi possível sair da conta. Tente novamente.");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <section className="relative overflow-hidden bg-hero text-hero-foreground">
        <div className="surface-hero pointer-events-none absolute inset-0 rounded-none" />
        <GuillochePattern className="pointer-events-none absolute -bottom-8 left-0 h-80 w-full text-hero-foreground/[0.08]" />

        <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-6 md:px-8">
          <Brand tone="inverse" to="/" />
          <div className="flex items-center gap-2">
            {!isLoading && user ? (
              <>
                <Button asChild variant="hero" size="sm">
                  <Link to="/inicio">
                    Meu painel
                    <ArrowRight aria-hidden />
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="hero-ghost"
                  size="sm"
                  onClick={() => void handleSignOut()}
                  disabled={signingOut}
                >
                  <LogOut aria-hidden />
                  Sair
                </Button>
              </>
            ) : (
              <Button asChild variant="hero" size="sm">
                <Link to="/auth">
                  Entrar
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            )}
          </div>
        </header>

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-20 pt-8 md:px-8 md:pb-28 md:pt-14 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-hero-accent">
              Controle financeiro pessoal
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight leading-[1.08] sm:text-5xl lg:text-6xl">
              Seu dinheiro organizado, claro e só seu.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-hero-muted sm:text-lg">
              Acompanhe saldo disponível, receitas, despesas e análises mensais em uma experiência
              simples, com cada conta isolada e protegida.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {user ? (
                <Button asChild variant="hero" size="lg">
                  <Link to="/inicio">
                    Abrir meu painel
                    <ArrowRight aria-hidden />
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="hero" size="lg">
                  <Link to="/auth">
                    Entrar com o Google
                    <ArrowRight aria-hidden />
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-3xl border border-hero-foreground/15 bg-hero-foreground/[0.07] p-6 shadow-hero backdrop-blur-sm sm:p-7">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-hero-muted">
                <span>Resumo da conta</span>
                <span className="inline-flex items-center gap-1.5 text-hero-accent">
                  <Lock className="h-3.5 w-3.5" aria-hidden />
                  Privado
                </span>
              </div>
              <p className="mt-5 text-xs text-hero-muted">Saldo disponível</p>
              <p className="tabular mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                R$ 0,00
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-hero-foreground/15 pt-5">
                <div className="rounded-2xl bg-hero-foreground/[0.06] p-3.5">
                  <span className="inline-flex items-center gap-1.5 text-xs text-hero-muted">
                    <ArrowDownLeft className="h-3.5 w-3.5 text-hero-accent" aria-hidden />
                    Entradas
                  </span>
                  <p className="tabular mt-1.5 font-display text-base font-semibold">R$ 0,00</p>
                </div>
                <div className="rounded-2xl bg-hero-foreground/[0.06] p-3.5">
                  <span className="inline-flex items-center gap-1.5 text-xs text-hero-muted">
                    <ArrowUpRight className="h-3.5 w-3.5 text-hero-muted" aria-hidden />
                    Saídas
                  </span>
                  <p className="tabular mt-1.5 font-display text-base font-semibold">R$ 0,00</p>
                </div>
              </div>
              <p className="mt-4 text-[11px] text-hero-muted/80">
                Ao entrar, você vê apenas as suas movimentações reais.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Tudo o que você precisa para acompanhar o mês
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Sem planilhas complicadas: registre o que entra e sai e deixe o Verdi organizar os
            números para você.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="surface-card p-6">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-12 lg:items-center">
          <div className="space-y-4 lg:col-span-5">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Privacidade desde a base
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              O Verdi separa cada usuário no servidor e no banco de dados para que apenas você
              consiga visualizar, criar, editar ou excluir suas movimentações.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3 lg:col-span-7">
            {PRIVACY_PILLARS.map(({ title, description }) => (
              <div key={title} className="space-y-2">
                <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 text-center md:px-8 md:py-24">
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Pronto para assumir o controle das suas finanças?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
          Entre com sua conta Google e comece a registrar suas receitas e despesas agora mesmo.
        </p>
        <div className="mt-7">
          <Button asChild size="lg">
            <Link to={user ? "/inicio" : "/auth"}>
              {user ? "Ir para meu painel" : "Acessar minha conta"}
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 text-xs text-muted-foreground sm:flex-row md:px-8">
          <span>Verdi — Controle financeiro pessoal</span>
          <span>Acesso protegido com Google</span>
        </div>
      </footer>
    </div>
  );
}
