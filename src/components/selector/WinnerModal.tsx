import React, { useEffect } from "react";
import { X, RotateCw, Trophy, SkipForward, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import type { ListItem, AnimationTheme } from "@/lib/types";
import { triggerWinnerConfetti } from "@/lib/utils";
import { sound } from "@/lib/sound";

interface WinnerModalProps {
  winner: ListItem | null;
  round: number;
  selectionNumber: number;
  theme?: AnimationTheme;
  onClose: () => void;
  onPickAgain: () => void;
  onSkip?: () => void;
  isRoundComplete?: boolean;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  winner,
  round,
  selectionNumber,
  theme = "gold_stadium",
  onClose,
  onPickAgain,
  onSkip,
  isRoundComplete = false,
}) => {
  const isGold = theme === "gold_stadium" || theme === "fifa_walkout";
  const isCrimson = theme === "crimson_arena" || theme === "wwe_rumble";

  useEffect(() => {
    if (winner) {
      triggerWinnerConfetti();
      if (isGold) {
        sound.playFifaWalkoutDrop();
      } else if (isCrimson) {
        sound.playWweBuzzer();
      } else {
        sound.playWinner();
      }
    }
  }, [winner, isGold, isCrimson]);

  // Keyboard shortcut: Escape to close, Enter to Pick Again, S to Skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Enter" && !isRoundComplete) {
        onPickAgain();
      } else if ((e.key === "s" || e.key === "S") && onSkip) {
        onSkip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onPickAgain, onSkip, isRoundComplete]);

  if (!winner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-in fade-in zoom-in-95 duration-200">
      {isGold ? (
        /* Gold Stadium Aesthetic Presentation */
        <div className="relative max-w-lg w-full rounded-3xl p-8 sm:p-10 border-2 border-amber-400 bg-gradient-to-b from-[#1c1508] via-[#100c05] to-[#080603] text-center space-y-6 shadow-[0_0_90px_rgba(245,158,11,0.35)]">
          {/* Top Amber Glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={onClose}
            aria-label="Close (Esc)"
            className="absolute top-5 right-5 rounded-full text-amber-300/70 hover:text-white rounded-full hover:bg-amber-950/60 transition-colors"
          >
            <X className="size-5" />
          </Button>

          {/* Header Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/50 text-amber-300 text-xs font-mono tracking-widest uppercase shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Selected Winner</span>
          </div>

          {/* Winner Name */}
          <div className="py-2 space-y-2">
            <div className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-200 to-amber-500 tracking-tight break-words drop-shadow-[0_0_35px_rgba(245,158,11,0.7)] uppercase">
              {winner.value}
            </div>

            <div className="text-xs text-amber-300/70 font-mono">
              Round {round} • Pick #{selectionNumber}
            </div>
          </div>

          {/* Round Complete Note */}
          {isRoundComplete && (
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-medium">
              ★ All items in Round {round} have been picked! Click &ldquo;Start New Round&rdquo; on the main page to reset eligibility.
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-4 border-t border-amber-500/30">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-11 w-full flex-1 rounded-xl text-xs font-mono uppercase tracking-wider border-amber-500/40 text-amber-200 hover:bg-amber-950/40"
            >
              Close
            </Button>

            {onSkip && (
              <Button
                variant="outline"
                onClick={onSkip}
                className="h-11 w-full flex-1 rounded-xl text-xs font-mono uppercase tracking-wider text-amber-300 border-amber-500/40 hover:border-amber-400 hover:text-amber-200 hover:bg-amber-500/10 gap-1.5"
                title="Skip this item and roll again"
              >
                <SkipForward className="w-4 h-4 text-amber-400" />
                <span>Skip</span>
              </Button>
            )}

            {!isRoundComplete && (
              <Button
                variant="cyber"
                onClick={onPickAgain}
                className="h-11 w-full flex-1 rounded-xl text-xs font-mono uppercase tracking-wider gap-1.5 whitespace-nowrap bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold shadow-[0_0_20px_rgba(245,158,11,0.5)] border-amber-400"
              >
                <RotateCw className="w-4 h-4" />
                <span>Pick Another</span>
              </Button>
            )}
          </div>

          <div className="text-[11px] font-mono text-amber-400/50">
            Press <Kbd>Esc</Kbd> to close {onSkip && <>&bull; <Kbd>S</Kbd> to skip</>}
          </div>
        </div>
      ) : isCrimson ? (
        /* Crimson Arena Aesthetic Presentation */
        <div className="relative max-w-lg w-full rounded-3xl p-8 sm:p-10 border-2 border-rose-500 bg-gradient-to-b from-[#180811] via-[#0f040a] to-[#070205] text-center space-y-6 shadow-[0_0_90px_rgba(244,63,94,0.35)]">
          {/* Top Rose Pyro Glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/25 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={onClose}
            aria-label="Close (Esc)"
            className="absolute top-5 right-5 rounded-full text-rose-300/70 hover:text-white rounded-full hover:bg-rose-950/60 transition-colors"
          >
            <X className="size-5" />
          </Button>

          {/* Header Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-400/50 text-rose-300 text-xs font-mono tracking-widest uppercase shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
            <span>Selected Winner</span>
          </div>

          {/* Hazard Accent Line */}
          <div className="h-1.5 w-full rounded-full bg-[repeating-linear-gradient(45deg,#f43f5e,#f43f5e_8px,#000_8px,#000_16px)] opacity-80" />

          {/* Winner Name */}
          <div className="py-2 space-y-2">
            <div className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-rose-200 to-red-500 tracking-tighter break-words drop-shadow-[0_0_35px_rgba(244,63,94,0.8)] uppercase">
              {winner.value}
            </div>

            <div className="text-xs text-rose-300/70 font-mono">
              Round {round} • Pick #{selectionNumber}
            </div>
          </div>

          {/* Round Complete Note */}
          {isRoundComplete && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-medium">
              ★ All items in Round {round} have been picked! Click &ldquo;Start New Round&rdquo; on the main page to reset eligibility.
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-4 border-t border-rose-500/30">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-11 w-full flex-1 rounded-xl text-xs font-mono uppercase tracking-wider border-rose-500/40 text-rose-200 hover:bg-rose-950/40"
            >
              Close
            </Button>

            {onSkip && (
              <Button
                variant="outline"
                onClick={onSkip}
                className="h-11 w-full flex-1 rounded-xl text-xs font-mono uppercase tracking-wider text-rose-300 border-rose-500/40 hover:border-rose-400 hover:text-rose-200 hover:bg-rose-500/10 gap-1.5"
                title="Skip this item and roll again"
              >
                <SkipForward className="w-4 h-4 text-rose-400" />
                <span>Skip</span>
              </Button>
            )}

            {!isRoundComplete && (
              <Button
                variant="cyber"
                onClick={onPickAgain}
                className="h-11 w-full flex-1 rounded-xl text-xs font-mono uppercase tracking-wider gap-1.5 whitespace-nowrap bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white font-bold shadow-[0_0_20px_rgba(244,63,94,0.5)] border-rose-400"
              >
                <RotateCw className="w-4 h-4" />
                <span>Pick Another</span>
              </Button>
            )}
          </div>

          <div className="text-[11px] font-mono text-rose-400/50">
            Press <Kbd>Esc</Kbd> to close {onSkip && <>&bull; <Kbd>S</Kbd> to skip</>}
          </div>
        </div>
      ) : (
        /* Cyber HUD Aesthetic Presentation */
        <div className="relative max-w-lg w-full cyber-glass-glow rounded-3xl p-8 sm:p-10 border border-cyan-400/50 text-center space-y-6 shadow-[0_0_80px_rgba(0,240,255,0.25)]">
          {/* Ambient Top Glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={onClose}
            aria-label="Close (Esc)"
            className="absolute top-5 right-5 rounded-full text-slate-400 hover:text-white rounded-full hover:bg-slate-800/80 transition-colors"
          >
            <X className="size-5" />
          </Button>

          {/* Header Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 text-xs font-mono tracking-widest uppercase">
            <Trophy className="w-4 h-4 text-cyan-400" />
            <span>Selected Winner</span>
          </div>

          {/* Winner Name */}
          <div className="py-4 space-y-2">
            <div className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-400 tracking-tight break-words drop-shadow-[0_0_25px_rgba(0,240,255,0.6)]">
              {winner.value}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Round {round} • Pick #{selectionNumber}
            </div>
          </div>

          {/* Round Complete Note */}
          {isRoundComplete && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
              ★ All items in Round {round} have been picked! Click &ldquo;Start New Round&rdquo; on the main page to reset eligibility.
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-4 border-t border-slate-800/80">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-11 w-full flex-1 rounded-xl text-xs font-mono uppercase tracking-wider"
            >
              Close
            </Button>

            {onSkip && (
              <Button
                variant="outline"
                onClick={onSkip}
                className="h-11 w-full flex-1 rounded-xl text-xs font-mono uppercase tracking-wider text-amber-300 border-amber-500/40 hover:border-amber-400 hover:text-amber-200 hover:bg-amber-500/10 gap-1.5"
                title="Skip this item and roll again"
              >
                <SkipForward className="w-4 h-4 text-amber-400" />
                <span>Skip</span>
              </Button>
            )}

            {!isRoundComplete && (
              <Button
                variant="cyber"
                onClick={onPickAgain}
                className="h-11 w-full flex-1 rounded-xl text-xs font-mono uppercase tracking-wider gap-1.5 whitespace-nowrap"
              >
                <RotateCw className="w-4 h-4" />
                <span>Pick Another</span>
              </Button>
            )}
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            Press <Kbd>Esc</Kbd> to close {onSkip && <>&bull; <Kbd>S</Kbd> to skip</>}
          </div>
        </div>
      )}
    </div>
  );
};
