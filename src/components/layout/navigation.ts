import { ArrowLeftRight, ChartPie, House, type LucideIcon } from "lucide-react";

export interface NavItem {
  to: "/" | "/analises" | "/movimentacoes";
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { to: "/", label: "Início", icon: House },
  { to: "/analises", label: "Análises", icon: ChartPie },
  { to: "/movimentacoes", label: "Movimentações", icon: ArrowLeftRight },
];
