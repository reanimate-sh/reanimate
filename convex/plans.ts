import { query } from "./_generated/server";

export const PLAN_PRODUCT_IDS = () => [
  {
    productId: process.env.DODO_CREATOR_MONTHLY_PRODUCT_ID!,
    name: "Creator",
    billingCycle: "monthly" as const,
    credits: 2500,
  },
  {
    productId: process.env.DODO_CREATOR_ANNUAL_PRODUCT_ID!,
    name: "Creator",
    billingCycle: "annual" as const,
    credits: 2500,
  },
  {
    productId: process.env.DODO_PRO_MONTHLY_PRODUCT_ID!,
    name: "Pro",
    billingCycle: "monthly" as const,
    credits: 10000,
  },
  {
    productId: process.env.DODO_PRO_ANNUAL_PRODUCT_ID!,
    name: "Pro",
    billingCycle: "annual" as const,
    credits: 10000,
  },
];

export function getPlanByProductId(productId: string) {
  return PLAN_PRODUCT_IDS().find((p) => p.productId === productId);
}

export const getPlans = query({
  args: {},
  handler: async () => {
    return PLAN_PRODUCT_IDS().filter((p) => !!p.productId);
  },
});
