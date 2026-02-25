"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { AppBackground } from "@/components/AppBackground";
import { AppHeader } from "@/features/app/components/AppHeader";
import { HomePromptComposer } from "@/features/app/components/HomePromptComposer";
import { api } from "@/lib/convexApi";

export default function HomePage() {
  const user = useQuery(api.users.current);

  const firstName = useMemo(() => {
    const name = user?.name?.trim();
    if (!name) {
      return "";
    }

    return name.split(" ")[0] ?? "";
  }, [user?.name]);

  const headline = firstName
    ? `What are we creating today, ${firstName}?`
    : "What are we creating today?";

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#0a0e18] text-white selection:bg-blue-500/30">
      <AppBackground />

      <div className="relative z-10 flex min-h-screen flex-col">
        <AppHeader homeHref="/app/home" showWorkspaceActions />

        <main className="flex w-full flex-1 items-start justify-center px-4 pt-16 pb-14 text-center sm:px-6 md:px-8 md:pt-32">
          <section className="w-full max-w-3xl">
            <h1 className="font-landing text-2xl font-medium text-white sm:text-4xl">
              {headline}
            </h1>
            <p className="mt-4 text-lg text-white/65 sm:text-lg font-light">
              Bring in your app and let&apos;s get started.
            </p>

            <div className="mt-8 sm:mt-10">
              <HomePromptComposer />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
