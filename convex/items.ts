import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getItems = query({
  args: { listId: v.id("lists") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("items")
      .withIndex("by_listId", (q) => q.eq("listId", args.listId))
      .order("asc")
      .collect();
  },
});

export const addItem = mutation({
  args: {
    listId: v.id("lists"),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const trimmed = args.value.trim();
    if (!trimmed) throw new Error("Item value cannot be empty");

    const now = Date.now();
    const itemId = await ctx.db.insert("items", {
      listId: args.listId,
      value: trimmed,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(args.listId, { updatedAt: now });
    return itemId;
  },
});

export const addItemsBulk = mutation({
  args: {
    listId: v.id("lists"),
    values: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const insertedIds = [];

    for (const val of args.values) {
      const trimmed = val.trim();
      if (trimmed) {
        const id = await ctx.db.insert("items", {
          listId: args.listId,
          value: trimmed,
          createdAt: now,
          updatedAt: now,
        });
        insertedIds.push(id);
      }
    }

    if (insertedIds.length > 0) {
      await ctx.db.patch(args.listId, { updatedAt: now });
    }

    return insertedIds;
  },
});

export const updateItem = mutation({
  args: {
    itemId: v.id("items"),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const trimmed = args.value.trim();
    if (!trimmed) throw new Error("Item value cannot be empty");

    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");

    const now = Date.now();
    await ctx.db.patch(args.itemId, {
      value: trimmed,
      updatedAt: now,
    });

    await ctx.db.patch(item.listId, { updatedAt: now });
    return { success: true };
  },
});

export const deleteItem = mutation({
  args: {
    itemId: v.id("items"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");

    await ctx.db.delete(args.itemId);
    await ctx.db.patch(item.listId, { updatedAt: Date.now() });
    return { success: true };
  },
});

export const clearItems = mutation({
  args: {
    listId: v.id("lists"),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("items")
      .withIndex("by_listId", (q) => q.eq("listId", args.listId))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    await ctx.db.patch(args.listId, { updatedAt: Date.now() });
    return { count: items.length };
  },
});
