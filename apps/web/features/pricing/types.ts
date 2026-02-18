export type BillingCycle = "monthly" | "annual";

export type PlanFeature = {
  label: string;
  hasInfo?: boolean;
};

type BasePlan = {
  name: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  isFeatured?: boolean;
  accent?: "default" | "teams";
  features: PlanFeature[];
};

export type RecurringPlan = BasePlan & {
  monthlyPrice: number;
  annualPrice: number;
  annualBillingNote?: string;
  customPrice?: never;
  customSubtext?: never;
};

export type CustomPlan = BasePlan & {
  customPrice: string;
  customSubtext: string;
  monthlyPrice?: never;
  annualPrice?: never;
  annualBillingNote?: never;
};

export type Plan = RecurringPlan | CustomPlan;

export type FaqItem = {
  question: string;
  answer: string;
};
