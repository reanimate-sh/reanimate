"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { OpenCodeApp } from "@reanimate/opencode";
import type { ApiResponse } from "@/lib/api-response";

type InitResponse = ApiResponse<{ agentUrl: string; projectPath: string }>;

export default function OpenCodeProjectPage() {
  const params = useParams<{ projectId: string }>();
  const searchParams = useSearchParams();
  const projectId = useMemo(() => {
    const value = params?.projectId;
    return Array.isArray(value) ? value[0] : value;
  }, [params?.projectId]);
  const initialPrompt = searchParams.get("prompt")?.trim() || undefined;
  const providerID = searchParams.get("providerID")?.trim();
  const modelID = searchParams.get("modelID")?.trim();
  const initialModel =
    providerID && modelID
      ? {
          providerID,
          modelID,
        }
      : undefined;

  const [agentUrl, setAgentUrl] = useState<string | null>(null);
  const [directory, setDirectory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      return;
    }

    let cancelled = false;
    setAgentUrl(null);
    setDirectory(null);
    setError(null);

    const initProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/init`, {
          method: "POST",
        });
        const data = (await response.json()) as InitResponse;

        if (!response.ok || !data.success) {
          throw new Error(data.success ? "Failed to initialize project" : data.error);
        }

        if (cancelled) {
          return;
        }

        setAgentUrl(data.agentUrl);
        setDirectory(data.projectPath);
      } catch (err) {
        if (cancelled) {
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to initialize project");
      }
    };

    void initProject();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (!projectId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05070d] text-sm text-rose-300">
        Invalid project id.
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05070d] px-4 text-center text-sm text-rose-300">
        {error}
      </div>
    );
  }

  if (!agentUrl || !directory) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05070d] text-sm text-white/70">
        Preparing your project...
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#05070d]">
      <OpenCodeApp
        baseUrl={agentUrl}
        directory={directory}
        initialPrompt={initialPrompt}
        initialModel={initialModel}
        className="h-full w-full"
      />
    </div>
  );
}
