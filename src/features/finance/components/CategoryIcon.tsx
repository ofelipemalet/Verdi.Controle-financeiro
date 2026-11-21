import { cn } from "@/lib/utils";

import type { CategoryId } from "../model/categories";
import { CATEGORY_APPEARANCE } from "./category-appearance";

interface CategoryIconProps {
  categoryId: CategoryId;
  size?: "sm" | "md";
  className?: string;
}

export function CategoryIcon({ categoryId, size = "md", className }: CategoryIconProps) {
  const { icon: Icon, color } = CATEGORY_APPEARANCE[categoryId];
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-2xl",
        size === "md" ? "h-11 w-11" : "h-8 w-8 rounded-xl",
        className,
      )}
      style={{ backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)`, color }}
    >
      <Icon className={size === "md" ? "h-5 w-5" : "h-4 w-4"} strokeWidth={2} />
    </span>
  );
}
