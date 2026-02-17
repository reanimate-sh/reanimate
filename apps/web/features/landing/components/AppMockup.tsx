"use client";

import Image from "next/image";
import { Geist } from "next/font/google";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const TOTAL_HERO_FRAMES = 120;
const EASE_IN_OUT: [number, number, number, number] = [0.42, 0, 0.58, 1];

const appMockupVariants = {
  hidden: {
    opacity: 0,
    y: 100,
    transformPerspective: 1000,
  },
  visible: {
    opacity: 1,
    y: 0,
    transformPerspective: 1000,
    transition: {
      delay: 0,
      ease: EASE_IN_OUT,
      staggerChildren: 0.4,
      delayChildren: 0.1,
    },
  },
};

const panelVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.9,
    rotateX: -10,
    transformPerspective: 1000,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring" as const,
      stiffness: 60,
      damping: 12,
      mass: 1.1,
      bounce: 0.2,
    },
  },
};

const getHeroFrameSrc = (frame: number) =>
  `https://www.usecardboard.com/marketing/hero/frames_${frame.toString().padStart(5, "0")}.webp`;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const TimelineTrackRow = ({ name }: { name: string }) => (
  <div className="group flex h-12 items-center justify-between border-b border-white/5 bg-black/30 px-3 transition-colors hover:bg-white/5">
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-zinc-300">{name}</span>
    </div>
    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      <button className="inline-flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3.5"
        >
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
      </button>
      <button className="inline-flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3.5"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M3 12h3" />
          <path d="M18 12h3" />
          <path d="M12 3v3" />
          <path d="M12 18v3" />
        </svg>
      </button>
      <button className="inline-flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3.5"
        >
          <path d="M6 18 18 6" />
          <path d="M6 6h12v12" />
        </svg>
      </button>
    </div>
  </div>
);

export type AppMockupProps = {
  loading?: boolean;
  onFramesLoaded?: () => void;
};

