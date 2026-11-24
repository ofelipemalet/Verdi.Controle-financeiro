import { cn } from "@/lib/utils";

const WIDTH = 400;
const HEIGHT = 220;
const LINES = 11;
const STEP = 8;

function wavePath(index: number, direction: 1 | -1): string {
  const base = 18 + index * 18;
  const amplitude = 22 + index * 2;
  const phase = index * 0.38 * direction;
  const points: string[] = [];
  for (let x = 0; x <= WIDTH; x += STEP) {
    const y = base + amplitude * Math.sin((x / WIDTH) * Math.PI * 2.4 * direction + phase);
    points.push(`${x === 0 ? "M" : "L"}${x} ${y.toFixed(1)}`);
  }
  return points.join("");
}

// Computed once: two crossing wave families, like the security print on banknotes.
const PATHS = Array.from({ length: LINES }, (_, i) => [wavePath(i, 1), wavePath(i, -1)]).flat();

interface GuillochePatternProps {
  className?: string;
}

export function GuillochePattern({ className }: GuillochePatternProps) {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMaxYMid slice"
      className={cn("pointer-events-none", className)}
      fill="none"
    >
      {PATHS.map((d, i) => (
        <path key={i} d={d} stroke="currentColor" strokeWidth="0.7" />
      ))}
    </svg>
  );
}
