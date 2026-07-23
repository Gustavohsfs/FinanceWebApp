import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-800 px-10 py-14 text-center",
        className,
      )}
    >
      {icon && <div className="text-bone-800">{icon}</div>}
      <p className="font-display text-subtitle font-semibold text-bone">{title}</p>
      {description && <p className="max-w-sm text-small text-bone-600">{description}</p>}
      {action}
    </div>
  );
}
