import React from "react";
import { Link } from "react-router";
import type { ListDoc } from "@/lib/types";

interface ListCardProps {
  list: ListDoc;
}

export const ListCard: React.FC<ListCardProps> = ({ list }) => {
  const itemCount = list.itemCount ?? 0;
  const selectedCount = list.selectedThisRound ?? 0;
  const progressPercent =
    itemCount > 0 ? Math.min(100, Math.round((selectedCount / itemCount) * 100)) : 0;

  return (
    <Link
      to={`/lists/${list.slug}`}
      className="cyber-glass rounded-2xl p-5 sm:p-6 border border-slate-800/80 hover:border-cyan-500/50 hover:shadow-[0_8px_30px_rgba(0,240,255,0.12)] transition-all duration-300 flex flex-col justify-between group block cursor-pointer"
    >
      <div className="space-y-4">
        {/* Title & Item Count */}
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors tracking-tight line-clamp-1">
            {list.name}
          </h3>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </div>
        </div>

        {/* Round Progress */}
        {list.selectionMode !== "allow_repetition" && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Round {list.currentRound || 1} Progress</span>
              <span className="text-cyan-300 font-semibold">
                {selectedCount} / {itemCount}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};
