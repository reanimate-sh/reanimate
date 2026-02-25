import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LandingPage } from "@/features/landing";

const BASE_URL = "https://reanimate.sh";
const APP_DESCRIPTION =
  "Reanimate turns your app into animated, motion-designed marketing videos using AI. Create app demo videos, product launch clips, and social media content in minutes.";

export const metadata: Metadata = {
  title: "Reanimate | Generate animated product videos for your app with AI",
  description: APP_DESCRIPTION,
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: "Reanimate | Generate animated product videos for your app with AI",
    description: APP_DESCRIPTION,
    url: BASE_URL,
  },
  twitter: {
    title: "Reanimate | Generate animated product videos for your app with AI",
    description: APP_DESCRIPTION,
  },
};

const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Reanimate",
  url: BASE_URL,
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Web",
  description: APP_DESCRIPTION,
  offers: [
    {
      "@type": "Offer",
      name: "Creator",
      price: "25",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "25",
        priceCurrency: "USD",
        unitText: "MONTH",
      },
      description: "Full AI-powered editing, 5 active projects per month, 100GB cloud storage.",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "100",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "100",
        priceCurrency: "USD",
        unitText: "MONTH",
      },
      description: "Unlimited projects, priority AI processing, 1TB cloud storage, priority 24/7 support.",
    },
    {
      "@type": "Offer",
      name: "Teams",
      description: "Custom pricing for organizations. Real-time collaboration, SAML & SSO, unlimited storage.",
    },
  ],
  featureList: [
    "AI-generated animated product videos",
    "App demo video creation",
    "Natural language video editing commands",
    "Smart zoom and screen pan",
    "Automated captions",
    "Visual edit with click, drag, and resize",
    "Unlimited exports",
  ],
  audience: {
    "@type": "Audience",
    audienceType:
      "App developers, SaaS founders, product marketers, mobile app teams, indie hackers, startup teams",
  },
  creator: {
    "@type": "Organization",
    name: "Reanimate",
    url: BASE_URL,
  },
};

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/app");
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <LandingPage />
    </>
  );
}
