import React from "react";
import { X, History, Trash2, Clock } from "lucide-react";
import type { SelectionRecord } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { CyberButton } from "../ui/CyberButton";
import { usePicki } from "@/lib/picki-context";

interface HistoryDrawerProps {
  listId: string;
  listName: string;
  selections: SelectionRecord[];
  onClose: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  listId,
  listName,
  selections,
  onClose,
}) => {
  const { clearSelections, deleteSelection } = usePicki();

  // Group selections by round descending
  const groupedByRound = selections.reduce<Record<number, SelectionRecord[]>>(
    (acc, sel) => {
      acc[sel.round] = acc[sel.round] || [];
      acc[sel.round].push(sel);
      return acc;
    },
    {}
  );

  const roundNumbers = Object.keys(groupedByRound)
    .map(Number)
    .sort((a, b) => b - a);

  const handleClear = async () => {
    if (window.confirm("Clear all selection history? Current items will not be affected.")) {
      await clearSelections(listId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-[#0a0d14] border-l border-cyan-500/20 p-6 flex flex-col justify-between shadow-[-10px_0_40px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">Selection History</h3>
              <p className="text-xs text-slate-400 font-mono truncate max-w-[220px]">
                {listName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {selections.length === 0 ? (
            <div className="text-center py-20 text-slate-500 text-xs font-mono">
              No picks recorded yet. Click SELECT to make your first pick!
            </div>
          ) : (
            roundNumbers.map((round) => (
              <div key={round} className="space-y-2.5">
                {/* Round header */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                    Round {round}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {groupedByRound[round].length} picks
                  </span>
                </div>

                {/* Round Items */}
                <div className="space-y-1.5">
                  {groupedByRound[round].map((sel) => (
                    <div
                      key={sel._id}
                      className="group/item flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs font-mono hover:border-slate-700/80 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 mr-2">
                        <span className="text-slate-500 w-5 shrink-0 text-right">
                          #{sel.selectionNumber}
                        </span>
                        <span className="text-white font-medium text-sm truncate font-sans">
                          {sel.itemValue}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Clock className="w-3 h-3 text-slate-600" />
                          <span>{formatDate(sel.selectedAt)}</span>
                        </div>
                        <button
                          onClick={() => deleteSelection(sel._id)}
                          className="opacity-0 group-hover/item:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-all cursor-pointer"
                          title="Void / Skip this pick"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          {selections.length > 0 ? (
            <button
              onClick={handleClear}
              className="text-xs text-rose-400/80 hover:text-rose-400 font-mono transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          ) : (
            <span />
          )}

          <CyberButton variant="secondary" size="sm" onClick={onClose}>
            Close
          </CyberButton>
        </div>
      </div>
    </div>
  );
};
