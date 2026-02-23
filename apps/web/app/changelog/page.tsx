import type { Metadata } from "next";
import { ChangelogPage } from "@/features/changelog";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Stay up to date with the latest features, improvements, and fixes shipped by the Reanimate team.",
  alternates: {
    canonical: "https://reanimate.sh/changelog",
  },
  openGraph: {
    title: "Changelog | Reanimate",
    description: "Stay up to date with the latest features, improvements, and fixes shipped by the Reanimate team.",
    url: "https://reanimate.sh/changelog",
  },
  twitter: {
    title: "Changelog | Reanimate",
    description: "Stay up to date with the latest features, improvements, and fixes shipped by the Reanimate team.",
  },
};

export default function ChangelogRoute() {
  return <ChangelogPage />;
}
