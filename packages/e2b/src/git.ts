import type { Sandbox } from "e2b";
import { runCommand } from "./utils";
import { PROJECT_PATH } from "./constants";

export interface GitResult {
  success: boolean;
  error?: string;
}

export interface GitCommitResult extends GitResult {
  commitHash?: string;
}

export interface GitDiffResult extends GitResult {
  output?: string;
}

export function getCwd(cwd?: string): string {
  return cwd ?? PROJECT_PATH;
}

export async function gitInit(sandbox: Sandbox, cwd: string): Promise<void> {
  const result = await runCommand(sandbox, "git init", { cwd });
  if (result.exitCode !== 0) {
    throw new Error(`git init failed with code ${result.exitCode}`);
  }
}

export async function gitRestore(sandbox: Sandbox, cwd: string): Promise<void> {
  await runCommand(sandbox, "git restore .", { cwd }).catch(() => {});
}

export async function gitCommit(
  sandbox: Sandbox,
  cwd: string,
  commitMessage: string,
  commitTag: string
): Promise<GitCommitResult> {
  try {
    const escapedMessage = commitMessage.replace(/"/g, '\\"');

    const addResult = await runCommand(sandbox, "git add .", { cwd });
    if (addResult.exitCode !== 0) {
      throw new Error(`git add failed with code ${addResult.exitCode}`);
    }

    const commitResult = await runCommand(
      sandbox,
      `git commit --allow-empty -m "${escapedMessage}"`,
      { cwd }
    );
    if (commitResult.exitCode !== 0) {
      throw new Error(
        `git commit failed with code ${commitResult.exitCode}: ${commitResult.stderr}`
      );
    }

    const commitHash = await tagCurrentCommit(sandbox, cwd, commitTag);
    return { success: true, commitHash: commitHash || undefined };
  } catch (error: any) {
    return { success: false, error: error?.message ?? "Unknown git commit error" };
  }
}

export async function checkoutToCommit(
  sandbox: Sandbox,
  cwd: string,
  commitHashOrTag: string
): Promise<void> {
  const exists = await validateCommitExists(sandbox, cwd, commitHashOrTag);
  if (!exists) {
    throw new Error(`Commit ${commitHashOrTag} does not exist or is invalid`);
  }

  const result = await runCommand(
    sandbox,
    `git reset --hard ${commitHashOrTag}`,
    { cwd }
  );
  if (result.exitCode !== 0) {
    throw new Error(
      `git reset failed with code ${result.exitCode}: ${result.stderr}`
    );
  }
}

export async function validateCommitExists(
  sandbox: Sandbox,
  cwd: string,
  commitHashOrTag: string
): Promise<boolean> {
  try {
    const result = await runCommand(
      sandbox,
      `git show ${commitHashOrTag} --quiet`,
      { cwd }
    );
    return result.exitCode === 0;
  } catch {
    return false;
  }
}

export async function getCurrentCommitHash(
  sandbox: Sandbox,
  cwd: string
): Promise<GitResult & { commitHash?: string }> {
  try {
    const result = await runCommand(sandbox, "git rev-parse HEAD", { cwd });
    if (result.exitCode === 0 && result.stdout) {
      return { success: true, commitHash: result.stdout.trim() };
    }
    return { success: false, error: `Failed to get commit hash, code: ${result.exitCode}` };
  } catch (error: any) {
    return { success: false, error: error?.message ?? "Failed to get commit hash" };
  }
}

export async function tagCurrentCommit(
  sandbox: Sandbox,
  cwd: string,
  tagName: string
): Promise<string> {
  const hashResult = await runCommand(sandbox, "git rev-parse HEAD", { cwd });
  const commitHash = hashResult.exitCode === 0 ? hashResult.stdout.trim() : "";

  if (commitHash) {
    await runCommand(sandbox, `git tag ${tagName} ${commitHash}`, { cwd }).catch(() => {});
  }

  return commitHash;
}

export async function getCurrentBranch(sandbox: Sandbox, cwd: string): Promise<string> {
  const result = await runCommand(sandbox, "git branch --show-current", { cwd });
  return result.stdout.trim();
}

export async function isDetachedHead(sandbox: Sandbox, cwd: string): Promise<boolean> {
  try {
    const result = await runCommand(sandbox, "git symbolic-ref -q HEAD", { cwd });
    return result.exitCode !== 0;
  } catch {
    return true;
  }
}

export async function fixDetachedHead(
  sandbox: Sandbox,
  cwd: string
): Promise<GitResult> {
  try {
    if (!(await isDetachedHead(sandbox, cwd))) return { success: true };

    const branchResult = await runCommand(sandbox, "git branch -f master HEAD", { cwd });
    if (branchResult.exitCode !== 0) {
      throw new Error(`Failed to move master branch: ${branchResult.stderr}`);
    }

    const checkoutResult = await runCommand(sandbox, "git checkout master", { cwd });
    if (checkoutResult.exitCode !== 0) {
      throw new Error(`Failed to checkout master: ${checkoutResult.stderr}`);
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message ?? "Failed to fix detached HEAD" };
  }
}

export async function getDiffNameStatus(
  sandbox: Sandbox,
  cwd: string,
  fromCommit: string,
  toCommit: string
): Promise<GitDiffResult> {
  try {
    const result = await runCommand(
      sandbox,
      `git diff --name-status ${fromCommit}..${toCommit} -- . ':!.reanimate' ':!.reanimate-attachments'`,
      { cwd }
    );
    if (result.exitCode === 0) return { success: true, output: result.stdout };
    throw new Error(`git diff failed with code ${result.exitCode}: ${result.stderr}`);
  } catch (error: any) {
    return { success: false, error: error?.message ?? "Failed to get git diff" };
  }
}

export async function extractFilesAtCommit(
  sandbox: Sandbox,
  sourcePath: string,
  targetPath: string,
  commitHash: string
): Promise<GitResult> {
  try {
    const result = await runCommand(
      sandbox,
      `git archive --format=tar ${commitHash} | tar -x -C ${targetPath}`,
      { cwd: sourcePath }
    );
    if (result.exitCode === 0) return { success: true };
    throw new Error(`git archive failed with code ${result.exitCode}: ${result.stderr}`);
  } catch (error: any) {
    return { success: false, error: error?.message ?? "Failed to extract files at commit" };
  }
}

export async function addRemote(
  sandbox: Sandbox,
  cwd: string,
  repoUrl: string,
  token: string
): Promise<GitResult> {
  try {
    const authenticatedUrl = repoUrl.replace(
      "https://github.com/",
      `https://${token}@github.com/`
    );

    await runCommand(sandbox, "git remote remove origin", { cwd }).catch(() => {});

    const result = await runCommand(
      sandbox,
      `git remote add origin ${authenticatedUrl}`,
      { cwd }
    );
    if (result.exitCode === 0) return { success: true };
    throw new Error(`git remote add failed with code ${result.exitCode}: ${result.stderr}`);
  } catch (error: any) {
    return { success: false, error: error?.message ?? "Failed to add git remote" };
  }
}

export async function pushToRemote(sandbox: Sandbox, cwd: string): Promise<GitResult> {
  try {
    const branch = await getCurrentBranch(sandbox, cwd);
    const result = await runCommand(
      sandbox,
      `git push --force origin ${branch}`,
      { cwd }
    );
    if (result.exitCode === 0) return { success: true };
    throw new Error(`git push failed with code ${result.exitCode}: ${result.stderr}`);
  } catch (error: any) {
    return { success: false, error: error?.message ?? "Failed to push to remote" };
  }
}

export async function pullFromRemote(
  sandbox: Sandbox,
  cwd: string
): Promise<GitResult & { diverged?: boolean }> {
  try {
    const hasRemote = await hasRemoteOrigin(sandbox, cwd);
    if (!hasRemote) return { success: true };

    const branch = await getCurrentBranch(sandbox, cwd);

    const pullResult = await runCommand(
      sandbox,
      `git pull --ff-only origin ${branch}`,
      { cwd }
    );

    if (pullResult.exitCode === 0) return { success: true, diverged: false };

    // Fast-forward failed — fetch remote refs but keep local state
    await runCommand(sandbox, `git fetch origin ${branch}`, { cwd }).catch(() => {});
    return { success: true, diverged: true };
  } catch (error: any) {
    return { success: false, error: error?.message ?? "Failed to pull from remote" };
  }
}

export async function hasChangesToCommit(sandbox: Sandbox, cwd: string): Promise<boolean> {
  try {
    const result = await runCommand(sandbox, "git status --porcelain", { cwd });
    if (result.exitCode === 0) return result.stdout?.trim().length > 0;
    throw new Error(`git status failed with code ${result.exitCode}`);
  } catch {
    return true; // Assume there are changes if we can't check
  }
}

export async function hasUnpushedCommits(sandbox: Sandbox, cwd: string): Promise<boolean> {
  try {
    const result = await runCommand(sandbox, "git push --dry-run 2>&1", { cwd });
    if (result.exitCode === 0) return !result.stdout?.trim().startsWith("Everything");
    throw new Error(`git push --dry-run failed with code ${result.exitCode}`);
  } catch {
    return false;
  }
}

async function hasRemoteOrigin(sandbox: Sandbox, cwd: string): Promise<boolean> {
  try {
    const result = await runCommand(sandbox, "git remote get-url origin", { cwd });
    return result.exitCode === 0;
  } catch {
    return false;
  }
}
