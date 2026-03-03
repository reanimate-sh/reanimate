import type {
  Event,
  Message,
  Part,
  PermissionRequest,
  QuestionRequest,
  Session,
  Todo,
} from "@opencode-ai/sdk/v2/client";
import type {
  BootstrapPayload,
  OpenCodeState,
  SessionMessagesPayload,
} from "./types";

function compareID(a: string, b: string) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function upsertByID<T extends { id: string }>(
  list: T[] | undefined,
  item: T,
): T[] {
  if (!list || list.length === 0) return [item];

  let low = 0;
  let high = list.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const cmp = compareID(list[mid]!.id, item.id);
    if (cmp === 0) {
      const next = list.slice();
      next[mid] = item;
      return next;
    }
    if (cmp < 0) low = mid + 1;
    if (cmp > 0) high = mid - 1;
  }

  const next = list.slice();
  next.splice(low, 0, item);
  return next;
}

function removeByID<T extends { id: string }>(
  list: T[] | undefined,
  id: string,
): T[] | undefined {
  if (!list || list.length === 0) return list;
  const idx = list.findIndex((entry) => entry.id === id);
  if (idx < 0) return list;
  if (list.length === 1) return [];
  const next = list.slice();
  next.splice(idx, 1);
  return next;
}

function groupBySession<T extends { id: string; sessionID: string }>(
  items: T[],
): Record<string, T[]> {
  const grouped: Record<string, T[]> = {};
  for (const item of items) {
    if (!item.id || !item.sessionID) continue;
    const existing = grouped[item.sessionID];
    if (!existing) grouped[item.sessionID] = [item];
    if (existing) existing.push(item);
  }
  return grouped;
}

function removeSessionCaches(
  state: OpenCodeState,
  sessionID: string,
): OpenCodeState {
  if (!sessionID) return state;
  const next = { ...state };
  if (next.messages[sessionID]) {
    const parts = { ...next.parts };
    for (const message of next.messages[sessionID] ?? []) {
      delete parts[message.id];
    }
    next.parts = parts;
  }

  const messages = { ...next.messages };
  const todos = { ...next.todos };
  const permissions = { ...next.permissions };
  const questions = { ...next.questions };
  const status = { ...next.sessionStatus };

  delete messages[sessionID];
  delete todos[sessionID];
  delete permissions[sessionID];
  delete questions[sessionID];
  delete status[sessionID];

  next.messages = messages;
  next.todos = todos;
  next.permissions = permissions;
  next.questions = questions;
  next.sessionStatus = status;
  return next;
}

export function createInitialState(directory: string): OpenCodeState {
  return {
    status: "loading",
    connection: "connecting",
    directory,
    sessions: [],
    sessionTotal: 0,
    sessionStatus: {},
    messages: {},
    parts: {},
    todos: {},
    permissions: {},
    questions: {},
    modelOptions: [],
    agents: [],
  };
}

export function applyBootstrap(
  state: OpenCodeState,
  payload: BootstrapPayload,
): OpenCodeState {
  const sessions = payload.sessions
    .filter((entry) => !entry.time.archived)
    .slice()
    .sort((a, b) => compareID(a.id, b.id));

  const activeSessionID =
    state.activeSessionID &&
    sessions.some((session) => session.id === state.activeSessionID)
      ? state.activeSessionID
      : sessions[0]?.id;

  return {
    ...state,
    status: "ready",
    connection: "connected",
    lastError: undefined,
    projectID: payload.projectID,
    sessions,
    sessionTotal: sessions.filter((entry) => !entry.parentID).length,
    sessionStatus: payload.sessionStatus,
    permissions: payload.permissions,
    questions: payload.questions,
    providers: payload.providers,
    providerAuth: payload.providerAuth,
    modelOptions: payload.modelOptions,
    selectedModel: payload.selectedModel,
    agents: payload.agents,
    selectedAgent: payload.selectedAgent,
    activeSessionID,
  };
}

export function applySessionMessages(
  state: OpenCodeState,
  payload: SessionMessagesPayload,
): OpenCodeState {
  return {
    ...state,
    messages: {
      ...state.messages,
      [payload.sessionID]: payload.messages,
    },
    parts: {
      ...state.parts,
      ...payload.parts,
    },
  };
}

