"use client";

import Image from "next/image";
import Link from "next/link";
import { PlayIcon } from "./icons/PlayIcon";
import { ArrowRightIcon } from "./icons/ArrowRightIcon";
import { CustomerLogosSection } from "./CustomerLogosSection";
import { AppMockup } from "./AppMockup";

type HeroSectionProps = {
  onWatchVideo: () => void;
  loading?: boolean;
  onFramesLoaded?: () => void;
};

export const HeroSection = ({
  onWatchVideo,
  loading = false,
  onFramesLoaded,
}: HeroSectionProps) => (
  <section className="relative z-10 flex min-h-screen w-full flex-col items-center justify-start px-4 pt-36 sm:px-6 lg:pt-42">
    {/* Background Video */}
    <div
      className="pointer-events-none absolute top-0 left-1/2 z-0 h-full w-screen -translate-x-1/2 overflow-hidden"
      style={{ opacity: 1 }}
    >
      <video
        autoPlay
        muted
        playsInline
        className="h-full w-full object-cover object-center opacity-40"
      >
        <source src="/videos/hero-720.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
    </div>

    {/* YC Badge */}
    <div className="relative z-10 mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm">
      <span>Backed by</span>
      <Image
        alt="Y Combinator"
        loading="lazy"
        width={120}
        height={24}
        decoding="async"
        className="h-5 w-auto object-contain"
        src="/images/marketing/yc-badge.png"
      />
    </div>

    {/* Hero Heading */}
    <h1 className="font-landing relative z-10 mt-2 flex max-w-md flex-col items-center text-center text-6xl leading-[1.01] font-medium tracking-[-2px] text-white md:max-w-4xl md:text-6xl lg:text-[68px]">
      Edit videos at the{" "}
      <span className="text-neutral-300">speed of thought.</span>
    </h1>

    {/* Hero Subtitle */}
    <p className="relative z-10 mt-6 max-w-3xl text-center text-lg font-normal tracking-[-0.5px] text-white/90 md:text-xl">
      Go from raw footage to a clean, publish-ready edit in minutes.
    </p>

    {/* CTA Buttons */}
    <div className="relative z-10 mt-10 flex flex-col items-center gap-4 sm:flex-row">
      <button
        onClick={onWatchVideo}
        className="group inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-8 py-4 text-base font-medium text-white backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 active:scale-[0.98]"
      >
        <PlayIcon />
        Watch our launch video
      </button>
      <Link
        href="/signup"
        className="group inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-base font-medium text-black transition-all hover:scale-[1.02] hover:bg-white/90 active:scale-[0.98]"
      >
        Start free trial
        <ArrowRightIcon />
      </Link>
    </div>

    {/* App Mockup */}
    <div className="relative z-10 mt-16 w-full max-w-[1400px] px-4 sm:px-6">
      <AppMockup loading={loading} onFramesLoaded={onFramesLoaded} />
    </div>

    <CustomerLogosSection />
  </section>
);
