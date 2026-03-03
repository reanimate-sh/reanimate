"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { CircleDot, EllipsisVertical, Plus, Search } from "lucide-react";
import { useOpenCode } from "../context";
import { useLayout } from "../context/layout";
import type { Session } from "@opencode-ai/sdk/v2/client";

function formatRelative(timestamp: number | undefined): string {
  if (!timestamp) return "";
  const now = Date.now();
  const diff = now - timestamp;
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

function sessionTitle(session: Session): string {
  const value = session.title?.trim();
  if (value) return value;
  return `Session ${session.id.slice(-6)}`;
}

type SessionTreeNode = {
  session: Session;
  depth: number;
};

function sortByRecent(a: Session, b: Session) {
  return (
    (b.time.updated ?? b.time.created ?? 0) -
    (a.time.updated ?? a.time.created ?? 0)
  );
}

function buildSessionTree(sessions: Session[]): SessionTreeNode[] {
  const byParent = new Map<string | undefined, Session[]>();
  for (const session of sessions) {
    const key = session.parentID;
    const list = byParent.get(key);
    if (list) list.push(session);
    else byParent.set(key, [session]);
  }

  for (const list of byParent.values()) {
    list.sort(sortByRecent);
  }

  const out: SessionTreeNode[] = [];
  const walk = (parentID: string | undefined, depth: number) => {
    const children = byParent.get(parentID) ?? [];
    for (const session of children) {
      out.push({ session, depth });
      walk(session.id, depth + 1);
    }
  };

  walk(undefined, 0);
  return out;
}

function buildFilteredTree(
  sessions: Session[],
  query: string,
): SessionTreeNode[] {
  if (!query.trim()) return buildSessionTree(sessions);
  const q = query.toLowerCase();

  const byID = new Map(sessions.map((session) => [session.id, session]));
  const include = new Set<string>();

  for (const session of sessions) {
    const match =
      sessionTitle(session).toLowerCase().includes(q) ||
      session.id.toLowerCase().includes(q);
    if (!match) continue;
    include.add(session.id);
    let parent = session.parentID ? byID.get(session.parentID) : undefined;
    while (parent) {
      include.add(parent.id);
      parent = parent.parentID ? byID.get(parent.parentID) : undefined;
    }
  }

  return buildSessionTree(sessions).filter((entry) =>
    include.has(entry.session.id),
  );
}

type SidebarProps = {
  activeSessionID?: string;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onNavigateHome: () => void;
};

export function Sidebar({
  activeSessionID,
  onSelectSession,
  onCreateSession,
  onNavigateHome,
}: SidebarProps) {
  const { state, actions } = useOpenCode();
  const layout = useLayout();
  const [search, setSearch] = useState("");
  const [menuSessionID, setMenuSessionID] = useState<string | undefined>();
  const [editingSessionID, setEditingSessionID] = useState<
    string | undefined
  >();
  const [editingTitle, setEditingTitle] = useState("");
  const [deleteConfirmID, setDeleteConfirmID] = useState<string | undefined>();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuSessionID) return;
    const onMouse = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuSessionID(undefined);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuSessionID(undefined);
      setEditingSessionID(undefined);
      setEditingTitle("");
      setDeleteConfirmID(undefined);
    };
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuSessionID]);

  const deleteSession = async (sessionID: string) => {
    setDeleteConfirmID(undefined);
    await actions.deleteSession(sessionID);
    setMenuSessionID(undefined);
  };

  const saveRename = async (sessionID: string) => {
    const title = editingTitle.trim();
    if (!title) {
      setEditingSessionID(undefined);
      setEditingTitle("");
      return;
    }
    await actions.renameSession(sessionID, title);
    setEditingSessionID(undefined);
    setEditingTitle("");
    setMenuSessionID(undefined);
  };

  const filtered = useMemo(
    () => buildFilteredTree(state.sessions, search),
    [state.sessions, search],
  );

  const sidebarWidth = layout.state.sidebar.width;

  return (
    <nav
      className="relative flex flex-col h-full bg-zinc-950 border-r border-zinc-800/80 shrink-0 transition-all duration-200"
      style={{ width: sidebarWidth }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/60 px-3 py-2.5">
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity min-w-0"
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-zinc-900 border border-zinc-700">
            <CircleDot className="h-3 w-3 text-zinc-300" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-300 font-medium">
              OpenCode
            </div>
            <div className="truncate text-[10px] text-zinc-500 font-mono">
              {state.directory || "—"}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={onCreateSession}
          title="New session"
          className="ml-1 shrink-0 size-6 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/60 transition-colors"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {/* Search */}
      <div className="px-2 py-1.5 border-b border-zinc-800/40">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sessions…"
            className="w-full rounded border border-zinc-800 bg-zinc-900/60 pl-7 pr-2 py-1 text-xs text-zinc-300 placeholder:text-zinc-600 outline-none focus:border-zinc-700 focus:bg-zinc-900"
          />
        </div>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto py-1 px-1">
        {filtered.length === 0 && (
          <div className="px-3 py-4 text-center text-xs text-zinc-600">
            {search ? "No matching sessions" : "No sessions yet"}
          </div>
        )}
        {filtered.map(({ session, depth }) => {
          const isActive = session.id === activeSessionID;
          const status = state.sessionStatus[session.id];
          const isBusy = status?.type === "busy";
          const hasPermission =
            (state.permissions[session.id] ?? []).length > 0;
          const hasQuestion = (state.questions[session.id] ?? []).length > 0;
          const needsAttention = hasPermission || hasQuestion;

          return (
            <SessionRow
              key={session.id}
              session={session}
              isActive={isActive}
              isBusy={isBusy}
              needsAttention={needsAttention}
              menuOpen={menuSessionID === session.id}
              editing={editingSessionID === session.id}
              editingTitle={editingTitle}
              depth={depth}
              onSelect={() => onSelectSession(session.id)}
              onToggleMenu={() => {
                setMenuSessionID((prev) =>
                  prev === session.id ? undefined : session.id,
                );
                setEditingSessionID(undefined);
                setEditingTitle("");
              }}
              onEditStart={() => {
                setEditingSessionID(session.id);
                setEditingTitle(session.title ?? "");
              }}
              onEditTitle={setEditingTitle}
              onEditSave={() => void saveRename(session.id)}
              onEditCancel={() => {
                setEditingSessionID(undefined);
                setEditingTitle("");
              }}
              onArchive={() => {
                void actions.archiveSession(session.id);
                setMenuSessionID(undefined);
              }}
              onShare={async () => {
                await actions.shareSession(session.id);
                setMenuSessionID(undefined);
              }}
              onUnshare={async () => {
                await actions.unshareSession(session.id);
                setMenuSessionID(undefined);
              }}
              onDelete={() => {
                setDeleteConfirmID(session.id);
                setMenuSessionID(undefined);
              }}
              menuRef={menuSessionID === session.id ? menuRef : undefined}
            />
          );
        })}
      </div>

      {deleteConfirmID && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 px-3"
          onMouseDown={(event) => {
            if (event.target !== event.currentTarget) return;
            setDeleteConfirmID(undefined);
          }}
        >
          <div className="w-full max-w-[260px] rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl">
            <div className="px-3 pt-3 pb-1 text-sm text-zinc-100">
              Delete session?
            </div>
            <div className="px-3 pb-3 text-xs text-zinc-500">
              This cannot be undone.
            </div>
            <div className="flex justify-end gap-2 border-t border-zinc-800 px-3 py-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmID(undefined)}
                className="rounded border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void deleteSession(deleteConfirmID)}
                className="rounded border border-rose-500/40 bg-rose-500/20 px-2.5 py-1 text-xs text-rose-100 hover:bg-rose-500/30"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer: total count */}
      <div className="border-t border-zinc-800/40 px-3 py-2 flex items-center justify-between">
        <span className="text-[10px] text-zinc-600">
          {state.sessionTotal} session{state.sessionTotal !== 1 ? "s" : ""}
        </span>
        <button
          type="button"
          onClick={() => void actions.refresh()}
          className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          Refresh
        </button>
      </div>
    </nav>
  );
}

