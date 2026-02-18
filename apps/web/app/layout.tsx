import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/ConvexClientProvider";

export const metadata: Metadata = {
  title: "Cardboard | Agentic Video Editor",
  description: "A fast, collaborative, and agentic video editor that runs in your browser. Create, cut, and compose videos with AI — no installs, no downloads.",
  icons: {
    icon: "/logos/cardboard-logo-no-bg.png",
  },
  openGraph: {
    title: "Cardboard | Agentic Video Editor",
    description: "Create, cut, and compose videos with AI right in your browser.",
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
        <ClerkProvider dynamic>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
