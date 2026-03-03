"use client";

import { OpenCodeApp } from "@reanimate/opencode";

export default function OpenCodePage() {
  const baseUrl = process.env.NEXT_PUBLIC_OPENCODE_SERVER_URL ?? "http://localhost:4096";
  const directory = process.env.NEXT_PUBLIC_OPENCODE_DIRECTORY ?? "/Users/sid/Projects/Reanimate";

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#05070d]">
      <OpenCodeApp baseUrl={baseUrl} directory={directory} className="h-full w-full" />
    </div>
  );
}
