import { Outlet, createFileRoute, isRedirect, redirect } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";
import { AuthenticatedUserProvider } from "@/features/auth/auth-context";
import { sanitizeRedirectPath } from "@/features/auth/redirect";
import { TransactionDialogProvider } from "@/features/finance/components/TransactionDialogProvider";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        throw redirect({
          to: "/auth",
          search: { redirect: sanitizeRedirectPath(location.href) },
        });
      }
      return { user: data.user };
    } catch (error) {
      if (isRedirect(error)) throw error;
      throw redirect({
        to: "/auth",
        search: { redirect: sanitizeRedirectPath(location.href) },
      });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user } = Route.useRouteContext();

  return (
    <AuthenticatedUserProvider user={user}>
      <TransactionDialogProvider>
        <AppShell userEmail={user.email ?? null}>
          <Outlet />
        </AppShell>
      </TransactionDialogProvider>
    </AuthenticatedUserProvider>
  );
}