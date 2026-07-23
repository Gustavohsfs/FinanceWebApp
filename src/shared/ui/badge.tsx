import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/shared/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-micro font-medium",
  {
    variants: {
      variant: {
        neutral: "bg-ink-800 text-bone-600",
        flame: "bg-flame-950 text-flame-400",
        mint: "bg-mint/10 text-mint",
        ember: "bg-ember/10 text-ember",
        projected: "border border-dashed border-bone-800 text-bone-600 opacity-70",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
