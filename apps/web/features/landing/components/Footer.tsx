"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CardboardLogo } from "./icons/CardboardLogo";

export const Footer = () => (
  <motion.footer
    className="relative z-10 w-full border-t border-white/10 bg-black/20 py-20"
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.5 }}
  >
    <div className="mx-auto w-[calc(100vw-3rem)] max-w-[2000px] md:w-[calc(100vw-6rem)] xl:w-[calc(100vw-12rem)]">
      <motion.div
        className="mb-8 grid grid-cols-1 gap-8 px-8 md:grid-cols-5 pb-12"
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Brand */}
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="mb-4 flex items-center gap-3">
            <div className="relative h-6 w-6 md:h-7 md:w-7">
              <CardboardLogo />
            </div>
            <span className="font-landing -ml-px text-lg font-normal tracking-tight text-white">
              Cardboard
            </span>
          </Link>
          <p className="text-sm text-neutral-400 mb-4 max-w-sm">
            The agentic video editor that helps you create stunning content 10x faster.
          </p>
          <div className="flex items-center gap-4">
            <Link href="https://x.com/usecardboard" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </Link>
            <Link href="https://www.linkedin.com/company/cardboardinc" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Product */}
        <div>
          <h4 className="font-medium text-white mb-4">Product</h4>
          <ul className="space-y-3">
            <li>
              <Link href="/pricing" className="text-sm text-neutral-400 hover:text-white transition-colors">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/changelog" className="text-sm text-neutral-400 hover:text-white transition-colors">
                Changelog
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-medium text-white mb-4">Legal</h4>
          <ul className="space-y-3">
            <li>
              <Link href="/privacy" className="text-sm text-neutral-400 hover:text-white transition-colors">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-sm text-neutral-400 hover:text-white transition-colors">
                Terms
              </Link>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-medium text-white mb-4">Company</h4>
          <ul className="space-y-3">
            <li>
              <Link href="mailto:founders@usecardboard.com" className="text-sm text-neutral-400 hover:text-white transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </motion.div>

      <motion.div
        className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.08, duration: 0.45 }}
      >
        <p className="text-sm text-neutral-500">
          © 2026 Cardboard Inc. All rights reserved.
        </p>
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          All systems operational
        </div>
      </motion.div>
    </div>
  </motion.footer>
);
