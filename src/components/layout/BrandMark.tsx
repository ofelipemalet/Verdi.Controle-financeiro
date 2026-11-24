import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
}

/** The Verdi logo: a white sprout on a green circle. Also used for the app icons in public/. */
export function BrandMark({ className }: BrandMarkProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-float",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="h-[55%] w-[55%]" fill="none">
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
  );
}
