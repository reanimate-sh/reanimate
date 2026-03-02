"use client";

import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/lib/convexApi";

export default function Home({
  preloaded,
}: {
  preloaded: Preloaded<typeof api.users.current, {}>;
}) {
  const user = usePreloadedQuery(preloaded);
  return (
    <div className="flex flex-col gap-4 bg-slate-200 dark:bg-slate-800 p-4 rounded-md">
      <h2 className="text-xl font-bold">Reactive client-loaded data</h2>
      {user ? (
        <div className="flex flex-col gap-2">
          <p><span className="font-semibold">Name:</span> {user.name}</p>
          <p><span className="font-semibold">ID:</span> {user._id}</p>
          <p><span className="font-semibold">Clerk ID:</span> {user.externalId}</p>
        </div>
      ) : (
        <p className="text-slate-500">Not logged in or user not synced yet.</p>
      )}
    </div>
  );
}
