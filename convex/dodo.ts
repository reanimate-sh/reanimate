import { DodoPayments, DodoPaymentsClientConfig } from "@dodopayments/convex";
import { components, internal } from "./_generated/api";

export const dodo = new DodoPayments(components.dodopayments, {
  // Maps the currently authenticated Convex/Clerk user to a Dodo customer.
  // identity.subject is the Clerk user ID, which is stored as externalId.
  identify: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.runQuery(internal.users.getByExternalId, {
      externalId: identity.subject,
    });

    if (!user) {
      return null;
    }

    // If the user already has a Dodo customer ID, pass it so Dodo reuses the
    // same customer record. Otherwise return null so Dodo creates a new one.
    if (!user.dodoCustomerId) {
      return null;
    }

    return { dodoCustomerId: user.dodoCustomerId };
  },
  apiKey: process.env.DODO_PAYMENTS_API_KEY!,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT as
    | "test_mode"
    | "live_mode",
} as DodoPaymentsClientConfig);

export const { checkout, customerPortal } = dodo.api();
