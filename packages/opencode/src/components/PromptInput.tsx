"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useOpenCode } from "../context";
import { useSettings } from "../context/settings";
import { keybindFor, matchesKeybind } from "../keybind";
import type {
  PermissionRequest,
  QuestionAnswer,
  QuestionRequest,
  Todo,
} from "@opencode-ai/sdk/v2/client";
import {
  ArrowUp,
  Bot,
  Check,
  CircleHelp,
  ListChecks,
  Square,
} from "lucide-react";
import {
  ModelSelector,
  type ModelSelectorValue,
} from "@reanimate/ui/components/shared/ModelSelector";

// ── Permission dock ───────────────────────────────────────────────────────────

function PermissionBlock({
  request,
  responding,
}: {
  request: PermissionRequest;
  responding: boolean;
}) {
  const { actions } = useOpenCode();

  return (
    <div
      data-component="permission-prompt"
      className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-3"
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-amber-200">
        <ListChecks className="h-3 w-3" />
        Permission request
      </div>
      <div className="mt-1 text-sm text-zinc-100">{request.permission}</div>
      {request.patterns.length > 0 ? (
        <div className="mt-2 flex max-h-36 flex-col gap-1 overflow-y-auto">
          {request.patterns.map((pattern) => (
            <code key={pattern} className="break-all text-[11px] text-zinc-300">
              {pattern}
            </code>
          ))}
        </div>
      ) : null}
      <div data-slot="permission-actions" className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={responding}
          onClick={() => void actions.replyPermission(request.id, "reject")}
          className="rounded border border-zinc-600 px-3 py-1 text-xs text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
        >
          Deny
        </button>
        <button
          type="button"
          disabled={responding}
          onClick={() => void actions.replyPermission(request.id, "always")}
          className="rounded border border-zinc-600/50 bg-zinc-800/50 px-3 py-1 text-xs text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
        >
          Allow always
        </button>
        <button
          type="button"
          disabled={responding}
          onClick={() => void actions.replyPermission(request.id, "once")}
          className="rounded border border-zinc-600/70 bg-zinc-800/60 px-3 py-1 text-xs text-zinc-100 hover:bg-zinc-800 disabled:opacity-50"
        >
          Allow once
        </button>
      </div>
    </div>
  );
}

// ── Question card ─────────────────────────────────────────────────────────────

type QuestionDraft = Record<string, string[]>;
type QuestionCustomDraft = Record<string, string>;

