"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { useOpenCode } from "../context";
import { useSettings } from "../context/settings";
import { DialogSettings } from "../components/dialogs/DialogSettings";
import { DialogSelectModel } from "../components/dialogs/DialogSelectModel";
import { Home } from "./Home";
import { SessionPage } from "./Session";
import { keybindFor, matchesKeybind } from "../keybind";

type View = { type: "home" } | { type: "session"; sessionID: string };

type LayoutProps = {
  className?: string;
};

export function Layout({ className }: LayoutProps) {
  const { state, actions } = useOpenCode();
  const settings = useSettings();
  const [view, setView] = useState<View>({ type: "home" });
  const [isSessionListOpen, setSessionListOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);

  // Sync initial active session into view
  useEffect(() => {
    if (state.status !== "ready") return;
    if (view.type === "home" && state.activeSessionID) {
      setView({ type: "session", sessionID: state.activeSessionID });
    }
  }, [state.status, state.activeSessionID, view.type]);

  // Keep session view valid after archive/delete/state refresh
  useEffect(() => {
    if (state.status !== "ready") return;
    if (view.type !== "session") return;
    const exists = state.sessions.some((entry) => entry.id === view.sessionID);
    if (exists) return;
    if (state.activeSessionID) {
      setView({ type: "session", sessionID: state.activeSessionID });
      return;
    }
    setView({ type: "home" });
  }, [
    state.activeSessionID,
    state.sessions,
    state.status,
    view.type,
    view.type === "session" ? view.sessionID : "",
  ]);

  // Navigate to a session
  const navigateToSession = useCallback(
    (sessionID: string) => {
      actions.selectSession(sessionID);
      setView({ type: "session", sessionID });
      setSessionListOpen(false);
    },
    [actions],
  );

  // Navigate home
  const navigateHome = useCallback(() => {
    setView({ type: "home" });
    setSessionListOpen(false);
  }, []);

  // Create session and navigate to it
  const handleCreateSession = useCallback(async () => {
    const id = await actions.createSession();
    if (id) navigateToSession(id);
    return id;
  }, [actions, navigateToSession]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (state.status !== "ready") return;
      if (isEditableTarget(event.target)) return;

      const key = event.key.toLowerCase();

      if (
        matchesKeybind(
          event,
          keybindFor(settings.keybinds.all(), "session.new"),
        )
      ) {
        event.preventDefault();
        void handleCreateSession();
        return;
      }

      if (
        view.type === "session" &&
        matchesKeybind(
          event,
          keybindFor(settings.keybinds.all(), "session.close"),
        )
      ) {
        event.preventDefault();
        navigateHome();
        return;
      }

      if (
        matchesKeybind(
          event,
          keybindFor(settings.keybinds.all(), "settings.open"),
        )
      ) {
        event.preventDefault();
        setSettingsOpen(true);
        return;
      }

      if (
        matchesKeybind(
          event,
          keybindFor(settings.keybinds.all(), "model.select"),
        )
      ) {
        event.preventDefault();
        setModelSelectorOpen(true);
        return;
      }

      if (
        view.type === "session" &&
        state.sessionStatus[view.sessionID]?.type === "busy" &&
        matchesKeybind(
          event,
          keybindFor(settings.keybinds.all(), "session.abort"),
        )
      ) {
        event.preventDefault();
        void actions.abortActiveSession();
        return;
      }

      const mod = event.metaKey || event.ctrlKey;
      if (!event.altKey || event.shiftKey || mod) return;
      if (key !== "arrowup" && key !== "arrowdown") return;

      const sessions = state.sessions
        .filter((entry) => !entry.parentID)
        .slice()
        .sort(
          (a, b) =>
            (b.time.updated ?? b.time.created ?? 0) -
            (a.time.updated ?? a.time.created ?? 0),
        );
      if (sessions.length === 0) return;

      const activeID = view.type === "session" ? view.sessionID : undefined;
      const currentIndex = activeID
        ? sessions.findIndex((entry) => entry.id === activeID)
        : -1;

      const targetIndex =
        currentIndex < 0
          ? key === "arrowdown"
            ? 0
            : sessions.length - 1
          : (currentIndex + (key === "arrowdown" ? 1 : -1) + sessions.length) %
            sessions.length;

      const target = sessions[targetIndex];
      if (!target) return;
      event.preventDefault();
      navigateToSession(target.id);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    actions,
    handleCreateSession,
    navigateToSession,
    settings,
    state.sessionStatus,
    state.sessions,
    state.status,
    view,
  ]);

  return (
    <div
      className={`relative flex h-full min-h-[650px] flex-col overflow-hidden border border-zinc-800 bg-zinc-950 text-zinc-100 ${className ?? ""}`}
    >
      {/* Body */}
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {state.status === "loading" && <LoadingScreen />}
        {state.status === "error" && (
          <ErrorScreen
            error={state.lastError}
            onRetry={() => void actions.refresh()}
          />
        )}
        {state.status === "ready" && (
          <>
            {view.type === "home" && (
              <Home
                onOpenSession={navigateToSession}
                onCreateSession={handleCreateSession}
              />
            )}
            {view.type === "session" && (
              <SessionPage
                sessionID={view.sessionID}
                onOpenSession={navigateToSession}
                isSessionListOpen={isSessionListOpen}
                onSessionListOpenChange={(open: boolean) =>
                  setSessionListOpen(open)
                }
              />
            )}
          </>
        )}
      </main>

      {/* Dialogs */}
      <DialogSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <DialogSelectModel
        open={modelSelectorOpen}
        onClose={() => setModelSelectorOpen(false)}
      />
    </div>
  );
}

// ── Loading / Error screens ───────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 rounded-full border-2 border-zinc-700 border-t-zinc-300 animate-spin" />
        <div className="text-sm text-zinc-500">Connecting…</div>
      </div>
    </div>
  );
}

function ErrorScreen({
  error,
  onRetry,
}: {
  error?: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <div className="text-sm font-medium text-zinc-200">
            Connection failed
          </div>
          <div className="text-xs text-zinc-500">
            {error ?? "Unable to connect to the OpenCode server."}
          </div>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="rounded border border-zinc-700 px-4 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return !!target.closest("[contenteditable='true']");
}
