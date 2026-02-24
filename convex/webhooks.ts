import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getPlanByProductId } from "./plans";
import { allotCredits } from "./credits";
import { logTransaction } from "./transactions";

function cycleSourceId(subscriptionId: string, periodEnd?: string) {
  const date = periodEnd ? new Date(periodEnd) : new Date(Date.now());
  return `${subscriptionId}:${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

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
    if (!args.clerkUserId) {
      console.warn(
        `onSubscriptionActive: no clerkUserId in metadata for customer ${args.dodoCustomerId}`
      );
      return;
    }

    const plan = args.productId ? getPlanByProductId(args.productId) : undefined;
    if (!plan) {
      console.warn(
        `onSubscriptionActive: unrecognized product ID "${args.productId}" for customer ${args.dodoCustomerId}`
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

    await ctx.db.patch("users", user._id, {
      dodoCustomerId: args.dodoCustomerId,
      subscriptionId: args.subscriptionId,
      subscriptionStatus: args.status,
      productId: args.productId,
      currentPeriodEnd: args.currentPeriodEnd,
    });

    const sourceId = cycleSourceId(args.subscriptionId, args.currentPeriodEnd);
    const metadata = { planName: plan.name, billingCycle: plan.billingCycle };

    await allotCredits(ctx.db, {
      userId: user._id,
      type: "subscription",
      amount: plan.credits,
      sourceId,
      expiresAt: args.currentPeriodEnd,
      metadata,
    });

    await logTransaction(ctx.db, {
      userId: user._id,
      type: "credit",
      amount: plan.credits,
      source: "subscription",
      sourceId,
      metadata,
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

    const effectiveProductId = args.productId ?? user.productId;
    const plan = effectiveProductId
      ? getPlanByProductId(effectiveProductId)
      : undefined;

    if (args.productId && !plan) {
      console.warn(
        `onSubscriptionUpdated: unrecognized product ID "${args.productId}" for customer ${args.dodoCustomerId}`
      );
      return;
    }

    await ctx.db.patch("users", user._id, {
      subscriptionId: args.subscriptionId,
      subscriptionStatus: args.status,
      productId: effectiveProductId,
      ...(args.currentPeriodEnd !== undefined
        ? { currentPeriodEnd: args.currentPeriodEnd }
        : {}),
    });

    if (plan && args.status === "active") {
      const sourceId = cycleSourceId(args.subscriptionId, args.currentPeriodEnd);
      const metadata = { planName: plan.name, billingCycle: plan.billingCycle };

      await allotCredits(ctx.db, {
        userId: user._id,
        type: "subscription",
        amount: plan.credits,
        sourceId,
        expiresAt: args.currentPeriodEnd,
        metadata,
      });

      await logTransaction(ctx.db, {
        userId: user._id,
        type: "credit",
        amount: plan.credits,
        source: "subscription",
        sourceId,
        metadata,
      });
    }
  },
});
