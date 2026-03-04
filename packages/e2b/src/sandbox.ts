import { Sandbox } from "e2b";
import { LRUCache } from "lru-cache";

const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

interface CachedSandbox {
  sandboxId: string;
  apiKey: string;
  lastUpdatedAt: number;
}

// Module-level singletons — shared across all callers in the same process
const cache = new LRUCache<string, CachedSandbox>({
  ttl: 30 * 60 * 1000,
  max: 1000,
  updateAgeOnGet: true,
});
const creationLocks = new Map<string, Promise<Sandbox>>();
const timeoutLocks = new Map<string, Promise<void>>();

/**
 * Get or create a sandbox for a project.
 * Connects to an existing sandbox when `sandboxId` is provided, otherwise
 * creates a new one and calls `onCreated` to persist the new sandbox ID.
 * Deduplicates concurrent calls for the same projectId.
 */
export async function getSandbox(opts: {
  userId: string;
  projectId: string;
  sandboxId?: string;
  apiKey: string;
  templateId: string;
  onCreated?: (sandboxId: string, templateId: string) => Promise<void>;
}): Promise<Sandbox> {
  const existing = creationLocks.get(opts.projectId);
  if (existing) return existing;

  const promise = _getSandboxInner(opts);
  creationLocks.set(opts.projectId, promise);
  try {
    return await promise;
  } finally {
    creationLocks.delete(opts.projectId);
  }
}

async function _getSandboxInner(opts: {
  userId: string;
  projectId: string;
  sandboxId?: string;
  apiKey: string;
  templateId: string;
  onCreated?: (sandboxId: string, templateId: string) => Promise<void>;
}): Promise<Sandbox> {
  const { userId, projectId, sandboxId, apiKey, templateId, onCreated } = opts;

  if (sandboxId) {
    try {
      const sandbox = await Sandbox.connect(sandboxId, { apiKey, timeoutMs: TIMEOUT_MS });
      setCached(projectId, sandbox.sandboxId, apiKey);
      return sandbox;
    } catch {
      // Fall through to create a new sandbox
    }
  }

  const sandbox = await Sandbox.betaCreate(templateId, {
    apiKey,
    timeoutMs: TIMEOUT_MS,
    autoPause: true,
    metadata: {
      ...(userId && { userId }),
      ...(projectId && { projectId }),
    },
  });

  setCached(projectId, sandbox.sandboxId, apiKey);
  await onCreated?.(sandbox.sandboxId, templateId);
  return sandbox;
}

/**
 * Connect directly to a sandbox by ID without any caching or creation logic.
 */
export function connectSandbox(sandboxId: string, apiKey: string): Promise<Sandbox> {
  return Sandbox.connect(sandboxId, { apiKey });
}

/**
 * Extend a sandbox's timeout. Debounced — only hits the API if >55s have
 * passed since the last update.
 */
export function resetSandboxTimeout(projectId: string): Promise<void> {
  const existing = timeoutLocks.get(projectId);
  if (existing) return existing;

  const cached = cache.get(projectId);
  if (!cached || Date.now() - cached.lastUpdatedAt < 55_000) return Promise.resolve();

  const promise = _extendTimeout(projectId, cached).finally(() =>
    timeoutLocks.delete(projectId)
  );
  timeoutLocks.set(projectId, promise);
  return promise;
}

async function _extendTimeout(projectId: string, cached: CachedSandbox): Promise<void> {
  try {
    await Sandbox.setTimeout(cached.sandboxId, TIMEOUT_MS, { apiKey: cached.apiKey });
    cache.set(projectId, { ...cached, lastUpdatedAt: Date.now() });
  } catch {
    // Non-fatal — sandbox may have been paused or killed
  }
}

function setCached(projectId: string, sandboxId: string, apiKey: string): void {
  const existing = cache.get(projectId);
  if (existing && existing.sandboxId !== sandboxId) {
    Sandbox.kill(existing.sandboxId, { apiKey: existing.apiKey }).catch(() => {});
  }
  cache.set(projectId, { sandboxId, apiKey, lastUpdatedAt: Date.now() });
}
