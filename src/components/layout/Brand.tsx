import { Link } from "@tanstack/react-router";

export const APP_NAME = "Verdi";

export function Brand() {
  return (
    <Link
      to="/"
      className="press inline-flex items-center gap-2.5 rounded-xl"
      aria-label={`${APP_NAME} — Início`}
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-float">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="none">
          <path
            d="M5 5.5c4.5 0 7 3.2 7 8.5 0-5.3 2.5-8.5 7-8.5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M12 14v4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </span>
      <span className="font-display text-lg font-semibold tracking-tight text-foreground">
        {APP_NAME}
      </span>
    </Link>
  );
}
