import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  lists: defineTable({
    name: v.string(),
    slug: v.string(),
    selectionMode: v.union(
      v.literal("no_repetition"),
      v.literal("allow_repetition"),
      v.literal("auto_restart")
    ),
    currentRound: v.number(),
    animationDuration: v.number(), // in seconds e.g. 2.5
    reducedMotion: v.boolean(),
    animationTheme: v.optional(
      v.union(
        v.literal("random"),
        v.literal("gold_stadium"),
        v.literal("crimson_arena"),
        v.literal("cyber_hud"),
        v.literal("fifa_walkout"),
        v.literal("wwe_rumble")
      )
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_updatedAt", ["updatedAt"]),

  items: defineTable({
    listId: v.id("lists"),
    value: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_listId", ["listId"]),

  selections: defineTable({
    listId: v.id("lists"),
    itemId: v.optional(v.id("items")),
    itemValue: v.string(),
    round: v.number(),
    selectionNumber: v.number(),
    selectedAt: v.number(),
  })
    .index("by_listId", ["listId"])
    .index("by_list_round", ["listId", "round"]),
});
