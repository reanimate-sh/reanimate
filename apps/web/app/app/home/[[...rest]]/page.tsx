import type { Metadata } from "next";
import { UserButton, UserProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

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
        <UserButton appearance={clerkAppearance} />
      </header>
      <div className="flex flex-1 items-center justify-center p-4">
        <UserProfile path="/app/home" appearance={clerkAppearance} />
      </div>
    </div>
  );
}
