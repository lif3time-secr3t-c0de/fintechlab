import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <span className={cn("inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium", className)}>
      {children}
    </span>
  );
}