export function applyDirectoryEvent(
  state: OpenCodeState,
  event: Event,
): OpenCodeState {
  switch (event.type) {
    case "session.created": {
      const info = event.properties.info;
      const sessions = upsertByID(state.sessions, info);
      return {
        ...state,
        sessions,
        sessionTotal: info.parentID
          ? state.sessionTotal
          : state.sessionTotal + 1,
      };
    }
    case "session.updated": {
      const info = event.properties.info;
      const exists = state.sessions.some((entry) => entry.id === info.id);

      if (info.time.archived) {
        const sessions = state.sessions.filter((entry) => entry.id !== info.id);
        const cleaned = removeSessionCaches(
          {
            ...state,
            sessions,
            sessionTotal: info.parentID
              ? state.sessionTotal
              : Math.max(0, state.sessionTotal - (exists ? 1 : 0)),
            activeSessionID:
              state.activeSessionID === info.id
                ? sessions[0]?.id
                : state.activeSessionID,
          },
          info.id,
        );
        return cleaned;
      }

      return {
        ...state,
        sessions: upsertByID(state.sessions, info),
      };
    }
    case "session.deleted": {
      const info = event.properties.info;
      const exists = state.sessions.some((entry) => entry.id === info.id);
      const sessions = state.sessions.filter((entry) => entry.id !== info.id);
      const cleaned = removeSessionCaches(
        {
          ...state,
          sessions,
          sessionTotal: info.parentID
            ? state.sessionTotal
            : Math.max(0, state.sessionTotal - (exists ? 1 : 0)),
          activeSessionID:
            state.activeSessionID === info.id
              ? sessions[0]?.id
              : state.activeSessionID,
        },
        info.id,
      );
      return cleaned;
    }
    case "session.status": {
      return {
        ...state,
        sessionStatus: {
          ...state.sessionStatus,
          [event.properties.sessionID]: event.properties.status,
        },
      };
    }
    case "message.updated": {
      const info = event.properties.info;
      const nextSessionMessages = upsertByID(
        state.messages[info.sessionID],
        info,
      );
      return {
        ...state,
        messages: {
          ...state.messages,
          [info.sessionID]: nextSessionMessages,
        },
      };
    }
    case "message.removed": {
      const sessionID = event.properties.sessionID;
      const messageID = event.properties.messageID;
      const nextMessages =
        removeByID(state.messages[sessionID], messageID) ?? [];
      const parts = { ...state.parts };
      delete parts[messageID];
      return {
        ...state,
        messages: {
          ...state.messages,
          [sessionID]: nextMessages,
        },
        parts,
      };
    }
    case "message.part.updated": {
      const part = event.properties.part;
      const nextParts = upsertByID(state.parts[part.messageID], part);
      return {
        ...state,
        parts: {
          ...state.parts,
          [part.messageID]: nextParts,
        },
      };
    }
    case "message.part.removed": {
      const messageID = event.properties.messageID;
      const partID = event.properties.partID;
      const list = removeByID(state.parts[messageID], partID);
      const parts = { ...state.parts };
      if (!list || list.length === 0) delete parts[messageID];
      if (list && list.length > 0) parts[messageID] = list;
      return {
        ...state,
        parts,
      };
    }
    case "todo.updated": {
      const sessionID = event.properties.sessionID;
      return {
        ...state,
        todos: {
          ...state.todos,
          [sessionID]: event.properties.todos
            .slice()
            .sort((a, b) => compareID(a.id, b.id)),
        },
      };
    }
    case "permission.asked": {
      const permission = event.properties;
      const list = upsertByID(
        state.permissions[permission.sessionID],
        permission,
      );
      return {
        ...state,
        permissions: {
          ...state.permissions,
          [permission.sessionID]: list,
        },
      };
    }
    case "permission.replied": {
      const sessionID = event.properties.sessionID;
      const list =
        removeByID(state.permissions[sessionID], event.properties.requestID) ??
        [];
      return {
        ...state,
        permissions: {
          ...state.permissions,
          [sessionID]: list,
        },
      };
    }
    case "question.asked": {
      const question = event.properties;
      const list = upsertByID(state.questions[question.sessionID], question);
      return {
        ...state,
        questions: {
          ...state.questions,
          [question.sessionID]: list,
        },
      };
    }
    case "question.replied":
    case "question.rejected": {
      const sessionID = event.properties.sessionID;
      const list =
        removeByID(state.questions[sessionID], event.properties.requestID) ??
        [];
      return {
        ...state,
        questions: {
          ...state.questions,
          [sessionID]: list,
        },
      };
    }
    default: {
      return state;
    }
  }
}

export function groupPermissionsBySession(
  input: PermissionRequest[],
): Record<string, PermissionRequest[]> {
  const grouped = groupBySession(input);
  for (const key of Object.keys(grouped)) {
    grouped[key] = grouped[key]!.slice().sort((a, b) => compareID(a.id, b.id));
  }
  return grouped;
}

export function groupQuestionsBySession(
  input: QuestionRequest[],
): Record<string, QuestionRequest[]> {
  const grouped = groupBySession(input);
  for (const key of Object.keys(grouped)) {
    grouped[key] = grouped[key]!.slice().sort((a, b) => compareID(a.id, b.id));
  }
  return grouped;
}

export function createSessionMessagesPayload(
  sessionID: string,
  rows: Array<{ info: Message; parts: Part[] }>,
): SessionMessagesPayload {
  const messages = rows
    .map((row) => row.info)
    .sort((a, b) => compareID(a.id, b.id));
  const parts: Record<string, Part[]> = {};
  for (const row of rows) {
    parts[row.info.id] = row.parts
      .slice()
      .sort((a, b) => compareID(a.id, b.id));
  }
  return { sessionID, messages, parts };
}
