"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/lib/convexApi";
import { hasActiveSubscription } from "@/features/billing/util";

export default function AppEntryPage() {
  const router = useRouter();
  const user = useQuery(api.users.current, {});
  const hasAccess = hasActiveSubscription(user?.subscriptionStatus, user?.subscriptionPeriodEnd);

  useEffect(() => {
    if (user === undefined) {
      return;
    }

    router.replace(hasAccess ? "/app/home" : "/app/upgrade");
  }, [hasAccess, router, user]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-sm text-white/60">
      Loading your workspace...
    </div>
  );
}
