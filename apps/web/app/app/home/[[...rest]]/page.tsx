"use client";

import { UserButton, UserProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { BillingPage } from "../../../../features/billing/BillingPage";

const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorBackground: "#18181b",
    colorInputBackground: "#27272a",
    colorNeutral: "#ffffff",
    colorPrimary: "#ffffff",
    colorPrimaryForeground: "#000000",
    colorForeground: "#ffffff",
    colorMutedForeground: "rgba(255,255,255,0.65)",
    colorBorder: "rgba(255,255,255,0.10)",
    borderRadius: "0.5rem",
    fontFamily: "inherit",
  },
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <span className="text-sm font-medium text-white/60">Reanimate</span>
        <UserButton appearance={clerkAppearance}>
          <UserButton.UserProfilePage
            label="Billing"
            url="billing"
            labelIcon={
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
            }
          >
            <BillingPage />
          </UserButton.UserProfilePage>
        </UserButton>
      </header>
      <div className="flex flex-1 items-center justify-center p-4">
        <UserProfile path="/app/home" appearance={clerkAppearance}>
          <UserProfile.Page
            label="Billing"
            url="billing"
            labelIcon={
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
            }
          >
            <BillingPage />
          </UserProfile.Page>
        </UserProfile>
      </div>
    </div>
  );
}
