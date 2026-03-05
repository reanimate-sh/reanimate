import type { Sandbox } from "e2b";
import { runCommand } from "./utils";
import { PROJECT_PATH } from "./constants";

interface Step {
  name: string;
  command: string;
}

interface EnvSource {
  name: string;
  path: string;
}

interface RunStep extends Step {
  port: number;
}

export interface TemplateConfig {
  systemSetup?: Step[];
  templateName: string;
  description: string;
  projectDependencies: Step[];
  codeChecks: Step[];
  runStep: RunStep[];
  buildSteps: Step[];
  deploySteps: Step[];
  cleanupFiles: string[];
  packageManager: string;
  isLegacy?: boolean;
  envPaths: EnvSource[];
}

export const templateConfigs: TemplateConfig[] = [
  {
    templateName: "reanimate-sh/nextjs-tailwind-template",
    description:
      "This template uses the Next.js App directory, with TailwindCSS",
    projectDependencies: [{ name: "Install Dependencies", command: "bun i" }],
    runStep: [{ name: "Run Dev Server", command: "bun run remotion", port: 4000 }],
    codeChecks: [],
    buildSteps: [{ name: "Build", command: "bun run build" }],
    deploySteps: [{ name: "Start Production Server", command: "bun run start" }],
    cleanupFiles: [".next", "node_modules"],
    packageManager: "bun",
    envPaths: [{ name: "default", path: ".env" }],
  },
];

export const DEFAULT_TEMPLATE: TemplateConfig = templateConfigs[0];

const TEMPLATE_FILE = `${PROJECT_PATH}/.reanimate/template`;
const CONFIG_FILE = `${PROJECT_PATH}/.reanimate/config`;

export async function getTemplateConfig(sandbox: Sandbox): Promise<TemplateConfig> {
  try {
    const templateName = (await sandbox.files.read(TEMPLATE_FILE, { format: "text" })).trim();

    if (templateName.startsWith("custom")) {
      const rawConfig = await sandbox.files.read(CONFIG_FILE, { format: "text" });
      return JSON.parse(rawConfig) as TemplateConfig;
    }

    const config = templateConfigs.find((c) => c.templateName.endsWith(templateName));
    if (!config) throw new Error(`Template not found: ${templateName}`);
    return config;
  } catch {
    return DEFAULT_TEMPLATE;
  }
}

export type OutputCallback = (data: string, stream: "stdout" | "stderr" | "command") => void;

export async function runSystemSetupSteps(
  sandbox: Sandbox,
  onOutput?: OutputCallback
): Promise<{ success: boolean; error?: string }> {
  const templateConfig = await getTemplateConfig(sandbox);
  const steps = templateConfig.systemSetup ?? [];

  if (steps.length === 0) {
    return { success: false, error: "No system setup configuration found." };
  }

  for (const step of steps) {
    onOutput?.(`$ ${step.command}`, "command");

    const handle = await runCommand(sandbox, step.command, {
      cwd: PROJECT_PATH,
      timeoutMs: 0,
      background: true,
      onStdout: (data) => onOutput?.(data, "stdout"),
      onStderr: (data) => onOutput?.(data, "stderr"),
    });

    const result = await handle.wait();
    if (result.exitCode !== 0) {
      return { success: false, error: `Setup step failed: ${step.command}` };
    }
  }

  return { success: true };
}

export async function downloadAndExtractArchive(
  sandbox: Sandbox,
  archiveUrl: string,
  targetPath: string,
  authToken?: string
): Promise<void> {
  const tempZip = "/tmp/template.zip";
  const tempUnzip = "/tmp/extract";

  const curlCommand = authToken?.trim()
    ? `curl -L -H "Authorization: token ${authToken}" -o ${tempZip} ${archiveUrl}`
    : `curl -L -o ${tempZip} ${archiveUrl}`;

  try {
    const downloadResult = await runCommand(sandbox, curlCommand);
    if (downloadResult.exitCode !== 0) {
      throw new Error(`Download failed: ${downloadResult.stderr}`);
    }

    const unzipResult = await runCommand(
      sandbox,
      `unzip -q ${tempZip} -d ${tempUnzip} && (shopt -s dotglob && mv ${tempUnzip}/*/* ${targetPath}/) && rm -rf ${tempZip} ${tempUnzip}`
    );
    if (unzipResult.exitCode !== 0) {
      throw new Error(`Extract failed: ${unzipResult.stderr}`);
    }
  } finally {
    await runCommand(sandbox, `rm -rf ${tempZip} ${tempUnzip}`).catch(() => {});
  }
}
