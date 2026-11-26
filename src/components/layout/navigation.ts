import { ArrowLeftRight, ChartPie, House, type LucideIcon } from "lucide-react";

export interface NavItem {
  to: "/inicio" | "/analises" | "/movimentacoes";
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { to: "/inicio", label: "Início", icon: House },
  { to: "/analises", label: "Análises", icon: ChartPie },
  { to: "/movimentacoes", label: "Movimentações", icon: ArrowLeftRight },
];
