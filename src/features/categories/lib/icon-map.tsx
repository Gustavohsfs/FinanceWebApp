import {
  Bus,
  Car,
  CircleEllipsis,
  Dumbbell,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  Laptop,
  PartyPopper,
  PawPrint,
  Plane,
  Repeat,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Utensils,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "shopping-cart": ShoppingCart,
  "shopping-bag": ShoppingBag,
  bus: Bus,
  car: Car,
  house: House,
  "heart-pulse": HeartPulse,
  "party-popper": PartyPopper,
  "graduation-cap": GraduationCap,
  repeat: Repeat,
  ellipsis: CircleEllipsis,
  wallet: Wallet,
  laptop: Laptop,
  "trending-up": TrendingUp,
  utensils: Utensils,
  gift: Gift,
  plane: Plane,
  dumbbell: Dumbbell,
  "paw-print": PawPrint,
};

export function CategoryIcon({
  name,
  className,
  style,
}: {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const Icon = CATEGORY_ICONS[name] ?? CircleEllipsis;
  return <Icon className={className} style={style} />;
}

export const ICON_OPTIONS = Object.keys(CATEGORY_ICONS);
