import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { GuillochePattern } from "@/components/common/GuillochePattern";
import { Brand } from "@/components/layout/Brand";
import {
  consumePendingRedirect,
  sanitizeRedirectPath,
  savePendingRedirect,
} from "@/features/auth/redirect";
import { usePublicAuthSession } from "@/features/auth/use-auth-session";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

interface AuthSearch {
  redirect?: string;
}

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => {
    const raw = search["redirect"];
    return typeof raw === "string" ? { redirect: sanitizeRedirectPath(raw) } : {};
  },
  head: () => ({
    meta: [
      { title: "Entrar — Verdi" },
      {
        name: "description",
        content: "Acesse sua conta privada no Verdi com o Google para gerenciar suas finanças.",
      },
      { property: "og:title", content: "Entrar — Verdi" },
      {
        property: "og:description",
        content: "Acesse sua conta privada no Verdi com o Google para gerenciar suas finanças.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { redirect: redirectParam } = Route.useSearch();
  const navigate = useNavigate();
  const { user, isLoading } = usePublicAuthSession();
  const [signingIn, setSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user) {
      const target = consumePendingRedirect(redirectParam);
      void navigate({ to: target, replace: true });
    }
  }, [isLoading, user, redirectParam, navigate]);

  const handleGoogleSignIn = async () => {
    if (signingIn) return;
    setErrorMessage(null);
    setSigningIn(true);

    const target = sanitizeRedirectPath(redirectParam);
    savePendingRedirect(target);

    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/auth`,
      });

      if (result.error) {
        setErrorMessage("Não foi possível concluir o login com o Google. Tente novamente.");
        setSigningIn(false);
        return;
      }

      if (result.redirected) {
        return;
      }

      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await navigate({ to: consumePendingRedirect(target), replace: true });
        return;
      }

      setErrorMessage("Não foi possível confirmar sua sessão. Tente novamente.");
      setSigningIn(false);
    } catch {
      setErrorMessage("Não foi possível conectar ao Google agora. Tente novamente.");
      setSigningIn(false);
    }
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-hero p-12 text-hero-foreground lg:flex">
        <div className="surface-hero pointer-events-none absolute inset-0 rounded-none opacity-95" />
        <GuillochePattern className="pointer-events-none absolute -bottom-10 left-0 h-80 w-full text-hero-foreground/[0.08]" />
        <div className="relative">
          <Brand tone="inverse" to="/" />
        </div>
        <div className="relative max-w-md space-y-5">
          <h1 className="font-display text-4xl font-semibold tracking-tight leading-tight">
            Suas finanças em um espaço exclusivo seu.
          </h1>
          <p className="text-base leading-relaxed text-hero-muted">
            Cada pessoa acessa apenas as próprias receitas, despesas e análises, sincronizadas com
            segurança na nuvem.
          </p>
        </div>
        <div className="relative flex items-center gap-3 text-sm text-hero-muted">
          <ShieldCheck className="h-5 w-5 shrink-0 text-hero-accent" aria-hidden />
          <span>Acesso autenticado via Google com isolamento total entre contas.</span>
        </div>
      </section>

      <main className="flex flex-col justify-between bg-background px-6 py-8 sm:px-10">
        <div className="flex items-center justify-between gap-3">
          <div className="shrink-0 lg:hidden">
            <Brand to="/" />
          </div>
          <Link
            to="/"
            className="press ml-auto inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            <span>
              Voltar<span className="hidden sm:inline"> à apresentação</span>
            </span>
          </Link>
        </div>

        <div className="mx-auto my-auto w-full max-w-md py-10">
          <div className="surface-card animate-rise p-7 sm:p-9">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Lock className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Entrar na sua conta
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Use sua conta Google para acessar seu painel financeiro pessoal no Verdi.
            </p>

            {errorMessage && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-2.5 rounded-2xl border border-destructive/25 bg-expense-soft px-4 py-3 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="mt-7">
              <GoogleSignInButton
                onClick={() => void handleGoogleSignIn()}
                loading={signingIn || isLoading}
                className="w-full"
              />
            </div>

            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              Seus lançamentos ficam vinculados exclusivamente à sua conta e nunca são
              compartilhados com outros usuários.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Verdi · Controle financeiro pessoal
        </p>
      </main>
    </div>
  );
}