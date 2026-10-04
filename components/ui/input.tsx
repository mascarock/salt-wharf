import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full border border-[var(--rule)] bg-[var(--paper)] px-3 text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--tungsten)]",
        className,
      )}
      {...props}
    />
  );
}
