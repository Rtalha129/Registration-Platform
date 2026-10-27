import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "warm";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const sizeStyles = {
      sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
      md: "h-9.5 px-4 text-xs font-medium rounded-xl gap-2",
      lg: "h-11 px-5.5 text-sm font-medium rounded-xl gap-2.5",
    };

    const variantStyles = {
      primary:
        "bg-[#f4f3ef] text-[#0c0d10] hover:bg-white active:bg-[#e4e3dd] shadow-[0_1px_2px_rgba(0,0,0,0.4)] border border-white/20 active:scale-[0.99] transition-all",
      secondary:
        "bg-[#181b22] hover:bg-[#20242f] text-[#ecebe5] border border-white/[0.08] hover:border-white/[0.16] shadow-sm active:scale-[0.99] transition-all",
      warm:
        "bg-[#e07a5f] hover:bg-[#d66e53] text-white shadow-[0_1px_3px_rgba(224,122,95,0.3)] border border-[#e07a5f]/40 active:scale-[0.99] transition-all",
      outline:
        "bg-transparent border border-white/[0.12] hover:border-white/[0.25] text-[#c7c9d1] hover:text-white transition-all",
      ghost: "hover:bg-white/[0.05] text-[#8e929e] hover:text-[#f4f3ef] transition-colors",
      danger: "bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 transition-all",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center select-none cursor-pointer tracking-tight font-sans transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 disabled:opacity-40 disabled:cursor-not-allowed",
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
