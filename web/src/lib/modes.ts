import { RefreshCw, Repeat, ShieldCheck, type LucideIcon } from "lucide-react";
import type { SelectionMode } from "@/lib/types";

export const MODES: Record<
  SelectionMode,
  { label: string; icon: LucideIcon; description: string; badge: string; active: string; text: string }
> = {
  no_repetition: {
    label: "No Repetition",
    icon: ShieldCheck,
    description: "Each item is picked once per round.",
    badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    active: "data-[pressed]:bg-cyan-500/15 data-[pressed]:border-cyan-400/60 data-[pressed]:shadow-[0_0_15px_rgba(0,240,255,0.15)]",
    text: "text-cyan-300",
  },
  allow_repetition: {
    label: "Allow Repetition",
    icon: Repeat,
    description: "Any item can be picked again immediately.",
    badge: "bg-purple-500/10 text-purple-300 border-purple-500/30",
    active: "data-[pressed]:bg-purple-500/15 data-[pressed]:border-purple-400/60 data-[pressed]:shadow-[0_0_15px_rgba(139,92,246,0.15)]",
    text: "text-purple-300",
  },
  auto_restart: {
    label: "Auto-Restart",
    icon: RefreshCw,
    description: "Starts a new round automatically when everything is picked.",
    badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    active: "data-[pressed]:bg-emerald-500/15 data-[pressed]:border-emerald-400/60 data-[pressed]:shadow-[0_0_15px_rgba(16,185,129,0.15)]",
    text: "text-emerald-300",
  },
};

export const MODE_ORDER: SelectionMode[] = ["no_repetition", "allow_repetition", "auto_restart"];
