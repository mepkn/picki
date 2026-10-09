import React, { useState } from "react";
import { useNavigate } from "react-router";
import { X, Sparkles, ShieldCheck, Repeat, RefreshCw } from "lucide-react";
import { CyberButton } from "../ui/CyberButton";
import { usePicki } from "@/lib/picki-context";
import type { SelectionMode } from "@/lib/types";

interface CreateListModalProps {
  onClose: () => void;
}

export const CreateListModal: React.FC<CreateListModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { createList } = usePicki();

  const [name, setName] = useState("");
  const [itemsText, setItemsText] = useState("");
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("no_repetition");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a list name.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const items = itemsText
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const { slug } = await createList({
        name: name.trim(),
        items,
        selectionMode,
      });

      onClose();
      navigate(`/lists/${slug}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create list");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="cyber-glass-glow rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 relative border border-cyan-500/30 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">Create New List</h2>
              <p className="text-xs text-slate-400">Set up a new collection for random selection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* List Name */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-cyan-400/90 font-medium">
              List Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Friday Meeting, Presentation Order, Game Night..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/70 text-sm transition-all"
            />
          </div>

          {/* Initial Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-cyan-400/90 font-medium">
                Items (One per line)
              </label>
              <span className="text-xs text-slate-500">Optional, can add later</span>
            </div>
            <textarea
              rows={5}
              value={itemsText}
              onChange={(e) => setItemsText(e.target.value)}
              placeholder="Alice&#10;Bob&#10;Charlie&#10;David"
              className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/70 text-sm font-mono transition-all resize-y"
            />
          </div>

          {/* Selection Mode */}
          <div className="space-y-2.5">
            <label className="text-xs font-mono uppercase tracking-wider text-cyan-400/90 font-medium">
              Selection Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Mode 1 */}
              <button
                type="button"
                onClick={() => setSelectionMode("no_repetition")}
                className={`flex flex-col p-3 rounded-xl text-left border transition-all ${
                  selectionMode === "no_repetition"
                    ? "bg-cyan-500/15 border-cyan-400/60 shadow-[0_0_15px_rgba(0,240,255,0.15)] text-white"
                    : "bg-slate-950/50 border-slate-800/80 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium text-xs text-cyan-300 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>No Repetition</span>
                </div>
                <span className="text-[11px] text-slate-400 leading-tight">
                  Each item is picked once per round. (Default)
                </span>
              </button>

              {/* Mode 2 */}
              <button
                type="button"
                onClick={() => setSelectionMode("allow_repetition")}
                className={`flex flex-col p-3 rounded-xl text-left border transition-all ${
                  selectionMode === "allow_repetition"
                    ? "bg-purple-500/15 border-purple-400/60 shadow-[0_0_15px_rgba(139,92,246,0.15)] text-white"
                    : "bg-slate-950/50 border-slate-800/80 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium text-xs text-purple-300 mb-1">
                  <Repeat className="w-3.5 h-3.5" />
                  <span>Allow Repetition</span>
                </div>
                <span className="text-[11px] text-slate-400 leading-tight">
                  Any item can be picked again immediately.
                </span>
              </button>

              {/* Mode 3 */}
              <button
                type="button"
                onClick={() => setSelectionMode("auto_restart")}
                className={`flex flex-col p-3 rounded-xl text-left border transition-all ${
                  selectionMode === "auto_restart"
                    ? "bg-emerald-500/15 border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.15)] text-white"
                    : "bg-slate-950/50 border-slate-800/80 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium text-xs text-emerald-300 mb-1">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Auto-Restart</span>
                </div>
                <span className="text-[11px] text-slate-400 leading-tight">
                  Automatically starts a new round when finished.
                </span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <CyberButton type="button" variant="ghost" size="md" onClick={onClose}>
              Cancel
            </CyberButton>
            <CyberButton
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
            >
              Create & Open List
            </CyberButton>
          </div>
        </form>
      </div>
    </div>
  );
};
