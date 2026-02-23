import type { BillingCycle, Plan, RecurringPlan } from "./types";

export const isRecurringPlan = (plan: Plan): plan is RecurringPlan =>
  "monthlyPrice" in plan && "annualPrice" in plan;

export const getPlanPrice = (plan: Plan, billingCycle: BillingCycle) => {
  if (!isRecurringPlan(plan)) {
    return plan.customPrice;
  }

  const amount = billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;
  return `$${amount}`;
};

export const getPlanSecondaryText = (plan: Plan, billingCycle: BillingCycle) => {
  if (!isRecurringPlan(plan)) {
    return plan.customSubtext;
  }

  return billingCycle === "annual" ? plan.annualBillingNote ?? "" : plan.monthlyBillingNote ?? "";
};
