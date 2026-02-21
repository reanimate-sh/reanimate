import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/ConvexClientProvider";

export const metadata: Metadata = {
  title: "Reanimate | Generate animated product videos for your app with AI",
  description: "Turn your app into animated product videos with AI. Create demos, launch clips, and social content fast.",
  icons: {
    icon: "/logos/reanimate-logo-white.svg",
  },
  openGraph: {
    title: "Reanimate | Generate animated product videos for your app with AI",
    description: "Turn your app into animated product videos with AI. Create demos, launch clips, and social content fast.",
    images: ["/images/marketing/og.png"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-black text-white">
        <ClerkProvider dynamic waitlistUrl="/waitlist">
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
