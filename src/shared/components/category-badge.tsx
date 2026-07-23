import { cn } from "@/shared/lib/cn";

interface CategoryBadgeProps {
  name: string;
  color?: string;
  className?: string;
}

export function CategoryBadge({ name, color, className }: CategoryBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-small text-bone-600", className)}>
      <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color ?? "#52525B" }} />
      {name}
    </span>
  );
}
