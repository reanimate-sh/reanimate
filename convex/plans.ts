import { query } from "./_generated/server";

export type PlanDefinition = {
  productId: string;
  name: "Creator" | "Pro";
  billingCycle: "monthly" | "annual";
  credits: number;
  projectLimit: number | null;
};

export const PLAN_PRODUCT_IDS = (): PlanDefinition[] => [
  {
    productId: process.env.DODO_CREATOR_MONTHLY_PRODUCT_ID!,
    name: "Creator",
    billingCycle: "monthly" as const,
    credits: 2500,
    projectLimit: 5,
  },
  {
    productId: process.env.DODO_CREATOR_ANNUAL_PRODUCT_ID!,
    name: "Creator",
    billingCycle: "annual" as const,
    credits: 2500,
    projectLimit: 5,
  },
  {
    productId: process.env.DODO_PRO_MONTHLY_PRODUCT_ID!,
    name: "Pro",
    billingCycle: "monthly" as const,
    credits: 10000,
    projectLimit: null,
  },
  {
    productId: process.env.DODO_PRO_ANNUAL_PRODUCT_ID!,
    name: "Pro",
    billingCycle: "annual" as const,
    credits: 10000,
    projectLimit: null,
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
