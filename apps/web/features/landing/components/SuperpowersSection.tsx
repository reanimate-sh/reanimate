"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { STEPS } from "../data/superpowers";

const COLOR_MAP: Record<string, string> = {
  rose: "bg-rose-500/5",
  emerald: "bg-emerald-500/5",
  blue: "bg-blue-500/5",
  purple: "bg-purple-500/5",
  amber: "bg-amber-500/5",
};

const BORDER_MAP: Record<string, string> = {
  rose: "border-rose-500/10 shadow-rose-500/5",
  emerald: "border-emerald-500/10 shadow-emerald-500/5",
  blue: "border-blue-500/10 shadow-blue-500/5",
  purple: "border-purple-500/10 shadow-purple-500/5",
  amber: "border-amber-500/10 shadow-amber-500/5",
};

const VOICE_PEAKS = [10, 16, 22, 14, 20, 12, 18, 24, 11, 19, 13, 21, 17, 23, 15, 20, 12, 22, 14, 18, 24, 16, 21, 13];

type FeatureCard = {
  key: string;
  color: string;
  icon: React.ReactNode;
  doneLabel: string;
  body: (state: { result: boolean }) => React.ReactNode;
  footer: [string, string];
  position: string;
};

const buildFeatureCards = (): FeatureCard[] => [
  {
    key: "Voiceover",
    color: "purple",
    doneLabel: "Created",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
        <path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/>
      </svg>
    ),
    body: ({ result }) => (
      <div className="flex h-14 w-full items-center justify-center gap-0.5 rounded-lg bg-black/40 px-2 ring-1 ring-white/5">
        {VOICE_PEAKS.map((peak, i) => (
          <div
            key={i}
            className="voiceover-pulse w-1 rounded-full bg-purple-500/40"
            style={
              result
                ? ({
                    "--voice-peak": `${peak}px`,
                    animationDelay: `${i * 50}ms`,
                    animationPlayState: "running",
                  } as React.CSSProperties)
                : {
                    height: "4px",
                    opacity: 0.3,
                    animation: "none",
                  }
            }
          />
        ))}
      </div>
    ),
    footer: ["Narrator_1.wav", "00:12"],
    position: "absolute right-32 bottom-20 z-30",
  },
  {
    key: "Smart Zoom",
    color: "emerald",
    doneLabel: "Focused",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
        <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
      </svg>
    ),
    body: ({ result }) => (
      <div className="relative h-14 w-full overflow-hidden rounded-lg bg-black/40 ring-1 ring-white/5">
        <div className="absolute inset-2 rounded border border-white/10 bg-zinc-900/70" />
        <div
          className="absolute rounded-md border-2 border-emerald-300/80 bg-emerald-500/10 transition-all duration-500"
          style={{
            left: result ? "44%" : "14%",
            top: result ? "10%" : "25%",
            width: result ? "44%" : "72%",
            height: result ? "80%" : "50%",
            boxShadow: result ? "0 0 0 1px rgba(16,185,129,0.35), inset 0 0 20px rgba(16,185,129,0.2)" : "none",
          }}
        />
        <div className="absolute top-1/2 left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-200/90" />
      </div>
    ),
    footer: ["Zoom level", "160%"],
    position: "absolute top-8 left-12 z-10",
  },
  {
    key: "Screen Pan",
    color: "blue",
    doneLabel: "Aligned",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
        <path d="M3 12h18"/><path d="m9 6-6 6 6 6"/><path d="m15 6 6 6-6 6"/>
      </svg>
    ),
    body: ({ result }) => (
      <div className="relative flex h-14 w-full items-center rounded-lg bg-black/40 px-3 ring-1 ring-white/5">
        <div className="absolute left-3 right-3 h-6 rounded-md bg-zinc-800/90" />
        <div className="absolute left-5 flex gap-2 opacity-50">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-3 w-6 rounded-sm bg-zinc-700/70" />
          ))}
        </div>
        <div
          className="absolute top-1/2 h-8 w-16 -translate-y-1/2 rounded-md border border-blue-300/75 bg-blue-500/15 shadow-[0_0_0_1px_rgba(59,130,246,0.35)] transition-all duration-500"
          style={{ left: result ? "64%" : "18%" }}
        />
      </div>
    ),
    footer: ["Viewport X", "+420"],
    position: "absolute bottom-20 left-64 z-20",
  },
  {
    key: "Smart Trim",
    color: "amber",
    doneLabel: "Trimmed",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
        <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>
      </svg>
    ),
    body: ({ result }) => (
      <div className="flex h-14 w-full flex-col justify-center gap-2 rounded-lg bg-black/40 px-3 ring-1 ring-white/5">
        <div className="flex h-1.5 w-full opacity-40">
          <div className="h-full w-full rounded-full bg-amber-500" />
        </div>
        <div className="flex h-1.5 w-full gap-0.5 transition-[width] duration-500" style={{ width: result ? "60%" : "100%" }}>
          <div className="h-full w-full rounded-full bg-amber-500" />
        </div>
      </div>
    ),
    footer: ["Duration", "-14s"],
    position: "absolute top-[-20px] left-1/2 -translate-x-1/2 z-10",
  },
  {
    key: "Click Ripple",
    color: "amber",
    doneLabel: "Triggered",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
        <circle cx="12" cy="12" r="1"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="9"/>
      </svg>
    ),
    body: ({ result }) => (
      <div className="flex h-14 w-full items-center justify-center rounded-lg bg-black/40 px-3 ring-1 ring-white/5">
        <div className="relative h-8 w-8 rounded-full border border-amber-300/70 bg-amber-400/15">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border border-amber-300/70 transition-all duration-500"
              style={{
                transform: result ? `scale(${1 + i * 0.55})` : "scale(0.65)",
                opacity: result ? 0.66 - i * 0.2 : 0,
                transitionDelay: `${i * 120}ms`,
              }}
            />
          ))}
          <div className="absolute top-1/2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-200" />
        </div>
      </div>
    ),
    footer: ["Submit", "ripple"],
    position: "absolute top-0 right-12 z-20",
  },
];

