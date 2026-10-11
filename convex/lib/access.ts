import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { isAllowedEmail } from "./allowlist";

/** The signed-in, still-allowlisted user, or null. */
export async function currentUserId(ctx: QueryCtx): Promise<Id<"users"> | null> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) return null;
  // Re-checked on every call, so removing an email cuts off existing sessions.
  const user = await ctx.db.get(userId);
  return isAllowedEmail(user?.email) ? userId : null;
}

export async function requireUserId(ctx: QueryCtx): Promise<Id<"users">> {
  const userId = await currentUserId(ctx);
  if (userId === null) throw new ConvexError("Not signed in.");
  return userId;
}

// Missing and foreign lists look the same to the caller.
export async function getOwnedList(ctx: QueryCtx, id: Id<"lists">): Promise<Doc<"lists">> {
  const userId = await requireUserId(ctx);
  const list = await ctx.db.get(id);
  if (list === null || list.userId !== userId) throw new ConvexError("List not found.");
  return list;
}