export const AppMockup = ({ loading = false, onFramesLoaded }: AppMockupProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const preloadedFramesRef = useRef<HTMLImageElement[]>([]);

  const [frameIndex, setFrameIndex] = useState(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) return 60;
    return 1;
  });
  const [framesReady, setFramesReady] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const adjustedScrollProgress = useTransform(scrollYProgress, (latest) => clamp(latest, 0, 1));

  const playheadLeft = useTransform(adjustedScrollProgress, [0, 0.5], ["-25%", "55%"]);

  useMotionValueEvent(adjustedScrollProgress, "change", (latest) => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return;
    }

    const nextFrame = Math.min(
      Math.max(Math.floor(119 * Math.min(2 * latest, 1)) + 1, 1),
      TOTAL_HERO_FRAMES,
    );

    setFrameIndex((previous) => (previous === nextFrame ? previous : nextFrame));
  });

  useEffect(() => {
    if (window.innerWidth < 768) {
      onFramesLoaded?.();
      return;
    }

    let loadedFrameCount = 0;
    const frames: HTMLImageElement[] = [];

    for (let i = 1; i <= TOTAL_HERO_FRAMES; i += 1) {
      const frame = new window.Image();
      frame.src = getHeroFrameSrc(i);
      frame.onload = () => {
        loadedFrameCount += 1;
        if (loadedFrameCount === TOTAL_HERO_FRAMES) {
          setFramesReady(true);
          onFramesLoaded?.();
        }
      };
      frames.push(frame);
    }

    preloadedFramesRef.current = frames;

    return () => {
      preloadedFramesRef.current = [];
    };
  }, [onFramesLoaded]);

  useEffect(() => {
    if (!framesReady) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const frame = preloadedFramesRef.current[frameIndex - 1];

    if (!canvas || !context || !frame) return;

    canvas.width = frame.naturalWidth;
    canvas.height = frame.naturalHeight;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(frame, 0, 0);
  }, [frameIndex, framesReady]);

  return (
    <motion.div
      ref={containerRef}
      className={`${geist.variable} [--font-sans:var(--font-geist)] relative z-20 flex h-[460px] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/40 font-sans text-xs text-zinc-400 shadow-2xl shadow-black/50 backdrop-blur-xl select-none md:h-[720px]`}
      variants={appMockupVariants}
      initial="hidden"
      animate={loading ? "hidden" : "visible"}
      style={{ perspective: "1200px" }}
    >
      {/* Glass overlay effects */}
      <div className="pointer-events-none absolute inset-0 z-0 rounded-2xl bg-gradient-to-br from-white/[0.08] via-transparent to-white/[0.02]" />
      <div className="pointer-events-none absolute inset-0 z-0 rounded-2xl bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-px z-0 rounded-2xl ring-1 ring-white/5 ring-inset" />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <motion.div
          className="hidden h-full shrink-0 origin-top border-r border-white/10 md:flex"
          variants={panelVariants}
        >
          {/* Icon rail */}
          <div className="flex w-12 flex-col items-center gap-2 border-r border-white/10 bg-black/30 py-2">
            <div className="relative flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-md bg-white/10" />
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10 transition-colors relative z-10 text-white hover:bg-white/10 hover:text-zinc-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                  >
                    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
                  </svg>
                </button>
              </div>
            </div>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10 transition-colors text-zinc-500 hover:bg-white/10 hover:text-zinc-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
              >
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </button>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10 transition-colors text-zinc-500 hover:bg-white/10 hover:text-zinc-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
              >
                <path d="M10 9.17a3 3 0 1 0 0 5.66" />
                <path d="M17 9.17a3 3 0 1 0 0 5.66" />
                <rect x="2" y="5" width="20" height="14" rx="2" />
              </svg>
            </button>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10 transition-colors text-zinc-500 hover:bg-white/10 hover:text-zinc-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
              >
                <path d="m11 7.601-5.994 8.19a1 1 0 0 0 .1 1.298l.817.818a1 1 0 0 0 1.314.087L15.09 12" />
                <path d="M16.5 21.174C15.5 20.5 14.372 20 13 20c-2.058 0-3.928 2.356-6 2-2.072-.356-2.775-3.369-1.5-4.5" />
                <circle cx="16" cy="7" r="5" />
              </svg>
            </button>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10 transition-colors text-zinc-500 hover:bg-white/10 hover:text-zinc-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
              >
                <path d="M12 4v16" />
                <path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2" />
                <path d="M9 20h6" />
              </svg>
            </button>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10 transition-colors text-zinc-500 hover:bg-white/10 hover:text-zinc-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
              >
                <path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" />
                <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
              </svg>
            </button>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10 transition-colors text-zinc-500 hover:bg-white/10 hover:text-zinc-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </button>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10 transition-colors text-zinc-500 hover:bg-white/10 hover:text-zinc-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
              >
                <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>

          {/* Media Library Panel */}
          <div className="flex w-64 flex-col bg-black/30">
            <div className="animate-in fade-in flex h-full flex-col duration-300">
              <div className="space-y-4 px-4 py-5 pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-sans text-[14px] leading-none font-medium text-zinc-100">
                        Media Library
                      </h3>
                      <p className="mt-1.5 font-sans text-[11px] font-medium text-zinc-500">
                        Uploads & Assets
                      </p>
                    </div>
                  </div>
                  <div className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-4"
                    >
                      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
                    </svg>
                  </div>
                </div>
                <div className="h-px w-full bg-white/10" />
              </div>
              <div className="p-4 pb-0">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-zinc-500"
                    >
                      <path d="m21 21-4.34-4.34" />
                      <circle cx="11" cy="11" r="8" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search assets..."
                      className="h-9 w-full rounded-xl border border-white/10 bg-white/5 py-1.5 pr-3 pl-9 text-xs text-zinc-300 placeholder:text-zinc-600 focus:border-white/20 focus:outline-none"
                    />
                  </div>
                  <button className="inline-flex items-center justify-center font-medium rounded-md text-xs h-9 shrink-0 gap-2 bg-white px-3 text-black hover:bg-zinc-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-4"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                    Add
                  </button>
                </div>
              </div>
              <div className="grid flex-1 grid-cols-2 content-start gap-2 overflow-y-auto p-4">
                {[100, 200, 300, 400, 500, 600].map((delay) => (
                  <div
                    key={delay}
                    className="relative aspect-video overflow-hidden rounded-md border border-white/5 bg-zinc-900/50"
                  >
                    <div
                      className="absolute inset-0 animate-pulse bg-white/5"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                    <div
                      className="absolute bottom-1 left-1 h-3 w-8 animate-pulse rounded bg-black/40"
                      style={{ animationDelay: `${delay + 50}ms` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Canvas Area */}
        <div className="relative flex flex-1 origin-center flex-col overflow-hidden bg-black/20">
          <div className="flex min-h-0 flex-1 items-center justify-center p-6">
            <div className="group relative flex aspect-video max-h-full w-full items-center justify-center overflow-hidden rounded-lg border border-white/5 bg-black shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-16 w-16 fill-white/5 text-white/5"
                >
                  <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
                </svg>
              </div>
              {!framesReady && (
                <Image
                  src="/marketing/hero/frames_00001.webp"
                  alt=""
                  className="pointer-events-none absolute inset-0 h-full w-full object-contain select-none"
                  fill
                  draggable={false}
                />
              )}
              {framesReady && (
                <canvas
                  ref={canvasRef}
                  className="pointer-events-none absolute inset-0 h-full w-full object-contain select-none"
                />
              )}
            </div>
          </div>
        </div>

        {/* Right AI Director Panel */}
        <motion.div
          className="hidden w-[340px] shrink-0 origin-top flex-col border-l border-white/10 bg-black/30 xl:flex"
          variants={panelVariants}
        >
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3 w-3 animate-pulse text-white"
                >
                  <path d="M12 18V5" />
                  <path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4" />
                  <path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5" />
                  <path d="M17.997 5.125a4 4 0 0 1 2.526 5.77" />
                  <path d="M18 18a4 4 0 0 0 2-7.464" />
                  <path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517" />
                  <path d="M6 18a4 4 0 0 1-2-7.464" />
                  <path d="M6.003 5.125a4 4 0 0 0-2.526 5.77" />
                </svg>
                <p className="text-white/80">Planning the next cut...</p>
              </div>
            </div>
          </div>
          <div className="p-4 pt-0">
            <div className="relative w-full rounded-lg border border-white/10 bg-black/30 p-2">
              <textarea
                className="min-h-[60px] w-full resize-none bg-transparent p-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none"
                placeholder="What story do you want to tell?"
              />
              <div className="mt-2 flex items-center justify-between px-2 pb-1">
                <div className="flex items-center gap-2">
                  <div className="rounded-md border border-white/5 bg-white/5 p-1 text-xs text-zinc-400">
                    Claude Sonnet 4.5
                  </div>
                </div>
                <button className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-white text-black hover:bg-zinc-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4"
                  >
                    <path d="m5 12 7-7 7 7" />
                    <path d="M12 19V5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="flex h-[160px] shrink-0 origin-bottom flex-col border-t border-white/10 bg-black/30 md:h-[240px]"
        variants={panelVariants}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <div className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-1 rounded-md border border-white/10 p-0.5">
              <button className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-white text-black hover:bg-zinc-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4"
                >
                  <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" />
                </svg>
              </button>
              <button className="hidden h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-white/10 hover:text-zinc-300 md:inline-flex">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  version="1.1"
                  x="0px"
                  y="0px"
                  viewBox="0 0 50 50"
                  enableBackground="new 0 0 50 50"
                  xmlSpace="preserve"
                  className="h-4 w-4"
                >
                  <g>
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      fill="currentColor"
                      d="M43.786,15.879c-0.056,0.398,0.059,0.74,0.344,1.025 c0.515,0.514,1.312,0.514,1.824,0.059l2.224,2.221c0.056,0.059-0.23,0.459-0.684,0.912L19.848,47.455 c-0.455,0.4-0.854,0.686-0.91,0.629l-2.225-2.223c0,0,0.059,0,0.059-0.057c0.515-0.457,0.515-1.311,0-1.766 c-0.284-0.289-0.686-0.457-1.026-0.402l-0.969,0.969c-0.799,0.799-2.052,0.742-2.851,0l-6.612-6.668 c-0.738-0.797-0.738-1.994,0-2.795l1.026-0.908c0-0.4-0.113-0.799-0.398-1.086c-0.514-0.51-1.311-0.51-1.823,0v0.057l-2.281-2.336 c-0.113-0.055,0.229-0.457,0.63-0.914L30.11,2.598c0.455-0.455,0.854-0.738,0.909-0.682l2.281,2.281 c-0.455,0.512-0.455,1.309,0,1.822c0.285,0.283,0.685,0.398,1.082,0.398l0.97-0.971c0.742-0.799,2.053-0.799,2.793,0l6.611,6.67 c0.799,0.742,0.799,2.053,0,2.793L43.786,15.879L43.786,15.879z M9.533,35.715c-0.399,0.342-0.399,0.971,0,1.314l3.361,3.473 c0.399,0.342,1.025,0.342,1.426,0l0,0c0.399-0.398,0.399-1.027,0-1.424l-0.911-0.912l0.911-0.912c1.14,0.57,2.393,0.457,3.19-0.285 c0.799-0.742,0.855-1.996,0.286-3.135l0.968-0.969l0.913,0.969c0.4,0.4,1.026,0.4,1.425,0l0,0c0.398-0.398,0.398-1.027,0-1.426 l-0.912-0.91l3.82-3.822c1.025,0.457,2.278,0.285,3.135-0.568c0.855-0.855,1.083-2.105,0.626-3.191l3.764-3.705l0.91,0.969 c0.4,0.342,1.026,0.342,1.426,0l0,0c0.396-0.4,0.396-1.025,0-1.424l-0.911-0.912l0.854-0.857c1.141,0.574,2.394,0.459,3.192-0.283 c0.798-0.799,0.856-2.051,0.283-3.191l1.026-1.025l0.915,0.969c0.397,0.398,1.023,0.398,1.424,0l0,0c0.341-0.4,0.341-1.025,0-1.426 l-3.423-3.422c-0.396-0.398-1.024-0.398-1.421,0l0,0c-0.4,0.402-0.4,1.027,0,1.426l0.68,0.686l-0.967,0.967 c-1.141-0.625-2.451-0.568-3.248,0.229c-0.855,0.799-0.913,2.111-0.286,3.25l-0.854,0.855l-0.684-0.686 c-0.399-0.398-1.027-0.398-1.427,0l0,0c-0.34,0.346-0.34,0.971,0,1.369l0.686,0.686l-3.876,3.875 c-0.915-0.229-1.997,0-2.737,0.74c-0.742,0.74-0.969,1.766-0.742,2.736l-3.989,3.934l-0.683-0.686 c-0.397-0.398-1.025-0.398-1.425,0l0,0 c-0.341,0.398-0.398,1.025,0,1.424l0.684,0.686L16.03,32.01c-1.143-0.629-2.45-0.57-3.248,0.23 c-0.798,0.797-0.856,2.105-0.286,3.248l-0.911,0.854L10.9,35.715C10.558,35.316,9.876,35.316,9.533,35.715L9.533,35.715z"
                    />
                  </g>
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center gap-1">
            <button className="hidden h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-white/10 hover:text-zinc-200 md:inline-flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
              >
                <path d="M17.971 4.285A2 2 0 0 1 21 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z" />
                <path d="M3 20V4" />
              </svg>
            </button>
            <button className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-white/10 hover:text-zinc-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
              >
                <path d="M13.971 4.285A2 2 0 0 1 17 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z" />
                <path d="M21 20V4" />
              </svg>
            </button>
            <button className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-200 hover:bg-white/10 hover:text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4 fill-current"
              >
                <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
              </svg>
            </button>
            <button className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-white/10 hover:text-zinc-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
              >
                <path d="M10.029 4.285A2 2 0 0 0 7 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z" />
                <path d="M3 4v16" />
              </svg>
            </button>
            <button className="hidden h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-white/10 hover:text-zinc-200 md:inline-flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
              >
                <path d="M21 4v16" />
                <path d="M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z" />
              </svg>
            </button>
          </div>

          <div className="flex flex-1 items-center justify-end gap-4">
            <div className="hidden w-32 items-center gap-2 md:flex">
              <span className="text-xs text-zinc-500">100%</span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-800">
                <div className="h-full w-[40%] rounded-full bg-zinc-500" />
              </div>
            </div>
            <button className="hidden h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-white/10 hover:text-zinc-200 md:inline-flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
              >
                <rect x="5" y="2" width="14" height="20" rx="7" />
                <path d="M12 6v4" />
              </svg>
            </button>
            <button className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-white/10 hover:text-zinc-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
              >
                <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
                <path d="M16 9a5 5 0 0 1 0 6" />
                <path d="M19.364 18.364a9 9 0 0 0 0-12.728" />
              </svg>
            </button>
          </div>
        </div>

        <div className="relative flex flex-1 overflow-hidden">
          <div className="flex w-28 shrink-0 flex-col border-r border-white/10 bg-black/30 md:w-56">
            <div className="flex h-8 shrink-0 items-center justify-center border-b border-white/10 px-2 font-mono text-xs font-medium text-zinc-200">
              00:01:15:00
            </div>
            <div className="overflow-y-auto">
              <TimelineTrackRow name="B-roll" />
              <TimelineTrackRow name="Main" />
              <TimelineTrackRow name="Music" />
            </div>
          </div>

          <div className="relative flex flex-1 flex-col overflow-hidden bg-black/20">
            <div className="flex h-8 shrink-0 items-end border-b border-white/10 px-2">
              <div className="flex flex-1 justify-between pb-1 font-mono text-[10px] text-zinc-600">
                <span>00:00</span>
                <span>00:15</span>
                <span>00:30</span>
                <span>00:45</span>
                <span>01:00</span>
                <span>01:15</span>
              </div>
            </div>

            <div className="relative overflow-y-auto">
              <motion.div
                className="absolute top-0 bottom-0 z-20 flex w-px flex-col items-center bg-white"
                style={{ left: playheadLeft }}
              >
                <div className="-mt-1.5 h-3 w-3 rotate-45 rounded-sm bg-white" />
              </motion.div>

              <div className="relative h-12 border-b border-white/5 px-2">
                <div className="absolute top-0 bottom-0 left-[5%] w-[15%] overflow-hidden rounded-md border border-white/20 bg-white/10">
                  <div className="absolute inset-0 animate-pulse bg-white/5" />
                </div>
              </div>

              <div className="relative h-12 border-b border-white/5 px-2">
                <div className="absolute top-0 bottom-0 left-[20%] z-10 w-[18%] overflow-hidden rounded-md border border-white/40 bg-white/20 ring-1 ring-white/20">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-40"
                    style={{ backgroundImage: `url(${getHeroFrameSrc(9)})` }}
                  />
                </div>
                <div className="absolute top-0 bottom-0 left-[40%] w-[15%] overflow-hidden rounded-md border border-white/20 bg-white/10">
                  <div className="absolute inset-0 animate-pulse bg-white/5" />
                </div>
              </div>

              <div className="relative h-12 border-b border-white/5 px-2">
                <div className="absolute top-px bottom-px left-0 flex w-[55%] items-center overflow-hidden rounded-md border border-white/20 bg-white/10">
                  <div className="flex h-full w-full items-center justify-between gap-px px-2 opacity-30">
                    {Array.from({ length: 120 }).map((_, index) => (
                      <div
                        key={index}
                        className="w-1 shrink-0 rounded-full bg-white/40"
                        style={{
                          height: `${(30 + 40 * Math.abs(Math.sin(index * 15))).toFixed(2)}%`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
