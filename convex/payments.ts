import { action } from "./_generated/server";
import { v } from "convex/values";
import { checkout, customerPortal } from "./dodo";
import { internal } from "./_generated/api";

const TRIAL_DAYS = 7;

export const createCheckout = action({
  args: {
    productId: v.string(),
    quantity: v.optional(v.number()),
    returnUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const metadata: Record<string, string> = {};
    if (identity) {
      metadata.clerkUserId = identity.subject;
    }

    const user = identity
      ? await ctx.runQuery(internal.users.getByExternalId, {
          externalId: identity.subject,
        })
      : null;

    const trialPeriodDays = user && !user.subscriptionId ? TRIAL_DAYS : 0;

    const session = await checkout(ctx, {
      payload: {
        product_cart: [
          {
            product_id: args.productId,
            quantity: args.quantity ?? 1,
          },
        ],
        subscription_data: {
          trial_period_days: trialPeriodDays,
        },
        return_url: args.returnUrl,
        billing_currency: "USD",
        feature_flags: {
          allow_discount_code: true,
        },
        metadata,
      },
    });

    if (!session?.checkout_url) {
      throw new Error("Checkout session did not return a checkout_url");
    }

    return session;
  },
});

export const getCustomerPortal = action({
  args: {
    sendEmail: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const portal = await customerPortal(ctx, { send_email: args.sendEmail });

    if (!portal?.portal_url) {
      throw new Error("Customer portal did not return a portal_url");
    }

    return portal;
  },
});
