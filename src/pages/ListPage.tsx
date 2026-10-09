import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Share2,
  Settings,
  ListPlus,
  History,
  RotateCcw,
  Sparkles,
  Check,
  AlertTriangle,
  Edit3,
  Trash2,
} from "lucide-react";
import { Navbar } from "@/components/navigation/Navbar";
import { HolographicSelector } from "@/components/selector/HolographicSelector";
import { GoldStadiumSelector } from "@/components/selector/GoldStadiumSelector";
import { CrimsonArenaSelector } from "@/components/selector/CrimsonArenaSelector";
import { WinnerModal } from "@/components/selector/WinnerModal";
import { ListEditorDrawer } from "@/components/list-editor/ListEditorDrawer";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { HistoryDrawer } from "@/components/history/HistoryDrawer";
import { CyberButton } from "@/components/ui/CyberButton";
import { ModeBadge } from "@/components/ui/Badge";
import { usePicki } from "@/lib/picki-context";
import type { ListItem, SelectionResult } from "@/lib/types";
import { copyToClipboard } from "@/lib/utils";

export function ListPage() {
  const navigate = useNavigate();
  const params = useParams();
  const slug = params.slug ?? "";

  const {
    getListBySlug,
    getItems,
    getSelections,
    selectRandomItem,
    startNewRound,
    deleteSelection,
    deleteList,
    updateList,
  } = usePicki();

  const list = getListBySlug(slug);
  const items = list ? getItems(list._id) : [];
  const selections = list ? getSelections(list._id) : [];

  // Random aesthetic chosen when list has animationTheme 'random'
  const [randomTheme] = useState<"gold_stadium" | "crimson_arena" | "cyber_hud">(() => {
    const styles = ["cyber_hud", "gold_stadium", "crimson_arena"] as const;
    return styles[Math.floor(Math.random() * styles.length)];
  });

  const rawTheme = list?.animationTheme || "cyber_hud";
  const effectiveTheme: "gold_stadium" | "crimson_arena" | "cyber_hud" =
    rawTheme === "random"
      ? randomTheme
      : rawTheme === "fifa_walkout" || rawTheme === "gold_stadium"
      ? "gold_stadium"
      : rawTheme === "wwe_rumble" || rawTheme === "crimson_arena"
      ? "crimson_arena"
      : "cyber_hud";

  // Modal / Drawer UI states
  const [showEditor, setShowEditor] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Title editing state & list deletion
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(list?.name || "");
  const [isDeletingList, setIsDeletingList] = useState(false);


  const handleSaveTitle = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = titleInput.trim();
    if (!trimmed || !list) {
      setIsEditingTitle(false);
      setTitleInput(list?.name || "");
      return;
    }
    if (trimmed !== list.name) {
      await updateList({ listId: list._id, name: trimmed });
    }
    setIsEditingTitle(false);
  };

  const handleDeleteList = async () => {
    if (!list) return;
    if (window.confirm(`Delete list "${list.name}"? This action cannot be undone.`)) {
      setIsDeletingList(true);
      try {
        await deleteList(list._id);
        navigate("/");
      } catch {
        setIsDeletingList(false);
      }
    }
  };

  // Selection execution states
  const [isSelecting, setIsSelecting] = useState(false);
  const [authoritativeResult, setAuthoritativeResult] = useState<SelectionResult | null>(null);
  const authoritativeResultRef = React.useRef<SelectionResult | null>(null);
  const [winnerItem, setWinnerItem] = useState<ListItem | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [autoRestartNotice, setAutoRestartNotice] = useState<string | null>(null);

  // Calculate current round progress
  const currentRoundSelections = selections.filter(
    (s) => s.round === (list?.currentRound || 1)
  );
  const selectedCountThisRound = currentRoundSelections.length;
  const isRoundComplete =
    list?.selectionMode === "no_repetition" &&
    items.length > 0 &&
    selectedCountThisRound >= items.length;

  const handleShare = async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2505);
    }
  };

  // Authoritative selection trigger
  const handleSelect = async () => {
    if (!list) return;
    if (isSelecting) return; // Prevent double-clicks / rapid fires
    if (items.length === 0) {
      setShowEditor(true);
      return;
    }
    if (isRoundComplete) {
      return;
    }

    try {
      setIsSelecting(true);
      setErrorMessage(null);
      setAutoRestartNotice(null);
      authoritativeResultRef.current = null;
      setAuthoritativeResult(null);

      // Call authoritative backend mutation
      const result = await selectRandomItem(list._id);
      authoritativeResultRef.current = result;
      setAuthoritativeResult(result);

      if (result.autoRestarted) {
        setAutoRestartNotice(`Round ${result.round} initiated automatically!`);
        setTimeout(() => setAutoRestartNotice(null), 4000);
      }
    } catch (err: unknown) {
      setIsSelecting(false);
      setErrorMessage(err instanceof Error ? err.message : "Selection failed");
    }
  };

  // When animation finishes decelerating on authoritative result
  const handleAnimationComplete = () => {
    const result = authoritativeResultRef.current || authoritativeResult;
    if (result) {
      const match = items.find((i) => i._id === result.selectedItem._id) || {
        _id: result.selectedItem._id,
        listId: list?._id || "",
        value: result.selectedItem.value,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setWinnerItem(match);
      setShowWinnerModal(true);
    }
    setIsSelecting(false);
  };

  // Skip selected candidate and pick next
  const handleSkip = async () => {
    const result = authoritativeResultRef.current || authoritativeResult;
    if (!result) return;
    const skippedName = winnerItem?.value || result.selectedItem.value;
    const selectionIdToVoid = result.selectionId;

    setShowWinnerModal(false);
    setWinnerItem(null);
    setAuthoritativeResult(null);
    authoritativeResultRef.current = null;

    try {
      // 1. Delete selection from backend so candidate is not marked as selected
      await deleteSelection(selectionIdToVoid);
      setAutoRestartNotice(`Skipped ${skippedName}. Picking next...`);
      setTimeout(() => setAutoRestartNotice(null), 3500);

      // 2. Automatically trigger select for next eligible person
      setTimeout(() => {
        handleSelect();
      }, 300);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to skip candidate");
    }
  };

  const handleSelectRef = React.useRef(handleSelect);
  useEffect(() => {
    handleSelectRef.current = handleSelect;
  });

  // Keyboard shortcut: Spacebar to select
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === "Space" &&
        !showEditor &&
        !showSettings &&
        !showHistory &&
        !showWinnerModal &&
        !isSelecting &&
        !isRoundComplete &&
        items.length > 0
      ) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          handleSelectRef.current();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showEditor, showSettings, showHistory, showWinnerModal, isSelecting, isRoundComplete, items.length]);

  const selectedItem: ListItem | null = authoritativeResult
    ? items.find((i) => i._id === authoritativeResult.selectedItem._id) ?? {
        _id: authoritativeResult.selectedItem._id,
        listId: list?._id ?? "",
        value: authoritativeResult.selectedItem.value,
        createdAt: 0,
        updatedAt: 0,
      }
    : null;

  const Selector =
    effectiveTheme === "gold_stadium"
      ? GoldStadiumSelector
      : effectiveTheme === "crimson_arena"
      ? CrimsonArenaSelector
      : HolographicSelector;

  // Not Found State
  if (!list) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto px-4 flex flex-col items-center justify-center text-center py-20 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">List Not Found</h1>
            <p className="text-slate-400 text-sm">
              The list you are looking for does not exist or may have been deleted.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/">
              <CyberButton variant="primary" size="md">
                Go to Homepage
              </CyberButton>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col justify-between">
        {/* Top Header Bar */}
        <div className="cyber-glass rounded-2xl p-4 sm:p-6 border border-slate-800/80 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Back & Title */}
            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
              <Link
                to="/"
                className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-500/40 transition-colors mt-0.5 sm:mt-0 shrink-0"
                title="Back to home"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-nowrap group/title min-w-0">
                  {isEditingTitle ? (
                    <form onSubmit={handleSaveTitle} className="inline-flex items-center gap-2 min-w-0">
                      <input
                        type="text"
                        autoFocus
                        value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
                        onFocus={(e) => e.currentTarget.select()}
                        onBlur={() => handleSaveTitle()}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            setIsEditingTitle(false);
                            setTitleInput(list.name);
                          }
                        }}
                        style={{ width: `${Math.max(titleInput.length + 1, 3)}ch` }}
                        className="bg-transparent border-0 border-b-2 border-cyan-400 pb-0.5 text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-normal focus:outline-none focus:ring-0 min-w-0 max-w-[200px] xs:max-w-[280px] sm:max-w-xs md:max-w-md"
                      />
                      <button
                        type="submit"
                        onMouseDown={(e) => e.preventDefault()}
                        className="p-1.5 rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                        title="Save title"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <>
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-normal border-b-2 border-transparent pb-0.5 truncate max-w-[220px] xs:max-w-[300px] sm:max-w-sm md:max-w-md">
                        {list.name}
                      </h1>
                      <button
                        onClick={() => {
                          setTitleInput(list.name);
                          setIsEditingTitle(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-300 hover:bg-slate-800/80 transition-all opacity-70 group-hover/title:opacity-100 cursor-pointer shrink-0"
                        title="Rename title"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <ModeBadge mode={list.selectionMode} className="shrink-0" />
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-1">
                  <span>
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </span>
                  <span>•</span>
                  {list.selectionMode !== "allow_repetition" ? (
                    <span className="text-cyan-300">
                      Round {list.currentRound || 1}: {selectedCountThisRound} / {items.length} picked
                    </span>
                  ) : (
                    <span className="text-purple-300">Repetition Allowed</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-nowrap overflow-x-auto pb-1 sm:pb-0 shrink-0">
              {/* Copy URL */}
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer whitespace-nowrap shrink-0"
                title="Copy persistent link to clipboard"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold whitespace-nowrap">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="whitespace-nowrap">Share Link</span>
                  </>
                )}
              </button>

              {/* Items Editor Button */}
              <button
                onClick={() => setShowEditor(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <ListPlus className="w-3.5 h-3.5 text-cyan-400" />
                <span className="whitespace-nowrap">Edit Items ({items.length})</span>
              </button>

              {/* History Drawer Button */}
              <button
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <History className="w-3.5 h-3.5 text-purple-400" />
                <span className="whitespace-nowrap">History ({selections.length})</span>
              </button>

              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white transition-all cursor-pointer shrink-0"
                title="List Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Delete List Button */}
              <button
                onClick={handleDeleteList}
                disabled={isDeletingList}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-rose-500/10 border border-slate-700/80 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                title="Delete list"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Notices */}
        {autoRestartNotice && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono text-center animate-in fade-in">
            {autoRestartNotice}
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono text-center animate-in fade-in">
            {errorMessage}
          </div>
        )}

        {/* Central Selector Visual Chamber */}
        <div className="flex-1 flex flex-col items-center justify-center py-4 sm:py-8 space-y-4">
          {/* Active Themed Selector (Random by default or chosen in settings) */}
          <Selector
            items={items}
            isSelecting={isSelecting}
            selectedItem={selectedItem}
            animationDuration={list.animationDuration || 2.5}
            reducedMotion={list.reducedMotion || false}
            onAnimationComplete={handleAnimationComplete}
          />

          {/* Action Zone */}
          <div className="mt-6 flex flex-col items-center gap-3 w-full max-w-sm">
            {isRoundComplete ? (
              <div className="space-y-3 w-full text-center">
                <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold uppercase tracking-wider">
                  ★ Round {list.currentRound} Complete! All items selected.
                </div>
                <CyberButton
                  variant="cyber"
                  size="xl"
                  onClick={() => startNewRound(list._id)}
                  className="w-full gap-2.5"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Start Round {(list.currentRound || 1) + 1}</span>
                </CyberButton>
              </div>
            ) : (
              <CyberButton
                variant={
                  effectiveTheme === "gold_stadium"
                    ? "cyber"
                    : effectiveTheme === "crimson_arena"
                    ? "primary"
                    : "cyber"
                }
                size="xl"
                onClick={handleSelect}
                disabled={isSelecting || items.length === 0}
                className={`w-full gap-2.5 text-xl tracking-widest py-5 ${
                  effectiveTheme === "gold_stadium"
                    ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black font-black border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.5)]"
                    : effectiveTheme === "crimson_arena"
                    ? "bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white font-black border-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.5)]"
                    : ""
                }`}
              >
                <Sparkles
                  className={`w-5 h-5 ${
                    effectiveTheme === "gold_stadium"
                      ? "text-black"
                      : effectiveTheme === "crimson_arena"
                      ? "text-amber-300"
                      : "text-cyan-300"
                  }`}
                />
                <span>{isSelecting ? "SELECTING..." : "SELECT"}</span>
              </CyberButton>
            )}

            <div className="text-[11px] font-mono text-slate-500 text-center">
              Press <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">Space</kbd> or click to select
            </div>
          </div>
        </div>
      </main>

      {/* Modals & Drawers */}
      {showWinnerModal && winnerItem && authoritativeResult && (
        <WinnerModal
          winner={winnerItem}
          round={authoritativeResult.round}
          selectionNumber={authoritativeResult.selectionNumber}
          isRoundComplete={authoritativeResult.isRoundComplete}
          theme={effectiveTheme}
          onClose={() => setShowWinnerModal(false)}
          onPickAgain={() => {
            setShowWinnerModal(false);
            setTimeout(() => handleSelect(), 250);
          }}
          onSkip={handleSkip}
        />
      )}

      {showEditor && (
        <ListEditorDrawer
          listId={list._id}
          items={items}
          onClose={() => setShowEditor(false)}
        />
      )}

      {showSettings && (
        <SettingsModal list={list} onClose={() => setShowSettings(false)} />
      )}

      {showHistory && (
        <HistoryDrawer
          listId={list._id}
          listName={list.name}
          selections={selections}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}
