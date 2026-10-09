export type SelectionMode = "no_repetition" | "allow_repetition" | "auto_restart";
export type AnimationTheme =
  | "random"
  | "gold_stadium"
  | "crimson_arena"
  | "cyber_hud"
  | "fifa_walkout"
  | "wwe_rumble";

export interface ListItem {
  _id: string;
  listId: string;
  value: string;
  createdAt: number;
  updatedAt: number;
}

export interface ListDoc {
  _id: string;
  name: string;
  slug: string;
  selectionMode: SelectionMode;
  currentRound: number;
  animationDuration: number;
  reducedMotion: boolean;
  animationTheme?: AnimationTheme;
  createdAt: number;
  updatedAt: number;
  itemCount?: number;
  selectedThisRound?: number;
}

export interface SelectionRecord {
  _id: string;
  listId: string;
  itemId?: string;
  itemValue: string;
  round: number;
  selectionNumber: number;
  selectedAt: number;
}

export interface SelectionResult {
  selectionId: string;
  selectedItem: {
    _id: string;
    value: string;
  };
  round: number;
  selectionNumber: number;
  isRoundComplete: boolean;
  remainingInRound: number;
  autoRestarted?: boolean;
}
