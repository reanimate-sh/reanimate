import type { Metadata } from "next";
import { LegalPage } from "@/features/legal";
import { privacyDocumentHtml } from "@/features/legal/content/privacy";

export const metadata: Metadata = {
  title: "Privacy Policy | Reanimate",
  description: "Privacy Policy for Reanimate, Inc.",
};

export default function PrivacyRoute() {
  return <LegalPage html={privacyDocumentHtml} />;
}
