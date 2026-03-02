"use client";

import { useQuery } from "convex/react";
import { Calendar, Heart, Mail, MessageCircle } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BillingPage } from "@/features/billing/BillingPage";
import { hasActiveSubscription } from "@/features/billing/util";
import { ReanimateLogo } from "@/features/landing/components/icons/ReanimateLogo";
import { CAL_BOOKING_URL, SUPPORT_EMAIL, SUPPORT_EMAIL_MAILTO } from "@/lib/constants";
import { api } from "@/lib/convexApi";

const billingIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);

const clerkAppearance = {
  baseTheme: dark,
  variables: {
    fontSize: "0.9rem",
    fontWeight: { normal: 300, medium: 400, semibold: 500, bold: 600 },
    spacing: "1.025rem",
    colorBackground: "#18181b",
    colorInputBackground: "#27272a",
    colorNeutral: "#ffffff",
    colorPrimary: "#ffffff",
    colorPrimaryForeground: "#000000",
    colorForeground: "#ffffff",
    colorMutedForeground: "rgba(255,255,255,1)",
    colorBorder: "rgba(255,255,255,1)",
    borderRadius: "0.5rem",
    fontFamily: "inherit",
  },
  elements: {
    rootBox: {
      width: "100%",
    },
    userButtonPopoverCard: {
      backgroundColor: "#18181b",
      border: "1px solid rgba(255,255,255,0.10)",
      boxShadow: "0 12px 36px rgba(0,0,0,0.5)",
      width: "28rem",
      maxWidth: "calc(100vw - 1.5rem)",
    },
    userButtonPopoverActionButton: {
      color: "#ffffff",
    },
    userButtonPopoverActionButtonText: {
      color: "#ffffff",
    },
    userButtonPopoverActionButtonIcon: {
      color: "rgba(255,255,255,0.75)",
    },
    userButtonPopoverFooter: {
      backgroundColor: "#111111",
      borderTop: "1px solid rgba(255,255,255,0.10)",
    },
    modalContent: {
      backgroundColor: "#18181b",
      color: "#ffffff",
    },
    cardBox: {
      width: "min(96vw, 64rem)",
      maxWidth: "64rem",
      boxShadow: "0 20px 40px rgba(0,0,0,0.55)",
    },
    card: {
      backgroundColor: "#18181b",
      border: "1px solid rgba(255,255,255,0.10)",
    },
    navbar: {
      backgroundColor: "#111111",
      borderRight: "1px solid rgba(255,255,255,0.10)",
    },
    navbarButton: {
      color: "rgba(255,255,255,0.8)",
    },
    navbarButtonActive: {
      color: "#ffffff",
      backgroundColor: "rgba(255,255,255,0.08)",
    },
    headerTitle: {
      color: "#ffffff",
    },
    headerSubtitle: {
      color: "rgba(255,255,255,0.65)",
    },
    userPreviewMainIdentifier: {
      color: "#ffffff",
    },
    userPreviewSecondaryIdentifier: {
      color: "rgba(255,255,255,0.65)",
    },
  },
};

type AppHeaderProps = {
  homeHref?: string;
  showWorkspaceActions?: boolean;
};

const HeaderWorkspaceActions = () => {
  const user = useQuery(api.users.current, {});
  const plans = useQuery(api.plans.getPlans);
  const helpPopoverRef = useRef<HTMLDivElement | null>(null);

  const [isHelpPopoverOpen, setIsHelpPopoverOpen] = useState(false);
  const hasAccess = hasActiveSubscription(user?.subscriptionStatus, user?.subscriptionPeriodEnd);

  const activePlanLabel = (() => {
    if (user === undefined || plans === undefined) {
      return "Loading...";
    }

    if (!hasAccess) {
      return "No active plan";
    }

    const activePlan = plans.find((plan) => plan.productId === user?.productId);
    if (!activePlan) {
      return "Active subscription";
    }

    return activePlan.name;
  })();

  useEffect(() => {
    if (!isHelpPopoverOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!helpPopoverRef.current?.contains(event.target as Node)) {
        setIsHelpPopoverOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsHelpPopoverOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isHelpPopoverOpen]);

  return (
    <>
      <div ref={helpPopoverRef} className="relative">
        <button
          type="button"
          aria-expanded={isHelpPopoverOpen}
          aria-haspopup="dialog"
          onClick={() => setIsHelpPopoverOpen((open) => !open)}
          className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-sm font-medium text-white/85 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
        >
          <MessageCircle className="size-4" />
          <span>Need any help?</span>
        </button>

        {isHelpPopoverOpen && (
          <div
            role="dialog"
            aria-label="Need any help"
            className="absolute top-full right-0 z-40 mt-2 w-[260px] overflow-hidden rounded-xl border border-white/12 bg-zinc-950/70 p-0 shadow-2xl ring-1 ring-white/12 backdrop-blur-xl"
          >
            <div className="relative px-4 py-4 text-center">
              <div className="absolute inset-0 -z-10 bg-linear-to-b from-white/5 to-transparent" />

              <div className="mb-2.5 flex justify-center">
                <div className="flex size-8 items-center justify-center rounded-full bg-white/10 shadow-inner">
                  <Heart className="size-4 fill-white/75 text-white/75" />
                </div>
              </div>

              <p className="font-light text-[13px] leading-relaxed font-medium text-sky-50">
                We&apos;d love to hear from you.
              </p>
              <p className="mt-1 text-[11px] leading-normal text-white/70">
                Let us know how we can help you better.
              </p>

              <div className="mt-3.5 flex flex-col gap-2">
                <a
                  href={CAL_BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 text-[12px] font-medium text-white/85 transition-all duration-150 hover:border-white/30 hover:bg-white/15 hover:text-white"
                >
                  <Calendar className="size-3.5" />
                  Book a call
                </a>
                <a
                  href={SUPPORT_EMAIL_MAILTO}
                  className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-[12px] font-medium text-white/70 transition-all duration-150 hover:border-white/20 hover:bg-white/10 hover:text-white/90"
                >
                  <Mail className="size-3.5" />
                  {SUPPORT_EMAIL}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="group hidden h-8 items-center rounded-full border border-white/10 bg-white/5 px-4 transition-colors hover:bg-white/10 md:flex">
        <span className="text-sm font-medium text-white/90 transition-colors group-hover:text-white">
          {activePlanLabel}
        </span>
      </div>
    </>
  );
};

export const AppHeader = ({ homeHref = "/", showWorkspaceActions = false }: AppHeaderProps) => (
  <header className="relative z-20 flex w-full items-center justify-between px-4 py-4 sm:px-6 md:px-8 md:py-6">
    <Link href={homeHref} className="flex cursor-pointer items-center gap-2">
      <div className="size-9 text-white/90">
        <ReanimateLogo />
      </div>
      <span className="font-landing text-xl font-medium tracking-tight text-white">Reanimate</span>
    </Link>
    <div className="flex items-center gap-3 md:gap-4">
      {showWorkspaceActions && <HeaderWorkspaceActions />}
      <div className="origin-top-right scale-125">
        <UserButton appearance={clerkAppearance} userProfileProps={{ appearance: clerkAppearance }}>
          <UserButton.UserProfilePage label="Billing" url="billing" labelIcon={billingIcon}>
            <BillingPage />
          </UserButton.UserProfilePage>
        </UserButton>
      </div>
    </div>
  </header>
);
