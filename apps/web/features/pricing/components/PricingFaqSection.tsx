"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { FaqItem } from "../types";

type PricingFaqSectionProps = {
  faqs: FaqItem[];
  openQuestionIndex: number;
  onToggleQuestion: (index: number) => void;
};

export const PricingFaqSection = ({
  faqs,
  openQuestionIndex,
  onToggleQuestion,
}: PricingFaqSectionProps) => (
  <section id="faq" className="mt-32 w-full max-w-[52rem]">
    <div className="mb-12 text-center">
      <h2 className="text-4xl font-normal tracking-tight">Common questions</h2>
    </div>

    <div className="grid gap-7">
      {faqs.map((faq, index) => {
        const isOpen = index === openQuestionIndex;

        return (
          <motion.div
            key={faq.question}
            className="overflow-hidden rounded-3xl border border-white/5 bg-white/2 transition-colors hover:bg-white/3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
          >
            <button
              type="button"
              className="flex w-full cursor-pointer items-start justify-between gap-5 p-7 text-left"
              onClick={() => onToggleQuestion(index)}
              aria-expanded={isOpen}
            >
              <h4 className="flex-1 text-lg font-medium text-white">{faq.question}</h4>
              <ChevronDown
                className={`size-6 shrink-0 text-neutral-400 transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="answer"
                  className="overflow-hidden"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="px-7 pb-7 text-base leading-relaxed text-neutral-400">{faq.answer}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  </section>
);
