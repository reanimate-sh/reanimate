"use client";

import { Calendar, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import type { ChangelogEntry as ChangelogEntryType } from "../types";
import { splitChangelogItem } from "../utils";

type ChangelogEntryProps = {
  entry: ChangelogEntryType;
  isHousekeepingOpen: boolean;
  onToggleHousekeeping: (version: string) => void;
};

export const ChangelogEntry = ({
  entry,
  isHousekeepingOpen,
  onToggleHousekeeping,
}: ChangelogEntryProps) => {
  const hasHousekeepingDetails = Boolean(entry.housekeepingDetails?.length);
  const isHousekeepingExpanded = hasHousekeepingDetails && isHousekeepingOpen;

  return (
    <article className="grid grid-cols-1 items-start gap-8 py-12 lg:grid-cols-3 lg:gap-12">
      <div className="lg:sticky lg:top-32 lg:self-start">
        <div className="space-y-4">
          <span className="inline-flex items-center rounded-full border border-neutral-700 bg-black/90 px-5 py-2 font-mono text-base font-medium text-neutral-300">
            {entry.version}
          </span>
          <h2 className="font-landing text-xl leading-tight font-medium tracking-tight text-white md:text-2xl">
            {entry.title}
          </h2>
          <time className="flex w-fit items-center gap-2 rounded-lg border border-neutral-800/50 bg-neutral-900/60 px-3 py-2 font-mono text-base text-neutral-200 backdrop-blur-sm">
            <Calendar className="h-4 w-4 text-neutral-300" aria-hidden="true" />
            {entry.date}
          </time>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="prose prose-invert prose-neutral max-w-none [&>*:first-child]:mt-0">
          {entry.sections.map((section, sectionIndex) => (
            <section key={`${entry.version}-${section.title}`}>
              <h3
                className={`font-landing mb-4 text-2xl font-medium text-neutral-200 ${
                  sectionIndex === 0 ? "mt-0" : "mt-6"
                }`}
              >
                {section.title}
              </h3>
              <ul className="text-md my-4 list-none space-y-3">
                {section.items.map((rawItem) => {
                  const { label, description } = splitChangelogItem(rawItem);

                  return (
                    <li
                      key={`${entry.version}-${section.title}-${rawItem}`}
                      className="font-landing text-md flex gap-2 leading-relaxed text-white/70"
                    >
                      <span className="shrink-0 text-neutral-400">-</span>
                      <span className="flex-1 font-normal">
                        {label && <strong className="text-md font-medium text-white">{label}</strong>}
                        {description ? ` ${description}` : ""}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        {entry.housekeepingLabel && (
          <>
            <button
              type="button"
              onClick={hasHousekeepingDetails ? () => onToggleHousekeeping(entry.version) : undefined}
              aria-expanded={isHousekeepingExpanded}
              data-state={isHousekeepingExpanded ? "open" : "closed"}
              className="group flex items-center gap-2 py-2 text-gray-400 transition-colors hover:text-neutral-200"
            >
              <ChevronRight
                className={`h-6 w-6 transition-transform fill-green ${
                  isHousekeepingExpanded ? "rotate-90" : ""
                }`}
                aria-hidden="true"
              />
              <span className="font-landing text-lg font-medium">{entry.housekeepingLabel}</span>
            </button>

            <motion.div
              initial={false}
              animate={{
                height: isHousekeepingExpanded ? "auto" : 0,
                opacity: isHousekeepingExpanded ? 1 : 0,
              }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="mt-2 overflow-hidden"
            >
              <ul className="space-y-3 pb-2">
                {entry.housekeepingDetails?.map((item) => {
                  const { label, description } = splitChangelogItem(item);

                  return (
                    <li key={`${entry.version}-${item}`} className="font-landing">
                      {label && <p className="text-sm leading-tight font-medium text-white">{label}</p>}
                      <p className="mt-1 text-sm leading-relaxed font-light text-white/70">
                        {description || item}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </>
        )}
      </div>
    </article>
  );
};
