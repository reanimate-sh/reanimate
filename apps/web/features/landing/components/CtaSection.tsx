"use client";

import Link from "next/link";
import { ArrowRightIcon } from "./icons/ArrowRightIcon";

export const CtaSection = () => (
  <section className="relative z-10 w-full flex-col items-center py-24 md:py-32">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="font-landing text-5xl md:text-6xl font-medium tracking-tight text-white mb-6">
        Start using Cardboard today.
      </h2>
      <p className="text-lg text-neutral-400 mb-10">
        Pricing starts at <span className="text-white font-medium">$60/month</span>.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/pricing"
          className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white border border-white/20 rounded-lg hover:bg-white/5 transition-all active:scale-[0.98]"
        >
          Explore plans
        </Link>
        <Link
          href="/signup"
          className="group inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-4 text-base font-medium text-black transition-all hover:scale-[1.02] hover:bg-white/90 active:scale-[0.98]"
        >
          Start free trial
          <ArrowRightIcon />
        </Link>
      </div>
    </div>
  </section>
);
