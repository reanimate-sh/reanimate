"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren
} from "react";
import {
  createOpencodeClient,
  type Part,
  type Agent,
  type Event,
  type Message,
  type ProviderListResponse,
  type Session
} from "@opencode-ai/sdk/v2/client";
import {
  applyBootstrap,
  applyDirectoryEvent,
  applySessionMessages,
  createInitialState,
  createSessionMessagesPayload,
  groupPermissionsBySession,
  groupQuestionsBySession
} from "./reducer";
import { startGlobalEventStream } from "./events";
import type {
  ModelOption,
  ModelRef,
  OpenCodeActions,
  OpenCodeState,
  PromptPart
} from "./types";

type OpenCodeProviderProps = PropsWithChildren<{
  baseUrl: string;
  directory: string;
  fetch?: typeof fetch;
  initialPrompt?: string;
  initialModel?: ModelRef;
}>;

type OpenCodeContextValue = {
  state: OpenCodeState;
  actions: OpenCodeActions;
};

const OpenCodeContext = createContext<OpenCodeContextValue | undefined>(
  undefined
);

function errorMessage(error: unknown) {
  if (error && typeof error === "object" && "data" in error) {
    const maybeData = (error as { data?: { message?: string } }).data;
    if (maybeData?.message) return maybeData.message;
  }
  if (error instanceof Error) return error.message;
  return "Request failed";
}

// Ascending time-ordered ID generation matching opencode's Identifier.ascending()
let _lastTimestamp = 0;
let _counter = 0;

function createID(prefix: "msg" | "prt") {
  const now = Date.now();
  if (now !== _lastTimestamp) {
    _lastTimestamp = now;
    _counter = 0;
  }
  _counter += 1;

  let ts = BigInt(now) * BigInt(0x1000) + BigInt(_counter);
  const bytes = new Uint8Array(6);
  for (let i = 0; i < 6; i++) {
    bytes[i] = Number((ts >> BigInt(40 - 8 * i)) & BigInt(0xff));
  }
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const rand = new Uint8Array(14);
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    crypto.getRandomValues(rand);
  } else {
    for (let i = 0; i < 14; i++) rand[i] = Math.floor(Math.random() * 256);
  }
  const suffix = Array.from(rand)
    .map((b) => chars[b % 62])
    .join("");

  return `${prefix}_${hex}${suffix}`;
}

function modelOptionsFromProviders(
  providers?: ProviderListResponse
): ModelOption[] {
  if (!providers) return [];
  const connected = new Set(providers.connected ?? []);
  const options: ModelOption[] = [];
  for (const provider of providers.all ?? []) {
    if (!connected.has(provider.id)) continue;
    for (const [modelID, model] of Object.entries(provider.models ?? {})) {
      const modelName = model.name || modelID;
      options.push({
        providerID: provider.id,
        modelID,
        label: `${provider.name} / ${modelName}`
      });
    }
  }
  return options;
}

function pickDefaultModel(
  providers: ProviderListResponse | undefined,
  options: ModelOption[]
): ModelRef | undefined {
  if (!providers || options.length === 0) return options[0];

  for (const providerID of providers.connected ?? []) {
    const modelID = providers.default?.[providerID];
    if (!modelID) continue;
    const match = options.find(
      (entry) => entry.providerID === providerID && entry.modelID === modelID
    );
    if (match) return { providerID: match.providerID, modelID: match.modelID };
  }

  return options[0];
}

function isSelectableAgent(agent: Agent): boolean {
  return !agent.hidden && agent.mode === "primary";
}

function pickDefaultAgent(agents: Agent[]): string | undefined {
  const selectable = agents.filter(isSelectableAgent);
  return selectable[0]?.name;
}

function modelExists(
  options: ModelOption[],
  model: ModelRef | undefined
): model is ModelRef {
  if (!model) return false;
  return options.some(
    (entry) =>
      entry.providerID === model.providerID && entry.modelID === model.modelID
  );
}

function agentExists(
  agents: Agent[],
  value: string | undefined
): value is string {
  if (!value) return false;
  return agents.some(
    (entry) => entry.name === value && isSelectableAgent(entry)
  );
}

