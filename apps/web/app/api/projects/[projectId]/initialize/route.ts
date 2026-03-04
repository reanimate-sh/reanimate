import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../../convex/_generated/dataModel";
import { getSandbox, getAgentUrl, PROJECT_PATH } from "@reanimate/e2b";
import { saveSandboxData } from "@/lib/sandbox.repository";
import { apiError, apiSuccess } from "@/lib/api-response";
import {
  projectExistsInSandbox,
  initializeProject,
  ensureAgentRunning,
} from "./service";

const E2B_TEMPLATE_ID = process.env.E2B_TEMPLATE_ID ?? "base";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  const session = await auth();
  if (!session.userId) {
    return apiError("Unauthorized", 401);
  }

  const convexToken = await session.getToken({ template: "convex" });
  if (!convexToken) {
    return apiError("Could not get auth token", 401);
  }

  const opts = { token: convexToken };

  const e2bApiKey = process.env.E2B_API_KEY;

  if (!e2bApiKey) {
    return apiError("E2B API key not configured", 400);
  }

  const project = await fetchQuery(
    api.projects.getById,
    { projectId: projectId as Id<"projects"> },
    opts
  );
  if (!project) {
    return apiError("Project not found", 404);
  }

  const sandboxData = project.sandbox as { sandboxId?: string; templateId?: string } | undefined;

  let sandbox;
  try {
    sandbox = await getSandbox({
      userId: session.userId,
      projectId,
      sandboxId: sandboxData?.sandboxId,
      apiKey: e2bApiKey,
      templateId: sandboxData?.templateId ?? E2B_TEMPLATE_ID,
      onCreated: (sandboxId, templateId) =>
        saveSandboxData(projectId as Id<"projects">, sandboxId, templateId, opts),
    });
  } catch (err) {
    console.error("Failed to get/create sandbox:", err);
    return apiError("Failed to create sandbox", 500);
  }

  if (!(await projectExistsInSandbox(sandbox))) {
    try {
      await initializeProject(sandbox, projectId);
    } catch (err) {
      console.error("Failed to initialize project:", err);
      return apiError("Failed to initialize project", 500);
    }
  }

  try {
    await ensureAgentRunning(sandbox);
  } catch (err) {
    console.error("Agent start failed:", err);
  }

  const agentUrl = await getAgentUrl(sandbox);

  return apiSuccess({ agentUrl, projectPath: PROJECT_PATH });
}
