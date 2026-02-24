"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Info } from "lucide-react";
import Link from "next/link";
import type { BillingCycle, Plan } from "../types";
import { getPlanPrice, getPlanSecondaryText, isRecurringPlan } from "../utils";
import { CheckoutButton } from "./CheckoutButton";

type PricingPlanCardProps = {
  plan: Plan;
  billingCycle: BillingCycle;
  index: number;
  productId?: string;
};

export const PricingPlanCard = ({ plan, billingCycle, index, productId }: PricingPlanCardProps) => {
  const secondaryText = getPlanSecondaryText(plan, billingCycle);
  const isFeatured = Boolean(plan.isFeatured);
  const usesTeamsAccent = plan.accent === "teams";

  return (
    <motion.div
      className={`group relative flex flex-col overflow-hidden rounded-3xl border p-9 backdrop-blur-sm transition-colors duration-500 ${
        isFeatured
          ? "border-white/20 bg-white/[0.04] shadow-2xl shadow-blue-500/5"
          : "border-white/10 bg-white/[0.02]"
      }`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
    >
      <div
        className={`absolute inset-0 -z-10 bg-gradient-to-br opacity-0 transition-opacity duration-700 group-hover:opacity-100 ${
          usesTeamsAccent ? "from-green-400/10 via-transparent to-transparent" : "from-white/10 via-transparent to-transparent"
        }`}
      />

      <div className="mb-9 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-medium tracking-tight">{plan.name}</h2>
          {isFeatured && (
            <span className="rounded-full bg-neutral-300/20 px-3.5 py-1 text-xs font-bold tracking-widest text-neutral-300 uppercase">
              Recommended
            </span>
          )}
        </div>
        <p className="text-base text-neutral-400">{plan.description}</p>
      </div>

      <div className="mb-9 flex flex-col">
        <div className="flex items-baseline gap-2">
          <span className="text-6xl font-medium tracking-[-1px]">
            <AnimatePresence mode="wait">
              <motion.span
                key={`${plan.name}-${billingCycle}`}
                className={isRecurringPlan(plan) ? "tabular-nums" : ""}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
              >
                {getPlanPrice(plan, billingCycle)}
              </motion.span>
            </AnimatePresence>
          </span>

          {isRecurringPlan(plan) && <span className="text-xl font-normal text-neutral-500 italic">/mo</span>}
        </div>

        <div className="min-h-[24px]">
          <p
            className={`mt-1 text-base text-neutral-500 ${secondaryText ? "opacity-100" : "opacity-0"}`}
            aria-hidden={!secondaryText}
          >
            {secondaryText || " "}
          </p>
        </div>
      </div>

      {productId ? (
        <CheckoutButton
          productId={productId}
          className={`group/btn relative mb-10 flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl py-5 text-base font-medium transition-all duration-300 ${
            isFeatured || usesTeamsAccent
              ? "bg-white text-black hover:bg-neutral-200"
              : "bg-white/10 text-white ring-1 ring-white/10 hover:bg-white/20"
          }`}
        >
          {plan.ctaLabel}
          <ArrowRight className="size-5 transition-transform group-hover/btn:translate-x-1" />
        </CheckoutButton>
      ) : (
        <Link
          href={plan.ctaHref}
          className={`group/btn relative mb-10 flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl py-5 text-base font-medium transition-all duration-300 ${
            isFeatured || usesTeamsAccent
              ? "bg-white text-black hover:bg-neutral-200"
              : "bg-white/10 text-white ring-1 ring-white/10 hover:bg-white/20"
          }`}
        >
          {plan.ctaLabel}
          <ArrowRight className="size-5 transition-transform group-hover/btn:translate-x-1" />
        </Link>
      )}

      <div className="mt-0">
        <p className="mb-7 text-sm font-bold tracking-widest text-neutral-500 uppercase">What&apos;s included</p>
        <ul className="space-y-5">
          {plan.features.map((feature) => (
            <li key={`${plan.name}-${feature.label}`} className="flex items-start gap-4">
              <div
                className={`mt-0.5 flex size-6 items-center justify-center rounded-full ring-1 ${
                  isFeatured
                    ? "bg-neutral-300/10 text-neutral-300 ring-neutral-300/20"
                    : "bg-white/5 text-neutral-400 ring-white/10"
                }`}
              >
                <Check className="size-4" />
              </div>

              <div className="flex flex-1 items-center gap-2.5">
                <span className="text-base font-normal text-neutral-300">{feature.label}</span>
                {feature.hasInfo && (
                  <button
                    type="button"
                    className="flex items-center justify-center text-neutral-400 transition-colors hover:text-neutral-300"
                    aria-label="File size limit information"
                  >
                    <Info className="size-5" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};