function optimisticUserMessage(input: {
  sessionID: string;
  messageID: string;
  text: string;
  agent: string;
  model: ModelRef;
  requestParts: PromptPart[];
}) {
  const message: Message = {
    id: input.messageID,
    sessionID: input.sessionID,
    role: "user",
    time: { created: Date.now() },
    agent: input.agent,
    model: {
      providerID: input.model.providerID,
      modelID: input.model.modelID
    }
  };

  // Build Part[] from PromptPart[] by adding sessionID and messageID
  const parts: Part[] = input.requestParts.map(
    (rp) =>
      ({
        ...rp,
        sessionID: input.sessionID,
        messageID: input.messageID
      }) as Part
  );

  return { message, parts };
}

function findPermissionSession(
  state: OpenCodeState,
  requestID: string
): string | undefined {
  for (const [sessionID, list] of Object.entries(state.permissions)) {
    if (list.some((entry) => entry.id === requestID)) return sessionID;
  }
  return undefined;
}

function findQuestionSession(
  state: OpenCodeState,
  requestID: string
): string | undefined {
  for (const [sessionID, list] of Object.entries(state.questions)) {
    if (list.some((entry) => entry.id === requestID)) return sessionID;
  }
  return undefined;
}

function findNextSessionID(
  sessions: Session[],
  removedSessionID: string,
  parentID: string | undefined
): string | undefined {
  if (parentID) return parentID;
  const roots = sessions.filter((entry) => !entry.parentID);
  const index = roots.findIndex((entry) => entry.id === removedSessionID);
  if (index < 0) return roots[0]?.id;
  return roots[index + 1]?.id ?? roots[index - 1]?.id;
}

