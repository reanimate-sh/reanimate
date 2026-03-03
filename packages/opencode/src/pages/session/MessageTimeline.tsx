"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  type RefObject,
  type ReactNode,
} from "react";
import type {
  Message,
  Part,
  ToolPart,
  AssistantMessage,
} from "@opencode-ai/sdk/v2/client";
import {
  AlertCircle,
  ArrowDown,
  BookOpen,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  Copy,
  Globe,
  List,
  LoaderCircle,
  Pencil,
  Search,
  Terminal,
  type LucideIcon,
  UserRound,
  Wrench,
} from "lucide-react";
import { useOpenCode } from "../../context";
import {
  normalizeWheelDelta,
  shouldMarkBoundaryGesture,
} from "./message-gesture";

// ── helpers ──────────────────────────────────────────────────────────────────

function formatTime(time: number | undefined): string {
  if (!time) return "";
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(time));
}

function isAssistantMessage(message: Message): message is AssistantMessage {
  return message.role === "assistant";
}

function getCopyText(parts: Part[]): string {
  return parts
    .filter(
      (part): part is Extract<Part, { type: "text" }> => part.type === "text",
    )
    .map((part) => part.text.trim())
    .filter(Boolean)
    .join("\n\n");
}

function normalizeAssistantParts(parts: Part[], hideReasoning: boolean) {
  const hasTool = parts.some(
    (part) => part.type === "tool" && (part as ToolPart).tool !== "todoread",
  );
  if (hasTool) return parts;

  let seenText = false;
  return parts.map((part) => {
    if (seenText) return part;
    if (hideReasoning && part.type === "reasoning") return part;
    if (part.type !== "text" && part.type !== "reasoning") return part;
    seenText = true;
    const text = part.text.replace(/^(?:\r?\n)+/, "");
    if (text === part.text) return part;
    return { ...part, text };
  });
}

const TOOL_ICONS: Record<string, LucideIcon> = {
  read: BookOpen,
  list: List,
  glob: Search,
  grep: Search,
  webfetch: Globe,
  task: Bot,
  bash: Terminal,
  edit: Pencil,
  write: Pencil,
  apply_patch: Pencil,
  todowrite: CheckCircle2,
  todoread: CheckCircle2,
  question: CircleHelp,
};

const TOOL_TITLES: Record<string, string> = {
  read: "Read",
  list: "List",
  glob: "Glob",
  grep: "Grep",
  webfetch: "Web Fetch",
  task: "Agent",
  bash: "Shell",
  edit: "Edit",
  write: "Write",
  apply_patch: "Patch",
  todowrite: "Todos",
  todoread: "Todos",
  question: "Questions",
};

function toolStateInput(part: ToolPart): Record<string, unknown> {
  const input =
    part.state && "input" in part.state ? part.state.input : undefined;
  if (!input || typeof input !== "object") return {};
  return input as Record<string, unknown>;
}

function toolStateOutput(part: ToolPart): string {
  const output =
    part.state && "output" in part.state ? part.state.output : undefined;
  if (typeof output === "string") return output;
  return "";
}

function toolStateMetadata(part: ToolPart): Record<string, unknown> {
  const metadata =
    part.state && "metadata" in part.state ? part.state.metadata : undefined;
  if (!metadata || typeof metadata !== "object") return {};
  return metadata as Record<string, unknown>;
}

function toolSubtitle(part: ToolPart): string {
  const input = toolStateInput(part);
  if (part.tool === "read") return String(input.filePath ?? "");
  if (part.tool === "list") return String(input.path ?? "");
  if (part.tool === "glob") return String(input.pattern ?? "");
  if (part.tool === "grep") return String(input.pattern ?? "");
  if (part.tool === "webfetch") return String(input.url ?? "");
  if (part.tool === "task") return String(input.description ?? "");
  if (part.tool === "bash") return String(input.description ?? "");
  if (part.tool === "edit") return String(input.filePath ?? "");
  if (part.tool === "write") return String(input.filePath ?? "");
  return "";
}

