import type { Doc } from "../../convex/_generated/dataModel";
import type { AnimationTheme, ListDoc, SelectionMode } from "./types";

/** Maps a Convex list document to the shape the UI uses, filling defaults. */
export function toListDoc(l: Doc<"lists"> & { itemCount?: number; selectedThisRound?: number }): ListDoc {
  return {
    _id: l._id as string,
    name: l.name,
    slug: l.slug,
    selectionMode: l.selectionMode as SelectionMode,
    currentRound: l.currentRound,
    animationDuration: l.animationDuration ?? 2.5,
    reducedMotion: l.reducedMotion ?? false,
    animationTheme: (l.animationTheme as AnimationTheme) ?? "cyber_hud",
    createdAt: l.createdAt,
    updatedAt: l.updatedAt,
    itemCount: l.itemCount,
    selectedThisRound: l.selectedThisRound,
  };
}
