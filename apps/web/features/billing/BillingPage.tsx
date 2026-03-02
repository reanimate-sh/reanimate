"use client";

import { useAction, useQuery } from "convex/react";
import { ArrowUpRight } from "lucide-react";
import { api } from "../../lib/convexApi";
import { hasActiveSubscription } from "./util";

function formatShortDate(date: string | undefined) {
  if (!date) {
    return undefined;
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDaysUntil(date: string | undefined) {
  if (!date) {
    return undefined;
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  const msInDay = 1000 * 60 * 60 * 24;
  return Math.ceil((parsed.getTime() - Date.now()) / msInDay);
}

export function BillingPage() {
  const user = useQuery(api.users.current, {});
  const plans = useQuery(api.plans.getPlans);
  const getCustomerPortal = useAction(api.payments.getCustomerPortal);

  async function handleManageSubscription() {
    const portal = await getCustomerPortal({ sendEmail: false });
    window.location.href = portal.portal_url;
  }

  const hasAccess = hasActiveSubscription(
    user?.subscriptionStatus,
    user?.subscriptionPeriodEnd
  );
  const activePlan = plans?.find((plan) => plan.productId === user?.productId);

  const currentPlanName = hasAccess ? activePlan?.name ?? "Active subscription" : "No active subscription";

  const status = (() => {
    if (user?.subscriptionStatus === "active") {
      return {
        label: "Active",
        textClassName: "text-emerald-400",
        dotClassName: "bg-emerald-500",
      };
    }

    if (user?.subscriptionStatus === "cancelled" && hasAccess) {
      return {
        label: "Cancels Soon",
        textClassName: "text-yellow-400",
        dotClassName: "bg-yellow-400",
      };
    }

    if (user?.subscriptionStatus === "on_hold") {
      return {
        label: "Payment Failed",
        textClassName: "text-red-400",
        dotClassName: "bg-red-400",
      };
    }

    return {
      label: "Inactive",
      textClassName: "text-neutral-400",
      dotClassName: "bg-neutral-500",
    };
  })();

  const billingInterval = activePlan?.billingCycle ?? "N/A";

  const periodStart = formatShortDate(user?.subscriptionStartedAt);
  const periodEnd = formatShortDate(user?.subscriptionPeriodEnd);
  const billingPeriod = periodStart && periodEnd ? `${periodStart} — ${periodEnd}` : "N/A";

  const nextRenewal = formatShortDate(user?.subscriptionPeriodEnd);
  const daysUntilRenewal = getDaysUntil(user?.subscriptionPeriodEnd);

  const projectLimit =
    typeof activePlan?.projectLimit === "number"
      ? `${activePlan.projectLimit} ${activePlan.projectLimit === 1 ? "Project" : "Projects"}`
      : activePlan
        ? "Unlimited"
        : "N/A";

  const showUpgradeToPro = hasAccess && activePlan?.name !== "Pro";
  const shouldShowUpgradeButton = showUpgradeToPro || !hasAccess;
  const upgradeButtonLabel = showUpgradeToPro ? "Upgrade to Pro" : "View plans";

  async function handleUpgrade() {
    window.location.href = "/app/upgrade";
  }

  return (
    <div className="flex flex-col gap-8 py-2">
      <section className="space-y-4">
        <div className="flex items-end justify-between px-1">
          <div className="space-y-1">
            <p className="text-[10px] font-medium tracking-widest text-neutral-400 uppercase">
              Current Plan
            </p>
            <h2 className="text-2xl font-normal tracking-tight text-white">{currentPlanName}</h2>
          </div>
          <div className="flex items-center gap-2 pb-1">
            <div className={`size-1.5 rounded-full ${status.dotClassName}`} />
            <span className={`text-xs font-base ${status.textClassName}`}>{status.label}</span>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-1">
          <div className="space-y-px overflow-hidden rounded-lg">
            <div className="flex items-center justify-between bg-neutral-900/50 px-4 py-3.5">
              <span className="text-xs font-light text-neutral-300">Billing Interval</span>
              <span className="text-xs font-normal text-neutral-100 capitalize">{billingInterval}</span>
            </div>
            <div className="flex items-center justify-between bg-neutral-900/50 px-4 py-3.5">
              <span className="text-xs font-light text-neutral-300">Billing Period</span>
              <span className="text-xs font-normal text-neutral-100">{billingPeriod}</span>
            </div>
            <div className="flex items-center justify-between bg-neutral-900/50 px-4 py-3.5">
              <span className="text-xs font-light text-neutral-300">Next Renewal</span>
              <span className="text-xs font-normal text-neutral-100">
                {nextRenewal ?? "N/A"}
                {typeof daysUntilRenewal === "number" && daysUntilRenewal >= 0 && (
                  <span className="ml-1.5 font-light text-neutral-500">(in {daysUntilRenewal} days)</span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between bg-neutral-900/50 px-4 py-3.5">
              <span className="text-xs font-light text-neutral-300">Project Limit</span>
              <span className="text-xs font-normal text-neutral-100">{projectLimit}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <button
          onClick={handleManageSubscription}
          disabled={!hasAccess}
          className="group flex w-full cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 transition-all hover:bg-white/10 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-left text-sm font-normal text-white">Manage Subscription</span>
            <span className="text-[10px] font-light text-neutral-400">
              Invoices, payment methods, and cancellation
            </span>
          </div>
          <ArrowUpRight className="size-4 text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>

        {shouldShowUpgradeButton && (
          <button
            onClick={handleUpgrade}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm font-medium text-blue-400 transition-all hover:bg-blue-500/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {upgradeButtonLabel}
          </button>
        )}
      </section>

      <footer className="px-1 text-[10px] font-light leading-relaxed text-neutral-500">
        <p>
          Subscription managed via Dodo Payments. Changes to your plan will take effect at the
          start of your next billing cycle.
        </p>
      </footer>
    </div>
  );
}
