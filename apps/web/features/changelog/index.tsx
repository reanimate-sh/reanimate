"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Footer } from "@/features/landing/components/Footer";
import { Header } from "@/features/landing/components/Header";
import { ChangelogEntry } from "./components/ChangelogEntry";
import { CHANGELOG_ENTRIES } from "./data";

export const ChangelogPage = () => {
  const [openHousekeepingVersion, setOpenHousekeepingVersion] = useState<string | null>(null);

  const handleToggleHousekeeping = (version: string) => {
    setOpenHousekeepingVersion((currentVersion) => (currentVersion === version ? null : version));
  };

  return (
    <div className="font-landing relative flex min-h-screen w-full flex-col items-center bg-black">
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

      <Header />

      <main className="z-10 flex-1 w-full max-w-6xl px-4 pt-32 pb-12">
        <div className="mt-12 flex flex-col items-center">
          <h1 className="font-landing mt-2 max-w-4xl text-center text-5xl leading-[1.1] font-medium tracking-[-2px] text-white md:text-6xl lg:text-[64px]">
            Changelog
          </h1>
          <p className="font-landing mt-4 max-w-3xl text-center text-lg font-light tracking-[-0.5px] text-white/70">
            Updates, improvements, and quiet wins.
          </p>

          <div className="mt-12 flex w-full flex-col">
            {CHANGELOG_ENTRIES.map((entry, index) => (
              <motion.div
                key={entry.version}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.015 }}
              >
                {index ? <div className="border-t border-white/30" /> : null}
                <ChangelogEntry
                  entry={entry}
                  isHousekeepingOpen={openHousekeepingVersion === entry.version}
                  onToggleHousekeeping={handleToggleHousekeeping}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <div className="relative z-10 w-full">
        <Footer />
      </div>
    </div>
  );
};
