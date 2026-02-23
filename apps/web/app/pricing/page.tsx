import type { Metadata } from "next";
import { PricingPage } from "@/features/pricing";
import { FAQS } from "@/features/pricing/data";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for Reanimate. Start with a 7-day free trial. Creator at $25/mo, Pro at $100/mo, or custom Teams pricing.",
  alternates: {
    canonical: "https://reanimate.sh/pricing",
  },
  openGraph: {
    title: "Pricing | Reanimate",
    description: "Simple, transparent pricing for Reanimate. Start with a 7-day free trial. Creator at $25/mo, Pro at $100/mo, or custom Teams pricing.",
    url: "https://reanimate.sh/pricing",
  },
  twitter: {
    title: "Pricing | Reanimate",
    description: "Simple, transparent pricing for Reanimate. Start with a 7-day free trial. Creator at $25/mo, Pro at $100/mo, or custom Teams pricing.",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function PricingRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PricingPage />
    </>
  );
}
