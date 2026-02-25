import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { SUPPORT_EMAIL } from "@/lib/constants";

const BASE_URL = "https://reanimate.sh";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Reanimate | Generate animated product videos for your app with AI",
    template: "%s | Reanimate",
  },
  description: "Turn your app into animated product videos with AI. Create demos, launch clips, and social content fast.",
  icons: {
    icon: "/logos/reanimate-logo-white.svg",
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: "Reanimate | Generate animated product videos for your app with AI",
    description: "Turn your app into animated product videos with AI. Create demos, launch clips, and social content fast.",
    images: [
      {
        url: "/images/marketing/og.png",
        width: 1200,
        height: 630,
        alt: "Reanimate | Generate animated product videos for your app with AI",
      },
    ],
    type: "website",
    siteName: "Reanimate",
    locale: "en_US",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Reanimate | Generate animated product videos for your app with AI",
    description: "Turn your app into animated product videos with AI. Create demos, launch clips, and social content fast.",
    images: ["/images/marketing/og.png"],
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Reanimate",
  url: BASE_URL,
  logo: `${BASE_URL}/logos/reanimate-logo-white.svg`,
  description: "Turn your app into animated product videos with AI. Create demos, launch clips, and social content fast.",
  contactPoint: {
    "@type": "ContactPoint",
    email: SUPPORT_EMAIL,
    contactType: "customer support",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="font-sans relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-black text-white">
        <ClerkProvider dynamic waitlistUrl="/waitlist">
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
