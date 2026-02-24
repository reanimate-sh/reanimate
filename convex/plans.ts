import { query } from "./_generated/server";

// Each entry maps a Dodo product ID to a human-readable plan name.
// Product IDs are set as env vars in the Convex dashboard.
export const PLAN_PRODUCT_IDS = () => [
  {
    productId: process.env.DODO_CREATOR_MONTHLY_PRODUCT_ID!,
    name: "Creator",
    billing: "monthly" as const,
  },
  {
    productId: process.env.DODO_CREATOR_ANNUAL_PRODUCT_ID!,
    name: "Creator",
    billing: "annual" as const,
  },
  {
    productId: process.env.DODO_PRO_MONTHLY_PRODUCT_ID!,
    name: "Pro",
    billing: "monthly" as const,
  },
  {
    productId: process.env.DODO_PRO_ANNUAL_PRODUCT_ID!,
    name: "Pro",
    billing: "annual" as const,
  },
];

export function isKnownProductId(productId: string): boolean {
  return PLAN_PRODUCT_IDS().some((p) => p.productId === productId);
}

// Public query so the frontend can get product IDs from Convex instead of
// NEXT_PUBLIC_ env vars — single source of truth.
export const getPlans = query({
  args: {},
  handler: async () => {
    return PLAN_PRODUCT_IDS().filter((p) => !!p.productId);
  },
});
