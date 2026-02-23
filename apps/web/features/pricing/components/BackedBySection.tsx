"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export const BackedBySection = () => (
  <motion.div
    className="mt-32 flex flex-col items-center border-t border-white/5 pt-24 text-center"
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="mb-12 text-base font-bold tracking-[0.2em] text-neutral-500 uppercase">Backed by the best</h3>
    <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0">
      <Image src="/images/marketing/yc-badge.png" alt="YC" width={160} height={36} className="h-9 w-auto object-contain" />
    </div>
  </motion.div>
);
