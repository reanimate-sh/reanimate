import { internalMutation, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { getPlanByProductId } from "./plans";
import { allotCredits } from "./credits";
import { logTransaction } from "./transactions";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

function sourceIdForMonth(subscriptionId: string, dateInput?: string | Date) {
  const parsedDate =
    typeof dateInput === "string"
      ? new Date(dateInput)
      : dateInput ?? new Date(Date.now());
  const date = Number.isNaN(parsedDate.getTime()) ? new Date(Date.now()) : parsedDate;
  return `${subscriptionId}:${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function addMonthsFromAnchor(anchor: Date, monthOffset: number) {
  const year = anchor.getUTCFullYear();
  const month = anchor.getUTCMonth();
  const day = anchor.getUTCDate();

  const targetMonth = month + monthOffset;
  const firstOfTarget = new Date(
    Date.UTC(
      year,
      targetMonth,
      1,
      anchor.getUTCHours(),
      anchor.getUTCMinutes(),
      anchor.getUTCSeconds(),
      anchor.getUTCMilliseconds(),
    ),
  );
  const lastDayOfTarget = new Date(
    Date.UTC(
      firstOfTarget.getUTCFullYear(),
      firstOfTarget.getUTCMonth() + 1,
      0,
      anchor.getUTCHours(),
      anchor.getUTCMinutes(),
      anchor.getUTCSeconds(),
      anchor.getUTCMilliseconds(),
    ),
  ).getUTCDate();

  return new Date(
    Date.UTC(
      firstOfTarget.getUTCFullYear(),
      firstOfTarget.getUTCMonth(),
      Math.min(day, lastDayOfTarget),
      anchor.getUTCHours(),
      anchor.getUTCMinutes(),
      anchor.getUTCSeconds(),
      anchor.getUTCMilliseconds(),
    ),
  );
}

function nextAnchorAfter(anchor: Date, after: Date) {
  const monthDiff =
    (after.getUTCFullYear() - anchor.getUTCFullYear()) * 12 +
    (after.getUTCMonth() - anchor.getUTCMonth());
  const offset = Math.max(monthDiff, 0);

  let next = addMonthsFromAnchor(anchor, offset);
  if (next.getTime() <= after.getTime()) {
    next = addMonthsFromAnchor(anchor, offset + 1);
  }

  return next;
}

function minExpiry(primary: Date, periodEnd?: string) {
  if (!periodEnd) return primary.toISOString();
  const periodEndMs = new Date(periodEnd).getTime();
  if (Number.isNaN(periodEndMs)) return primary.toISOString();
  return new Date(Math.min(primary.getTime(), periodEndMs)).toISOString();
}

async function grantSubscriptionCredits(
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    amount: number;
    sourceId: string;
    expiresAt?: string;
    metadata: { planName: string; billingCycle: "monthly" | "annual" };
  }
) {
  const created = await allotCredits(ctx.db, {
    userId: args.userId,
    type: "subscription",
    amount: args.amount,
    sourceId: args.sourceId,
    expiresAt: args.expiresAt,
    metadata: args.metadata,
  });

  if (!created) return;

  await logTransaction(ctx.db, {
    userId: args.userId,
    type: "credit",
    amount: args.amount,
    source: "subscription",
    sourceId: args.sourceId,
    metadata: args.metadata,
  });
}

async function scheduleAnnualCreditGrant(
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    subscriptionId: string;
    scheduleVersion: number;
    nextGrantAt: Date;
  }
) {
  await ctx.scheduler.runAt(
    args.nextGrantAt.getTime(),
    internal.webhooks.processAnnualCreditGrant,
    {
      userId: args.userId,
      subscriptionId: args.subscriptionId,
      scheduleVersion: args.scheduleVersion,
    }
  );
}

export const onSubscriptionActive = internalMutation({
  args: {
    clerkUserId: v.optional(v.string()),
    dodoCustomerId: v.string(),
    subscriptionId: v.string(),
    productId: v.optional(v.string()),
    status: v.string(),
    subscriptionPeriodEnd: v.optional(v.string()),
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
    const metadata = { planName: plan.name, billingCycle: plan.billingCycle };

    if (plan.billingCycle === "annual" && args.status === "active") {
      const now = new Date();
      const nextGrantAt = nextAnchorAfter(now, now);
      const sourceId = sourceIdForMonth(args.subscriptionId, now);
      const scheduleVersion = (user.creditScheduleVersion ?? 0) + 1;

      await ctx.db.patch("users", user._id, {
        dodoCustomerId: args.dodoCustomerId,
        subscriptionId: args.subscriptionId,
        subscriptionStatus: args.status,
        productId: args.productId,
        subscriptionPeriodEnd: args.subscriptionPeriodEnd,
        subscriptionStartedAt: now.toISOString(),
        nextCreditGrantAt: nextGrantAt.toISOString(),
        creditScheduleVersion: scheduleVersion,
      });

      await grantSubscriptionCredits(ctx, {
        userId: user._id,
        amount: plan.credits,
        sourceId,
        expiresAt: minExpiry(nextGrantAt, args.subscriptionPeriodEnd),
        metadata,
      });

      await scheduleAnnualCreditGrant(ctx, {
        userId: user._id,
        subscriptionId: args.subscriptionId,
        scheduleVersion,
        nextGrantAt,
      });
      return;
    }

    await ctx.db.patch("users", user._id, {
      dodoCustomerId: args.dodoCustomerId,
      subscriptionId: args.subscriptionId,
      subscriptionStatus: args.status,
      productId: args.productId,
      subscriptionPeriodEnd: args.subscriptionPeriodEnd,
      creditScheduleVersion: (user.creditScheduleVersion ?? 0) + 1,
    });

    const sourceId = sourceIdForMonth(
      args.subscriptionId,
      args.subscriptionPeriodEnd,
    );
    await grantSubscriptionCredits(ctx, {
      userId: user._id,
      amount: plan.credits,
      sourceId,
      expiresAt: args.subscriptionPeriodEnd,
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
    subscriptionPeriodEnd: v.optional(v.string()),
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

    if (!plan || args.status !== "active") {
      await ctx.db.patch("users", user._id, {
        subscriptionId: args.subscriptionId,
        subscriptionStatus: args.status,
        productId: effectiveProductId,
        creditScheduleVersion: (user.creditScheduleVersion ?? 0) + 1,
        ...(args.subscriptionPeriodEnd !== undefined
          ? { subscriptionPeriodEnd: args.subscriptionPeriodEnd }
          : {}),
      });
      return;
    }

    const metadata = { planName: plan.name, billingCycle: plan.billingCycle };

    if (plan.billingCycle === "annual") {
      const now = new Date();
      const previousPlan = user.productId
        ? getPlanByProductId(user.productId)
        : undefined;
      const sameAnnualSubscription =
        user.subscriptionId === args.subscriptionId &&
        previousPlan?.billingCycle === "annual" &&
        !!user.subscriptionStartedAt;

      const parsedAnchor = sameAnnualSubscription
        ? new Date(user.subscriptionStartedAt!)
        : now;
      const anchor = Number.isNaN(parsedAnchor.getTime()) ? now : parsedAnchor;
      const nextGrantAt = nextAnchorAfter(anchor, now);
      const sourceId = sourceIdForMonth(args.subscriptionId, now);
      const scheduleVersion = (user.creditScheduleVersion ?? 0) + 1;

      await ctx.db.patch("users", user._id, {
        subscriptionId: args.subscriptionId,
        subscriptionStatus: args.status,
        productId: effectiveProductId,
        subscriptionStartedAt: anchor.toISOString(),
        nextCreditGrantAt: nextGrantAt.toISOString(),
        creditScheduleVersion: scheduleVersion,
        ...(args.subscriptionPeriodEnd !== undefined
          ? { subscriptionPeriodEnd: args.subscriptionPeriodEnd }
          : {}),
      });

      await grantSubscriptionCredits(ctx, {
        userId: user._id,
        amount: plan.credits,
        sourceId,
        expiresAt: minExpiry(nextGrantAt, args.subscriptionPeriodEnd),
        metadata,
      });

      await scheduleAnnualCreditGrant(ctx, {
        userId: user._id,
        subscriptionId: args.subscriptionId,
        scheduleVersion,
        nextGrantAt,
      });
      return;
    }

    await ctx.db.patch("users", user._id, {
      subscriptionId: args.subscriptionId,
      subscriptionStatus: args.status,
      productId: effectiveProductId,
      creditScheduleVersion: (user.creditScheduleVersion ?? 0) + 1,
      ...(args.subscriptionPeriodEnd !== undefined
        ? { subscriptionPeriodEnd: args.subscriptionPeriodEnd }
        : {}),
    });

    const sourceId = sourceIdForMonth(
      args.subscriptionId,
      args.subscriptionPeriodEnd,
    );
    await grantSubscriptionCredits(ctx, {
      userId: user._id,
      amount: plan.credits,
      sourceId,
      expiresAt: args.subscriptionPeriodEnd,
      metadata,
    });
  },
});

export const processAnnualCreditGrant = internalMutation({
  args: {
    userId: v.id("users"),
    subscriptionId: v.string(),
    scheduleVersion: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return;

    if (user.creditScheduleVersion !== args.scheduleVersion) return;
    if (user.subscriptionId !== args.subscriptionId) return;
    if (user.subscriptionStatus !== "active") return;
    if (!user.productId || !user.nextCreditGrantAt) return;

    const plan = getPlanByProductId(user.productId);
    if (!plan || plan.billingCycle !== "annual") return;

    const grantAt = new Date(user.nextCreditGrantAt);
    if (Number.isNaN(grantAt.getTime())) return;
    if (grantAt.getTime() > Date.now() + 60_000) return;

    const periodEndMs = user.subscriptionPeriodEnd
      ? new Date(user.subscriptionPeriodEnd).getTime()
      : undefined;
    if (
      periodEndMs !== undefined &&
      !Number.isNaN(periodEndMs) &&
      (Date.now() >= periodEndMs || grantAt.getTime() >= periodEndMs)
    ) {
      return;
    }

    const parsedAnchor = user.subscriptionStartedAt
      ? new Date(user.subscriptionStartedAt)
      : grantAt;
    const anchor = Number.isNaN(parsedAnchor.getTime()) ? grantAt : parsedAnchor;
    const nextGrantAt = nextAnchorAfter(anchor, grantAt);
    const sourceId = sourceIdForMonth(args.subscriptionId, grantAt);
    const metadata = { planName: plan.name, billingCycle: plan.billingCycle };

    await grantSubscriptionCredits(ctx, {
      userId: user._id,
      amount: plan.credits,
      sourceId,
      expiresAt: minExpiry(nextGrantAt, user.subscriptionPeriodEnd),
      metadata,
    });

    await ctx.db.patch("users", user._id, {
      nextCreditGrantAt: nextGrantAt.toISOString(),
    });

    if (
      periodEndMs !== undefined &&
      !Number.isNaN(periodEndMs) &&
      nextGrantAt.getTime() >= periodEndMs
    ) {
      return;
    }

    await scheduleAnnualCreditGrant(ctx, {
      userId: user._id,
      subscriptionId: args.subscriptionId,
      scheduleVersion: args.scheduleVersion,
      nextGrantAt,
    });
  },
});
