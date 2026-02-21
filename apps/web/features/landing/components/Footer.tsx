"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ReanimateLogo } from "./icons/ReanimateLogo";
import { SocialLinks } from "./SocialLinks";

export const Footer = () => (
  <motion.footer
    className="w-full border-t border-white/5 bg-black pt-20 pb-10"
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true, margin: "-120px" }}
    transition={{ duration: 0.45 }}
  >
    <div className="mx-auto flex flex-col gap-12 md:gap-16 w-[calc(100%-3rem)] max-w-[2000px] md:w-[calc(100%-6rem)] xl:w-[calc(100%-12rem)]">
      <motion.div
        className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, delay: 0.05 }}
      >
        <div className="col-span-2 flex flex-col gap-6 lg:col-span-4">
          <Link href="/" className="flex w-fit items-center gap-3 transition-opacity hover:opacity-80">
            <div className="size-9">
              <ReanimateLogo />
            </div>
            <h3 className="font-landing text-2xl font-normal tracking-tight text-white">
              Reanimate
            </h3>
          </Link>
          <p className="max-w-xs text-base leading-relaxed font-thin text-white/70">
            Create stunning contents for your app 10x faster.
          </p>
          <SocialLinks
            className="flex items-center gap-4"
            linkClassName="group flex items-center justify-center rounded-full border border-transparent bg-white/5 p-2.5 transition-all hover:scale-105 hover:border-white/5 hover:bg-white/10 active:scale-95"
            iconClassName="size-5 text-neutral-400 transition-colors group-hover:text-white"
          />
        </div>

        <div className="hidden lg:col-span-2 lg:block" />

        <div className="col-span-1 lg:col-span-2">
          <h4 className="font-landing mb-6 font-normal tracking-wide text-white">Product</h4>
          <ul className="space-y-4">
            <li>
              <Link href="/pricing" className="block w-fit font-thin text-neutral-500 transition-colors hover:text-white">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/changelog" className="block w-fit font-thin text-neutral-500 transition-colors hover:text-white">
                Changelog
              </Link>
            </li>
          </ul>
        </div>

        <div className="col-span-1 lg:col-span-2">
          <h4 className="font-landing mb-6 text-base font-normal tracking-wide text-white">Legal</h4>
          <ul className="space-y-4">
            <li>
              <Link href="/privacy" className="block w-fit font-thin text-neutral-500 transition-colors hover:text-white">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="block w-fit font-thin text-neutral-500 transition-colors hover:text-white">
                Terms
              </Link>
            </li>
          </ul>
        </div>

        <div className="col-span-1 lg:col-span-2">
          <h4 className="font-landing mb-6 text-base font-normal tracking-wide text-white">Company</h4>
          <ul className="space-y-4">
            <li>
              <Link href="mailto:contact@reanimate.sh" className="block w-fit font-thin text-neutral-500 transition-colors hover:text-white">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </motion.div>

      <motion.div
        className="flex flex-col items-center justify-between gap-6 border-t border-white/5 pt-8 md:flex-row"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1, duration: 0.45 }}
      >
        <p className="text-sm font-medium text-neutral-600">
          © 2026 Reanimate Inc. All rights reserved.
        </p>
        <div className="flex gap-8">
          <span className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/50 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-sm font-medium text-neutral-400">All systems operational.</span>
          </span>
        </div>
      </motion.div>
    </div>
  </motion.footer>
);
