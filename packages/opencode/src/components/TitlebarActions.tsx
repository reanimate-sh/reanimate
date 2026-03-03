"use client";

import { useEffect, useState } from "react";
import { CircleDot, Settings } from "lucide-react";
import { createPortal } from "react-dom";

type TitlebarActionsProps = {
  onOpenSettings: () => void;
  onOpenModelSelector: () => void;
  selectedModelLabel?: string;
};

export function TitlebarActions({
  onOpenSettings,
  onOpenModelSelector,
  selectedModelLabel,
}: TitlebarActionsProps) {
  const [mounted, setMounted] = useState(false);
  const [container, setContainer] = useState<Element | null>(null);

  useEffect(() => {
    const el = document.getElementById("opencode-titlebar-right");
    setContainer(el);
    setMounted(true);
  }, []);

  if (!mounted || !container) return null;

  return createPortal(
    <div className="flex items-center gap-2">
      {/* Model selector button */}
      <button
        type="button"
        onClick={onOpenModelSelector}
        title="Select model"
        className="flex items-center gap-1.5 rounded border border-zinc-700/70 bg-zinc-900/60 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 transition-colors max-w-[180px]"
      >
        <CircleDot className="h-3 w-3" />
        <span className="truncate">{selectedModelLabel ?? "Select model"}</span>
      </button>

      {/* Settings button */}
      <button
        type="button"
        onClick={onOpenSettings}
        title="Settings"
        className="size-7 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
        aria-label="Open settings"
      >
        <Settings className="h-3.5 w-3.5" />
      </button>
    </div>,
    container,
  );
}
