import type { Sandbox, CommandHandle } from "e2b";
import { runCommand } from "./utils";
import { PROJECT_PATH } from "./constants";
import { getTemplateConfig, runSystemSetupSteps, type OutputCallback } from "./template";

interface R2Config {
  bucket: string;
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  screenshotBucket?: string;
}

interface UploadHandle {
  tarHandle?: CommandHandle;
  uploadHandle?: CommandHandle;
}

// Track ongoing uploads for cancellation
const ongoingUploads = new Map<string, UploadHandle>();

function getR2Config(): R2Config {
  const bucket = process.env.R2_BUCKET;
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!bucket || !accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 env vars not configured (R2_BUCKET, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)");
  }

  return {
    bucket,
    accountId,
    accessKeyId,
    secretAccessKey,
    screenshotBucket: process.env.R2_SCREENSHOT_BUCKET,
  };
}

function getR2Envs(config: R2Config) {
  return {
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    envs: {
      AWS_ACCESS_KEY_ID: config.accessKeyId,
      AWS_SECRET_ACCESS_KEY: config.secretAccessKey,
      AWS_REGION: "auto",
      AWS_S3_ADDRESSING_STYLE: "virtual",
    },
  };
}

async function generateExcludePatterns(sandbox: Sandbox): Promise<string[]> {
  const excludePatterns: string[] = [];

  try {
    const templateConfig = await getTemplateConfig(sandbox);
    for (const file of templateConfig.cleanupFiles) {
      excludePatterns.push(`${file}/*`);
    }
  } catch {}

  excludePatterns.push(
    // Node.js
    "node_modules", "dist", "build", ".next", ".nuxt", ".output",
    // Python
    "__pycache__", ".venv", "venv", ".tox", ".pytest_cache",
    // Go / Rust / Java
    "vendor", "bin", "target", "obj", ".gradle",
    // Ruby
    "vendor/bundle",
    // General
    "out",
    // Core dumps
    "core.*", "*.core", "*.dmp", "*.dump", "crash.log"
  );

  return excludePatterns;
}

export async function uploadToR2(
  sandbox: Sandbox,
  sandboxPath: string,
  r2Prefix: string
): Promise<void> {
  const config = getR2Config();
  const existing = ongoingUploads.get(r2Prefix);
  if (existing) {
    try {
      await existing.tarHandle?.kill();
      await existing.uploadHandle?.kill();
    } catch {}
    ongoingUploads.delete(r2Prefix);
  }

  const tracking: UploadHandle = {};
  ongoingUploads.set(r2Prefix, tracking);

  try {
    const { endpoint, envs } = getR2Envs(config);
    const archivePath = `/tmp/project.tar.gz`;

    const excludePatterns = await generateExcludePatterns(sandbox);
    const excludeArgs = excludePatterns.map((p) => `--exclude='${p}'`).join(" ");

    // Clean up dump files before archiving
    await runCommand(
      sandbox,
      `([ -f core ] && rm core || true) && (rm -f core.* *.core *.dmp *.dump *.crashlog crash.log 2>/dev/null || true)`,
      { cwd: sandboxPath }
    ).catch(() => {});

    const tarHandle = await runCommand(
      sandbox,
      `cd "${sandboxPath}" && tar -czf "${archivePath}" ${excludeArgs} .`,
      { background: true, timeoutMs: 0 }
    );
    tracking.tarHandle = tarHandle;
    const tarResult = await tarHandle.wait();
    if (tarResult.exitCode !== 0) {
      throw new Error(`Failed to create archive: ${tarResult.stderr}`);
    }

    const uploadHandle = await runCommand(
      sandbox,
      `aws s3 cp "${archivePath}" s3://${config.bucket}/${r2Prefix}/project.tar.gz --endpoint-url=${endpoint} --only-show-errors`,
      { envs, background: true, timeoutMs: 0 }
    );
    tracking.uploadHandle = uploadHandle;
    const uploadResult = await uploadHandle.wait();
    if (uploadResult.exitCode !== 0) {
      throw new Error(`Archive upload failed: ${uploadResult.stderr}`);
    }

    await runCommand(sandbox, `rm -f "${archivePath}"`);
  } catch (error) {
    throw new Error(`Upload to object storage failed: ${error}`);
  } finally {
    ongoingUploads.delete(r2Prefix);
  }
}

