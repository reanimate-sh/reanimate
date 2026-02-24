import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { isKnownProductId } from "./plans";

export const onSubscriptionActive = internalMutation({
  args: {
    clerkUserId: v.optional(v.string()),
    dodoCustomerId: v.string(),
    subscriptionId: v.string(),
    productId: v.optional(v.string()),
    status: v.string(),
    currentPeriodEnd: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.productId || !isKnownProductId(args.productId)) {
      console.warn(
        `onSubscriptionActive: unrecognized product ID "${args.productId}" for customer ${args.dodoCustomerId}`
      );
      return;
    }

    if (!args.clerkUserId) {
      console.warn(
        `onSubscriptionActive: no clerkUserId in metadata for customer ${args.dodoCustomerId}`
      );
      return;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", args.clerkUserId!))
      .first();

    if (!user) {
      console.warn(
        `onSubscriptionActive: no user found for clerkUserId ${args.clerkUserId}`
      );
      return;
    }

    await ctx.db.patch(user._id, {
      dodoCustomerId: args.dodoCustomerId,
      subscriptionId: args.subscriptionId,
      subscriptionStatus: args.status,
      productId: args.productId,
      currentPeriodEnd: args.currentPeriodEnd,
    });
  },
});

export const onSubscriptionUpdated = internalMutation({
  args: {
    dodoCustomerId: v.string(),
    subscriptionId: v.string(),
    productId: v.optional(v.string()),
    status: v.string(),
    currentPeriodEnd: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("byDodoCustomerId", (q) =>
        q.eq("dodoCustomerId", args.dodoCustomerId)
      )
      .first();

    if (!user) {
      console.warn(
        `onSubscriptionUpdated: no user found for customer ${args.dodoCustomerId}`
      );
      return;
    }

    if (args.productId && !isKnownProductId(args.productId)) {
      console.warn(
        `onSubscriptionUpdated: unrecognized product ID "${args.productId}" for customer ${args.dodoCustomerId}`
      );
      return;
    }

    await ctx.db.patch(user._id, {
      subscriptionId: args.subscriptionId,
      subscriptionStatus: args.status,
      productId: args.productId ?? user.productId,
      ...(args.currentPeriodEnd !== undefined
        ? { currentPeriodEnd: args.currentPeriodEnd }
        : {}),
    });
  },
});
