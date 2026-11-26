import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export interface PublicAuthSession {
  user: User | null;
  isLoading: boolean;
}

export function usePublicAuthSession(): PublicAuthSession {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (active) setUser(data.user ?? null);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadUser();

    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        if (active) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        void loadUser();
      }
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return { user, isLoading };
}