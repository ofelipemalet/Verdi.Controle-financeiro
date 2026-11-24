import { useHydrated } from "@tanstack/react-router";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export function greetingForHour(hour: number): string {
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

/** Greeting and date in the visitor's own timezone; neutral text until hydrated to avoid mismatches. */
export function useGreeting(): { greeting: string; dateLabel: string | null } {
  const hydrated = useHydrated();
  if (!hydrated) return { greeting: "Olá", dateLabel: null };
  const now = new Date();
  const date = dateFormatter.format(now);
  return {
    greeting: greetingForHour(now.getHours()),
    dateLabel: date.charAt(0).toUpperCase() + date.slice(1),
  };
}
