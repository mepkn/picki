import { createContext, useContext } from "react";
import type { ListDoc, SelectionResult, SelectionMode, AnimationTheme } from "./types";

export interface PickiContextType {
  lists: ListDoc[];
  createList: (params: {
    name: string;
    items?: string[];
    selectionMode?: SelectionMode;
    animationTheme?: AnimationTheme;
  }) => Promise<{ listId: string; slug: string }>;
  updateList: (params: {
    listId: string;
    name?: string;
    selectionMode?: SelectionMode;
    animationDuration?: number;
    reducedMotion?: boolean;
    animationTheme?: AnimationTheme;
  }) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  duplicateList: (listId: string) => Promise<{ listId: string; slug: string }>;
  startNewRound: (listId: string) => Promise<{ newRound: number }>;
  addItem: (listId: string, value: string) => Promise<string>;
  addItemsBulk: (listId: string, values: string[]) => Promise<string[]>;
  updateItem: (itemId: string, value: string) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  clearItems: (listId: string) => Promise<void>;
  selectRandomItem: (listId: string) => Promise<SelectionResult>;
  clearSelections: (listId: string) => Promise<void>;
  deleteSelection: (selectionId: string) => Promise<void>;
}

export const PickiContext = createContext<PickiContextType | null>(null);

export function usePicki() {
  const context = useContext(PickiContext);
  if (!context) {
    throw new Error("usePicki must be used within a PickiProvider");
  }
  return context;
}
