"use client";

import Image from "next/image";
import Link from "next/link";
import { PlayIcon } from "./icons/PlayIcon";
import { ArrowRightIcon } from "./icons/ArrowRightIcon";

const AppMockup = () => (
  <div className="relative z-20 flex h-[460px] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/40 font-sans text-xs text-zinc-400 shadow-2xl shadow-black/50 backdrop-blur-xl select-none md:h-[720px]" style={{ perspective: "1200px" }}>
    {/* Glass overlay effects */}
    <div className="pointer-events-none absolute inset-0 z-0 rounded-2xl bg-gradient-to-br from-white/[0.08] via-transparent to-white/[0.02]" />
    <div className="pointer-events-none absolute inset-0 z-0 rounded-2xl bg-gradient-to-t from-black/40 via-transparent to-transparent" />
    <div className="pointer-events-none absolute inset-px z-0 rounded-2xl ring-1 ring-white/5 ring-inset" />

    <div className="flex flex-1 overflow-hidden">
      {/* Left Sidebar */}
      <div className="hidden h-full shrink-0 origin-top border-r border-white/10 md:flex">
        {/* Icon rail */}
        <div className="flex w-12 flex-col items-center gap-2 border-r border-white/10 bg-black/30 py-2">
          <div className="relative flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-md bg-white/10" />
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10 transition-colors relative z-10 text-white hover:bg-white/10 hover:text-zinc-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
              </button>
            </div>
          </div>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10 transition-colors text-zinc-500 hover:bg-white/10 hover:text-zinc-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          </button>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10 transition-colors text-zinc-500 hover:bg-white/10 hover:text-zinc-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="M10 9.17a3 3 0 1 0 0 5.66"/><path d="M17 9.17a3 3 0 1 0 0 5.66"/><rect x="2" y="5" width="20" height="14" rx="2"/></svg>
          </button>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10 transition-colors text-zinc-500 hover:bg-white/10 hover:text-zinc-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="m11 7.601-5.994 8.19a1 1 0 0 0 .1 1.298l.817.818a1 1 0 0 0 1.314.087L15.09 12"/><path d="M16.5 21.174C15.5 20.5 14.372 20 13 20c-2.058 0-3.928 2.356-6 2-2.072-.356-2.775-3.369-1.5-4.5"/><circle cx="16" cy="7" r="5"/></svg>
          </button>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10 transition-colors text-zinc-500 hover:bg-white/10 hover:text-zinc-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="M12 4v16"/><path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2"/><path d="M9 20h6"/></svg>
          </button>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10 transition-colors text-zinc-500 hover:bg-white/10 hover:text-zinc-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/></svg>
          </button>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10 transition-colors text-zinc-500 hover:bg-white/10 hover:text-zinc-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
          </button>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10 transition-colors text-zinc-500 hover:bg-white/10 hover:text-zinc-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>

        {/* Media Library Panel */}
        <div className="flex w-64 flex-col bg-black/30">
          <div className="animate-in fade-in flex h-full flex-col duration-300">
            <div className="space-y-4 px-4 py-5 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-sans text-[14px] leading-none font-medium text-zinc-100">Media Library</h3>
                    <p className="mt-1.5 font-sans text-[11px] font-medium text-zinc-500">Uploads & Assets</p>
                  </div>
                </div>
                <div className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
                </div>
              </div>
              <div className="h-px w-full bg-white/10" />
            </div>
            <div className="p-4 pb-0">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-zinc-500"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
                  <input type="text" placeholder="Search assets..." className="h-9 w-full rounded-xl border border-white/10 bg-white/5 py-1.5 pr-3 pl-9 text-xs text-zinc-300 placeholder:text-zinc-600 focus:border-white/20 focus:outline-none" />
                </div>
                <button className="inline-flex items-center justify-center font-medium rounded-md text-xs h-9 shrink-0 gap-2 bg-white px-3 text-black hover:bg-zinc-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  Add
                </button>
              </div>
            </div>
            <div className="grid flex-1 grid-cols-2 content-start gap-2 overflow-y-auto p-4">
              {[100, 200, 300, 400, 500, 600].map((delay) => (
                <div key={delay} className="relative aspect-video overflow-hidden rounded-md border border-white/5 bg-zinc-900/50">
                  <div className="absolute inset-0 animate-pulse bg-white/5" style={{ animationDelay: `${delay}ms` }} />
                  <div className="absolute bottom-1 left-1 h-3 w-8 animate-pulse rounded bg-black/40" style={{ animationDelay: `${delay + 50}ms` }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex flex-1 origin-center flex-col overflow-hidden bg-black/20">
        <div className="flex min-h-0 flex-1 items-center justify-center p-6">
          <div className="group relative flex aspect-video max-h-full w-full items-center justify-center overflow-hidden rounded-lg border border-white/5 bg-black shadow-2xl">
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-16 w-16 fill-white/5 text-white/5"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg>
            </div>
            <Image src="/marketing/hero/frames_00001.webp" alt="" className="pointer-events-none absolute inset-0 h-full w-full object-contain select-none" fill draggable={false} />
          </div>
        </div>
      </div>

      {/* Right AI Director Panel */}
      <div className="hidden w-[340px] shrink-0 origin-top flex-col border-l border-white/10 bg-black/30 xl:flex">
        <div className="relative flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4">
          <h5 className="text-sm font-normal text-zinc-500">Director</h5>
          <div className="flex items-center justify-end gap-2">
            <div className="flex items-center gap-1.5 rounded border border-white/5 bg-white/5 px-2 py-1 text-xs text-zinc-300">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              <span>Ready</span>
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <div className="flex flex-col items-end gap-1">
            <div className="max-w-[90%] rounded-lg border border-transparent bg-zinc-800 p-3">
              <div className="space-y-2">
                <div className="h-2 w-48 animate-pulse rounded bg-white/10" />
                <div className="h-2 w-32 animate-pulse rounded bg-white/10" />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start gap-1">
            <div className="max-w-[90%] rounded-lg bg-transparent p-3 pl-0 text-zinc-300">
              <div className="space-y-2">
                <div className="h-2 w-64 animate-pulse rounded bg-zinc-800" />
                <div className="h-2 w-56 animate-pulse rounded bg-zinc-800" />
                <div className="h-2 w-40 animate-pulse rounded bg-zinc-800" />
              </div>
            </div>
          </div>
          <div className="mt-2 flex flex-col items-start gap-1">
            <div className="flex items-center gap-2 pl-0 text-xs text-zinc-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 animate-pulse text-white"><path d="M12 18V5"/><path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4"/><path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5"/><path d="M17.997 5.125a4 4 0 0 1 2.526 5.77"/><path d="M18 18a4 4 0 0 0 2-7.464"/><path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517"/><path d="M6 18a4 4 0 0 1-2-7.464"/><path d="M6.003 5.125a4 4 0 0 0-2.526 5.77"/></svg>
              <p className="text-white/80">Planning the next cut...</p>
            </div>
          </div>
        </div>
        <div className="p-4 pt-0">
          <div className="relative w-full rounded-lg border border-white/10 bg-black/30 p-2">
            <textarea className="min-h-[60px] w-full resize-none bg-transparent p-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none" placeholder="What story do you want to tell?" />
            <div className="mt-2 flex items-center justify-between px-2 pb-1">
              <div className="flex items-center gap-2">
                <div className="rounded-md border border-white/5 bg-white/5 p-1 text-xs text-zinc-400">Claude Sonnet 4.5</div>
              </div>
              <button className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-white text-black hover:bg-zinc-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

type HeroSectionProps = {
  onWatchVideo: () => void;
};

export const HeroSection = ({ onWatchVideo }: HeroSectionProps) => (
  <section className="relative z-10 flex min-h-screen w-full flex-col items-center justify-start px-4 pt-36 sm:px-6 lg:pt-42">
    {/* Background Video */}
    <div className="pointer-events-none absolute top-0 left-1/2 z-0 h-full w-screen -translate-x-1/2 overflow-hidden" style={{ opacity: 1 }}>
      <video autoPlay muted playsInline className="h-full w-full object-cover object-center opacity-40">
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
      Edit videos at the <span className="text-neutral-300">speed of thought.</span>
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
      <AppMockup />
    </div>
  </section>
);
