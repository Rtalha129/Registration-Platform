import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "outline" | "danger" | "stamp";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-[#181a22] text-[#d6d8df] border-white/[0.08]",
    secondary: "bg-[#1f222c] text-[#a4a8b5] border-white/[0.06]",
    success: "bg-emerald-950/40 text-emerald-300 border-emerald-800/40",
    warning: "bg-amber-950/40 text-amber-300 border-amber-800/40",
    outline: "bg-transparent text-[#9ba0aa] border-white/[0.12]",
    danger: "bg-rose-950/40 text-rose-300 border-rose-800/40",
    stamp: "stamp-badge text-amber-400 border-amber-400/80 bg-amber-400/5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium border font-sans tracking-tight",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
