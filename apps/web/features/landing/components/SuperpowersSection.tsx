"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { STEPS, SEARCH_STEPS } from "../data/superpowers";

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

const buildFeatureCards = (voicePeaks: number[]): FeatureCard[] => [
  {
    key: "Silence Removal",
    color: "rose",
    doneLabel: "Done",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-400">
        <circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/>
      </svg>
    ),
    body: ({ result }) => (
      <div className="relative flex h-14 w-full items-center overflow-hidden rounded-lg bg-black/40 px-3 ring-1 ring-white/5">
        <div className="absolute top-1/2 right-0 left-0 h-px -translate-y-1/2 bg-zinc-800" />
        <div className="flex w-full items-center justify-between gap-1">
          {[1, 0, 1, 1, 0, 1, 1, 1, 0, 1].map((filled, i) => (
            <div
              key={i}
              className={`h-6 rounded-sm ${filled ? "bg-zinc-700" : "bg-rose-500/20"}`}
              style={{
                width: result ? (filled ? "20%" : "0%") : (filled ? "15%" : "8%"),
                opacity: result && !filled ? 0 : 1,
                marginRight: result && !filled ? "0px" : "2px",
                transition: "width 600ms ease-in-out, opacity 600ms ease-in-out, margin-right 600ms ease-in-out",
              }}
            />
          ))}
        </div>
      </div>
    ),
    footer: ["Track 1 (Audio)", "-4.2s"],
    position: "absolute top-0 right-12 z-20",
  },
  {
    key: "Color Grade",
    color: "emerald",
    doneLabel: "Applied",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
        <path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/>
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
      </svg>
    ),
    body: ({ result }) => (
      <div className="flex h-14 w-full items-center justify-center gap-3 rounded-lg bg-black/40 px-3 ring-1 ring-white/5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="relative h-8 w-8 rounded-full border border-white/10 bg-zinc-800 shadow-inner">
            <div
              className="absolute inset-0 rounded-full transition-all duration-500"
              style={{
                backgroundColor: result ? ["#10b981", "#0ea5e9", "#f59e0b"][i] : "transparent",
                opacity: result ? 0.3 : 0,
              }}
            />
            <div
              className="absolute h-1.5 w-1.5 rounded-full bg-white shadow-sm transition-all duration-500"
              style={{
                top: result ? ["30%", "60%", "40%"][i] : "50%",
                left: result ? ["40%", "70%", "30%"][i] : "50%",
                transform: "translateX(-50%) translateY(-50%)",
              }}
            />
          </div>
        ))}
      </div>
    ),
    footer: ["Matrix_LUT", "100%"],
    position: "absolute top-8 left-12 z-10",
  },
  {
    key: "Captions",
    color: "blue",
    doneLabel: "Generated",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
        <path d="M12 4v16"/><path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2"/><path d="M9 20h6"/>
      </svg>
    ),
    body: ({ result }) => (
      <div className="relative flex h-14 w-full flex-col justify-center gap-1.5 rounded-lg bg-black/40 px-4 py-2 ring-1 ring-white/5">
        {[1, 2].map((t, i) => (
          <div key={t} className="flex items-center gap-2">
            <span className="font-mono text-[8px] text-zinc-600">00:0{t}</span>
            <div className="flex-1">
              <div
                className="h-1.5 rounded-sm bg-zinc-700 transition-all duration-500"
                style={{
                  width: result ? (i === 0 ? "80%" : "60%") : "0%",
                  transitionDelay: `${i * 200}ms`,
                }}
              />
            </div>
          </div>
        ))}
        <div
          className="absolute top-2 left-0 h-6 w-0.5 rounded-r bg-emerald-500 transition-opacity duration-300"
          style={{ opacity: result ? 1 : 0 }}
        />
      </div>
    ),
    footer: ["English (US)", "99% Acc"],
    position: "absolute bottom-20 left-64 z-20",
  },
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
        {voicePeaks.map((peak, i) => (
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
];

type DescribePhase = "typing" | "sending" | "processing" | "result";

const DescribeChangeCard = () => {
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<DescribePhase>("typing");
  const [typedPrompt, setTypedPrompt] = useState("");
  const step = STEPS[stepIndex];
  const featureCards = buildFeatureCards(VOICE_PEAKS);

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
              Reanimate understands the semantic meaning of your request and maps it to complex timeline operations automatically.
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
          <div className="relative h-64 w-full overflow-hidden rounded-lg border border-white/5 bg-zinc-900/50">
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
            {/* Komal selection */}
            <div className="pointer-events-none absolute inset-x-4 top-1/2 h-12 -translate-y-1/2">
              <div className="collab-selection absolute left-0 h-full rounded-md border-2 border-rose-500/50 bg-rose-500/20">
                <div className="absolute -top-3 -right-3 z-20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 fill-rose-500 text-rose-500">
                    <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z"/>
                  </svg>
                  <div className="-mt-2 ml-4 rounded-md bg-rose-500 px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm">Komal</div>
                </div>
              </div>
            </div>
            {/* Alex cursor */}
            <div className="collab-alex absolute z-20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 fill-amber-500 text-amber-500">
                <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z"/>
              </svg>
              <div className="-mt-2 ml-4 rounded-md bg-amber-500 px-1.5 py-0.5 text-[10px] font-medium text-black shadow-sm">Alex</div>
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
              <span className="text-xs text-zinc-200">Komal tightened this cut</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SEARCH_IDLE_RESULTS = [
  { name: "IMG_4829.mov", time: "02:14" },
  { name: "IMG_4830.mov", time: "04:12" },
  { name: "IMG_4831.mov", time: "01:05" },
];

type SearchPhase = "idle" | "typing" | "results";

const FindAnythingCard = () => {
  const [searchIndex, setSearchIndex] = useState(0);
  const [phase, setPhase] = useState<SearchPhase>("idle");
  const [typedChars, setTypedChars] = useState(0);
  const searchStep = SEARCH_STEPS[searchIndex];

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === "idle") {
      timeout = setTimeout(() => setPhase("typing"), 900);
    } else if (phase === "typing") {
      if (typedChars < searchStep.query.length) {
        timeout = setTimeout(() => setTypedChars((chars) => chars + 1), 70);
      } else {
        timeout = setTimeout(() => setPhase("results"), 450);
      }
    } else {
      timeout = setTimeout(() => {
        setTypedChars(0);
        setPhase("idle");
        setSearchIndex((index) => (index + 1) % SEARCH_STEPS.length);
      }, 1700);
    }

    return () => clearTimeout(timeout);
  }, [phase, typedChars, searchStep.query.length]);

  const visibleQuery = phase === "idle" ? "Find anything..." : searchStep.query.slice(0, typedChars);
  const visibleResults = phase === "results" ? searchStep.results : SEARCH_IDLE_RESULTS;
  const activeResult = phase === "results" ? searchStep.activeResult : -1;

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
              <path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <h3 className="text-xl font-medium tracking-tight text-white">Find anything</h3>
            <p className="mt-2 text-lg leading-relaxed text-zinc-400">Search clips by what happened. Not filenames.</p>
          </div>
        </div>
        <div className="relative mt-4 flex grow flex-col items-center justify-start py-4">
          <div className="w-full max-w-[340px]">
            {/* Search box */}
            <div className="relative mb-4 flex h-12 items-center rounded-xl border border-white/5 bg-zinc-900 shadow-xl ring-1 ring-white/5 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`mr-3 ml-4 h-4 w-4 transition-colors ${phase === "idle" ? "text-zinc-400" : "text-zinc-100"}`}>
                <path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>
              </svg>
              <div className="relative flex-1 overflow-hidden text-sm text-zinc-300">
                <div className={`font-medium ${phase === "idle" ? "text-zinc-500" : "text-zinc-100"}`}>
                  {visibleQuery}
                  <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-zinc-400 align-text-bottom" />
                </div>
              </div>
            </div>
            {/* Results */}
            <div className="relative space-y-2">
              {visibleResults.map((result, i) => {
                const isActive = i === activeResult;
                const rowStyle = isActive
                  ? {
                      opacity: 1,
                      backgroundColor: "rgba(255,255,255,0.08)",
                      borderColor: "rgba(255,255,255,0.1)",
                    }
                  : phase === "results"
                    ? {
                        opacity: 0.2,
                        backgroundColor: "rgba(39,39,42,0.2)",
                        borderColor: "rgba(255,255,255,0.02)",
                      }
                    : {
                        opacity: 0.4,
                        backgroundColor: "rgba(39,39,42,0.2)",
                        borderColor: "rgba(255,255,255,0.05)",
                      };

                return (
                  <div
                    key={`${searchIndex}-${phase}-${result.name}`}
                    className="flex items-center gap-3 rounded-lg border border-white/5 bg-zinc-800/20 p-3 transition-all duration-500"
                    style={rowStyle}
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-md ${isActive ? "bg-zinc-100" : "bg-zinc-800 ring-1 ring-white/5"}`}>
                      {isActive ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-zinc-900"><path d="M20 6 9 17l-5-5"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-zinc-600">
                          <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/>
                          <path d="M14 2v5a1 1 0 0 0 1 1h5"/>
                          <path d="M15.033 13.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56v-4.704a.645.645 0 0 1 .967-.56z"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className={`text-sm font-medium transition-colors ${isActive ? "text-zinc-100" : "text-zinc-500"}`}>{result.name}</div>
                      <div className={`text-xs ${isActive ? "text-zinc-400" : "text-zinc-700"}`}>{result.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
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
        <FindAnythingCard />
      </div>
    </div>
  </section>
);
