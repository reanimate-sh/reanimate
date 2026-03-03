"use client";

import { useMemo, useState } from "react";
import { FolderOpen, FolderPlus, Plus } from "lucide-react";
import { useOpenCode } from "../context";
import type { Session } from "@opencode-ai/sdk/v2/client";

type HomeProps = {
  onOpenSession: (sessionID: string) => void;
  onCreateSession: () => Promise<string | undefined>;
  onOpenDirectory?: () => void;
};

function formatRelative(timestamp: number | undefined): string {
  if (!timestamp) return "";
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));
}

function sessionTitle(session: Session): string {
  const value = session.title?.trim();
  if (value) return value;
  return `Session ${session.id.slice(-6)}`;
}

export function Home({
  onOpenSession,
  onCreateSession,
  onOpenDirectory,
}: HomeProps) {
  const { state, actions } = useOpenCode();
  const [creating, setCreating] = useState(false);

  const recent = useMemo(() => {
    return state.sessions
      .slice()
      .sort(
        (a, b) =>
          (b.time.updated ?? b.time.created ?? 0) -
          (a.time.updated ?? a.time.created ?? 0),
      )
      .slice(0, 10);
  }, [state.sessions]);

  const handleNewSession = async () => {
    setCreating(true);
    try {
      const id = await onCreateSession();
      if (id) onOpenSession(id);
    } finally {
      setCreating(false);
    }
  };

  const hasProjects = state.sessions.length > 0;

  return (
    <div className="mx-auto mt-16 w-full max-w-lg px-4">
      {/* Logo / wordmark */}
      <div className="mb-2 text-2xl font-semibold tracking-tight text-zinc-100">
        opencode
      </div>

      {/* Server / directory info */}
      <div className="mb-8 flex items-center gap-2 text-sm text-zinc-400">
        <span
          className={`size-2 rounded-full shrink-0 ${
            state.connection === "connected"
              ? "bg-emerald-400"
              : state.connection === "disconnected"
                ? "bg-rose-400"
                : "bg-zinc-500"
          }`}
        />
        <span className="truncate font-mono text-xs">
          {state.directory || "No directory"}
        </span>
      </div>

      {hasProjects ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-zinc-200">
              Recent sessions
            </div>
            <div className="flex items-center gap-2">
              {onOpenDirectory && (
                <button
                  type="button"
                  onClick={onOpenDirectory}
                  className="flex items-center gap-1.5 rounded border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
                >
                  <FolderOpen className="h-3 w-3" />
                  Open
                </button>
              )}
              <button
                type="button"
                onClick={() => void handleNewSession()}
                disabled={creating}
                className="flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-900/60 px-2.5 py-1 text-xs text-zinc-200 hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                <Plus className="h-3 w-3" />
                New session
              </button>
            </div>
          </div>

          <ul className="flex flex-col gap-1.5">
            {recent.map((session) => {
              const status = state.sessionStatus[session.id];
              const isBusy = status?.type === "busy";
              return (
                <li key={session.id}>
                  <button
                    type="button"
                    onClick={() => onOpenSession(session.id)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-left hover:border-zinc-700 hover:bg-zinc-900 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1 truncate text-sm text-zinc-100">
                        {sessionTitle(session)}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {isBusy && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-300">
                            <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                            busy
                          </span>
                        )}
                        <span className="text-[11px] text-zinc-500">
                          {formatRelative(
                            session.time.updated ?? session.time.created,
                          )}
                        </span>
                      </div>
                    </div>
                    {session.parentID && (
                      <div className="mt-0.5 text-[11px] text-zinc-500">
                        fork
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/50 text-zinc-400">
            <FolderPlus className="h-5 w-5" />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="text-sm font-medium text-zinc-200">
              No sessions yet
            </div>
            <div className="text-xs text-zinc-500">
              Start a new session to begin
            </div>
          </div>
          <div className="flex gap-2">
            {onOpenDirectory && (
              <button
                type="button"
                onClick={onOpenDirectory}
                className="flex items-center gap-1.5 rounded border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                <FolderOpen className="h-3 w-3" />
                Open project
              </button>
            )}
            <button
              type="button"
              onClick={() => void handleNewSession()}
              disabled={creating}
              className="flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-900/60 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              <Plus className="h-3 w-3" />
              New session
            </button>
          </div>
        </div>
      )}

      {state.lastError && (
        <div className="mt-4 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {state.lastError}
        </div>
      )}
    </div>
  );
}
