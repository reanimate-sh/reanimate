import type { Sandbox } from "e2b";
import { getHost, runCommand } from "./utils";
import { AGENT_PORT, PROJECT_PATH } from "./constants";

export function getAgentUrl(sandbox: Sandbox): Promise<string> {
  return getHost(sandbox, AGENT_PORT);
}

export async function stopAgent(sandbox: Sandbox): Promise<void> {
  await runCommand(sandbox, `sudo lsof -ti :${AGENT_PORT} | xargs -r sudo kill -9`, {
    user: "root",
  }).catch(() => {});
}

export async function startAgent(
  sandbox: Sandbox,
  envs?: Record<string, string>
): Promise<void> {
  await runCommand(sandbox, "opencode serve --port 4095", {
    background: true,
    timeoutMs: 0,
    cwd: PROJECT_PATH,
    envs,
  }).catch(() => {});
}

export async function updateAgent(
  sandbox: Sandbox
): Promise<{ success: boolean; error?: unknown }> {
  try {
    await stopAgent(sandbox);

    await runCommand(sandbox, "rm -rf /usr/local/lib/node_modules/.opencode-*", {
      user: "root",
      timeoutMs: 10000,
    }).catch(() => {});

    await runCommand(sandbox, "rm -rf /home/user/.cache/opencode/models.json", {
      user: "root",
      timeoutMs: 30000,
    }).catch(() => {});

    const result = await runCommand(sandbox, "npm i -g --force opencode-ai", {
      user: "root",
      timeoutMs: 300000,
    });

    if (result.exitCode === 0) return { success: true };

    throw new Error(`Install failed: ${result.stderr || result.stdout}`);
  } catch (error) {
    return { success: false, error };
  }
}

// Returns true if streaming, false if reachable but not streaming, null if unreachable
export async function isAgentStreaming(
  sandbox: Sandbox
): Promise<boolean | null> {
  try {
    const agentUrl = await getAgentUrl(sandbox);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    try {
      const res = await fetch(
        `${agentUrl}/session/status?directory=${encodeURIComponent(PROJECT_PATH)}`,
        { signal: controller.signal }
      );
      if (!res.ok) return null;
      const data = await res.json();
      return Object.keys(data).length > 0;
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    return null;
  }
}

export async function shouldRestartAgent(
  sandbox: Sandbox
): Promise<boolean> {
  try {
    const isStreaming = await isAgentStreaming(sandbox);
    if (isStreaming === null) return true;
    if (isStreaming) return false;

    const [installed, latest] = await Promise.all([
      runCommand(sandbox, "opencode --version", { timeoutMs: 10000 }),
      runCommand(sandbox, "npm view opencode-ai version", { timeoutMs: 10000 }),
    ]);

    const normalize = (v: string) => v.replace(/-/g, "");
    return normalize(installed.stdout.trim()) !== normalize(latest.stdout.trim());
  } catch {
    return true;
  }
}