function toolArgs(part: ToolPart): string[] {
  const input = toolStateInput(part);
  if (part.tool === "read") {
    const out: string[] = [];
    if (input.offset !== undefined) out.push(`offset=${String(input.offset)}`);
    if (input.limit !== undefined) out.push(`limit=${String(input.limit)}`);
    return out;
  }
  if (part.tool === "glob") {
    return [];
  }
  if (part.tool === "grep") {
    const out: string[] = [];
    if (input.include !== undefined)
      out.push(`include=${String(input.include)}`);
    return out;
  }
  if (part.tool === "webfetch") {
    const out: string[] = [];
    if (input.format !== undefined) out.push(`format=${String(input.format)}`);
    return out;
  }
  return [];
}

function collectSessionToolParts(
  state: ReturnType<typeof useOpenCode>["state"],
  sessionID: string,
): ToolPart[] {
  const messages = state.messages[sessionID] ?? [];
  const out: ToolPart[] = [];
  for (const message of messages) {
    if (message.role !== "assistant") continue;
    const parts = state.parts[message.id] ?? [];
    for (const part of parts) {
      if (part.type !== "tool") continue;
      out.push(part as ToolPart);
    }
  }
  return out;
}

function ToolIcon({ name }: { name: string }) {
  const Icon = TOOL_ICONS[name] ?? Wrench;
  return <Icon className="h-3.5 w-3.5 text-zinc-400" />;
}

// ── Tool Status ────────────────────────────────────────────────────────────

function ToolStatus({ part }: { part: ToolPart }): ReactNode {
  const state = part.state;

  if (state.status === "pending") {
    return <span className="text-xs text-zinc-400">Pending…</span>;
  }

  if (state.status === "running") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-amber-300">
        <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span>Running</span>
        {state.title && <span className="text-zinc-300">- {state.title}</span>}
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-rose-300">
          <AlertCircle className="h-3.5 w-3.5" />
          Error
        </div>
        <pre className="whitespace-pre-wrap text-xs text-rose-200/90">
          {state.error}
        </pre>
      </div>
    );
  }

  return null;
}

