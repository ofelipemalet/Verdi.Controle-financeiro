import {
  Briefcase,
  Car,
  CirclePlus,
  Ellipsis,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  Laptop,
  Receipt,
  Repeat,
  RotateCcw,
  ShoppingBag,
  Ticket,
  TrendingUp,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

import type { CategoryId } from "../model/categories";

interface CategoryAppearance {
  icon: LucideIcon;
  color: string;
}

export const CATEGORY_APPEARANCE: Record<CategoryId, CategoryAppearance> = {
  salary: { icon: Briefcase, color: "var(--chart-1)" },
  freelance: { icon: Laptop, color: "var(--chart-2)" },
  investments: { icon: TrendingUp, color: "var(--chart-4)" },
  gifts: { icon: Gift, color: "var(--chart-9)" },
  refunds: { icon: RotateCcw, color: "var(--chart-8)" },
  "other-income": { icon: CirclePlus, color: "var(--chart-7)" },
  housing: { icon: House, color: "var(--chart-1)" },
  food: { icon: UtensilsCrossed, color: "var(--chart-6)" },
  transport: { icon: Car, color: "var(--chart-4)" },
  health: { icon: HeartPulse, color: "var(--chart-2)" },
  education: { icon: GraduationCap, color: "var(--chart-7)" },
  leisure: { icon: Ticket, color: "var(--chart-5)" },
  shopping: { icon: ShoppingBag, color: "var(--chart-3)" },
  bills: { icon: Receipt, color: "var(--chart-8)" },
  subscriptions: { icon: Repeat, color: "var(--chart-9)" },
  "other-expense": { icon: Ellipsis, color: "var(--chart-10)" },
};
