import React, { useState } from "react";
import { X, Sliders, ShieldCheck, Repeat, RefreshCw, Volume2, VolumeX, Trash2, RotateCcw, Trophy, Flame, Cpu, Dices } from "lucide-react";
import type { ListDoc, SelectionMode, AnimationTheme } from "@/lib/types";
import { CyberButton } from "../ui/CyberButton";
import { usePicki } from "@/lib/picki-context";
import { sound } from "@/lib/sound";

interface SettingsModalProps {
  list: ListDoc;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ list, onClose }) => {
  const { updateList, clearSelections, startNewRound } = usePicki();

  const [mode, setMode] = useState<SelectionMode>(list.selectionMode);
  const [theme, setTheme] = useState<AnimationTheme>(list.animationTheme || "cyber_hud");
  const [duration, setDuration] = useState<number>(list.animationDuration || 2.5);
  const [reducedMotion, setReducedMotion] = useState<boolean>(list.reducedMotion || false);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateList({
        listId: list._id,
        selectionMode: mode,
        animationDuration: duration,
        reducedMotion,
        animationTheme: theme,
      });
      sound.setMuted(isMuted);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("Clear all selection history for this list? Your items and round status will not be lost.")) {
      await clearSelections(list._id);
      setMessage("Selection history cleared.");
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleStartNewRound = async () => {
    const res = await startNewRound(list._id);
    setMessage(`Round ${res.newRound} initiated! All items are eligible.`);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="cyber-glass-glow rounded-3xl max-w-lg w-full relative border border-cyan-500/30 max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header (Pinned) */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 sm:px-8 py-5 shrink-0 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">List Settings</h2>
              <p className="text-xs text-slate-400 font-mono">{list.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6">
          {message && (
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              {message}
            </div>
          )}

          {/* Section 1: Selection Mode */}
        <div className="space-y-3">
          <label className="text-xs font-mono uppercase tracking-wider text-cyan-400/90 font-medium">
            Selection Behavior
          </label>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setMode("no_repetition")}
              className={`w-full p-3.5 rounded-xl text-left border transition-all ${
                mode === "no_repetition"
                  ? "bg-cyan-500/15 border-cyan-400/60 shadow-[0_0_15px_rgba(0,240,255,0.15)] text-white"
                  : "bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between font-medium text-xs text-cyan-300 mb-1">
                <span className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  No Repetition (Default)
                </span>
                {mode === "no_repetition" && <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400">Active</span>}
              </div>
              <p className="text-xs text-slate-300">
                Each item is selected once before you start another round.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMode("allow_repetition")}
              className={`w-full p-3.5 rounded-xl text-left border transition-all ${
                mode === "allow_repetition"
                  ? "bg-purple-500/15 border-purple-400/60 shadow-[0_0_15px_rgba(139,92,246,0.15)] text-white"
                  : "bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between font-medium text-xs text-purple-300 mb-1">
                <span className="flex items-center gap-1.5 font-bold">
                  <Repeat className="w-4 h-4" />
                  Allow Repetition
                </span>
                {mode === "allow_repetition" && <span className="text-[10px] uppercase font-mono tracking-widest text-purple-400">Active</span>}
              </div>
              <p className="text-xs text-slate-300">
                An item can be selected again immediately.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMode("auto_restart")}
              className={`w-full p-3.5 rounded-xl text-left border transition-all ${
                mode === "auto_restart"
                  ? "bg-emerald-500/15 border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.15)] text-white"
                  : "bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between font-medium text-xs text-emerald-300 mb-1">
                <span className="flex items-center gap-1.5 font-bold">
                  <RefreshCw className="w-4 h-4" />
                  Auto-Restart Round
                </span>
                {mode === "auto_restart" && <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400">Active</span>}
              </div>
              <p className="text-xs text-slate-300">
                Automatically start a new round when every item has been selected.
              </p>
            </button>
          </div>
        </div>

        {/* Section 2: Animation & Audio */}
        <div className="space-y-4 pt-2 border-t border-slate-800">
          <label className="text-xs font-mono uppercase tracking-wider text-cyan-400/90 font-medium">
            Visual & Audio
          </label>

          {/* Animation Theme Preset */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Animation Style</span>
              <span className="text-cyan-400 font-bold">
                {theme === "random"
                  ? "Random (Per Round)"
                  : theme === "gold_stadium" || theme === "fifa_walkout"
                  ? "Gold"
                  : theme === "crimson_arena" || theme === "wwe_rumble"
                  ? "Crimson"
                  : "Cyber"}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setTheme("cyber_hud")}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  theme === "cyber_hud"
                    ? "bg-purple-500/15 border-purple-400 text-purple-200 shadow-[0_0_15px_rgba(139,92,246,0.25)]"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <Cpu className="w-4 h-4 text-purple-400" />
                <span className="text-[11px] font-mono font-bold">Cyber</span>
                <span className="text-[9px] text-slate-500 font-sans">Default</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("gold_stadium")}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  theme === "gold_stadium" || theme === "fifa_walkout"
                    ? "bg-amber-500/15 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-[11px] font-mono font-bold">Gold</span>
                <span className="text-[9px] text-slate-500 font-sans">Flares & Lights</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("crimson_arena")}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  theme === "crimson_arena" || theme === "wwe_rumble"
                    ? "bg-rose-500/15 border-rose-400 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.25)]"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <Flame className="w-4 h-4 text-rose-400" />
                <span className="text-[11px] font-mono font-bold">Crimson</span>
                <span className="text-[9px] text-slate-500 font-sans">Steam & Siren</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("random")}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  theme === "random"
                    ? "bg-cyan-500/15 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.25)]"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <Dices className="w-4 h-4 text-cyan-400" />
                <span className="text-[11px] font-mono font-bold">Random</span>
                <span className="text-[9px] text-slate-500 font-sans">Shuffle</span>
              </button>
            </div>
          </div>

          {/* Animation Duration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Spin Duration</span>
              <span className="text-cyan-300 font-bold">{duration}s</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={duration}
              onChange={(e) => setDuration(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Reduced Motion Switch */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <div className="text-sm font-medium text-slate-200">Reduced Motion</div>
              <div className="text-xs text-slate-400">Faster, simplified transition with minimal movement</div>
            </div>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              className="w-4 h-4 accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-2.5">
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              <div>
                <div className="text-sm font-medium text-slate-200">Sound Effects</div>
                <div className="text-xs text-slate-400">Futuristic ticker and celebration chimes</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={!isMuted}
              onChange={(e) => setIsMuted(!e.target.checked)}
              className="w-4 h-4 accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Section 3: Rounds & History Management */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <label className="text-xs font-mono uppercase tracking-wider text-cyan-400/90 font-medium">
            Rounds & History
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleStartNewRound}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-xs font-mono text-cyan-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start New Round</span>
            </button>
            <button
              type="button"
              onClick={handleClearHistory}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-rose-500/40 text-xs font-mono text-rose-300 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        </div>

        </div>

        {/* Footer Action Buttons (Pinned) */}
        <div className="flex items-center justify-end gap-3 px-6 sm:px-8 py-4 border-t border-slate-800/80 bg-slate-950/60 shrink-0">
          <CyberButton variant="ghost" size="md" onClick={onClose}>
            Cancel
          </CyberButton>
          <CyberButton
            variant="primary"
            size="md"
            onClick={handleSave}
            isLoading={isSaving}
          >
            Save Settings
          </CyberButton>
        </div>
      </div>
    </div>
  );
};
