import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "cyber" | "glow";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
}

export const CyberButton = React.forwardRef<HTMLButtonElement, CyberButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none rounded-xl active:scale-[0.98]";

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-4 py-2 text-sm gap-2",
      lg: "px-6 py-3 text-base gap-2.5",
      xl: "px-8 py-4 text-lg font-semibold gap-3",
    };

    const variantStyles = {
      primary:
        "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-[0_0_20px_rgba(0,240,255,0.35)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] border border-cyan-300/40",
      secondary:
        "bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-cyan-500/40 hover:text-white backdrop-blur-md",
      danger:
        "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:border-rose-500/50 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)]",
      ghost:
        "bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-100 border border-transparent",
      glow:
        "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold shadow-[0_0_25px_rgba(139,92,246,0.4)] border border-white/20",
      cyber:
        "bg-slate-950/90 text-cyan-300 border-2 border-cyan-400/60 shadow-[0_0_25px_rgba(0,240,255,0.25)] hover:border-cyan-300 hover:shadow-[0_0_35px_rgba(0,240,255,0.5)] hover:text-cyan-200 uppercase tracking-wider font-bold",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

CyberButton.displayName = "CyberButton";
