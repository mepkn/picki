import React, { useState } from "react";
import { X, Plus, ClipboardPaste, Trash2, Edit2, Check, AlertCircle } from "lucide-react";
import type { ListItem } from "@/lib/types";
import { CyberButton } from "../ui/CyberButton";
import { usePicki } from "@/lib/picki-context";

interface ListEditorDrawerProps {
  listId: string;
  items: ListItem[];
  onClose: () => void;
}

export const ListEditorDrawer: React.FC<ListEditorDrawerProps> = ({
  listId,
  items,
  onClose,
}) => {
  const { addItem, addItemsBulk, updateItem, deleteItem, clearItems } = usePicki();

  const [newItemValue, setNewItemValue] = useState("");
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemValue.trim()) return;

    try {
      setIsSubmitting(true);
      await addItem(listId, newItemValue.trim());
      setNewItemValue("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkAdd = async () => {
    if (!bulkText.trim()) return;

    try {
      setIsSubmitting(true);
      const lines = bulkText
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await addItemsBulk(listId, lines);
      setBulkText("");
      setShowBulkPaste(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (item: ListItem) => {
    setEditingItemId(item._id);
    setEditingText(item.value);
  };

  const saveEdit = async (itemId: string) => {
    if (!editingText.trim()) return;
    await updateItem(itemId, editingText.trim());
    setEditingItemId(null);
  };

  const handleClearAll = async () => {
    if (window.confirm("Remove all items from this list?")) {
      await clearItems(listId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-[#0a0d14] border-l border-cyan-500/20 p-6 flex flex-col justify-between shadow-[-10px_0_40px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">Manage List Items</h3>
            <p className="text-xs text-slate-400 font-mono">
              {items.length} {items.length === 1 ? "entry" : "entries"} total
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Add Item Input */}
          <form onSubmit={handleAddSingle} className="flex gap-2">
            <input
              type="text"
              placeholder="Add item..."
              value={newItemValue}
              onChange={(e) => setNewItemValue(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400/70"
            />
            <CyberButton
              type="submit"
              variant="primary"
              size="sm"
              disabled={!newItemValue.trim() || isSubmitting}
            >
              <Plus className="w-4 h-4" />
            </CyberButton>
          </form>

          {/* Bulk Paste Toggle */}
          <div>
            <button
              onClick={() => setShowBulkPaste(!showBulkPaste)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>{showBulkPaste ? "Hide Bulk Paste" : "Paste Multiple Items"}</span>
            </button>

            {showBulkPaste && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <textarea
                  rows={4}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="Paste lines here...&#10;Alice&#10;Bob&#10;Charlie"
                  className="w-full p-2.5 text-xs font-mono bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400/60"
                />
                <div className="flex justify-end gap-2">
                  <CyberButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBulkPaste(false)}
                  >
                    Cancel
                  </CyberButton>
                  <CyberButton
                    variant="primary"
                    size="sm"
                    onClick={handleBulkAdd}
                    disabled={!bulkText.trim() || isSubmitting}
                  >
                    Add All Lines
                  </CyberButton>
                </div>
              </div>
            )}
          </div>

          {/* Duplicate notice */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 font-mono">
            <AlertCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Duplicate values are permitted and treated as distinct entries.</span>
          </div>

          {/* Items List */}
          <div className="space-y-1.5">
            {items.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs font-mono">
                No items added yet.
              </div>
            ) : (
              items.map((item, index) => (
                <div
                  key={item._id}
                  className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/60 hover:border-cyan-500/30 transition-all text-sm"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0 mr-2">
                    <span className="text-[11px] font-mono text-slate-500 w-5 shrink-0 text-right">
                      {index + 1}.
                    </span>

                    {editingItemId === item._id ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <input
                          type="text"
                          autoFocus
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(item._id);
                            if (e.key === "Escape") setEditingItemId(null);
                          }}
                          className="flex-1 px-2 py-1 text-xs bg-slate-950 border border-cyan-400 rounded text-white focus:outline-none"
                        />
                        <button
                          onClick={() => saveEdit(item._id)}
                          className="p-1 text-emerald-400 hover:text-emerald-300"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-200 truncate font-medium">
                        {item.value}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(item)}
                      className="p-1.5 text-slate-400 hover:text-cyan-300 rounded hover:bg-slate-800 transition-colors"
                      title="Edit item"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteItem(item._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          {items.length > 0 ? (
            <button
              onClick={handleClearAll}
              className="text-xs text-rose-400/80 hover:text-rose-400 font-mono transition-colors"
            >
              Clear all items
            </button>
          ) : (
            <span />
          )}

          <CyberButton variant="secondary" size="sm" onClick={onClose}>
            Done
          </CyberButton>
        </div>
      </div>
    </div>
  );
};
