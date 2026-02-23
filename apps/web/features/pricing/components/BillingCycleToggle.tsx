"use client";

import { motion } from "framer-motion";
import type { BillingCycle } from "../types";

type BillingCycleToggleProps = {
  billingCycle: BillingCycle;
  onChange: (nextCycle: BillingCycle) => void;
};

const tabClassName =
  "relative z-10 cursor-pointer rounded-full px-9 py-3 text-base font-normal transition-all duration-300";

export const BillingCycleToggle = ({ billingCycle, onChange }: BillingCycleToggleProps) => (
  <motion.div
    className="relative flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-2 backdrop-blur-3xl"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.4, delay: 0.08 }}
  >
    <button
      type="button"
      className={`${tabClassName} ${billingCycle === "monthly" ? "text-black" : "text-neutral-400 hover:text-white"}`}
      onClick={() => onChange("monthly")}
    >
      {billingCycle === "monthly" && (
        <motion.div
          layoutId="billing-pill"
          className="absolute inset-0 z-[-1] rounded-full bg-white shadow-xl shadow-white/10"
        />
      )}
      Monthly
    </button>

    <button
      type="button"
      className={`${tabClassName} flex items-center gap-2 ${billingCycle === "annual" ? "text-black" : "text-neutral-400 hover:text-white"}`}
      onClick={() => onChange("annual")}
    >
      {billingCycle === "annual" && (
        <motion.div
          layoutId="billing-pill"
          className="absolute inset-0 z-[-1] rounded-full bg-white shadow-xl shadow-white/10"
        />
      )}
      Annual
      <span
        className={`ml-1 rounded-full px-2.5 py-1 text-xs font-bold tracking-wider uppercase ${
          billingCycle === "annual" ? "bg-black/10 text-black/70" : "bg-white/10 text-neutral-300"
        }`}
      >
        -20%
      </span>
    </button>
  </motion.div>
);
