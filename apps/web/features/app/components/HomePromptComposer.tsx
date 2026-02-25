"use client";

import { ArrowUp, ChevronDown, Sparkles } from "lucide-react";
import { type FormEvent, useState } from "react";

const MODEL_OPTIONS = [
  { value: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
  { value: "gpt-5", label: "GPT-5" },
  { value: "gemini-2-5-pro", label: "Gemini 2.5 Pro" },
];

export const HomePromptComposer = () => {
  const [prompt, setPrompt] = useState("");
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [model, setModel] = useState(MODEL_OPTIONS[0].value);

  const canSubmit = prompt.trim().length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-[28px] border border-white/10 bg-black/55 p-2.5 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-3"
    >
      <textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="What would you like to edit today?"
        rows={3}
        className="min-h-[92px] w-full resize-none bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none sm:text-base"
      />

      <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-1">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAutoMode((value) => !value)}
            className={`inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors ${
              isAutoMode
                ? "border-white/20 bg-white/10 text-white"
                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            <Sparkles className="size-3.5" />
            Auto
          </button>

          <div className="relative">
            <select
              value={model}
              onChange={(event) => setModel(event.target.value)}
              className="h-7 appearance-none rounded-full border border-white/10 bg-white/5 py-0 pr-8 pl-3 text-xs font-medium text-white/85 transition-colors hover:bg-white/10 focus:border-white/25 focus:outline-none"
            >
              {MODEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-[#0a0e18] text-white">
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-white/60" />
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex size-8 items-center justify-center rounded-full bg-white text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/45"
        >
          <ArrowUp className="size-4" />
        </button>
      </div>
    </form>
  );
};