// ── SessionRow ────────────────────────────────────────────────────────────────

function SessionRow({
  session,
  isActive,
  isBusy,
  needsAttention,
  menuOpen,
  editing,
  editingTitle,
  depth,
  onSelect,
  onToggleMenu,
  onEditStart,
  onEditTitle,
  onEditSave,
  onEditCancel,
  onArchive,
  onShare,
  onUnshare,
  onDelete,
  menuRef,
}: {
  session: Session;
  isActive: boolean;
  isBusy: boolean;
  needsAttention: boolean;
  menuOpen: boolean;
  editing: boolean;
  editingTitle: string;
  depth: number;
  onSelect: () => void;
  onToggleMenu: () => void;
  onEditStart: () => void;
  onEditTitle: (value: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onArchive: () => void;
  onShare: () => void;
  onUnshare: () => void;
  onDelete: () => void;
  menuRef?: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      className={`group w-full rounded-lg px-2 py-1.5 text-left transition-colors mb-0.5 relative ${
        isActive
          ? "bg-zinc-900/70 border border-zinc-600"
          : "border border-transparent hover:bg-zinc-800/60 hover:border-zinc-700/50"
      }`}
      style={{ paddingLeft: `${8 + Math.min(depth, 6) * 12}px` }}
    >
      <div className="flex items-center gap-2 min-w-0">
        {/* Status dot */}
        <div className="shrink-0 size-4 flex items-center justify-center">
          {isBusy ? (
            <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
          ) : needsAttention ? (
            <span className="size-1.5 rounded-full bg-orange-400" />
          ) : (
            <span
              className={`size-1 rounded-full ${isActive ? "bg-zinc-300" : "bg-zinc-600"}`}
            />
          )}
        </div>

        {/* Title */}
        {editing ? (
          <input
            value={editingTitle}
            autoFocus
            onChange={(event) => onEditTitle(event.target.value)}
            onBlur={onEditSave}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onEditSave();
                return;
              }
              if (event.key === "Escape") {
                event.preventDefault();
                onEditCancel();
              }
            }}
            className="flex-1 min-w-0 rounded bg-zinc-950/70 border border-zinc-700 px-1.5 py-0.5 text-xs text-zinc-200 outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={onSelect}
            className={`flex-1 min-w-0 truncate text-sm text-left ${
              isActive ? "text-zinc-100" : "text-zinc-300"
            }`}
          >
            {sessionTitle(session)}
          </button>
        )}

        {/* Time */}
        <span className="shrink-0 text-[10px] text-zinc-600 group-hover:text-zinc-500 transition-colors">
          {formatRelative(session.time.updated ?? session.time.created)}
        </span>

        <button
          type="button"
          onClick={onToggleMenu}
          className="shrink-0 size-5 flex items-center justify-center rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800"
          aria-label="Session options"
        >
          <EllipsisVertical className="h-3 w-3" />
        </button>
      </div>

      {depth > 0 && (
        <div className="mt-0.5 text-[10px] text-zinc-600">↳ fork</div>
      )}
      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute right-1 top-7 z-20 min-w-[120px] rounded border border-zinc-700 bg-zinc-900 shadow-xl py-1"
        >
          <button
            type="button"
            onClick={onEditStart}
            className="w-full text-left px-2.5 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
          >
            Rename
          </button>
          <button
            type="button"
            onClick={onArchive}
            className="w-full text-left px-2.5 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
          >
            Archive
          </button>
          <button
            type="button"
            onClick={() => {
              if (session.share?.url) onUnshare();
              else onShare();
            }}
            className="w-full text-left px-2.5 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
          >
            {session.share?.url ? "Unshare" : "Share"}
          </button>
          {session.share?.url && (
            <button
              type="button"
              onClick={() =>
                void navigator.clipboard.writeText(session.share!.url)
              }
              className="w-full text-left px-2.5 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
            >
              Copy link
            </button>
          )}
          <div className="my-1 border-t border-zinc-800" />
          <button
            type="button"
            onClick={onDelete}
            className="w-full text-left px-2.5 py-1 text-xs text-rose-300 hover:bg-zinc-800"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
