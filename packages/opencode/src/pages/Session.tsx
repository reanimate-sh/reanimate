"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft, EllipsisVertical, List, Plus } from "lucide-react";
import { useOpenCode } from "../context";
import { MessageTimeline } from "./session/MessageTimeline";
import { PromptInput } from "../components/PromptInput";
import type { Session } from "@opencode-ai/sdk/v2/client";

type SessionPageProps = {
  sessionID: string;
  onOpenSession: (sessionID: string) => void;
  isSessionListOpen: boolean;
  onSessionListOpenChange: (open: boolean) => void;
};

export function SessionPage({
  sessionID,
  onOpenSession,
  isSessionListOpen,
  onSessionListOpenChange,
}: SessionPageProps) {
  const { state, actions } = useOpenCode();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [promptHeight, setPromptHeight] = useState(160);
  const [messageLimit, setMessageLimit] = useState(200);
  const [loadingEarlier, setLoadingEarlier] = useState(false);

  // Keep active session in sync
  useEffect(() => {
    if (state.activeSessionID !== sessionID) {
      actions.selectSession(sessionID);
    }
  }, [sessionID, state.activeSessionID, actions]);

  // Track prompt dock height for scroll offset
  const handlePromptHeightChange = useCallback((h: number) => {
    setPromptHeight(h);
  }, []);

  const messageCount = state.messages[sessionID]?.length ?? 0;
  const historyMore = messageCount >= messageLimit;
  const disconnected = state.connection === "disconnected";
  const sessionState = state.sessionStatus[sessionID]?.type;
  const working =
    !disconnected && (sessionState === "busy" || sessionState === "retry");
  const statusClass = disconnected
    ? "bg-rose-400"
    : working
      ? "bg-amber-400 animate-pulse"
      : "bg-emerald-400";
  const statusLabel = disconnected
    ? "Disconnected"
    : working
      ? "Working"
      : "Connected";

  useEffect(() => {
    setMessageLimit(200);
    setLoadingEarlier(false);
  }, [sessionID]);

  const loadEarlier = useCallback(async () => {
    const nextLimit = messageLimit + 200;
    setLoadingEarlier(true);
    setMessageLimit(nextLimit);
    try {
      await actions.loadSessionMessages(sessionID, nextLimit);
    } finally {
      setLoadingEarlier(false);
    }
  }, [actions, messageLimit, sessionID]);

  const createSession = useCallback(async () => {
    const id = await actions.createSession();
    if (!id) return;
    onSessionListOpenChange(false);
    onOpenSession(id);
  }, [actions, onOpenSession, onSessionListOpenChange]);

  const selectSession = useCallback(
    (id: string) => {
      onSessionListOpenChange(false);
      onOpenSession(id);
    },
    [onOpenSession, onSessionListOpenChange],
  );

  return (
    <div className="flex min-w-0 flex-1 flex-col h-full bg-zinc-950 relative overflow-hidden">
      {isSessionListOpen ? (
        <SessionPicker
          activeSessionID={sessionID}
          sessions={state.sessions}
          onSelectSession={selectSession}
          onCreateSession={() => void createSession()}
          onClose={() => onSessionListOpenChange(false)}
        />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="border-b border-zinc-800/70">
            <div className="mx-auto flex w-full items-center justify-between px-4 py-2.5 md:max-w-4xl md:px-6 2xl:max-w-5xl">
              <div className="inline-flex items-center text-xs text-zinc-300">
                <span
                  className={`size-2 rounded-full ${statusClass}`}
                  title={statusLabel}
                  aria-label={`Status: ${statusLabel}`}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onSessionListOpenChange(true)}
                  className="group relative inline-flex items-center justify-center rounded-md p-1.5 text-zinc-200 transition-transform transition-colors duration-150 hover:scale-110 hover:bg-zinc-800/60 hover:text-zinc-100 active:scale-95"
                  aria-label="Open sessions"
                  title="Open sessions"
                >
                  <List className="size-4" />
                  <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-800 px-2 py-1 text-[10px] text-zinc-100 opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                    Sessions
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => void createSession()}
                  className="group relative inline-flex items-center justify-center rounded-md p-1.5 text-zinc-200 transition-transform transition-colors duration-150 hover:scale-110 hover:bg-zinc-800/60 hover:text-zinc-100 active:scale-95"
                  aria-label="New session"
                  title="New session"
                >
                  <Plus className="size-4" />
                  <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-800 px-2 py-1 text-[10px] text-zinc-100 opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                    New session
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div
            className="flex-1 relative min-h-0 overflow-hidden"
            style={
              { "--prompt-height": `${promptHeight}px` } as React.CSSProperties
            }
          >
            <MessageTimeline
              sessionID={sessionID}
              centered
              scrollRef={scrollRef}
              historyMore={historyMore}
              historyLoading={loadingEarlier}
              onLoadEarlier={loadEarlier}
            />

            <PromptInput
              sessionID={sessionID}
              centered
              onHeightChange={handlePromptHeightChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SessionPicker({
  activeSessionID,
  sessions,
  onSelectSession,
  onCreateSession,
  onClose,
}: {
  activeSessionID: string;
  sessions: Session[];
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onClose: () => void;
}) {
  const { actions } = useOpenCode();
  const [query, setQuery] = useState("");
  const [menuSessionID, setMenuSessionID] = useState<string | undefined>();
  const [deleteConfirmSession, setDeleteConfirmSession] = useState<
    Session | undefined
  >();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuSessionID) return;
    const onMouseDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuSessionID(undefined);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuSessionID(undefined);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuSessionID]);

  const visible = sessions
    .slice()
    .sort(
      (a, b) =>
        (b.time.updated ?? b.time.created ?? 0) -
        (a.time.updated ?? a.time.created ?? 0),
    )
    .filter((session) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      const title = (session.title?.trim() || "Untitled session").toLowerCase();
      return title.includes(q);
    });

  return (
    <div className="flex h-full flex-col overflow-hidden bg-zinc-950">
      <div className="mx-auto flex h-full w-full flex-col px-4 md:max-w-4xl 2xl:max-w-5xl">
        <div className="border-b border-zinc-800/70 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="group relative inline-flex items-center justify-center rounded-md p-1.5 text-zinc-200 transition-transform transition-colors duration-150 hover:scale-110 hover:bg-zinc-800/60 hover:text-zinc-100 active:scale-95"
                aria-label="Back to chat"
                title="Back to chat"
              >
                <ArrowLeft className="size-4" />
                <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-800 px-2 py-1 text-[10px] text-zinc-100 opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                  Back to chat
                </span>
              </button>
              <div className="text-sm font-medium text-zinc-100">Sessions</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCreateSession}
                className="group relative inline-flex items-center justify-center rounded-md p-1.5 text-zinc-200 transition-transform transition-colors duration-150 hover:scale-110 hover:bg-zinc-800/60 hover:text-zinc-100 active:scale-95"
                aria-label="New session"
                title="New session"
              >
                <Plus className="size-4" />
                <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-800 px-2 py-1 text-[10px] text-zinc-100 opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                  New session
                </span>
              </button>
            </div>
          </div>
          <div className="mt-3">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search sessions"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-200 outline-none placeholder:text-zinc-500 transition-colors focus:border-zinc-600 focus:bg-zinc-900/70"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-3">
          {visible.length === 0 ? (
            <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/30 px-3 py-8 text-center text-sm text-zinc-500">
              No sessions found.
            </div>
          ) : (
            <div className="space-y-2">
              {visible.map((session) => {
                const title = session.title?.trim() || "Untitled session";
                const timestamp = session.time.updated ?? session.time.created;
                const isActive = session.id === activeSessionID;
                return (
                  <div
                    key={session.id}
                    className={`relative w-full rounded-xl border px-3 py-2.5 transition-colors ${
                      isActive
                        ? "border-zinc-600/80 bg-zinc-900/70"
                        : "border-zinc-800/70 bg-zinc-900/30 hover:border-zinc-700/80 hover:bg-zinc-900/55"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectSession(session.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="truncate text-sm font-medium text-zinc-100">
                            {title}
                          </div>
                          <div className="shrink-0 text-[11px] text-zinc-500">
                            {formatRelative(timestamp)}
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setMenuSessionID((prev) =>
                            prev === session.id ? undefined : session.id,
                          )
                        }
                        className="shrink-0 rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
                        aria-label="Session options"
                      >
                        <EllipsisVertical className="h-3 w-3" />
                      </button>
                    </div>

                    {menuSessionID === session.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-2 top-9 z-20 min-w-[130px] rounded border border-zinc-700 bg-zinc-900 py-1 shadow-xl"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            void actions.archiveSession(session.id);
                            setMenuSessionID(undefined);
                          }}
                          className="w-full px-2.5 py-1 text-left text-xs text-zinc-200 hover:bg-zinc-800"
                        >
                          Archive
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (session.share?.url)
                              void actions.unshareSession(session.id);
                            else void actions.shareSession(session.id);
                            setMenuSessionID(undefined);
                          }}
                          className="w-full px-2.5 py-1 text-left text-xs text-zinc-200 hover:bg-zinc-800"
                        >
                          {session.share?.url ? "Unshare" : "Share"}
                        </button>
                        {session.share?.url && (
                          <button
                            type="button"
                            onClick={() => {
                              void navigator.clipboard.writeText(
                                session.share!.url,
                              );
                              setMenuSessionID(undefined);
                            }}
                            className="w-full px-2.5 py-1 text-left text-xs text-zinc-200 hover:bg-zinc-800"
                          >
                            Copy link
                          </button>
                        )}
                        <div className="my-1 border-t border-zinc-800" />
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteConfirmSession(session);
                            setMenuSessionID(undefined);
                          }}
                          className="w-full px-2.5 py-1 text-left text-xs text-rose-300 hover:bg-zinc-800"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {deleteConfirmSession && (
          <div
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 px-4"
            onMouseDown={(event) => {
              if (event.target !== event.currentTarget) return;
              setDeleteConfirmSession(undefined);
            }}
          >
            <div className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl">
              <div className="px-4 pt-4 pb-2 text-sm font-medium text-zinc-100">
                Delete session?
              </div>
              <div className="px-4 pb-4 text-xs text-zinc-400">
                This action cannot be undone and removes the full conversation.
              </div>
              <div className="flex justify-end gap-2 border-t border-zinc-800 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmSession(undefined)}
                  className="rounded border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void actions.deleteSession(deleteConfirmSession.id);
                    setDeleteConfirmSession(undefined);
                  }}
                  className="rounded border border-rose-500/50 bg-rose-500/20 px-3 py-1.5 text-xs text-rose-100 hover:bg-rose-500/30"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatRelative(timestamp: number | undefined): string {
  if (!timestamp) return "";
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 30) return `${days}d`;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));
}
