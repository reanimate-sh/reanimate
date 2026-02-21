"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import { ReanimateLogo } from "./icons/ReanimateLogo";

type HeaderProps = {
  showLogo?: boolean;
};

export const Header = ({ showLogo = true }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const nextScrolledState = latest > 60;
    if (nextScrolledState !== isScrolled) {
      setIsScrolled(nextScrolledState);
    }
  });

  const shellStyles = {
    backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0)",
    backdropFilter: isScrolled ? "blur(16px)" : "blur(0px)",
    boxShadow: isScrolled
      ? "0 0 0 1px rgba(255, 255, 255, 0.1), 0 8px 32px -8px rgba(0, 0, 0, 0.3)"
      : "none",
  };

  const shouldUseSharedLayoutLogo = pathname === "/";

  return (
    <motion.header
      className="fixed top-4 left-1/2 z-50 flex -translate-x-1/2 items-center justify-between px-4 py-4 w-[calc(100%-3rem)] max-w-[2000px] md:w-[calc(100%-6rem)] xl:w-[calc(100%-12rem)]"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: showLogo ? 1 : 0, pointerEvents: showLogo ? "auto" : "none" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <motion.div
        className="flex items-center gap-8 rounded-lg px-4 py-3"
        animate={shellStyles}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Link href="/" className="flex cursor-pointer items-center gap-3">
          {showLogo && (
            <motion.div
              layoutId={shouldUseSharedLayoutLogo ? "brand-logo" : undefined}
              className="relative h-6 w-6 md:h-7 md:w-7"
            >
              <ReanimateLogo />
            </motion.div>
          )}
          <span className="font-landing -ml-px hidden text-xl font-thin tracking-tight text-white sm:block">
            Reanimate
          </span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/pricing" className="font-thin text-md text-neutral-200 transition-colors hover:text-white">
            Pricing
          </Link>
          <Link href="/changelog" className="font-thin text-md text-neutral-200 transition-colors hover:text-white">
            Changelog
          </Link>
        </nav>
      </motion.div>
      <motion.div
        className="flex items-center rounded-lg px-3 py-3"
        animate={shellStyles}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="text-lg inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md border border-white/20 bg-white/5 px-6 py-1.75 font-medium text-white transition-all hover:scale-[1.02] hover:border-white/40 hover:bg-white/10 active:scale-[0.98]"
          >
            Login
          </Link>
          <Link
            href="/waitlist"
            className="text-lg inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md bg-white px-6 py-1.75 font-medium text-black transition-all hover:scale-[1.02] hover:bg-white/90 active:scale-[0.98]"
          >
            Join waitlist
          </Link>
        </div>
      </motion.div>
    </motion.header>
  );
};
