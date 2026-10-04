import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center border border-[var(--rule)] px-2 py-0.5 text-[0.7rem] uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}
