import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-[#c4c7d0]">
            {label}
            {props.required && <span className="text-[#e07a5f] ml-1">*</span>}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          ref={ref}
          className={cn(
            "flex h-9.5 w-full rounded-xl border border-white/[0.09] bg-[#161821] px-3.5 py-2 text-xs text-[#f4f3ef] placeholder:text-[#656a77] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/25 focus-visible:border-white/30 transition-all disabled:cursor-not-allowed disabled:opacity-40",
            error && "border-rose-500/70 focus-visible:ring-rose-500/30",
            className
          )}
          {...props}
        />
        {helperText && !error && (
          <p className="text-[11px] text-[#7d8290] leading-tight">{helperText}</p>
        )}
        {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
