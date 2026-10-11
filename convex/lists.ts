import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { currentUserId, getOwnedList, requireUserId } from "./lib/access";

function generateSlug(name: string): string {
  const sanitized = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return sanitized ? `${sanitized}-${randomSuffix}` : `list-${randomSuffix}`;
}

export const createList = mutation({
  args: {
    name: v.string(),
    items: v.optional(v.array(v.string())),
    selectionMode: v.optional(
      v.union(
        v.literal("no_repetition"),
        v.literal("allow_repetition"),
        v.literal("auto_restart")
      )
    ),
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
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const trimmedName = args.name.trim() || "Untitled List";
    let slug = generateSlug(trimmedName);

    // Verify slug uniqueness
    const existing = await ctx.db
      .query("lists")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (existing) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 5)}`;
    }

    const now = Date.now();
    const listId = await ctx.db.insert("lists", {
      userId,
      name: trimmedName,
      slug,
      selectionMode: args.selectionMode ?? "no_repetition",
      currentRound: 1,
      animationDuration: 2.5,
      reducedMotion: false,
      animationTheme: args.animationTheme ?? "cyber_hud",
      createdAt: now,
      updatedAt: now,
    });

    if (args.items && args.items.length > 0) {
      for (const itemVal of args.items) {
        const trimmed = itemVal.trim();
        if (trimmed) {
          await ctx.db.insert("items", {
            listId,
            value: trimmed,
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    }

    return { listId, slug };
  },
});

// Public: anyone with the link can view a list; only its owner can change it.
export const getListBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const list = await ctx.db
      .query("lists")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!list) return null;
    const userId = await currentUserId(ctx);
    return { ...list, canEdit: userId !== null && list.userId === userId };
  },
});

export const getAllLists = query({
  args: {},
  handler: async (ctx) => {
    const userId = await currentUserId(ctx);
    if (userId === null) return [];
    const lists = await ctx.db
      .query("lists")
      .withIndex("by_user_updatedAt", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const results = await Promise.all(
      lists.map(async (list) => {
        const items = await ctx.db
          .query("items")
          .withIndex("by_listId", (q) => q.eq("listId", list._id))
          .collect();

        const roundSelections = await ctx.db
          .query("selections")
          .withIndex("by_list_round", (q) =>
            q.eq("listId", list._id).eq("round", list.currentRound)
          )
          .collect();

        return {
          ...list,
          itemCount: items.length,
          selectedThisRound: roundSelections.length,
        };
      })
    );

    return results;
  },
});

export const updateList = mutation({
  args: {
    listId: v.id("lists"),
    name: v.optional(v.string()),
    selectionMode: v.optional(
      v.union(
        v.literal("no_repetition"),
        v.literal("allow_repetition"),
        v.literal("auto_restart")
      )
    ),
    animationDuration: v.optional(v.number()),
    reducedMotion: v.optional(v.boolean()),
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
  },
  handler: async (ctx, args) => {
    const { listId, ...fields } = args;
    const list = await getOwnedList(ctx, listId);

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (fields.name !== undefined) patch.name = fields.name.trim() || list.name;
    if (fields.selectionMode !== undefined) patch.selectionMode = fields.selectionMode;
    if (fields.animationDuration !== undefined) patch.animationDuration = fields.animationDuration;
    if (fields.reducedMotion !== undefined) patch.reducedMotion = fields.reducedMotion;
    if (fields.animationTheme !== undefined) patch.animationTheme = fields.animationTheme;

    await ctx.db.patch(listId, patch);
    return { success: true };
  },
});

export const deleteList = mutation({
  args: { listId: v.id("lists") },
  handler: async (ctx, args) => {
    await getOwnedList(ctx, args.listId);

    // Delete items
    const items = await ctx.db
      .query("items")
      .withIndex("by_listId", (q) => q.eq("listId", args.listId))
      .collect();
    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    // Delete selections
    const selections = await ctx.db
      .query("selections")
      .withIndex("by_listId", (q) => q.eq("listId", args.listId))
      .collect();
    for (const sel of selections) {
      await ctx.db.delete(sel._id);
    }

    // Delete list
    await ctx.db.delete(args.listId);
    return { success: true };
  },
});

export const duplicateList = mutation({
  args: { listId: v.id("lists") },
  handler: async (ctx, args) => {
    const list = await getOwnedList(ctx, args.listId);

    const items = await ctx.db
      .query("items")
      .withIndex("by_listId", (q) => q.eq("listId", args.listId))
      .collect();

    const now = Date.now();
    const newName = `${list.name} (Copy)`;
    const newSlug = generateSlug(newName);

    const newListId = await ctx.db.insert("lists", {
      userId: list.userId,
      name: newName,
      slug: newSlug,
      selectionMode: list.selectionMode,
      currentRound: 1,
      animationDuration: list.animationDuration,
      reducedMotion: list.reducedMotion,
      createdAt: now,
      updatedAt: now,
    });

    for (const item of items) {
      await ctx.db.insert("items", {
        listId: newListId,
        value: item.value,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { listId: newListId, slug: newSlug };
  },
});

export const startNewRound = mutation({
  args: { listId: v.id("lists") },
  handler: async (ctx, args) => {
    const list = await getOwnedList(ctx, args.listId);

    const nextRound = (list.currentRound || 1) + 1;
    await ctx.db.patch(args.listId, {
      currentRound: nextRound,
      updatedAt: Date.now(),
    });

    return { newRound: nextRound };
  },
});
