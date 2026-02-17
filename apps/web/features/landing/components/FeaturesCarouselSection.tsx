"use client";

import { motion } from "framer-motion";
import { VideoCarousel } from "./VideoCarousel";

export const FeaturesCarouselSection = () => (
  <section className="relative z-10 mt-24 flex w-full flex-col items-center py-24">
    <motion.div
      className="mb-16 w-full max-w-[1400px] px-6 lg:px-8"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="max-w-5xl">
        <h2 className="font-landing text-4xl leading-[1.01] font-medium tracking-[-1.5px] text-white md:text-7xl">
          First cut to final cut. No grind.
        </h2>
        <p className="mt-6 text-lg text-neutral-400">
          Get a strong first pass in minutes, then refine it like a real editor. Tight pacing, clean captions, share-ready exports.
        </p>
      </div>
    </motion.div>
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <VideoCarousel />
    </motion.div>
  </section>
);
