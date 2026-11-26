import type { QueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export async function signOutUser({
  queryClient,
  navigateToAuth,
}: {
  queryClient: QueryClient;
  navigateToAuth: () => Promise<void> | void;
}): Promise<void> {
  await queryClient.cancelQueries();
  queryClient.clear();
  await supabase.auth.signOut();
  await navigateToAuth();
}