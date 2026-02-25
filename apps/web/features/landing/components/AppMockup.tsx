"use client";

import { Geist } from "next/font/google";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUp,
  Captions,
  Folder,
  ImageIcon,
  Mic,
  Music2,
  Palette,
  Play,
  Plus,
  Search,
  Settings,
  WandSparkles,
  Type,
} from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { CAL_BOOKING_URL } from "@/lib/constants";
import { ReanimateLogo } from "./icons/ReanimateLogo";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

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

type SidebarTab =
  | "media"
  | "music"
  | "captions"
  | "voiceover"
  | "text"
  | "effects"
  | "luts"
  | "background"
  | "settings";

type SidebarTabConfig = {
  id: SidebarTab;
  label: string;
  icon: LucideIcon;
};

const SIDEBAR_TABS: SidebarTabConfig[] = [
  { id: "media", label: "Media", icon: Folder },
  { id: "music", label: "Sound", icon: Music2 },
  { id: "captions", label: "Captions", icon: Captions },
  { id: "voiceover", label: "Voiceover", icon: Mic },
  { id: "text", label: "Text", icon: Type },
  { id: "effects", label: "Effects", icon: WandSparkles },
  { id: "luts", label: "Color Grading", icon: Palette },
  { id: "background", label: "Frames", icon: ImageIcon },
  { id: "settings", label: "Settings", icon: Settings },
];

const PANEL_DETAILS: Record<SidebarTab, { title: string; subtitle: string; icon: LucideIcon }> = {
  media: { title: "Media Library", subtitle: "Uploads & Assets", icon: Folder },
  music: { title: "Music Library", subtitle: "Soundtracks & Moods", icon: Music2 },
  captions: { title: "Captions", subtitle: "Auto-transcribe & Edit", icon: Captions },
  voiceover: { title: "Voiceover", subtitle: "AI Speech Synthesis", icon: Mic },
  text: { title: "Typography", subtitle: "Styles & Presets", icon: Type },
  effects: { title: "Effects", subtitle: "Transitions & Motion", icon: WandSparkles },
  luts: { title: "Color Grading", subtitle: "LUTs & Filters", icon: Palette },
  background: { title: "Frames", subtitle: "Canvas Backgrounds", icon: ImageIcon },
  settings: { title: "Settings", subtitle: "Preferences", icon: Settings },
};

const mediaGridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.5 },
  },
};

const mediaItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

const ShimmerText = ({ children, className }: { children: string; className?: string }) => (
  <motion.span
    className={cn(
      "bg-gradient-to-r from-zinc-300 via-white to-zinc-300 bg-clip-text text-transparent",
      className,
    )}
    style={{ backgroundSize: "220% auto" }}
    animate={{ backgroundPosition: ["0% center", "100% center", "0% center"] }}
    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
  >
    {children}
  </motion.span>
);

type ChatMessage = {
  role: "user" | "assistant";
  content: ReactNode;
};

