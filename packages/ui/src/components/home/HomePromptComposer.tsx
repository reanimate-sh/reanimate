"use client";

import { ArrowUp } from "lucide-react";
import { type FormEvent, useState } from "react";
import {
  ModelSelector,
  type ModelSelectorValue,
} from "../shared/ModelSelector";

type HomePromptComposerProps = {
  onSubmit?: (input: {
    prompt: string;
    model?: ModelSelectorValue;
  }) => Promise<void> | void;
  isSubmitting?: boolean;
};

export const HomePromptComposer = ({
  onSubmit,
  isSubmitting = false,
}: HomePromptComposerProps) => {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<ModelSelectorValue>();

  const canSubmit = prompt.trim().length > 0 && !isSubmitting;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = prompt.trim();
    if (!value || !onSubmit || isSubmitting) {
      return;
    }

    try {
      await onSubmit({ prompt: value, model });
    } catch {
      return;
    }

    setPrompt("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border border-white/15 bg-black/70 p-2.5 sm:p-3"
    >
      <textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="Ask Reanimate to create a launch video for your app..."
        rows={3}
        className="min-h-[92px] w-full resize-none bg-transparent px-3 py-2 font-thin text-base text-white placeholder:text-white/35 focus:outline-none sm:text-lg"
      />

      <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-1">
        <div className="flex flex-wrap items-center gap-2">
          <ModelSelector value={model} onChange={setModel} />
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
