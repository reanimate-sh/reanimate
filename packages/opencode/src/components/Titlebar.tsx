"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  PanelLeft,
  PanelLeftOpen,
} from "lucide-react";
import { useLayout } from "../context/layout";
import { useSettings } from "../context/settings";
import { keybindFor, matchesKeybind } from "../keybind";

type HistoryState = {
  stack: string[];
  index: number;
};

function applyPath(history: HistoryState, current: string): HistoryState {
  if (history.stack[history.index] === current) return history;
  const stack = history.stack.slice(0, history.index + 1);
  stack.push(current);
  return { stack, index: stack.length - 1 };
}

function backPath(
  history: HistoryState,
): { state: HistoryState; to: string } | undefined {
  if (history.index <= 0) return undefined;
  const index = history.index - 1;
  return { state: { ...history, index }, to: history.stack[index]! };
}

function forwardPath(
  history: HistoryState,
): { state: HistoryState; to: string } | undefined {
  if (history.index >= history.stack.length - 1) return undefined;
  const index = history.index + 1;
  return { state: { ...history, index }, to: history.stack[index]! };
}

function editableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return !!target.closest("[contenteditable='true']");
}

type TitlebarProps = {
  currentPath: string;
  onNavigate: (path: string) => void;
};

export function Titlebar({ currentPath, onNavigate }: TitlebarProps) {
  const layout = useLayout();
  const settings = useSettings();
  const [history, setHistory] = useState<HistoryState>({
    stack: [currentPath],
    index: 0,
  });

  // Sync path changes into history
  const syncPath = useCallback((path: string) => {
    setHistory((prev) => applyPath(prev, path));
  }, []);

  useEffect(() => {
    syncPath(currentPath);
  }, [currentPath, syncPath]);

  const canBack = history.index > 0;
  const canForward = history.index < history.stack.length - 1;

  const back = useCallback(() => {
    let target: string | undefined;
    setHistory((previous) => {
      const next = backPath(previous);
      if (!next) return previous;
      target = next.to;
      return next.state;
    });
    if (target) onNavigate(target);
  }, [onNavigate]);

  const forward = useCallback(() => {
    let target: string | undefined;
    setHistory((previous) => {
      const next = forwardPath(previous);
      if (!next) return previous;
      target = next.to;
      return next.state;
    });
    if (target) onNavigate(target);
  }, [onNavigate]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (editableTarget(event.target)) return;
      if (
        matchesKeybind(
          event,
          keybindFor(settings.keybinds.all(), "common.goBack"),
        )
      ) {
        event.preventDefault();
        back();
        return;
      }
      if (
        matchesKeybind(
          event,
          keybindFor(settings.keybinds.all(), "common.goForward"),
        )
      ) {
        event.preventDefault();
        forward();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [back, forward, settings]);

  return (
    <header className="h-10 shrink-0 bg-[var(--background-base,#0c1524)] relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center border-b border-zinc-800/60">
      {/* Left section */}
      <div className="flex items-center pl-2">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={layout.mobileSidebar.toggle}
          className="xl:hidden w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 rounded-md"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="hidden xl:flex items-center gap-2 ml-2">
          {/* Sidebar toggle */}
          <button
            type="button"
            onClick={layout.sidebar.toggle}
            className="size-6 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 rounded"
            aria-label="Toggle sidebar"
            aria-expanded={layout.sidebar.opened()}
          >
            {layout.sidebar.opened() ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
          </button>

          {/* Back/Forward */}
          <button
            type="button"
            onClick={back}
            disabled={!canBack}
            className="size-6 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Go back"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={forward}
            disabled={!canForward}
            className="size-6 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Go forward"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Titlebar left portal slot */}
        <div
          id="opencode-titlebar-left"
          className="flex items-center gap-3 min-w-0 px-2"
        />
      </div>

      {/* Center section */}
      <div className="min-w-0 flex items-center justify-center pointer-events-none lg:absolute lg:inset-0 lg:flex lg:items-center lg:justify-center">
        <div
          id="opencode-titlebar-center"
          className="pointer-events-auto w-full min-w-0 flex justify-center lg:w-fit"
        />
      </div>

      {/* Right section */}
      <div className="flex items-center min-w-0 justify-end pr-4">
        <div
          id="opencode-titlebar-right"
          className="flex items-center gap-3 shrink-0 justify-end"
        />
      </div>
    </header>
  );
}