function QuestionBlock({ request }: { request: QuestionRequest }) {
  const { actions } = useOpenCode();
  const [answers, setAnswers] = useState<QuestionDraft>({});
  const [custom, setCustom] = useState<QuestionCustomDraft>({});

  const toggle = (header: string, label: string, multiple?: boolean) => {
    setAnswers((prev) => {
      const current = prev[header] ?? [];
      const has = current.includes(label);
      const next = multiple
        ? has
          ? current.filter((x) => x !== label)
          : [...current, label]
        : has
          ? []
          : [label];
      return { ...prev, [header]: next };
    });
  };

  const submit = () => {
    const payload: QuestionAnswer[] = request.questions.map((q) => {
      const selected = answers[q.header] ?? [];
      const free = custom[q.header]?.trim();
      if (!free) return selected;
      if (q.multiple) return [...selected, free];
      return [free];
    });
    void actions.replyQuestion(request.id, payload);
  };

  return (
    <div className="rounded-lg border border-blue-400/30 bg-blue-500/10 p-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-blue-200">
        <CircleHelp className="h-3 w-3" />
        Questions
      </div>
      <div className="mt-3 space-y-3">
        {request.questions.map((question) => (
          <div key={question.header} className="space-y-2">
            <div className="text-sm text-zinc-100">{question.question}</div>
            <div className="flex flex-wrap gap-2">
              {question.options.map((option) => {
                const selected = (answers[question.header] ?? []).includes(
                  option.label,
                );
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() =>
                      toggle(question.header, option.label, question.multiple)
                    }
                    className={`rounded border px-2 py-1 text-xs transition-colors ${
                      selected
                        ? "border-blue-300 bg-blue-500/30 text-blue-50"
                        : "border-zinc-600 bg-zinc-900/60 text-zinc-200 hover:bg-zinc-800"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            {question.custom !== false && (
              <input
                type="text"
                value={custom[question.header] ?? ""}
                onChange={(event) =>
                  setCustom((prev) => ({
                    ...prev,
                    [question.header]: event.target.value,
                  }))
                }
                placeholder="Type your own answer"
                className="w-full rounded border border-zinc-700 bg-zinc-900/60 px-2 py-1 text-xs text-zinc-200 outline-none focus:border-blue-400/50"
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={submit}
          className="rounded border border-blue-300/50 bg-blue-500/25 px-3 py-1 text-xs text-blue-50 hover:bg-blue-500/35"
        >
          Submit
        </button>
        <button
          type="button"
          onClick={() => void actions.rejectQuestion(request.id)}
          className="rounded border border-zinc-600 px-3 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

function TodoBlock({ todos }: { todos: Todo[] }) {
  if (todos.length === 0) return null;

  return (
    <div className="rounded-lg border border-zinc-700/70 bg-zinc-900/70 p-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-zinc-400">
        <ListChecks className="h-3 w-3" />
        Task list
      </div>
      <div className="mt-2 space-y-1.5">
        {todos.map((todo) => {
          const done = todo.status === "completed";
          const cancelled = todo.status === "cancelled";
          return (
            <div key={todo.id} className="flex items-center gap-2.5">
              <span
                className={`inline-flex size-3.5 items-center justify-center rounded-[2px] border ${done ? "border-zinc-200/90 bg-zinc-200/10 text-zinc-100" : cancelled ? "border-zinc-600/80 bg-zinc-800/60 text-transparent" : todo.status === "in_progress" ? "border-zinc-300/90 bg-zinc-300/10 text-transparent" : "border-zinc-500/90 bg-transparent text-transparent"}`}
              >
                <Check className="size-2.5 stroke-[2.6]" />
              </span>
              <span
                className={`text-sm ${done ? "text-zinc-500 line-through" : cancelled ? "text-zinc-500" : "text-zinc-300"}`}
              >
                {todo.content}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AgentSelector({
  value,
  agents,
  onChange,
  disabled,
}: {
  value?: string;
  agents: { name: string }[];
  onChange: (agent: string) => void;
  disabled?: boolean;
}) {
  const formatAgentName = (name: string) =>
    name.length > 0 ? `${name.charAt(0).toUpperCase()}${name.slice(1)}` : name;

  const selectedAgent = agents.find((agent) => agent.name === value);

  const handleCycle = () => {
    if (agents.length === 0) return;
    const currentIndex = value
      ? agents.findIndex((agent) => agent.name === value)
      : -1;
    const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % agents.length;
    const next = agents[nextIndex];
    if (next) onChange(next.name);
  };

  return (
    <button
      type="button"
      onClick={handleCycle}
      disabled={disabled || agents.length === 0}
      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 focus:border-white/25 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      aria-label="Cycle agents"
      title="Cycle agents"
    >
      <Bot className="size-4 text-white/70" />
      <span className="max-w-[150px] truncate">
        {selectedAgent ? formatAgentName(selectedAgent.name) : "Select agent"}
      </span>
    </button>
  );
}

// ── PromptInput ───────────────────────────────────────────────────────────────

type PromptInputProps = {
  sessionID?: string;
  centered?: boolean;
  onHeightChange?: (height: number) => void;
};

export function PromptInput({
  sessionID,
  centered = true,
  onHeightChange,
}: PromptInputProps) {
  const { state, actions } = useOpenCode();
  const settings = useSettings();
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  const activeSessionID = sessionID ?? state.activeSessionID;
  const activeStatus = activeSessionID
    ? state.sessionStatus[activeSessionID]
    : undefined;
  const isBusy = activeStatus?.type === "busy";
  const selectedModelValue: ModelSelectorValue | undefined = state.selectedModel
    ? {
        providerID: state.selectedModel.providerID,
        modelID: state.selectedModel.modelID,
      }
    : undefined;
  const availableAgents = useMemo(
    () => state.agents.filter((agent) => !agent.hidden && agent.mode === "primary"),
    [state.agents],
  );

  const permissionRequest = activeSessionID
    ? (state.permissions[activeSessionID] ?? [])[0]
    : undefined;

  const questionRequest = activeSessionID
    ? (state.questions[activeSessionID] ?? [])[0]
    : undefined;

  const blocked = !!(permissionRequest || questionRequest);
  const todos = activeSessionID ? (state.todos[activeSessionID] ?? []) : [];
  const visibleTodos = todos.filter(
    (todo) => todo.status !== "completed" && todo.status !== "cancelled",
  );

  useEffect(() => {
    const handler = (event: globalThis.KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement) {
        if (target.isContentEditable) return;
        const tag = target.tagName;
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          tag === "BUTTON"
        )
          return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "Escape") {
        textareaRef.current?.blur();
        return;
      }
      if (event.key.length !== 1 || blocked) return;
      textareaRef.current?.focus();
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [blocked]);

  // Auto-resize textarea
  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 300)}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [text, resize]);

  // Notify parent of prompt dock height
  useEffect(() => {
    if (!onHeightChange || !dockRef.current) return;
    const ro = new ResizeObserver(() => {
      if (dockRef.current) onHeightChange(dockRef.current.offsetHeight);
    });
    ro.observe(dockRef.current);
    return () => ro.disconnect();
  }, [onHeightChange]);

  const send = async () => {
    const value = text.trim();
    if (!value || isBusy) return;
    setText("");
    try {
      await actions.sendPrompt({ text: value });
    } catch {
      setText(value);
    }
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      matchesKeybind(
        e.nativeEvent,
        keybindFor(settings.keybinds.all(), "prompt.submit"),
      )
    ) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <div
      ref={dockRef}
      className="absolute inset-x-0 bottom-0 pt-12 pb-4 flex flex-col justify-center items-center z-50 bg-gradient-to-t from-[#080b12] via-[#080b12]/95 to-transparent pointer-events-none"
      style={
        {
          "--prompt-height": dockRef.current
            ? `${dockRef.current.offsetHeight}px`
            : "8rem",
        } as React.CSSProperties
      }
    >
      <div
        className={`w-full px-4 pointer-events-auto ${
          centered ? "md:max-w-4xl md:mx-auto 2xl:max-w-5xl" : ""
        }`}
      >
        {/* Permission block */}
        {permissionRequest && (
          <div
            data-component="tool-part-wrapper"
            data-permission="true"
            className="mb-3"
          >
            <PermissionBlock request={permissionRequest} responding={isBusy} />
          </div>
        )}

        {/* Question block */}
        {questionRequest && (
          <div
            data-component="tool-part-wrapper"
            data-question="true"
            className="mb-3"
          >
            <QuestionBlock request={questionRequest} />
          </div>
        )}

        {/* Prompt form */}
        {visibleTodos.length > 0 && (
          <div className="mb-3">
            <TodoBlock todos={visibleTodos} />
          </div>
        )}

        {!blocked && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            className="w-full rounded-2xl border border-white/15 bg-black/70 p-2 shadow-lg backdrop-blur-sm sm:p-2.5"
          >
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Reanimate…"
              rows={3}
              className="min-h-[84px] w-full resize-none bg-transparent px-3 py-1.5 text-base font-thin text-white placeholder:text-white/35 focus:outline-none sm:text-lg"
            />

            <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-1">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <AgentSelector
                  value={state.selectedAgent}
                  agents={availableAgents}
                  onChange={(agent) => actions.setSelectedAgent(agent)}
                />
                <ModelSelector
                  value={selectedModelValue}
                  onChange={(model) => {
                    actions.setSelectedModel({
                      providerID: model.providerID,
                      modelID: model.modelID,
                    });
                  }}
                  className="max-w-[220px]"
                />
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                {isBusy ? (
                  <button
                    type="button"
                    onClick={() => void actions.abortActiveSession()}
                    className="inline-flex size-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
                    aria-label="Stop response"
                    title="Stop response"
                  >
                    <Square className="size-3.5 fill-current" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!text.trim()}
                    className="inline-flex size-8 items-center justify-center rounded-full bg-white text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/45"
                    aria-label="Send prompt"
                    title="Send prompt"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