const SidebarIconButton = ({
  tab,
  active,
  onClick,
}: {
  tab: SidebarTabConfig;
  active: boolean;
  onClick: () => void;
}) => {
  const Icon = tab.icon;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative">
        {active && (
          <motion.div
            layoutId="active-tab-indicator"
            className="absolute inset-0 rounded-md bg-white/10"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
      </div>
      <button
        type="button"
        aria-label={tab.label}
        onClick={onClick}
        className={cn(
          "relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-white/10",
          active ? "text-white" : "text-zinc-500 hover:text-zinc-300",
        )}
      >
        <Icon className="size-5" />
      </button>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 5, scale: 0.9 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-full z-50 ml-3 rounded-md border border-white/10 bg-zinc-900/90 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-xl backdrop-blur-md"
          >
            {tab.label}
            <div className="absolute top-1/2 -left-1 -mt-1 h-2 w-2 -rotate-45 border-t border-l border-white/10 bg-zinc-900/90" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LeftPanelContent = ({ activeTab }: { activeTab: SidebarTab }) => {
  const panel = PANEL_DETAILS[activeTab];
  const Icon = panel.icon;

  return (
    <div className="flex w-64 flex-col bg-black/30">
      <div className="animate-in fade-in flex h-full flex-col duration-300">
        <div className="space-y-4 px-4 py-5 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="font-sans text-[14px] leading-none font-semibold text-zinc-100">
                  {panel.title}
                </h3>
                <p className="mt-1.5 font-sans text-[11px] font-medium text-zinc-500">{panel.subtitle}</p>
              </div>
            </div>
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-full",
                activeTab === "settings" ? "bg-zinc-500/10 text-zinc-400" : "bg-white/10 text-white",
              )}
            >
              <Icon className="size-4" />
            </div>
          </div>
          <div className="h-px w-full bg-white/10" />
        </div>

        {activeTab === "media" && (
          <>
            <div className="p-4 pb-0">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search assets..."
                    className="h-9 w-full rounded-xl border border-white/10 bg-white/5 py-1.5 pr-3 pl-9 text-xs text-zinc-300 placeholder:text-zinc-600 focus:border-white/20 focus:ring-1 focus:ring-white/20 focus:outline-none"
                  />
                </div>
                <button className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-white px-3 text-xs font-medium text-black hover:bg-zinc-200">
                  <Plus className="size-4" />
                  Add
                </button>
              </div>
            </div>
            <motion.div
              className="grid flex-1 grid-cols-2 content-start gap-2 overflow-y-auto p-4"
              variants={mediaGridVariants}
              initial="hidden"
              animate="visible"
            >
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <motion.div
                  key={index}
                  className="relative aspect-video overflow-hidden rounded-md border border-white/5 bg-zinc-900/50"
                  variants={mediaItemVariants}
                >
                  <div
                    className="absolute inset-0 animate-pulse bg-white/5"
                    style={{ animationDelay: `${100 * index}ms` }}
                  />
                  <div
                    className="absolute bottom-1 left-1 h-3 w-8 animate-pulse rounded bg-black/40"
                    style={{ animationDelay: `${150 * index}ms` }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </>
        )}

        {activeTab === "music" && (
          <>
            <div className="overflow-hidden px-4 py-4 pb-0">
              <div className="no-scrollbar -mb-2 flex gap-2 overflow-x-auto pb-2">
                {["All", "Cinematic", "Lo-Fi", "Upbeat", "Ambient"].map((genre, index) => (
                  <button
                    key={genre}
                    className={`shrink-0 rounded-full border px-3 py-1 text-[10px] font-medium transition-colors ${
                      index === 0
                        ? "border-white/50 bg-white/10 text-white"
                        : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="no-scrollbar -mr-4 h-full space-y-2 overflow-y-auto p-4 pr-6">
                {[
                  { title: "Neon Nights", artist: "Synthwave Boy", time: "2:14" },
                  { title: "Deep Focus", artist: "Mind State", time: "4:30" },
                  { title: "Epic Rise", artist: "Trailer FX", time: "1:45" },
                  { title: "Chill Hop", artist: "Lofi Beats", time: "3:20" },
                ].map((track) => (
                  <div
                    key={track.title}
                    className="group flex cursor-pointer items-center gap-3 rounded-xl border border-transparent bg-white/5 p-3 transition-all hover:border-white/10 hover:bg-white/10"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-500 group-hover:bg-white group-hover:text-black">
                      <Play className="size-4 fill-current" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium text-zinc-200">{track.title}</div>
                      <div className="truncate text-[10px] text-zinc-500">{track.artist}</div>
                    </div>
                    <div className="text-[10px] font-medium text-zinc-600 group-hover:text-zinc-400">
                      {track.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "captions" && (
          <>
            <div className="px-4 py-4 pb-0">
              <div className="flex w-full rounded-lg bg-white/5 p-1">
                <button className="flex-1 rounded-md bg-white/10 py-1 text-[10px] font-bold text-white shadow-sm">
                  Transcript
                </button>
                <button className="flex-1 rounded-md py-1 text-[10px] font-medium text-zinc-500 hover:text-zinc-300">
                  Styles
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {[
                  { time: "00:00", text: "Welcome to the future of video editing." },
                  { time: "00:04", text: "It's not just about cuts anymore." },
                  { time: "00:08", text: "It's about telling a story." },
                ].map((caption) => (
                  <div key={caption.time} className="group relative rounded-lg border border-transparent pl-4 hover:bg-white/5">
                    <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-zinc-800 group-hover:bg-white/50" />
                    <span className="mb-1 block font-mono text-[9px] text-zinc-600 group-hover:text-zinc-400">
                      {caption.time}
                    </span>
                    <p className="text-xs leading-relaxed text-zinc-300 group-hover:text-white">{caption.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 bg-black/20 p-4">
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-white py-2 text-black hover:bg-zinc-200">
                <span className="text-xs font-bold">Generate Captions</span>
              </button>
            </div>
          </>
        )}

        {activeTab === "voiceover" && (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                      Script
                    </label>
                    <span className="text-[10px] text-zinc-600">0/5000</span>
                  </div>
                  <textarea
                    className="h-32 w-full resize-none rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-zinc-300 placeholder:text-zinc-600 focus:border-white/20 focus:outline-none"
                    placeholder="Type your script here..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                    Voice
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2">
                    <div className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white">
                      <Mic className="size-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-zinc-200">Sarah (Pro)</div>
                      <div className="text-[10px] text-zinc-500">American, Soft, Calm</div>
                    </div>
                    <button className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300">
                      <ArrowUp className="size-4 rotate-90" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 bg-black/20 p-4">
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-white py-2 text-black hover:bg-zinc-200">
                <Mic className="size-4" />
                <span className="text-xs font-bold">Generate Speech</span>
              </button>
            </div>
          </>
        )}

        {activeTab === "text" && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div>
                <label className="mb-3 block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                  Basic
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Heading", "Subheading", "Body", "Caption"].map((item, index) => (
                    <div
                      key={item}
                      className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-4 transition-colors hover:bg-white/10"
                    >
                      <span
                        className={cn(
                          "font-sans text-zinc-200",
                          index === 0 && "text-lg font-bold",
                          index === 1 && "text-base font-semibold",
                          index === 2 && "text-sm font-medium",
                          index === 3 && "text-xs",
                        )}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-3 block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                  Animated
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {["Fade In Title", "Typewriter", "Lower Third"].map((preset) => (
                    <div
                      key={preset}
                      className="group flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:bg-white/10"
                    >
                      <span className="text-xs font-medium text-zinc-300">{preset}</span>
                      <Play className="size-3 fill-current text-white opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "effects" && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-5">
              <div>
                <label className="mb-3 block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                  Video Transitions
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((index) => (
                    <div
                      key={index}
                      className="flex aspect-square cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 transition-colors hover:bg-white/10"
                    >
                      <div className="size-6 rounded bg-gradient-to-br from-white/20 to-zinc-500/20" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-3 block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                  Motion
                </label>
                <div className="space-y-2">
                  {["Dynamic Zoom", "Ken Burns", "Shake"].map((effect) => (
                    <div
                      key={effect}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10"
                    >
                      <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-800 text-white">
                        <WandSparkles className="size-4" />
                      </div>
                      <span className="text-xs font-medium text-zinc-300">{effect}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "luts" && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "Cinematic", color: "from-blue-500/40 to-orange-500/40" },
                { name: "Teal & Orange", color: "from-cyan-500/40 to-orange-600/40" },
                { name: "B&W Noir", color: "from-gray-900/60 to-gray-500/40" },
                { name: "Vintage Warm", color: "from-yellow-500/30 to-red-500/30" },
                { name: "Cyberpunk", color: "from-pink-500/40 to-cyan-500/40" },
                { name: "Forest", color: "from-emerald-500/40 to-green-800/40" },
              ].map((lut) => (
                <div
                  key={lut.name}
                  className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-zinc-900"
                >
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60", lut.color)} />
                  <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
                    <span className="text-[10px] font-medium text-white">{lut.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "background" && (
          <>
            <div className="px-4 py-4 pb-0">
              <div className="flex w-full rounded-lg bg-white/5 p-1">
                <button className="flex-1 rounded-md bg-white/10 py-1 text-[10px] font-bold text-white shadow-sm">
                  Preset
                </button>
                <button className="flex-1 rounded-md py-1 text-[10px] font-medium text-zinc-500 hover:text-zinc-300">
                  Gradient
                </button>
                <button className="flex-1 rounded-md py-1 text-[10px] font-medium text-zinc-500 hover:text-zinc-300">
                  Solid
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((index) => (
                    <div
                      key={index}
                      className="aspect-square cursor-pointer rounded-xl border border-white/10 bg-zinc-800 transition-transform hover:scale-105"
                      style={{
                        background: `linear-gradient(${45 * index}deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 100%)`,
                      }}
                    />
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Padding</label>
                      <span className="font-mono text-[10px] text-zinc-300">12%</span>
                    </div>
                    <div className="h-1 w-full rounded-full bg-white/10">
                      <div className="h-full w-[12%] rounded-full bg-white" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Roundness</label>
                      <span className="font-mono text-[10px] text-zinc-300">24px</span>
                    </div>
                    <div className="h-1 w-full rounded-full bg-white/10">
                      <div className="h-full w-[40%] rounded-full bg-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "settings" && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              <div className="flex w-full rounded-lg bg-white/5 p-1">
                <button className="flex-1 rounded-md bg-white/10 py-1 text-[10px] font-bold text-white shadow-sm">
                  Shortcuts
                </button>
                <button className="flex-1 rounded-md py-1 text-[10px] font-medium text-zinc-500 hover:text-zinc-300">
                  Account
                </button>
              </div>

              {[
                {
                  category: "Timeline",
                  items: [
                    { keybind: "Space", label: "Play/Pause" },
                    { keybind: "S", label: "Split Clip" },
                  ],
                },
                {
                  category: "Tools",
                  items: [
                    { keybind: "V", label: "Select" },
                    { keybind: "C", label: "Cut Mode" },
                  ],
                },
                {
                  category: "Files",
                  items: [
                    { keybind: "Cmd+O", label: "Open" },
                    { keybind: "Cmd+E", label: "Export" },
                  ],
                },
              ].map((section) => (
                <div key={section.category} className="space-y-3">
                  <div className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                    {section.category}
                  </div>
                  <div className="overflow-hidden rounded-xl border border-white/5 bg-white/5">
                    {section.items.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between border-b border-white/5 px-3 py-2 last:border-0"
                      >
                        <span className="text-xs text-zinc-300">{item.label}</span>
                        <kbd className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[10px] font-bold text-zinc-400">
                          {item.keybind}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export type AppMockupProps = Record<string, never>;

export const AppMockup = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>("media");
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const adjustedScrollProgress = useTransform(scrollYProgress, (latest) => clamp(latest, 0, 1));

  const playheadLeft = useTransform(adjustedScrollProgress, [0, 0.5], ["-25%", "55%"]);

  useMotionValueEvent(adjustedScrollProgress, "change", (latest) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    video.currentTime = latest * video.duration;
  });

  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;

    setChatMessages((previous) => [...previous, { role: "user", content: chatInput }]);
    setChatInput("");

    window.setTimeout(() => {
      setChatMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: (
            <>
              Excited to try it out? How about we{" "}
              <a
                href={CAL_BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline underline-offset-2 hover:text-zinc-200"
              >
                hop on a call
              </a>
              ? :)
            </>
          ),
        },
      ]);
    }, 600);
  };

  return (
    <motion.div
      ref={containerRef}
      className={`${geist.variable} [--font-sans:var(--font-geist)] relative z-20 flex h-[460px] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/40 font-sans text-xs text-zinc-400 shadow-2xl shadow-black/50 backdrop-blur-xl select-none md:h-[720px]`}
      variants={appMockupVariants}
      initial="hidden"
      animate="visible"
      style={{ perspective: "1200px" }}
    >
      {/* Glass overlay effects */}
      <div className="pointer-events-none absolute inset-0 z-0 rounded-2xl bg-gradient-to-br from-white/[0.08] via-transparent to-white/[0.02]" />
      <div className="pointer-events-none absolute inset-0 z-0 rounded-2xl bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-px z-0 rounded-2xl ring-1 ring-white/5 ring-inset" />

      <div className="flex flex-1 overflow-hidden">
        <motion.div
          className="hidden h-full shrink-0 origin-top border-r border-white/10 md:flex"
          variants={panelVariants}
        >
          <div className="flex w-12 flex-col items-center gap-2 border-r border-white/10 bg-black/30 py-2">
            {SIDEBAR_TABS.map((tab) => (
              <SidebarIconButton
                key={tab.id}
                tab={tab}
                active={activeSidebarTab === tab.id}
                onClick={() => setActiveSidebarTab(tab.id)}
              />
            ))}
          </div>
          <LeftPanelContent activeTab={activeSidebarTab} />
        </motion.div>

        <motion.div
          className="relative flex flex-1 origin-center flex-col overflow-hidden bg-black/20"
          variants={panelVariants}
        >
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
              <video
                ref={videoRef}
                className="pointer-events-none absolute inset-0 h-full w-full object-contain select-none"
                src="/videos/mockup.mp4"
                muted
                playsInline
                preload="auto"
              />

              <AnimatePresence>
                {showEasterEgg && (
                  <motion.div
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className="relative z-10"
                      initial={{ scale: 0, rotate: -12, opacity: 0 }}
                      animate={{ scale: 1, rotate: 3, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15, mass: 0.8 }}
                    >
                      <motion.div
                        animate={{ rotate: [3, 0, 0] }}
                        transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
                      >
                        <div className="h-16 w-16 drop-shadow-2xl md:h-24 md:w-24">
                          <ReanimateLogo />
                        </div>
                      </motion.div>
                    </motion.div>
                    <motion.div
                      className="mt-4 text-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                    >
                      <p className="text-xl font-medium text-white">Bzz. Nice catch : )</p>
                      <p className="mt-1 text-sm text-white/60">We love people who notice the details.</p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

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
                <Mic className="h-3 w-3 animate-pulse text-white" />
                <ShimmerText className="text-white/80">Planning the next cut...</ShimmerText>
              </div>
            </div>

            {chatMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn("flex flex-col gap-1", message.role === "user" ? "items-end" : "items-start")}
              >
                <div
                  className={cn(
                    "max-w-[90%] rounded-lg p-3 text-sm",
                    message.role === "user"
                      ? "bg-zinc-800 text-zinc-100"
                      : "bg-transparent pl-0 text-zinc-300",
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 pt-0">
            <div className="relative w-full rounded-lg border border-white/10 bg-black/30 p-2">
              <textarea
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" || event.shiftKey) return;
                  event.preventDefault();
                  handleSendChatMessage();
                }}
                className="min-h-[60px] w-full resize-none bg-transparent p-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none"
                placeholder="What story do you want to tell?"
              />
              <div className="mt-2 flex items-center justify-between px-2 pb-1">
                <div className="flex items-center gap-2">
                  <div className="rounded-md border border-white/5 bg-white/5 p-1 text-xs text-zinc-400">
                    Claude Sonnet 4.6
                  </div>
                </div>
                <button
                  onClick={handleSendChatMessage}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-white text-black hover:bg-zinc-200"
                >
                  <ArrowUp className="size-4" />
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
            <button
              onClick={() => {
                if (showEasterEgg) return;
                setShowEasterEgg(true);
                window.setTimeout(() => {
                  setShowEasterEgg(false);
                }, 5000);
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-200 hover:bg-white/10 hover:text-white"
            >
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
                    className="absolute inset-0 bg-cover bg-center opacity-60"
                    style={{ backgroundImage: `url(/images/hero/mockup-roll.png)` }}
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
