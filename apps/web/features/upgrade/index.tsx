"use client";

import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppBackground } from "@/components/AppBackground";
import { hasActiveSubscription } from "@/features/billing/util";
import { BillingCycleToggle } from "@/features/pricing/components/BillingCycleToggle";
import { PricingPlanCard } from "@/features/pricing/components/PricingPlanCard";
import { PLANS } from "@/features/pricing/data";
import type { BillingCycle } from "@/features/pricing/types";
import { isRecurringPlan } from "@/features/pricing/utils";
import { CAL_BOOKING_URL } from "@/lib/constants";
import { AppHeader } from "@/features/app/components/AppHeader";
import { api } from "@/lib/convexApi";

const DEFAULT_BILLING_CYCLE: BillingCycle = "annual";

export const UpgradePage = () => {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(DEFAULT_BILLING_CYCLE);
  const plans = useQuery(api.plans.getPlans);
  const currentUser = useQuery(api.users.current);
  const hasAccess = hasActiveSubscription(
    currentUser?.subscriptionStatus,
    currentUser?.subscriptionPeriodEnd
  );

  const firstName = useMemo(() => {
    const name = currentUser?.name?.trim();
    if (!name) {
      return "there";
    }
    return name.split(" ")[0] ?? "there";
  }, [currentUser?.name]);

  useEffect(() => {
    if (currentUser === undefined) {
      return;
    }

    if (hasAccess) {
      router.replace("/app/home");
    }
  }, [currentUser, hasAccess, router]);

  if (currentUser === undefined || plans === undefined || hasAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-sm text-white/60">
        Loading available plans...
      </div>
    );
  }

  const hasUsedTrial = Boolean(currentUser?.subscriptionId);
  const welcomeText = hasUsedTrial ? `Welcome back, ${firstName}!` : `Welcome, ${firstName}!`;
  const headlineText = hasUsedTrial ? "Let's get you editing again" : "Let's get you editing";
  const subheadlineText = hasUsedTrial
    ? "Choose a plan to unlock everything and jump back in."
    : "Choose a plan to unlock everything and get started.";

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center overflow-x-hidden bg-[#0a0e18] text-white selection:bg-blue-500/30">
      <AppBackground />
      <AppHeader />

      <main className="relative z-10 w-full px-4 pt-4 pb-12">
        <div className="flex w-full flex-col items-center selection:bg-blue-500/30">
          <motion.div
            className="mt-12 mb-16 flex max-w-5xl flex-col items-center text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <h3 className="font-landing mb-4 text-lg text-white sm:text-xl">
              {welcomeText}
            </h3>
            <h1 className="font-landing mb-6 text-4xl font-medium text-white sm:text-5xl md:text-6xl">
              {headlineText}
            </h1>
            <p className="mb-4 max-w-4xl text-md leading-relaxed font-thin text-neutral-400 sm:text-lg">
              {subheadlineText}
            </p>
          </motion.div>

          <div className="mb-8">
            <BillingCycleToggle billingCycle={billingCycle} onChange={setBillingCycle} />
          </div>

          <section className="grid w-full max-w-[90rem] gap-10 md:grid-cols-2 lg:grid-cols-3">
            {PLANS.map((plan, index) => {
              const entry = plans.find((p) => p.name === plan.name && p.billingCycle === billingCycle);
              const displayPlan = isRecurringPlan(plan)
                ? {
                    ...plan,
                    ctaLabel: hasUsedTrial ? `Choose ${plan.name}` : "Start 7-day trial",
                  }
                : plan;

              return (
                <PricingPlanCard
                  key={plan.name}
                  plan={displayPlan}
                  billingCycle={billingCycle}
                  index={index}
                  productId={entry?.productId}
                  isCurrentPlan={false}
                />
              );
            })}
          </section>

          <p className="mt-24 text-center text-sm text-neutral-400">
            All plans include a 7-day free trial. Credit card required to start.
          </p>
          <div className="mt-2">
            <a
              href="/pricing#faq"
              className="inline-flex items-center gap-1 text-sm text-neutral-300 transition-colors hover:text-white hover:underline"
            >
              Have any questions? Check out our FAQ.
              <ArrowRight className="size-3.5" />
            </a>
          </div>
          <div className="mt-4 mb-12 text-center">
            <h5 className="mb-1 text-sm font-medium text-neutral-400">Need Help?</h5>
            <a
              href={CAL_BOOKING_URL}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-neutral-300 transition-colors hover:text-white hover:underline"
            >
              Book a call.
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};
