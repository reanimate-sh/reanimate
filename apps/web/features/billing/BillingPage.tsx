"use client";

import { useAction, useQuery } from "convex/react";
import { api } from "../../lib/convexApi";

function resolvePlanName(
  productId: string | undefined | null,
  plans: { productId: string; name: string }[] | undefined
): string {
  if (!productId) return "Active subscription";
  return plans?.find((p) => p.productId === productId)?.name ?? productId;
}

function isAccessActive(
  status: string | undefined | null,
  currentPeriodEnd: string | undefined | null
): boolean {
  if (!status) return false;
  if (status === "active" || status === "paused") return true;
  if (status === "cancelled" && currentPeriodEnd) {
    return new Date(currentPeriodEnd) > new Date();
  }
  return false;
}

export function BillingPage() {
  const user = useQuery(api.users.current);
  const plans = useQuery(api.plans.getPlans);
  const getCustomerPortal = useAction(api.payments.getCustomerPortal);

  async function handleManageSubscription() {
    const portal = await getCustomerPortal({ sendEmail: false });
    window.location.href = portal.portal_url;
  }

  const hasAccess = isAccessActive(
    user?.subscriptionStatus,
    user?.currentPeriodEnd
  );
  const isCancelledButActive =
    user?.subscriptionStatus === "cancelled" && hasAccess;

  function statusBadge() {
    const s = user?.subscriptionStatus;
    if (!s) return { label: "inactive", className: "bg-white/5 text-white/40" };
    if (s === "active") return { label: "active", className: "bg-green-500/10 text-green-400" };
    if (s === "cancelled" && hasAccess)
      return { label: "cancels soon", className: "bg-yellow-500/10 text-yellow-400" };
    if (s === "on_hold")
      return { label: "payment failed", className: "bg-red-500/10 text-red-400" };
    return { label: s, className: "bg-white/5 text-white/40" };
  }

  const badge = statusBadge();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Billing &amp; Subscription</h1>
        <p className="mt-1 text-sm text-white/60">
          Manage your plan and payment details.
        </p>
      </div>

      <div className="rounded-lg border border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Current plan</p>
            <p className="mt-0.5 text-sm text-white/60">
              {hasAccess
                ? resolvePlanName(user?.productId, plans)
                : "No active subscription"}
            </p>
            {isCancelledButActive && user?.currentPeriodEnd && (
              <p className="mt-1 text-xs text-yellow-400/80">
                Access until{" "}
                {new Date(user.currentPeriodEnd).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>
      </div>

      {hasAccess ? (
        <button
          onClick={handleManageSubscription}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium hover:bg-white/10 transition-colors"
        >
          Manage subscription
        </button>
      ) : (
        <a
          href="/pricing"
          className="block w-full rounded-lg bg-white px-4 py-2.5 text-center text-sm font-medium text-black hover:bg-white/90 transition-colors"
        >
          View plans
        </a>
      )}
    </div>
  );
}