function ToolBody({ part }: { part: ToolPart }) {
  const { state } = useOpenCode();
  const input = toolStateInput(part);
  const output = toolStateOutput(part);
  const metadata = toolStateMetadata(part);

  if (part.tool === "read") {
    const loaded = Array.isArray(metadata.loaded)
      ? metadata.loaded.filter(
          (item): item is string => typeof item === "string",
        )
      : [];
    if (loaded.length === 0) return null;
    return (
      <div className="mt-2 space-y-1">
        {loaded.map((file) => (
          <div key={file} className="text-xs text-zinc-300/90">
            Loaded {file}
          </div>
        ))}
      </div>
    );
  }

  if (part.tool === "task") {
    const childSessionId =
      typeof metadata.sessionId === "string" ? metadata.sessionId : undefined;
    if (!childSessionId) return null;
    const childTools = collectSessionToolParts(state, childSessionId);
    if (childTools.length === 0) return null;
    return (
      <div className="mt-2 space-y-1 max-h-56 overflow-y-auto" data-scrollable>
        {childTools.map((item) => {
          const itemTitle = TOOL_TITLES[item.tool] ?? item.tool;
          const itemSubtitle = toolSubtitle(item);
          return (
            <div
              key={item.id}
              className="flex items-center gap-2 text-xs text-zinc-300/90"
            >
              <ToolIcon name={item.tool} />
              <span className="text-zinc-200">{itemTitle}</span>
              {itemSubtitle && (
                <span className="truncate text-zinc-500">{itemSubtitle}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (part.tool === "bash") {
    const command = String(input.command ?? metadata.command ?? "");
    const body = output || String(metadata.output ?? "");
    return (
      <pre className="mt-2 whitespace-pre-wrap text-xs text-zinc-300/90 max-h-56 overflow-y-auto bg-zinc-800/50 rounded p-2">
        {`$ ${command}${body ? `\n\n${body}` : ""}`}
      </pre>
    );
  }

  if (part.tool === "todowrite") {
    const todos = (
      Array.isArray(metadata.todos)
        ? metadata.todos
        : Array.isArray(input.todos)
          ? input.todos
          : []
    ) as Array<{ content?: string; status?: string }>;
    if (todos.length === 0) return null;
    return (
      <div className="mt-2 space-y-1.5">
        {todos.map((todo, i) => {
          const done = todo.status === "completed";
          return (
            <div
              key={`${todo.content ?? "todo"}-${i}`}
              className="flex items-center gap-2.5 text-sm text-zinc-300"
            >
              <span
                className={`inline-flex size-3.5 items-center justify-center rounded-[2px] border ${done ? "border-zinc-200/90 bg-zinc-200/10 text-zinc-100" : "border-zinc-500/90 bg-transparent text-transparent"}`}
              >
                <Check className="size-2.5 stroke-[2.6]" />
              </span>
              <span
                className={
                  done ? "line-through text-zinc-500" : "text-zinc-300"
                }
              >
                {todo.content ?? ""}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  if (part.tool === "question") {
    const answers = Array.isArray(metadata.answers) ? metadata.answers : [];
    if (answers.length === 0) return null;
    return (
      <pre className="mt-2 whitespace-pre-wrap text-xs text-zinc-300/90 max-h-56 overflow-y-auto bg-zinc-800/50 rounded p-2">
        {JSON.stringify(answers, null, 2)}
      </pre>
    );
  }

  if (
    part.tool === "list" ||
    part.tool === "glob" ||
    part.tool === "grep" ||
    part.tool === "webfetch"
  ) {
    if (!output) return null;
    return (
      <pre
        className="mt-2 whitespace-pre-wrap text-xs text-zinc-300/90 max-h-56 overflow-y-auto bg-zinc-800/50 rounded p-2"
        data-scrollable
      >
        {output}
      </pre>
    );
  }

  if (part.tool === "write") {
    const content = typeof input.content === "string" ? input.content : "";
    if (!content) return null;
    return (
      <pre
        className="mt-2 whitespace-pre-wrap text-xs text-zinc-300/90 max-h-56 overflow-y-auto bg-zinc-800/50 rounded p-2"
        data-scrollable
      >
        {content}
      </pre>
    );
  }

  if (part.tool === "edit") {
    const oldString =
      typeof input.oldString === "string" ? input.oldString : "";
    const newString =
      typeof input.newString === "string" ? input.newString : "";
    if (!oldString && !newString) return null;
    return (
      <pre
        className="mt-2 whitespace-pre-wrap text-xs text-zinc-300/90 max-h-56 overflow-y-auto bg-zinc-800/50 rounded p-2"
        data-scrollable
      >
        {`--- before\n${oldString}\n\n+++ after\n${newString}`}
      </pre>
    );
  }

  if (part.tool === "apply_patch") {
    const files = Array.isArray(metadata.files)
      ? metadata.files.filter(
          (item): item is { relativePath?: string; type?: string } =>
            typeof item === "object" && item !== null,
        )
      : [];
    if (files.length === 0) return null;
    return (
      <div className="mt-2 space-y-1">
        {files.map((file, i) => (
          <div
            key={`${file.relativePath ?? "file"}-${i}`}
            className="text-xs text-zinc-300/90"
          >
            {String(file.type ?? "update")} {String(file.relativePath ?? "")}
          </div>
        ))}
      </div>
    );
  }

  if (output) {
    return (
      <pre className="mt-2 whitespace-pre-wrap text-xs text-zinc-300/90 max-h-56 overflow-y-auto bg-zinc-800/50 rounded p-2">
        {output}
      </pre>
    );
  }

  return null;
}

// ── Tool Block ─────────────────────────────────────────────────────────────

function ToolBlock({ part }: { part: ToolPart }) {
  const state = part.state;
  const output = toolStateOutput(part);
  const args = toolArgs(part);
  const subtitle = toolSubtitle(part);
  const title = TOOL_TITLES[part.tool] ?? part.tool;
  const metadata = toolStateMetadata(part);
  const hasBody =
    part.tool === "todowrite" ||
    part.tool === "question" ||
    part.tool === "task" ||
    part.tool === "read" ||
    part.tool === "write" ||
    part.tool === "edit" ||
    part.tool === "apply_patch" ||
    !!output;
  const initiallyOpen =
    part.tool === "todowrite" ||
    (part.tool === "question" &&
      Array.isArray(metadata.answers) &&
      metadata.answers.length > 0) ||
    state.status !== "completed";
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  useEffect(() => {
    if (state.status === "completed" && part.tool !== "todowrite") {
      setIsOpen(false);
    }
  }, [part.tool, state.status]);

  return (
    <div
      data-component="tool-part-wrapper"
      className="rounded-md border border-zinc-700/70 bg-zinc-900/80 overflow-hidden"
    >
      <button
        type="button"
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-zinc-800/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <ToolIcon name={part.tool} />
        <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs text-zinc-200 leading-none truncate">
              {title}
            </div>
            {subtitle && (
              <div className="text-xs text-zinc-400 truncate">{subtitle}</div>
            )}
            {state.status === "running" && state.title && (
              <div className="text-xs text-zinc-400 truncate">
                {state.title}
              </div>
            )}
            {args.length > 0 && (
              <div className="mt-0.5 flex flex-wrap gap-1">
                {args.map((arg) => (
                  <span key={arg} className="text-[10px] text-zinc-500">
                    {arg}
                  </span>
                ))}
              </div>
            )}
          </div>
          {state.status === "completed" && (
            <Check className="h-3 w-3 shrink-0 text-zinc-200" />
          )}
        </div>
        {hasBody && (
          <span className="text-zinc-500">
            {isOpen ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </span>
        )}
      </button>
      {hasBody && (isOpen || state.status !== "completed") && (
        <div className="px-3 pb-3 border-t border-zinc-700/50 pt-2">
          <ToolStatus part={part} />
          <ToolBody part={part} />
        </div>
      )}
    </div>
  );
}

// ── PartBlock ─────────────────────────────────────────────────────────────────

function PartBlock({
  part,
  hideReasoning,
}: {
  part: Part;
  hideReasoning?: boolean;
}) {
  if (hideReasoning && part.type === "reasoning") {
    return null;
  }

  if (part.type === "text" || part.type === "reasoning") {
    const isReasoning = part.type === "reasoning";
    return (
      <pre
        className={`whitespace-pre-wrap break-words font-sans text-base ${
          isReasoning ? "text-zinc-400 italic" : "text-zinc-100"
        }`}
      >
        {part.text}
      </pre>
    );
  }

  if (part.type === "tool") {
    return <ToolBlock part={part} />;
  }

  if (part.type === "file") {
    return (
      <div className="rounded-md border border-zinc-700/70 bg-zinc-900/75 px-3 py-2 text-xs text-zinc-200">
        <span className="text-zinc-500">Attachment:</span>{" "}
        {part.filename ?? part.url}
      </div>
    );
  }

  if (part.type === "patch") {
    return (
      <div className="rounded-md border border-zinc-700/70 bg-zinc-900/75 px-3 py-2 text-xs text-zinc-200">
        Patch updated {part.files.length} file
        {part.files.length !== 1 ? "s" : ""}
      </div>
    );
  }

  if (part.type === "step-start" || part.type === "step-finish") {
    return null;
  }

  if (part.type === "agent") {
    return (
      <div className="rounded-md border border-violet-700/40 bg-violet-900/20 px-3 py-2 text-xs text-violet-200">
        Agent call: @{part.name}
      </div>
    );
  }

  if (part.type === "subtask") {
    return (
      <div className="rounded-md border border-sky-700/40 bg-sky-900/20 px-3 py-2 text-xs text-sky-200">
        Subtask: {part.description || part.prompt}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-zinc-700/50 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-400">
      {part.type}
    </div>
  );
}

// ── Assistant Message ──────────────────────────────────────────────────────

function AssistantMessageBlock({
  message,
  parts,
  stepsExpanded,
  onToggleSteps,
  isWorking,
  hideReasoning,
}: {
  message: AssistantMessage;
  parts: Part[];
  stepsExpanded: boolean;
  onToggleSteps: () => void;
  isWorking: boolean;
  hideReasoning: boolean;
}) {
  const error = message.error;
  const [copied, setCopied] = useState(false);
  const displayParts = useMemo(
    () => normalizeAssistantParts(parts, hideReasoning),
    [hideReasoning, parts],
  );

  const toolParts = useMemo(
    () =>
      displayParts.filter(
        (p) => p.type === "tool" && (p as ToolPart).tool !== "todoread",
      ),
    [displayParts],
  );
  const nonToolParts = useMemo(
    () => displayParts.filter((p) => p.type !== "tool"),
    [displayParts],
  );
  const copyText = useMemo(() => getCopyText(displayParts), [displayParts]);

  const hasSteps = toolParts.length > 0;

  const handleCopy = useCallback(() => {
    if (!copyText) return;
    navigator.clipboard
      .writeText(copyText)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }, [copyText]);

  return (
    <div data-message-id={message.id} className="w-full">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-zinc-400">
          <Bot className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          {(isWorking || hasSteps) && (
            <button
              type="button"
              className="w-full flex items-center gap-2 px-0 py-0 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              onClick={onToggleSteps}
            >
              {isWorking ? (
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              ) : stepsExpanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
              <span>
                {isWorking
                  ? "Working..."
                  : stepsExpanded
                    ? "Hide Steps"
                    : `Show ${toolParts.length} Step${toolParts.length !== 1 ? "s" : ""}`}
              </span>
            </button>
          )}

          {(stepsExpanded || isWorking) &&
            toolParts.map((part) => (
              <PartBlock
                key={part.id}
                part={part}
                hideReasoning={hideReasoning}
              />
            ))}

          {nonToolParts.map((part) => (
            <PartBlock
              key={part.id}
              part={part}
              hideReasoning={hideReasoning}
            />
          ))}

          {error && (
            <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {"message" in error.data && typeof error.data.message === "string"
                ? error.data.message
                : "Request failed"}
            </div>
          )}
        </div>
      </div>
      <div className="mt-1 flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {copyText && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleCopy();
            }}
            className="inline-flex size-6 items-center justify-center rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors"
            aria-label={copied ? "Copied" : "Copy message"}
            title={copied ? "Copied" : "Copy message"}
          >
            {copied ? (
              <Check className="h-5 w-5" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </button>
        )}
        <span className="text-sm text-zinc-500">
          {formatTime(message.time.created)}
        </span>
      </div>
    </div>
  );
}

// ── MessageBlock ─────────────────────────────────────────────────────────────

function MessageBlock({
  message,
  parts,
  isLast,
  stepsExpanded,
  onToggleSteps,
}: {
  message: Message;
  parts: Part[];
  isLast: boolean;
  stepsExpanded: boolean;
  onToggleSteps: () => void;
}) {
  const isUser = message.role === "user";
  const { state } = useOpenCode();
  const sessionID = message.sessionID;
  const sessionStatus = state.sessionStatus[sessionID ?? ""];
  const isWorking = sessionStatus?.type === "busy" && isLast;
  const hideReasoning = !isWorking;
  const [copied, setCopied] = useState(false);
  const copyText = useMemo(() => getCopyText(parts), [parts]);

  const handleCopy = useCallback(() => {
    if (!copyText) return;
    navigator.clipboard
      .writeText(copyText)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }, [copyText]);

  if (isUser) {
    return (
      <div data-message-id={message.id} className="w-full">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-zinc-400">
            <UserRound className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            {parts.map((part) => (
              <PartBlock key={part.id} part={part} />
            ))}
          </div>
        </div>
        <div className="mt-1 flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {copyText && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleCopy();
              }}
              className="inline-flex size-6 items-center justify-center rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors"
              aria-label={copied ? "Copied" : "Copy message"}
              title={copied ? "Copied" : "Copy message"}
            >
              {copied ? (
                <Check className="h-5 w-5" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          )}
          <span className="text-sm text-zinc-500">
            {formatTime(message.time.created)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <AssistantMessageBlock
      message={message as AssistantMessage}
      parts={parts}
      stepsExpanded={stepsExpanded}
      onToggleSteps={onToggleSteps}
      isWorking={isWorking}
      hideReasoning={hideReasoning}
    />
  );
}

function TurnBlock({
  messages,
  partsByMessage,
  isLastTurn,
  expandedSteps,
  onToggleSteps,
}: {
  messages: Message[];
  partsByMessage: Record<string, Part[]>;
  isLastTurn: boolean;
  expandedSteps: Record<string, boolean>;
  onToggleSteps: (messageID: string) => void;
}) {
  if (messages.length === 0) return null;

  const groupedMessages = useMemo(() => {
    const groups: Array<{
      key: string;
      message: Message;
      parts: Part[];
      isLastMessage: boolean;
    }> = [];

    for (let index = 0; index < messages.length; index++) {
      const message = messages[index];
      if (!isAssistantMessage(message)) {
        groups.push({
          key: message.id,
          message,
          parts: partsByMessage[message.id] ?? [],
          isLastMessage: index === messages.length - 1,
        });
        continue;
      }

      const assistantMessages = [message];
      let nextIndex = index + 1;
      while (nextIndex < messages.length) {
        const nextMessage = messages[nextIndex];
        if (!isAssistantMessage(nextMessage)) break;
        assistantMessages.push(nextMessage);
        nextIndex++;
      }

      const lastAssistantMessage =
        assistantMessages[assistantMessages.length - 1];
      const combinedParts = assistantMessages.flatMap(
        (entry) => partsByMessage[entry.id] ?? [],
      );
      groups.push({
        key: `assistant-${assistantMessages[0].id}-${lastAssistantMessage.id}`,
        message: lastAssistantMessage,
        parts: combinedParts,
        isLastMessage: nextIndex - 1 === messages.length - 1,
      });

      index = nextIndex - 1;
    }

    return groups;
  }, [messages, partsByMessage]);

  return (
    <div className="w-full space-y-3">
      {groupedMessages.map(({ key, message, parts, isLastMessage }) => {
        return (
          <div key={key} className="group">
            <MessageBlock
              message={message}
              parts={parts}
              isLast={isLastTurn && isLastMessage}
              stepsExpanded={expandedSteps[key] ?? false}
              onToggleSteps={() => onToggleSteps(key)}
            />
          </div>
        );
      })}
    </div>
  );
}

// ── MessageTimeline ───────────────────────────────────────────────────────────

type MessageTimelineProps = {
  sessionID: string;
  centered?: boolean;
  scrollRef?: RefObject<HTMLDivElement | null>;
  historyMore?: boolean;
  historyLoading?: boolean;
  onLoadEarlier?: () => void | Promise<void>;
};

export function MessageTimeline({
  sessionID,
  centered = true,
  scrollRef,
  historyMore,
  historyLoading,
  onLoadEarlier,
}: MessageTimelineProps) {
  const { state } = useOpenCode();
  const internalScrollRef = useRef<HTMLDivElement>(null);
  const activeScrollRef = scrollRef ?? internalScrollRef;
  const [activeMessageID, setActiveMessageID] = useState<string | undefined>();
  const scrollGestureRef = useRef(0);
  const touchYRef = useRef<number | undefined>(undefined);
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>(
    {},
  );

  const messages = state.messages[sessionID] ?? [];
  const userMessages = useMemo(
    () => messages.filter((entry) => entry.role === "user"),
    [messages],
  );
  const [atBottom, setAtBottom] = useState(true);
  const [overflow, setOverflow] = useState(false);
  const renderInit = 40;
  const renderBatch = 40;
  const [renderStart, setRenderStart] = useState(0);

  const handleToggleSteps = useCallback((messageID: string) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [messageID]: !prev[messageID],
    }));
  }, []);

  useEffect(() => {
    const len = userMessages.length;
    setRenderStart(len > renderInit ? len - renderInit : 0);
    setActiveMessageID(undefined);
  }, [sessionID, userMessages.length]);

  const renderedMessages = useMemo(() => {
    if (renderStart <= 0) return userMessages;
    return userMessages.slice(renderStart);
  }, [userMessages, renderStart]);

  const renderedTurns = useMemo(() => {
    if (renderedMessages.length === 0)
      return [] as Array<{ anchor: Message; messages: Message[] }>;

    const boundaries = renderedMessages.map((entry) => entry.id);
    return renderedMessages.map((anchor, index) => {
      const nextBoundary = boundaries[index + 1];
      const turn = messages.filter((entry) => {
        if (entry.id < anchor.id) return false;
        if (!nextBoundary) return true;
        return entry.id < nextBoundary;
      });
      return { anchor, messages: turn };
    });
  }, [messages, renderedMessages]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    const el = activeScrollRef.current;
    if (!el) return;
    setActiveMessageID(undefined);
    if (window.location.hash.startsWith("#message-")) {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
    el.scrollTo({ top: el.scrollHeight, behavior: "auto" });
  }, [activeScrollRef]);

  useEffect(() => {
    if (!atBottom || activeMessageID) return;
    scrollToBottom();
  }, [messages.length, atBottom, activeMessageID, scrollToBottom]);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#message-")) return;
    const messageID = hash.replace(/^#message-/, "");
    if (!messageID) return;
    const index = userMessages.findIndex((entry) => entry.id === messageID);
    if (index < 0) return;

    if (index < renderStart) {
      setRenderStart(index);
    }

    requestAnimationFrame(() => {
      const el = document.getElementById(`message-${messageID}`);
      if (!(el instanceof HTMLElement)) return;
      el.scrollIntoView({ block: "center", behavior: "auto" });
      setActiveMessageID(messageID);
    });
  }, [userMessages, renderStart]);

  const handleScroll = () => {
    const el = activeScrollRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 32;
    const hasOverflow = el.scrollHeight > el.clientHeight;
    setAtBottom(isAtBottom);
    setOverflow(hasOverflow);

    if (isAtBottom && activeMessageID) {
      setActiveMessageID(undefined);
      if (window.location.hash.startsWith("#message-")) {
        history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search,
        );
      }
      return;
    }

    if (isAtBottom) return;
    if (Date.now() - scrollGestureRef.current > 300) return;

    const boxes = Array.from(
      el.querySelectorAll<HTMLElement>("[data-message-id]"),
    );
    if (boxes.length === 0) return;
    const rootTop = el.getBoundingClientRect().top;
    const target = boxes.reduce<{ id: string; dist: number } | undefined>(
      (best, node) => {
        const id = node.dataset.messageId;
        if (!id) return best;
        const top = node.getBoundingClientRect().top - rootTop;
        const dist = Math.abs(top - 24);
        if (!best || dist < best.dist) return { id, dist };
        return best;
      },
      undefined,
    );
    if (!target) return;
    if (target.id === activeMessageID) return;
    setActiveMessageID(target.id);
  };

  return (
    <div className="relative w-full h-full min-w-0">
      {/* Scroll-to-bottom button */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 bottom-[calc(var(--prompt-height,8rem)+32px)] z-60 pointer-events-none transition-all duration-200 ${
          overflow && !atBottom
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-2 scale-95 pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={scrollToBottom}
          className="size-8 flex items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 shadow-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </button>
      </div>

      <div
        ref={activeScrollRef}
        onWheel={(event) => {
          const root = event.currentTarget;
          const delta = normalizeWheelDelta({
            deltaY: event.deltaY,
            deltaMode: event.deltaMode,
            rootHeight: root.clientHeight,
          });
          if (!delta) return;
          const target =
            event.target instanceof HTMLElement
              ? event.target.closest("[data-scrollable]")
              : undefined;
          const node = target instanceof HTMLElement ? target : root;
          if (
            shouldMarkBoundaryGesture({
              delta,
              scrollTop: node.scrollTop,
              scrollHeight: node.scrollHeight,
              clientHeight: node.clientHeight,
            })
          ) {
            scrollGestureRef.current = Date.now();
          }
        }}
        onTouchStart={(event) => {
          touchYRef.current = event.touches[0]?.clientY;
        }}
        onTouchMove={(event) => {
          const next = event.touches[0]?.clientY;
          const prev = touchYRef.current;
          touchYRef.current = next;
          if (next === undefined || prev === undefined) return;
          const delta = prev - next;
          if (!delta) return;
          const root = event.currentTarget;
          const target =
            event.target instanceof HTMLElement
              ? event.target.closest("[data-scrollable]")
              : undefined;
          const node = target instanceof HTMLElement ? target : root;
          if (
            shouldMarkBoundaryGesture({
              delta,
              scrollTop: node.scrollTop,
              scrollHeight: node.scrollHeight,
              clientHeight: node.clientHeight,
            })
          ) {
            scrollGestureRef.current = Date.now();
          }
        }}
        onTouchEnd={() => {
          touchYRef.current = undefined;
        }}
        onTouchCancel={() => {
          touchYRef.current = undefined;
        }}
        onPointerDown={(event) => {
          if (event.target !== event.currentTarget) return;
          scrollGestureRef.current = Date.now();
        }}
        onScroll={handleScroll}
        className="relative min-w-0 w-full h-full overflow-y-auto"
      >
        <div
          role="log"
          className={`flex flex-col gap-4 items-start pt-4 pb-[calc(var(--prompt-height,8rem)+64px)] w-full px-4 md:px-6 ${
            centered ? "md:max-w-4xl md:mx-auto 2xl:max-w-5xl" : ""
          }`}
        >
          {renderStart > 0 && (
            <div className="w-full flex justify-center pt-2">
              <button
                type="button"
                onClick={() =>
                  setRenderStart((prev) => Math.max(0, prev - renderBatch))
                }
                className="rounded border border-zinc-700 px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-800/70"
              >
                Render earlier
              </button>
            </div>
          )}
          {renderStart === 0 && historyMore && (
            <div className="w-full flex justify-center pt-2">
              <button
                type="button"
                disabled={historyLoading}
                onClick={() => void onLoadEarlier?.()}
                className="rounded border border-zinc-700 px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-800/70 disabled:opacity-50"
              >
                {historyLoading ? "Loading earlier..." : "Load earlier"}
              </button>
            </div>
          )}
          {userMessages.length === 0 ? (
            <div className="w-full rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-8 text-center text-sm text-zinc-500 mt-8">
              Start a conversation by sending a prompt below.
            </div>
          ) : (
            renderedTurns.map((turn, index) => {
              const message = turn.anchor;
              return (
                <div
                  id={`message-${message.id}`}
                  key={message.id}
                  data-message-id={message.id}
                  className={
                    activeMessageID === message.id
                      ? "w-full rounded-xl ring-1 ring-zinc-600/70"
                      : "w-full"
                  }
                  onClick={() => {
                    if (atBottom) return;
                    setActiveMessageID(message.id);
                    history.replaceState(
                      null,
                      "",
                      `${window.location.pathname}${window.location.search}#message-${message.id}`,
                    );
                  }}
                >
                  <TurnBlock
                    messages={turn.messages}
                    partsByMessage={state.parts}
                    isLastTurn={index === renderedTurns.length - 1}
                    expandedSteps={expandedSteps}
                    onToggleSteps={handleToggleSteps}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
