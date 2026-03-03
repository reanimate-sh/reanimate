import type { Event, GlobalEvent, OpencodeClient } from "@opencode-ai/sdk/v2/client";
import type { DirectoryEvent } from "./types";

type StartStreamInput = {
  client: OpencodeClient;
  signal: AbortSignal;
  onEvent: (event: DirectoryEvent) => void;
  onError: (error: unknown) => void;
};

const FLUSH_FRAME_MS = 16;
const STREAM_YIELD_MS = 8;
const RECONNECT_DELAY_MS = 250;

type Queued = {
  directory: string;
  payload: Event;
};

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function keyFor(event: Queued) {
  if (event.payload.type === "session.status") {
    return `session.status:${event.directory}:${event.payload.properties.sessionID}`;
  }

  if (event.payload.type === "lsp.updated") {
    return `lsp.updated:${event.directory}`;
  }

  if (event.payload.type === "message.part.updated") {
    return `message.part.updated:${event.directory}:${event.payload.properties.part.messageID}:${event.payload.properties.part.id}`;
  }

  return undefined;
}

export async function startGlobalEventStream(input: StartStreamInput) {
  let queue: Queued[] = [];
  let buffer: Queued[] = [];
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastFlush = 0;
  const coalesced = new Map<string, number>();

  const flush = () => {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }

    if (queue.length === 0) return;

    const events = queue;
    queue = buffer;
    buffer = events;
    queue.length = 0;
    coalesced.clear();

    lastFlush = Date.now();
    for (const item of events) {
      input.onEvent(item);
    }

    buffer.length = 0;
  };

  const scheduleFlush = () => {
    if (timer) return;
    const elapsed = Date.now() - lastFlush;
    timer = setTimeout(flush, Math.max(0, FLUSH_FRAME_MS - elapsed));
  };

  while (!input.signal.aborted) {
    try {
      const response = await input.client.global.event({
        onSseError: (error) => {
          if (input.signal.aborted) return;
          input.onError(error);
        },
      });

      let yieldedAt = Date.now();

      for await (const event of response.stream as AsyncIterable<GlobalEvent>) {
        if (input.signal.aborted) break;
        const directory = event.directory ?? "global";
        const payload = event.payload;
        const queued = { directory, payload };
        const key = keyFor(queued);
        if (key) {
          const existingIndex = coalesced.get(key);
          if (existingIndex !== undefined) {
            queue[existingIndex] = queued;
            continue;
          }
          coalesced.set(key, queue.length);
        }
        queue.push(queued);
        scheduleFlush();

        if (Date.now() - yieldedAt < STREAM_YIELD_MS) continue;
        yieldedAt = Date.now();
        await wait(0);
      }
    } catch (error) {
      if (!input.signal.aborted) input.onError(error);
    }

    if (input.signal.aborted) break;
    await wait(RECONNECT_DELAY_MS);
  }

  flush();
}
