import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * One-off: gives every list without an owner to the account with `email`.
 *   npx convex run migrations:claimUnownedLists '{"email":"..."}'
 */
export const claimUnownedLists = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email.trim().toLowerCase()))
      .unique();
    if (!user) throw new Error(`No account for ${email}; sign up first.`);
    let claimed = 0;
    for (const list of await ctx.db.query("lists").collect()) {
      if (list.userId === undefined) {
        await ctx.db.patch(list._id, { userId: user._id });
        claimed++;
      }
    }
    return { claimed };
  },
});
