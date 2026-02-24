"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useState } from "react";
import { useQuery } from "convex/react";
import { Footer } from "@/features/landing/components/Footer";
import { Header } from "@/features/landing/components/Header";
import { api } from "@/lib/convexApi";
import { BillingCycleToggle } from "./components/BillingCycleToggle";
import { PricingFaqSection } from "./components/PricingFaqSection";
import { PricingPlanCard } from "./components/PricingPlanCard";
import { FAQS, PLANS } from "./data";
import type { BillingCycle } from "./types";

const DEFAULT_BILLING_CYCLE: BillingCycle = "annual";
const DEFAULT_OPEN_FAQ_INDEX = 0;

export const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(DEFAULT_BILLING_CYCLE);
  const [openQuestionIndex, setOpenQuestionIndex] = useState(DEFAULT_OPEN_FAQ_INDEX);
  const plans = useQuery(api.plans.getPlans);
  const { scrollY } = useScroll();
  const faqDarkenOpacity = useTransform(scrollY, [0, 560, 920, 1320], [0, 0, 0.28, 0.46]);

  const handleToggleQuestion = (index: number) => {
    setOpenQuestionIndex((currentOpenQuestion) => (currentOpenQuestion === index ? -1 : index));
  };

  return (
    <div className="font-landing relative z-10 flex min-h-screen w-full flex-col items-center bg-black">
      <motion.div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        style={{
          maskImage: "linear-gradient(to bottom, black 100%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 100%, transparent 100%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
      >
        <video autoPlay muted playsInline loop className="h-full w-full object-cover object-center opacity-40">
          <source src="/videos/hero-720.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
      </motion.div>
      <motion.div
        data-testid="pricing-faq-dim"
        className="pointer-events-none fixed inset-0 z-[1] bg-black"
        style={{ opacity: faqDarkenOpacity }}
      />

      <Header />

      <main className="z-10 w-full px-4 pt-32 pb-12">
        <div className="flex w-full flex-col items-center selection:bg-blue-500/30">
          <section className="mt-12 mb-16 flex max-w-5xl flex-col items-center text-center">
            <motion.h1
              className="mb-3 text-5xl leading-[1.1] font-medium tracking-[-2px] sm:text-6xl md:text-8xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45 }}
            >
              Pricing.
            </motion.h1>
            <motion.p
              className="max-w-3xl text-xl font-normal tracking-[-0.5px] text-neutral-400 sm:text-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.05 }}
            >
              Join creators making better videos in less time. 7-day free trial included.
            </motion.p>
          </section>

          <div className="mb-16">
            <BillingCycleToggle billingCycle={billingCycle} onChange={setBillingCycle} />
          </div>

          <div className="grid w-full max-w-[90rem] gap-10 md:grid-cols-2 lg:grid-cols-3">
            {PLANS.map((plan, index) => {
              const entry = plans?.find(
                (p) => p.name === plan.name && p.billing === billingCycle
              );
              return (
                <PricingPlanCard
                  key={plan.name}
                  plan={plan}
                  billingCycle={billingCycle}
                  index={index}
                  productId={entry?.productId}
                />
              );
            })}
          </div>

          {/* <BackedBySection /> */}
          <div className="mt-50" />

          <PricingFaqSection
            faqs={FAQS}
            openQuestionIndex={openQuestionIndex}
            onToggleQuestion={handleToggleQuestion}
          />
        </div>
      </main>

      <div className="relative z-10 w-full">
        <Footer />
      </div>
    </div>
  );
};
