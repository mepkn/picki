import React from "react";
import { cn } from "@/lib/utils";
import type { SelectionMode } from "@/lib/types";
import { ShieldCheck, RefreshCw, Repeat } from "lucide-react";

interface ModeBadgeProps {
  mode: SelectionMode;
  className?: string;
}

export const ModeBadge: React.FC<ModeBadgeProps> = ({ mode, className }) => {
  const configs = {
    no_repetition: {
      label: "No Repetition",
      icon: ShieldCheck,
      color: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    },
    allow_repetition: {
      label: "Allow Repetition",
      icon: Repeat,
      color: "bg-purple-500/10 text-purple-300 border-purple-500/30",
    },
    auto_restart: {
      label: "Auto-Restart",
      icon: RefreshCw,
      color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    },
  };

  const config = configs[mode] || configs.no_repetition;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-md",
        config.color,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};
