import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Receipt,
  Settings,
  Tags,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  keywords: string[];
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, keywords: ["dashboard", "inicio", "home"] },
  { href: "/lancamentos", label: "Lançamentos", icon: Receipt, keywords: ["lancamentos", "gastos"] },
  { href: "/categorias", label: "Categorias", icon: Tags, keywords: ["categorias"] },
  { href: "/entradas", label: "Entradas", icon: TrendingUp, keywords: ["entradas", "receitas"] },
  { href: "/metas", label: "Metas", icon: Target, keywords: ["metas", "objetivos"] },
  { href: "/contas", label: "Contas e cartões", icon: CreditCard, keywords: ["contas", "cartoes"] },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3, keywords: ["relatorios"] },
  { href: "/configuracoes", label: "Configurações", icon: Settings, keywords: ["configuracoes"] },
] as const;

export function labelForPathname(pathname: string): string {
  if (pathname === "/") return "Dashboard";
  const match = [...NAV_ITEMS].sort((a, b) => b.href.length - a.href.length).find((item) => item.href !== "/" && pathname.startsWith(item.href));
  return match?.label ?? "Fluxo";
}