export function OpenCodeProvider(props: OpenCodeProviderProps) {
  const globalClient = useMemo(
    () =>
      createOpencodeClient({
        baseUrl: props.baseUrl,
        fetch: props.fetch,
        throwOnError: true
      }),
    [props.baseUrl, props.fetch]
  );

  const directoryClient = useMemo(
    () =>
      createOpencodeClient({
        baseUrl: props.baseUrl,
        fetch: props.fetch,
        directory: props.directory,
        throwOnError: true
      }),
    [props.baseUrl, props.directory, props.fetch]
  );

  const [state, setState] = useState<OpenCodeState>(() =>
    createInitialState(props.directory)
  );
  const stateRef = useRef(state);
  const loadingSessionsRef = useRef(new Set<string>());
  const generationRef = useRef(0);
  const sentInitialPromptRef = useRef(false);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const loadSessionMessages = useCallback(
    async (sessionID: string, limit = 200) => {
      if (!sessionID) return;
      if (loadingSessionsRef.current.has(sessionID)) return;
      loadingSessionsRef.current.add(sessionID);
      const generation = generationRef.current;

      try {
        const response = await directoryClient.session.messages({
          sessionID,
          limit
        });
        if (generation !== generationRef.current) return;
        const payload = createSessionMessagesPayload(
          sessionID,
          response.data ?? []
        );
        setState((previous) => applySessionMessages(previous, payload));
      } catch (error) {
        if (generation !== generationRef.current) return;
        setState((previous) => ({
          ...previous,
          lastError: errorMessage(error)
        }));
      } finally {
        loadingSessionsRef.current.delete(sessionID);
      }
    },
    [directoryClient]
  );

  const bootstrap = useCallback(async () => {
    generationRef.current += 1;
    const generation = generationRef.current;

    setState((previous) => {
      const next = createInitialState(props.directory);
      next.activeSessionID = previous.activeSessionID;
      next.selectedAgent = previous.selectedAgent;
      next.selectedModel = previous.selectedModel;
      return next;
    });

    try {
      const [
        project,
        sessions,
        sessionStatus,
        permission,
        question,
        providers,
        providerAuth,
        agents
      ] = await Promise.all([
        directoryClient.project.current(),
        directoryClient.session.list({ roots: true, limit: 200 }),
        directoryClient.session.status(),
        directoryClient.permission.list(),
        directoryClient.question.list(),
        directoryClient.provider.list(),
        directoryClient.provider.auth(),
        directoryClient.app.agents()
      ]);

      if (generation !== generationRef.current) return;

      const providerList = providers.data;
      const providerAuthMap = providerAuth.data;
      const modelOptions = modelOptionsFromProviders(providerList);
      const agentList = agents.data ?? [];

      setState((previous) => {
        const selectedModel = modelExists(modelOptions, previous.selectedModel)
          ? previous.selectedModel
          : pickDefaultModel(providerList, modelOptions);

        const selectedAgent = agentExists(agentList, previous.selectedAgent)
          ? previous.selectedAgent
          : pickDefaultAgent(agentList);

        return applyBootstrap(previous, {
          sessions: sessions.data ?? [],
          sessionStatus: sessionStatus.data ?? {},
          permissions: groupPermissionsBySession(permission.data ?? []),
          questions: groupQuestionsBySession(question.data ?? []),
          providers: providerList,
          providerAuth: providerAuthMap,
          modelOptions,
          selectedModel,
          agents: agentList,
          selectedAgent,
          projectID: project.data?.id
        });
      });
    } catch (error) {
      if (generation !== generationRef.current) return;
      setState((previous) => ({
        ...previous,
        status: "error",
        connection: "disconnected",
        lastError: errorMessage(error)
      }));
    }
  }, [directoryClient, props.directory]);

  useEffect(() => {
    setState(createInitialState(props.directory));
    sentInitialPromptRef.current = false;
    void bootstrap();
  }, [bootstrap, props.directory]);

  useEffect(() => {
    if (!state.activeSessionID) return;
    if (state.messages[state.activeSessionID]) return;
    void loadSessionMessages(state.activeSessionID);
  }, [loadSessionMessages, state.activeSessionID, state.messages]);

  useEffect(() => {
    const controller = new AbortController();
    void startGlobalEventStream({
      client: globalClient,
      signal: controller.signal,
      onError: (error) => {
        if (controller.signal.aborted) return;
        setState((previous) => ({
          ...previous,
          connection: "disconnected",
          lastError: errorMessage(error)
        }));
      },
      onEvent: (event) => {
        if (controller.signal.aborted) return;

        setState((previous) => {
          if (!previous.lastError && previous.connection === "connected")
            return previous;
          return {
            ...previous,
            connection: "connected",
            lastError: undefined
          };
        });

        if (event.payload.type === "global.disposed") {
          void bootstrap();
          return;
        }

        if (event.directory !== props.directory) return;

        if (event.payload.type === "server.instance.disposed") {
          void bootstrap();
          return;
        }

        setState((previous) => applyDirectoryEvent(previous, event.payload));
      }
    });

    return () => {
      controller.abort();
    };
  }, [bootstrap, globalClient, props.directory]);

  const actions = useMemo<OpenCodeActions>(() => {
    return {
      refresh: async () => {
        await bootstrap();
      },
      selectSession: (sessionID: string) => {
        setState((previous) => ({
          ...previous,
          activeSessionID: sessionID
        }));
      },
      createSession: async (title?: string) => {
        const result = await directoryClient.session.create({ title });
        const session = result.data;
        if (!session) return undefined;

        setState((previous) => {
          const next = applyDirectoryEvent(previous, {
            type: "session.created",
            properties: { info: session }
          } satisfies Event);
          return {
            ...next,
            activeSessionID: session.id
          };
        });

        void loadSessionMessages(session.id);
        return session.id;
      },
      renameSession: async (sessionID, title) => {
        const nextTitle = title.trim();
        if (!nextTitle) return;
        try {
          const result = await directoryClient.session.update({
            sessionID,
            title: nextTitle
          });
          const updated = result.data;
          if (updated) {
            setState((previous) =>
              applyDirectoryEvent(previous, {
                type: "session.updated",
                properties: { info: updated }
              } satisfies Event)
            );
          }
        } catch (error) {
          setState((previous) => ({
            ...previous,
            lastError: errorMessage(error)
          }));
          void bootstrap();
        }
      },
      archiveSession: async (sessionID) => {
        try {
          const result = await directoryClient.session.update({
            sessionID,
            time: { archived: Date.now() }
          });
          const updated = result.data;
          if (updated) {
            setState((previous) => {
              const nextSessionID = findNextSessionID(
                previous.sessions,
                updated.id,
                updated.parentID
              );
              const next = applyDirectoryEvent(previous, {
                type: "session.updated",
                properties: { info: updated }
              } satisfies Event);
              if (previous.activeSessionID !== updated.id) return next;
              return {
                ...next,
                activeSessionID: nextSessionID
              };
            });
          }
        } catch (error) {
          setState((previous) => ({
            ...previous,
            lastError: errorMessage(error)
          }));
          void bootstrap();
        }
      },
      deleteSession: async (sessionID) => {
        const current = stateRef.current.sessions.find(
          (entry) => entry.id === sessionID
        );
        try {
          const response = await directoryClient.session.delete({ sessionID });
          if (!response.data) return;
          setState((previous) => {
            if (!current) return previous;
            const nextSessionID = findNextSessionID(
              previous.sessions,
              current.id,
              current.parentID
            );
            const next = applyDirectoryEvent(previous, {
              type: "session.deleted",
              properties: { info: current }
            } satisfies Event);
            if (previous.activeSessionID !== current.id) return next;
            return {
              ...next,
              activeSessionID: nextSessionID
            };
          });
          void bootstrap();
        } catch (error) {
          setState((previous) => ({
            ...previous,
            lastError: errorMessage(error)
          }));
          void bootstrap();
        }
      },
      loadSessionMessages: async (sessionID, limit) => {
        await loadSessionMessages(sessionID, limit);
      },
      shareSession: async (sessionID) => {
        try {
          const result = await directoryClient.session.share({ sessionID });
          const session = result.data;
          if (!session) return undefined;
          setState((previous) =>
            applyDirectoryEvent(previous, {
              type: "session.updated",
              properties: { info: session }
            } satisfies Event)
          );
          return session.share?.url;
        } catch (error) {
          setState((previous) => ({
            ...previous,
            lastError: errorMessage(error)
          }));
          return undefined;
        }
      },
      unshareSession: async (sessionID) => {
        try {
          const result = await directoryClient.session.unshare({ sessionID });
          const session = result.data;
          if (!session) return;
          setState((previous) =>
            applyDirectoryEvent(previous, {
              type: "session.updated",
              properties: { info: session }
            } satisfies Event)
          );
        } catch (error) {
          setState((previous) => ({
            ...previous,
            lastError: errorMessage(error)
          }));
        }
      },
      authorizeProvider: async (providerID, method) => {
        try {
          const response = await directoryClient.provider.oauth.authorize({
            providerID,
            method
          });
          const auth = response.data;
          if (auth?.url) {
            window.open(auth.url, "_blank", "noopener,noreferrer");
          }
        } catch (error) {
          setState((previous) => ({
            ...previous,
            lastError: errorMessage(error)
          }));
        }
      },
      sendPrompt: async ({ text, parts, variant }) => {
        const input = text.trim();
        if (!input) return;

        let sessionID = stateRef.current.activeSessionID;
        if (!sessionID) {
          sessionID = await actions.createSession();
        }
        if (!sessionID) return;

        const selectedModel = stateRef.current.selectedModel;
        const selectedAgent = stateRef.current.selectedAgent;
        if (!selectedModel || !selectedAgent) {
          setState((previous) => ({
            ...previous,
            lastError: "Choose a model and agent before sending a prompt."
          }));
          return;
        }

        const messageID = createID("msg");
        const requestParts: PromptPart[] = parts ?? [
          { id: createID("prt"), type: "text", text: input }
        ];
        const optimistic = optimisticUserMessage({
          sessionID,
          messageID,
          text: input,
          agent: selectedAgent,
          model: selectedModel,
          requestParts
        });

        setState((previous) => {
          let next = applyDirectoryEvent(previous, {
            type: "message.updated",
            properties: { info: optimistic.message }
          } satisfies Event);
          for (const part of optimistic.parts) {
            next = applyDirectoryEvent(next, {
              type: "message.part.updated",
              properties: { part }
            } satisfies Event);
          }
          return {
            ...next,
            sessionStatus: {
              ...next.sessionStatus,
              [sessionID]: { type: "busy" }
            },
            activeSessionID: sessionID,
            lastError: undefined
          };
        });

        try {
          await directoryClient.session.prompt({
            sessionID,
            messageID,
            agent: selectedAgent,
            model: selectedModel,
            variant,
            parts: requestParts
          });
        } catch (error) {
          setState((previous) => {
            const withoutMessage = applyDirectoryEvent(previous, {
              type: "message.removed",
              properties: { sessionID, messageID }
            } satisfies Event);
            return {
              ...withoutMessage,
              lastError: errorMessage(error),
              sessionStatus: {
                ...withoutMessage.sessionStatus,
                [sessionID]: { type: "idle" }
              }
            };
          });
          throw error;
        }
      },
      abortActiveSession: async () => {
        const sessionID = stateRef.current.activeSessionID;
        if (!sessionID) return;
        try {
          await directoryClient.session.abort({ sessionID });
        } catch (error) {
          setState((previous) => ({
            ...previous,
            lastError: errorMessage(error)
          }));
        }
      },
      setSelectedModel: (model) => {
        setState((previous) => ({
          ...previous,
          selectedModel: model
        }));
      },
      setSelectedAgent: (agent) => {
        setState((previous) => ({
          ...previous,
          selectedAgent: agentExists(previous.agents, agent)
            ? agent
            : previous.selectedAgent
        }));
      },
      replyPermission: async (requestID, reply) => {
        const sessionID = findPermissionSession(stateRef.current, requestID);
        if (sessionID) {
          setState((previous) =>
            applyDirectoryEvent(previous, {
              type: "permission.replied",
              properties: { sessionID, requestID, reply }
            } satisfies Event)
          );
        }

        try {
          await directoryClient.permission.reply({ requestID, reply });
        } catch (error) {
          setState((previous) => ({
            ...previous,
            lastError: errorMessage(error)
          }));
          void bootstrap();
        }
      },
      replyQuestion: async (requestID, answers) => {
        const sessionID = findQuestionSession(stateRef.current, requestID);
        if (sessionID) {
          setState((previous) =>
            applyDirectoryEvent(previous, {
              type: "question.replied",
              properties: { sessionID, requestID, answers }
            } satisfies Event)
          );
        }

        try {
          await directoryClient.question.reply({ requestID, answers });
        } catch (error) {
          setState((previous) => ({
            ...previous,
            lastError: errorMessage(error)
          }));
          void bootstrap();
        }
      },
      rejectQuestion: async (requestID) => {
        const sessionID = findQuestionSession(stateRef.current, requestID);
        if (sessionID) {
          setState((previous) =>
            applyDirectoryEvent(previous, {
              type: "question.rejected",
              properties: { sessionID, requestID }
            } satisfies Event)
          );
        }

        try {
          await directoryClient.question.reject({ requestID });
        } catch (error) {
          setState((previous) => ({
            ...previous,
            lastError: errorMessage(error)
          }));
          void bootstrap();
        }
      }
    };
  }, [bootstrap, directoryClient, loadSessionMessages]);

  useEffect(() => {
    const prompt = props.initialPrompt?.trim();
    if (!prompt || sentInitialPromptRef.current) {
      return;
    }
    if (
      state.status !== "ready" ||
      !state.selectedModel ||
      !state.selectedAgent
    ) {
      return;
    }

    const initialModel = props.initialModel;
    const shouldSwitchModel =
      initialModel &&
      modelExists(state.modelOptions, initialModel) &&
      (state.selectedModel.providerID !== initialModel.providerID ||
        state.selectedModel.modelID !== initialModel.modelID);

    if (shouldSwitchModel) {
      actions.setSelectedModel(initialModel);
      return;
    }

    sentInitialPromptRef.current = true;
    void actions.sendPrompt({ text: prompt }).catch(() => {
      sentInitialPromptRef.current = false;
    });
  }, [
    actions,
    props.initialModel,
    props.initialPrompt,
    state.modelOptions,
    state.selectedAgent,
    state.selectedModel,
    state.status
  ]);

  const value = useMemo<OpenCodeContextValue>(
    () => ({
      state,
      actions
    }),
    [actions, state]
  );

  return (
    <OpenCodeContext.Provider value={value}>
      {props.children}
    </OpenCodeContext.Provider>
  );
}

export function useOpenCode() {
  const value = useContext(OpenCodeContext);
  if (!value) {
    throw new Error("useOpenCode must be used within OpenCodeProvider");
  }
  return value;
}

export type { OpenCodeProviderProps, OpenCodeContextValue };
