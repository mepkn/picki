import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: "none" | "cyan" | "purple" | "pink";
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  glow = "none",
  hoverEffect = false,
  ...props
}) => {
  const glowStyles = {
    none: "",
    cyan: "shadow-[0_0_30px_rgba(0,240,255,0.15)] border-cyan-500/30",
    purple: "shadow-[0_0_30px_rgba(139,92,246,0.15)] border-purple-500/30",
    pink: "shadow-[0_0_30px_rgba(255,0,122,0.15)] border-pink-500/30",
  };

  return (
    <div
      className={cn(
        "cyber-glass rounded-2xl p-6 transition-all duration-300",
        hoverEffect && "hover:border-cyan-500/40 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,240,255,0.1)]",
        glowStyles[glow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
