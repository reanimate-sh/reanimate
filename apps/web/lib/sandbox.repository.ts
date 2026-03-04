import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { SandboxData } from "@reanimate/e2b";

type ConvexOpts = { token?: string } | undefined;

export async function getSandboxData(
  projectId: Id<"projects">,
  opts?: ConvexOpts
): Promise<SandboxData | null> {
  const project = await fetchQuery(api.projects.getById, { projectId }, opts);
  return (project?.sandbox as SandboxData) ?? null;
}

export async function saveSandboxData(
  projectId: Id<"projects">,
  sandboxId: string,
  templateId: string,
  opts?: ConvexOpts
): Promise<void> {
  const sandbox: SandboxData = {
    provider: "e2b",
    sandboxId,
    templateId,
    updatedAt: new Date().toISOString(),
  };
  await fetchMutation(
    api.projects.update,
    { projectId, sandbox },
    opts
  );
}

export async function clearSandboxData(
  projectId: Id<"projects">,
  opts?: ConvexOpts
): Promise<void> {
  await fetchMutation(api.projects.update, { projectId, sandbox: null }, opts);
}