type DescribePhase = "typing" | "sending" | "processing" | "result";

const DescribeChangeCard = () => {
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<DescribePhase>("typing");
  const [typedPrompt, setTypedPrompt] = useState("");
  const step = STEPS[stepIndex];
  const featureCards = buildFeatureCards();

  useEffect(() => {
    if (phase !== "typing") return;

    let chars = 0;
    let sendTimeout: ReturnType<typeof setTimeout> | undefined;

    const timer = setInterval(() => {
      if (chars <= step.prompt.length) {
        setTypedPrompt(step.prompt.slice(0, chars));
        chars += 1;
        return;
      }

      clearInterval(timer);
      sendTimeout = setTimeout(() => setPhase("sending"), 400);
    }, 20);

    return () => {
      clearInterval(timer);
      if (sendTimeout) clearTimeout(sendTimeout);
    };
  }, [phase, step.prompt]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === "sending") {
      timeout = setTimeout(() => setPhase("processing"), 200);
    } else if (phase === "processing") {
      timeout = setTimeout(() => setPhase("result"), 800);
    } else if (phase === "result") {
      timeout = setTimeout(() => {
        setStepIndex((index) => (index + 1) % STEPS.length);
        setTypedPrompt("");
        setPhase("typing");
      }, 2000);
    } else {
      return;
    }

    return () => clearTimeout(timeout);
  }, [phase]);

  return (
    <motion.div
      className="group relative col-span-1 overflow-hidden rounded-xl border border-white/5 bg-zinc-950 p-8 md:col-span-2 md:p-8"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex h-full flex-col">
        <div className="relative z-10 mb-16 flex max-w-3xl flex-row items-start gap-4">
          <div className="mt-1 flex h-6 w-6 items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-zinc-400">
              <path d="M12 20h-1a2 2 0 0 1-2-2 2 2 0 0 1-2 2H6"/>
              <path d="M13 8h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-7"/>
              <path d="M5 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1"/>
              <path d="M6 4h1a2 2 0 0 1 2 2 2 2 0 0 1 2-2h1"/>
              <path d="M9 6v12"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <h3 className="text-xl font-medium tracking-tight text-white">Describe the change</h3>
            <p className="mt-2 text-lg leading-relaxed text-zinc-400">
              Reanimate understands the semantic layout of your app and maps your text prompts to precise screen actions, zooms, and clicks automatically.
            </p>
          </div>
        </div>

        <div className="relative flex grow items-center justify-center py-12">
          <div className="relative h-[450px] w-full max-w-[900px]">
            {/* Prompt box */}
            <div
              className="absolute top-1/2 left-1/2 z-40 w-[360px] -translate-x-1/2 -translate-y-full rounded-2xl border-2 border-white/5 bg-zinc-800/60 backdrop-blur-xl"
              style={{
                boxShadow:
                  phase === "typing"
                    ? "0 2px 12px rgba(0, 0, 0, 0.5)"
                    : "0 10px 40px -10px rgba(0, 0, 0, 0.5)",
                transition: "box-shadow 500ms",
              }}
            >
              <div className="relative flex min-h-[120px] flex-col p-4">
                <div className="relative z-10 w-full text-base leading-relaxed text-neutral-200">
                  <span className="font-medium whitespace-pre-wrap">{typedPrompt}</span>
                  {phase === "typing" && <span className="ml-0.5 inline-block h-5 w-[2px] animate-pulse bg-white align-text-bottom" />}
                </div>
                <div className="absolute right-3 bottom-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
                      typedPrompt ? "bg-white text-black shadow-lg" : "bg-neutral-800 text-neutral-600"
                    }`}
                    style={{
                      transform: phase === "sending" ? "scale(0.9)" : "scale(1)",
                      opacity: phase === "sending" ? 0.8 : 1,
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature cards */}
            {featureCards.map((card) => {
              const isCardActive = step.activeCard === card.key && phase !== "typing";
              const isResult = step.activeCard === card.key && phase === "result";
              const yClass =
                card.key === "Smart Trim"
                  ? (isResult ? "translate-y-0" : "translate-y-2.5")
                  : (isResult ? "-translate-y-2.5" : "translate-y-0");

              return (
                <div
                  key={card.key}
                  className={`w-[260px] rounded-xl border bg-zinc-900 p-4 shadow-xl transition-all duration-500 ${card.position} ${yClass} ${
                    isCardActive
                      ? `scale-100 opacity-100 ${BORDER_MAP[card.color]}`
                      : "scale-95 opacity-30 blur-[1px] border-white/5"
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-md ${COLOR_MAP[card.color]}`}>
                        {card.icon}
                      </div>
                      <span className="text-sm font-medium text-zinc-200">{card.key}</span>
                    </div>
                    {isResult && (
                      <div className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                        {card.doneLabel}
                      </div>
                    )}
                  </div>
                  {card.body({ result: isResult })}
                  <div className="mt-3 flex justify-between font-mono text-[10px] text-zinc-500">
                    <span>{card.footer[0]}</span>
                    <span>{card.footer[1]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CollaborationCard = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      className="group relative col-span-1 overflow-hidden rounded-xl border border-white/5 bg-zinc-950 p-8"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
    >
      <div className="flex h-full flex-col">
        <div className="relative z-10 mb-8 flex flex-row items-start gap-4">
          <div className="mt-1 flex h-6 w-6 items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-zinc-400">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <path d="M16 3.128a4 4 0 0 1 0 7.744"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <h3 className="text-xl font-medium tracking-tight text-white">Live collaboration</h3>
            <p className="mt-2 text-lg leading-relaxed text-zinc-400">Review, tweak, and ship edits together. No back-and-forth.</p>
          </div>
        </div>
        <div className="relative mt-4 flex grow items-center justify-center py-8">
          <div
            className="relative h-64 w-full cursor-none overflow-hidden rounded-lg border border-white/5 bg-zinc-900/50"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onMouseMove={handleMouseMove}
          >
            {/* Timeline bg */}
            <div className="absolute inset-0 flex flex-col justify-center gap-4 px-4 opacity-50">
              <div className="h-12 w-full rounded-md bg-zinc-800/50" />
              <div className="flex gap-2">
                <div className="h-12 w-1/3 rounded-md bg-blue-500/10" />
                <div className="h-12 w-1/4 rounded-md bg-purple-500/10" />
                <div className="h-12 w-1/3 rounded-md bg-emerald-500/10" />
              </div>
              <div className="h-12 w-full rounded-md bg-zinc-800/50" />
            </div>
            {/* Elena selection */}
            <div className="pointer-events-none absolute inset-x-4 top-1/2 h-12 -translate-y-1/2">
              <div className="collab-selection absolute left-0 h-full rounded-md border-2 border-rose-500/50 bg-rose-500/20">
                <div className="absolute -top-3 -right-3 z-20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 fill-rose-500 text-rose-500">
                    <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z"/>
                  </svg>
                  <div className="-mt-2 ml-4 rounded-md bg-rose-500 px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm">Elena</div>
                </div>
              </div>
            </div>
            {/* Bruce cursor */}
            <div className="collab-bruce absolute z-20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 fill-amber-500 text-amber-500">
                <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z"/>
              </svg>
              <div className="-mt-2 ml-4 rounded-md bg-amber-500 px-1.5 py-0.5 text-[10px] font-medium text-black shadow-sm">Bruce</div>
            </div>
            <div className="absolute top-[150px] left-[250px] z-10 scale-0 opacity-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-black shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 fill-black/20">
                  <path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
            </div>
            {/* Toast */}
            <div className="collab-toast absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-zinc-900/90 px-3 py-1.5 shadow-xl backdrop-blur-md">
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">K</div>
              <span className="text-xs text-zinc-200">Elena tightened this cut</span>
            </div>
            {/* You cursor */}
            <div
              className="pointer-events-none absolute z-50 transition-opacity duration-150"
              style={{
                opacity: isHovering ? 1 : 0,
                transform: `translateX(${mousePos.x}px) translateY(${mousePos.y}px)`,
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 fill-white text-white">
                <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z"/>
              </svg>
              <div className="-mt-2 ml-4 rounded-md bg-white px-1.5 py-0.5 text-[10px] font-medium text-black shadow-sm">You</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const VISUAL_EDIT_SUFFIX = " today";

const VISUAL_EDIT_PHASES = [
  { id: "select", label: "Click", hint: "Select element" },
  { id: "text", label: "Edit", hint: "Update text" },
  { id: "drag", label: "Drag", hint: "Reposition layer" },
  { id: "resize", label: "Resize", hint: "Adjust frame" },
] as const;

type VisualEditPhase = (typeof VISUAL_EDIT_PHASES)[number]["id"];

const VISUAL_EDIT_LAYOUT: Record<
  VisualEditPhase,
  {
    x: number;
    y: number;
    width: number;
    height: number;
    cursorX: number;
    cursorY: number;
    panelX: number;
    panelY: number;
    panelW: number;
    panelH: number;
  }
> = {
  select: { x: 10, y: 22, width: 56, height: 38, cursorX: 16, cursorY: 53, panelX: 96, panelY: 58, panelW: 640, panelH: 384 },
  text: { x: 10, y: 22, width: 56, height: 38, cursorX: 33, cursorY: 52, panelX: 96, panelY: 58, panelW: 640, panelH: 384 },
  drag: { x: 24, y: 40, width: 56, height: 38, cursorX: 57, cursorY: 60, panelX: 182, panelY: 104, panelW: 640, panelH: 384 },
  resize: { x: 24, y: 40, width: 66, height: 43, cursorX: 87, cursorY: 83, panelX: 182, panelY: 104, panelW: 780, panelH: 430 },
};

const VisualEditCard = () => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const phase = VISUAL_EDIT_PHASES[phaseIndex];
  const layout = VISUAL_EDIT_LAYOUT[phase.id];

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (phase.id === "text") {
      if (typedChars < VISUAL_EDIT_SUFFIX.length) {
        timeout = setTimeout(() => setTypedChars((chars) => chars + 1), 70);
      } else {
        timeout = setTimeout(() => setPhaseIndex((index) => (index + 1) % VISUAL_EDIT_PHASES.length), 750);
      }
    } else {
      timeout = setTimeout(
        () =>
          setPhaseIndex((index) => {
            const nextIndex = (index + 1) % VISUAL_EDIT_PHASES.length;

            if (VISUAL_EDIT_PHASES[nextIndex].id === "text") {
              setTypedChars(0);
            }

            return nextIndex;
          }),
        phase.id === "select" ? 1000 : 1350,
      );
    }

    return () => clearTimeout(timeout);
  }, [phase.id, typedChars]);

  const editedSuffix =
    phase.id === "select"
      ? ""
      : phase.id === "text"
        ? VISUAL_EDIT_SUFFIX.slice(0, typedChars)
        : VISUAL_EDIT_SUFFIX;

  const controls = [
    { label: "X", value: layout.panelX },
    { label: "Y", value: layout.panelY },
    { label: "W", value: layout.panelW },
    { label: "H", value: layout.panelH },
  ];

  const isSelectedPhase = phase.id === "select" || phase.id === "drag";

  const isCoordinateActive = (label: string) => {
    if (phase.id === "drag") return label === "X" || label === "Y";
    if (phase.id === "resize") return label === "W" || label === "H";
    return false;
  };

  return (
    <motion.div
      className="group relative col-span-1 overflow-hidden rounded-xl border border-white/5 bg-zinc-950 p-8"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
    >
      <div className="flex h-full flex-col">
        <div className="relative z-10 mb-8 flex flex-row items-start gap-4">
          <div className="mt-1 flex h-6 w-6 items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-zinc-400">
              <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <h3 className="text-xl font-medium tracking-tight text-white">Visual edit</h3>
            <p className="mt-2 text-lg leading-relaxed text-zinc-400">Click elements, edit text, drag, and resize with precise control over every frame.</p>
          </div>
        </div>

        <div className="relative mt-4 flex grow flex-col items-center justify-start py-4">
          <div className="w-full max-w-[340px]">
            <div className="mb-4 flex flex-wrap gap-2">
              {VISUAL_EDIT_PHASES.map((item, index) => {
                const isActive = index === phaseIndex;
                const isDone = index < phaseIndex;

                return (
                  <div
                    key={item.id}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-medium tracking-wide transition-all duration-300 ${
                      isActive
                        ? "bg-zinc-100 text-zinc-950"
                        : isDone
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-zinc-900 text-zinc-500"
                    }`}
                  >
                    {item.label}
                  </div>
                );
              })}
            </div>

            <div className="relative h-56 overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50 shadow-xl ring-1 ring-white/5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(56,189,248,0.16),transparent_45%)]" />
              <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:28px_28px]" />
              <div
                className="absolute overflow-visible rounded-lg border bg-zinc-950/90 px-3 py-2"
                style={{
                  left: `${layout.x}%`,
                  top: `${layout.y}%`,
                  width: `${layout.width}%`,
                  height: `${layout.height}%`,
                  borderColor:
                    isSelectedPhase
                      ? "rgba(56,189,248,0.92)"
                      : phase.id === "resize"
                        ? "rgba(251,191,36,0.88)"
                        : "rgba(255,255,255,0.3)",
                  boxShadow:
                    isSelectedPhase
                      ? "0 0 0 1px rgba(56,189,248,0.38), 0 18px 34px -18px rgba(56,189,248,0.82)"
                      : phase.id === "resize"
                        ? "0 0 0 1px rgba(251,191,36,0.34), 0 18px 34px -18px rgba(251,191,36,0.7)"
                        : "0 18px 34px -20px rgba(0,0,0,0.95)",
                  transition:
                    "left 650ms cubic-bezier(0.22,1,0.36,1), top 650ms cubic-bezier(0.22,1,0.36,1), width 650ms cubic-bezier(0.22,1,0.36,1), height 650ms cubic-bezier(0.22,1,0.36,1), border-color 350ms ease, box-shadow 350ms ease",
                }}
              >
                <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">Headline</div>
                <div className="mt-1 text-sm font-medium text-zinc-100">
                  Launch your product{editedSuffix}
                  {phase.id === "text" && <span className="ml-0.5 inline-block h-3.5 w-[1.5px] animate-pulse bg-zinc-300 align-text-bottom" />}
                </div>
                <div className="mt-1.5 h-1.5 w-2/3 rounded-full bg-zinc-700/70" />
                <div className="mt-1 h-1 w-[42%] rounded-full bg-zinc-700/50" />
                {[
                  "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
                  "top-0 right-0 translate-x-1/2 -translate-y-1/2",
                  "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
                  "right-0 bottom-0 translate-x-1/2 translate-y-1/2",
                ].map((handleClass) => (
                  <div
                    key={handleClass}
                    className={`absolute h-3.5 w-3.5 rounded-full border border-amber-200/80 bg-amber-300 shadow-[0_0_0_2px_rgba(24,24,27,0.95),0_6px_14px_-7px_rgba(251,191,36,0.95)] transition-opacity duration-300 ${handleClass}`}
                    style={{ opacity: phase.id === "resize" ? 1 : 0 }}
                  />
                ))}
              </div>
              <div
                className="pointer-events-none absolute z-20 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  left: `${layout.cursorX}%`,
                  top: `${layout.cursorY}%`,
                  transform: "translateX(-50%) translateY(-50%)",
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 fill-white text-white drop-shadow-[0_6px_12px_rgba(0,0,0,0.8)]">
                  <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z"/>
                </svg>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-lg border border-white/10 bg-zinc-950/70 px-3 py-2 backdrop-blur-sm">
              <div className="text-[10px] font-medium tracking-[0.12em] text-zinc-500 uppercase">Coordinates</div>
              <div className="flex items-center gap-1.5 font-mono text-[11px] tabular-nums">
                {controls.map((control, index) => {
                  const isActive = isCoordinateActive(control.label);

                  return (
                    <div key={control.label} className="flex items-center gap-1">
                      {index > 0 && <span className="text-zinc-700">/</span>}
                      <span className={`${isActive ? "text-cyan-200" : "text-zinc-500"}`}>{control.label}</span>
                      <span className={`${isActive ? "text-cyan-100" : "text-zinc-200"}`}>{control.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 text-xs text-zinc-500">Action: {phase.hint}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const SuperpowersSection = () => (
  <section className="relative z-10 mt-24 w-full flex-col items-center py-32">
    <div className="mx-auto w-full max-w-[1400px] px-6 lg:px-8">
      <motion.div
        className="mb-16 flex flex-col items-start justify-start text-left"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.h2
          className="font-landing max-w-4xl text-4xl leading-[1.05] font-medium tracking-tight text-white md:text-7xl"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.03, duration: 0.45 }}
        >
          An editor anyone can use.
        </motion.h2>
        <motion.p
          className="mt-6 max-w-4xl text-lg leading-relaxed text-white/70 font-light"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.45 }}
        >
          Chat your way to stunning motion videos for your app. Simple for beginners, powerful for experts.
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <DescribeChangeCard />
        <CollaborationCard />
        <VisualEditCard />
      </div>
    </div>
  </section>
);
