import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

import { BrandMark } from "./BrandMark";

export const APP_NAME = "Verdi";

interface BrandProps {
  /** "inverse" is for dark green surfaces (sidebar, mobile header). */
  tone?: "default" | "inverse";
}

export function Brand({ tone = "default" }: BrandProps) {
  const inverse = tone === "inverse";
  return (
    <Link
      to="/"
      className="press inline-flex items-center gap-2.5 rounded-xl"
      aria-label={`${APP_NAME} — Início`}
    >
      <BrandMark className={cn(inverse && "ring-1 ring-hero-foreground/20")} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-lg font-semibold tracking-tight",
            inverse ? "text-hero-foreground" : "text-foreground",
          )}
        >
          {APP_NAME}
        </span>
        <span
          className={cn(
            "mt-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
            inverse ? "text-hero-muted" : "text-muted-foreground",
          )}
        >
          Finanças pessoais
        </span>
      </span>
    </Link>
  );
}
