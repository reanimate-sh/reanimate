import type { Metadata } from "next";
import { LegalPage } from "@/features/legal";
import { termsDocumentHtml } from "@/features/legal/content/terms";

export const metadata: Metadata = {
  title: "Terms of Service | Reanimate",
  description: "Terms of Service for Reanimate, Inc.",
};

export default function TermsRoute() {
  return <LegalPage html={termsDocumentHtml} />;
}
