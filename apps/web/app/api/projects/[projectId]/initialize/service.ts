import type { Sandbox } from "@reanimate/e2b";
import {
  startAgent,
  updateAgent,
  shouldRestartAgent,
  gitInit,
  gitCommit,
  downloadAndExtractArchive,
  runCommand,
  DEFAULT_TEMPLATE,
  PROJECT_PATH,
} from "@reanimate/e2b";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export async function projectExistsInSandbox(sandbox: Sandbox): Promise<boolean> {
  const result = await runCommand(
    sandbox,
    `test -d ${PROJECT_PATH} && echo exists || echo missing`
  );
  return result.stdout.trim() === "exists";
}

export async function initializeProject(sandbox: Sandbox, projectId: string): Promise<void> {
  await runCommand(sandbox, `mkdir -p ${PROJECT_PATH}`);
  await downloadTemplate(sandbox);
  await renameEnvExample(sandbox);
  await initGitRepo(sandbox, projectId);
}

async function downloadTemplate(sandbox: Sandbox): Promise<void> {
  const template = DEFAULT_TEMPLATE;
  const archiveUrl = `https://github.com/${template.templateName}/archive/refs/heads/main.zip`;
  await downloadAndExtractArchive(sandbox, archiveUrl, PROJECT_PATH, GITHUB_TOKEN);
}

async function renameEnvExample(sandbox: Sandbox): Promise<void> {
  await runCommand(
    sandbox,
    `[ -f ${PROJECT_PATH}/.env.example ] && mv ${PROJECT_PATH}/.env.example ${PROJECT_PATH}/.env || true`
  ).catch(() => {});
}

async function initGitRepo(sandbox: Sandbox, projectId: string): Promise<void> {
  await gitInit(sandbox, PROJECT_PATH);
  await gitCommit(sandbox, PROJECT_PATH, "Initial template setup", `template-${projectId}`);
}

export async function ensureAgentRunning(sandbox: Sandbox): Promise<void> {
  const needsRestart = await shouldRestartAgent(sandbox);
  if (needsRestart) {
    const envs = {
      IDEAVO_MINIMAL_MODE: "1",
      IDEAVO_API_KEY: ""
    }
    await updateAgent(sandbox);
    await startAgent(sandbox, envs);
  }
}

export { PROJECT_PATH };
