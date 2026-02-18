"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CardboardLogo } from "./icons/CardboardLogo";

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
            <div className="size-8">
              <CardboardLogo />
            </div>
            <h3 className="font-landing text-xl font-medium tracking-tight text-white">
              Cardboard
            </h3>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-neutral-400">
            The agentic video editor that helps you create stunning content 10x faster.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="https://x.com/usecardboard"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center rounded-full border border-transparent bg-white/5 p-2.5 transition-all hover:scale-105 hover:border-white/5 hover:bg-white/10 active:scale-95"
              aria-label="X (Twitter)"
            >
              <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="size-4 text-neutral-400 transition-colors group-hover:text-white">
                <title>X</title>
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
              </svg>
            </Link>
            <Link
              href="https://www.linkedin.com/company/cardboardinc"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center rounded-full border border-transparent bg-white/5 p-2.5 transition-all hover:scale-105 hover:border-white/5 hover:bg-white/10 active:scale-95"
              aria-label="LinkedIn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-neutral-400 transition-colors group-hover:text-white" aria-hidden="true">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="hidden lg:col-span-2 lg:block" />

        <div className="col-span-1 lg:col-span-2">
          <h4 className="font-landing mb-6 text-sm font-semibold tracking-wide text-white">Product</h4>
          <ul className="space-y-4">
            <li>
              <Link href="/pricing" className="block w-fit text-sm text-neutral-500 transition-colors hover:text-white">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/changelog" className="block w-fit text-sm text-neutral-500 transition-colors hover:text-white">
                Changelog
              </Link>
            </li>
          </ul>
        </div>

        <div className="col-span-1 lg:col-span-2">
          <h4 className="font-landing mb-6 text-sm font-semibold tracking-wide text-white">Legal</h4>
          <ul className="space-y-4">
            <li>
              <Link href="/privacy" className="block w-fit text-sm text-neutral-500 transition-colors hover:text-white">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="block w-fit text-sm text-neutral-500 transition-colors hover:text-white">
                Terms
              </Link>
            </li>
          </ul>
        </div>

        <div className="col-span-1 lg:col-span-2">
          <h4 className="font-landing mb-6 text-sm font-semibold tracking-wide text-white">Company</h4>
          <ul className="space-y-4">
            <li>
              <Link href="mailto:founders@usecardboard.com" className="block w-fit text-sm text-neutral-500 transition-colors hover:text-white">
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
        <p className="text-xs font-medium text-neutral-600">
          © 2026 Cardboard Inc. All rights reserved.
        </p>
        <div className="flex gap-8">
          <span className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/50 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-neutral-400">All systems operational.</span>
          </span>
        </div>
      </motion.div>
    </div>
  </motion.footer>
);