export async function downloadFromR2(
  sandbox: Sandbox,
  r2Prefix: string,
  onOutput?: OutputCallback
): Promise<void> {
  const config = getR2Config();
  const { endpoint, envs } = getR2Envs(config);
  const archiveName = `project.tar.gz`;
  const archivePath = `/tmp/${archiveName}`;

  try {
    // Check if object exists before attempting download
    const headResult = await runCommand(
      sandbox,
      `aws s3api head-object --bucket ${config.bucket} --key ${r2Prefix}/${archiveName} --endpoint-url=${endpoint}`,
      { envs }
    );

    if (headResult.exitCode !== 0) {
      const stderr = headResult.stderr ?? "";
      if (stderr.includes("Not Found") || stderr.includes("404")) {
        return; // Nothing to download, fresh sandbox
      }
      throw new Error(`Failed to verify object exists in R2`);
    }

    await runCommand(sandbox, `rm -rf "${PROJECT_PATH}"`);
    await sandbox.files.makeDir(PROJECT_PATH);

    const downloadResult = await runCommand(
      sandbox,
      `aws s3 cp s3://${config.bucket}/${r2Prefix}/${archiveName} "${archivePath}" --endpoint-url=${endpoint} --only-show-errors`,
      { envs, timeoutMs: 0 }
    );
    if (downloadResult.exitCode !== 0) {
      throw new Error(`Archive download failed: ${downloadResult.stderr}`);
    }

    const extractResult = await runCommand(
      sandbox,
      `cd "${PROJECT_PATH}" && tar -xzf "${archivePath}"`
    );
    if (extractResult.exitCode !== 0) {
      throw new Error(`Failed to extract archive: ${extractResult.stderr}`);
    }

    await runCommand(sandbox, `rm -f "${archivePath}"`);

    await runSystemSetupSteps(sandbox, onOutput);
  } catch (error) {
    await sandbox.kill().catch(() => {});
    throw new Error(`Download from object storage failed: ${error}`);
  }
}

export async function uploadScreenshot(
  sandbox: Sandbox,
  r2Prefix: string,
  port: string
): Promise<string | undefined> {
  const config = getR2Config();
  if (!config.screenshotBucket) return undefined;

  const { endpoint, envs } = getR2Envs(config);
  const screenshotPath = `/tmp/screenshot.jpeg`;
  const webpPath = `/tmp/screenshot.webp`;
  const r2Key = `${r2Prefix}/screenshot.webp`;

  try {
    const openResult = await runCommand(
      sandbox,
      `playwright-cli open http://localhost:${port}`,
      { timeoutMs: 12000 }
    );
    if (openResult.exitCode !== 0) return undefined;

    const screenshotResult = await runCommand(
      sandbox,
      [
        `playwright-cli resize 1280 720`,
        `playwright-cli screenshot --filename ${screenshotPath}`,
        `convert ${screenshotPath} ${webpPath}`,
      ].join(" && ")
    );
    if (screenshotResult.exitCode !== 0) return undefined;

    const uploadResult = await runCommand(
      sandbox,
      `aws s3 cp "${webpPath}" s3://${config.screenshotBucket}/${r2Key} --endpoint-url=${endpoint} --only-show-errors --content-type image/webp`,
      { envs, timeoutMs: 0 }
    );
    if (uploadResult.exitCode !== 0) {
      throw new Error(`Screenshot upload failed: ${uploadResult.stderr}`);
    }

    await runCommand(sandbox, `rm -f "${screenshotPath}" "${webpPath}"`);
    return r2Key;
  } catch {
    return undefined;
  }
}
