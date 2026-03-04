import type { Sandbox, CommandHandle, CommandResult, CommandStartOpts } from "e2b";
import { PROJECT_PATH } from "./constants";

export function runCommand(
  sandbox: Sandbox,
  command: string,
  opts?: CommandStartOpts & { background?: false }
): Promise<CommandResult>;

export function runCommand(
  sandbox: Sandbox,
  command: string,
  opts: CommandStartOpts & { background: true }
): Promise<CommandHandle>;

export function runCommand(
  sandbox: Sandbox,
  command: string,
  opts?: CommandStartOpts & { background?: boolean }
): Promise<CommandHandle | CommandResult> {
  return sandbox.commands.run(command, {
    user: "user",
    ...opts,
    envs: { TERM: "xterm", ...opts?.envs },
  });
}

export async function setupGitConfig(sandbox: Sandbox): Promise<void> {
  try {
    await runCommand(sandbox, 'git config --global user.name "Reanimate Agent"');
    await runCommand(sandbox, 'git config --global user.email "agent@reanimate.sh"');
    await runCommand(sandbox, "git config --global push.default current");
    await runCommand(sandbox, "git config --global pull.rebase true");
    await runCommand(sandbox, `git config --global --add safe.directory ${PROJECT_PATH}`);
  } catch {
    // Non-fatal — git operations will fail with a clearer error if config is missing
  }
}

export async function getHost(sandbox: Sandbox, port: number): Promise<string> {
  let host = sandbox.getHost(port);
  if (!host.startsWith("https://") && !host.startsWith("http://")) {
    host = `https://${host}`;
  }
  return host;
}
