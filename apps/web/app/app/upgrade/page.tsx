import type { Metadata } from "next";
import { UpgradePage } from "@/features/upgrade";

export const metadata: Metadata = {
  title: "Upgrade",
  robots: { index: false, follow: false },
};

export default function UpgradeRoute() {
  return <UpgradePage />;
}
