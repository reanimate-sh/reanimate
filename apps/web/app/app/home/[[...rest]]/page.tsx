"use client";

import { AppHeader } from "@/features/app/components/AppHeader";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      <AppHeader />
      <main className="flex flex-1 items-center justify-center p-6 text-center">
        <div className="max-w-xl">
          <h1 className="text-3xl font-medium text-white">Welcome to Reanimate</h1>
          <p className="mt-3 text-sm text-white/60">
            Manage your account and billing from the profile menu in the top-right corner.
          </p>
        </div>
      </main>
    </div>
  );
}
