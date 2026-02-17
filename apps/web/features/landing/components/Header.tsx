"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CardboardLogo } from "./icons/CardboardLogo";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const shellClasses = isScrolled
    ? "bg-white/8 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
    : "bg-transparent backdrop-blur-0 shadow-none";

  return (
    <header className="fixed top-4 left-1/2 z-50 flex -translate-x-1/2 items-center justify-between px-4 py-4 w-[calc(100%-3rem)] max-w-[2000px] md:w-[calc(100%-6rem)] xl:w-[calc(100%-12rem)]">
      <div className={`flex items-center gap-8 rounded-lg px-4 py-3 transition-all duration-200 ${shellClasses}`}>
        <Link href="/" className="flex cursor-pointer items-center gap-3">
          <div className="relative h-6 w-6 md:h-7 md:w-7">
            <CardboardLogo />
          </div>
          <span className="font-landing -ml-px hidden text-lg font-normal tracking-tight text-white sm:block">
            Cardboard
          </span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/pricing" className="text-sm text-neutral-200 transition-colors hover:text-white">
            Pricing
          </Link>
          <Link href="/changelog" className="text-sm text-neutral-200 transition-colors hover:text-white">
            Changelog
          </Link>
        </nav>
      </div>
      <div className={`flex items-center rounded-lg px-3 py-3 transition-all duration-200 ${shellClasses}`}>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="text-md inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md border border-white/20 bg-white/5 px-6 py-1.75 font-medium text-white transition-all hover:scale-[1.02] hover:border-white/40 hover:bg-white/10 active:scale-[0.98]"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="text-md inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md bg-white px-6 py-1.75 font-medium text-black transition-all hover:scale-[1.02] hover:bg-white/90 active:scale-[0.98]"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
};
