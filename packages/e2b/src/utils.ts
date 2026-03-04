import type { Sandbox, CommandHandle, CommandResult, CommandStartOpts } from "e2b";

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

export async function getHost(sandbox: Sandbox, port: number): Promise<string> {
  let host = sandbox.getHost(port);
  if (!host.startsWith("https://") && !host.startsWith("http://")) {
    host = `https://${host}`;
  }
  return host;
}
