"use client";

import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Link from "next/link";
import { BillingPage } from "@/features/billing/BillingPage";
import { ReanimateLogo } from "@/features/landing/components/icons/ReanimateLogo";

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
};

export const AppHeader = ({ homeHref = "/" }: AppHeaderProps) => (
  <header className="relative z-10 flex w-full items-center justify-between px-6 py-4 md:px-8 md:py-6">
    <Link href={homeHref} className="flex cursor-pointer items-center gap-2">
      <div className="size-9 text-white/90">
        <ReanimateLogo />
      </div>
    </Link>
    <div className="origin-top-right scale-125">
      <UserButton appearance={clerkAppearance} userProfileProps={{ appearance: clerkAppearance }}>
        <UserButton.UserProfilePage label="Billing" url="billing" labelIcon={billingIcon}>
          <BillingPage />
        </UserButton.UserProfilePage>
      </UserButton>
    </div>
  </header>
);
