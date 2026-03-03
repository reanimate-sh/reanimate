import type {
  Agent,
  Event,
  Message,
  Part,
  PermissionRequest,
  ProviderListResponse,
  ProviderAuthMethod,
  QuestionAnswer,
  QuestionRequest,
  Session,
  SessionStatus,
  TextPartInput,
  FilePartInput,
  AgentPartInput,
  Todo,
} from "@opencode-ai/sdk/v2/client";

export type PromptPart = (TextPartInput | FilePartInput | AgentPartInput) & {
  id: string;
};

export type ModelRef = {
  providerID: string;
  modelID: string;
};

export type ModelOption = ModelRef & {
  label: string;
};

export type OpenCodeState = {
  status: "loading" | "ready" | "error";
  connection: "connecting" | "connected" | "disconnected";
  directory: string;
  projectID?: string;
  sessions: Session[];
  sessionTotal: number;
  activeSessionID?: string;
  sessionStatus: Record<string, SessionStatus>;
  messages: Record<string, Message[]>;
  parts: Record<string, Part[]>;
  todos: Record<string, Todo[]>;
  permissions: Record<string, PermissionRequest[]>;
  questions: Record<string, QuestionRequest[]>;
  providers?: ProviderListResponse;
  providerAuth?: Record<string, ProviderAuthMethod[]>;
  modelOptions: ModelOption[];
  selectedModel?: ModelRef;
  agents: Agent[];
  selectedAgent?: string;
  lastError?: string;
};

export type BootstrapPayload = {
  sessions: Session[];
  sessionStatus: Record<string, SessionStatus>;
  permissions: Record<string, PermissionRequest[]>;
  questions: Record<string, QuestionRequest[]>;
  providers?: ProviderListResponse;
  providerAuth?: Record<string, ProviderAuthMethod[]>;
  modelOptions: ModelOption[];
  selectedModel?: ModelRef;
  agents: Agent[];
  selectedAgent?: string;
  projectID?: string;
};

export type SessionMessagesPayload = {
  sessionID: string;
  messages: Message[];
  parts: Record<string, Part[]>;
};

export type DirectoryEvent = {
  directory: string;
  payload: Event;
};

export type OpenCodeActions = {
  refresh: () => Promise<void>;
  selectSession: (sessionID: string) => void;
  createSession: (title?: string) => Promise<string | undefined>;
  renameSession: (sessionID: string, title: string) => Promise<void>;
  archiveSession: (sessionID: string) => Promise<void>;
  deleteSession: (sessionID: string) => Promise<void>;
  loadSessionMessages: (sessionID: string, limit?: number) => Promise<void>;
  shareSession: (sessionID: string) => Promise<string | undefined>;
  unshareSession: (sessionID: string) => Promise<void>;
  authorizeProvider: (providerID: string, method?: number) => Promise<void>;
  sendPrompt: (input: {
    text: string;
    parts?: PromptPart[];
    variant?: string;
  }) => Promise<void>;
  abortActiveSession: () => Promise<void>;
  setSelectedModel: (model: ModelRef) => void;
  setSelectedAgent: (agent: string) => void;
  replyPermission: (
    requestID: string,
    reply: "once" | "always" | "reject",
  ) => Promise<void>;
  replyQuestion: (
    requestID: string,
    answers: QuestionAnswer[],
  ) => Promise<void>;
  rejectQuestion: (requestID: string) => Promise<void>;
};
