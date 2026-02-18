"use client";

import Link from "next/link";
import { SignIn, SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { CardboardLogo } from "@/features/landing/components/icons/CardboardLogo";

type AuthMode = "login" | "signup";

type AuthContent = {
  heroTitle: string;
  heroSubtitle: string;
};

type AuthPageProps = {
  mode: AuthMode;
};

const AUTH_CONTENT: Record<AuthMode, AuthContent> = {
  login: {
    heroTitle: "Welcome back.",
    heroSubtitle: "Let's continue shaping the story.",
  },
  signup: {
    heroTitle: "Ready to create?",
    heroSubtitle: "Your browser's about to become a studio.",
  },
};

const BrandLink = ({ mobile = false }: { mobile?: boolean }) => (
  <Link href="/" className="flex items-center gap-3">
    <div className="size-10 text-white">
      <CardboardLogo />
    </div>
    <h3 className={`font-landing font-medium text-white ${mobile ? "text-2xl" : "text-xl"}`}>Cardboard</h3>
  </Link>
);

export const AuthPage = ({ mode }: AuthPageProps) => {
  const content = AUTH_CONTENT[mode];
  const clerkAppearance = {
    baseTheme: dark,
    layout: {
      logoImageUrl: "/logos/cardboard-logo-no-bg.png",
      logoPlacement: "inside" as const,
    },
    variables: {
      fontSize: "1rem",
      fontWeight: { normal: 300, medium: 400, semibold: 500, bold: 600 },
      spacing: "1.025rem"
    },
    elements: {
      rootBox: {
        width: "100%",
      },
      cardBox: {
        width: "100%",
        maxWidth: "42rem",
      },
      card: {
        width: "100%",
      },
    },
  };

  return (
    <div className="font-landing relative flex min-h-screen w-full flex-col overflow-x-hidden bg-black text-white">
      <div className="fixed inset-0 z-0">
        <video autoPlay loop muted playsInline className="h-full w-full object-cover">
          <source src="https://assets.usecardboard.com/landing/hero-720.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-10 flex min-h-screen w-full flex-col md:flex-row">
        <div className="hidden w-full flex-col justify-between p-8 md:flex md:w-1/2 md:p-16">
          <BrandLink />

          <div className="max-w-md">
            <h1 className="font-landing text-4xl leading-tight font-medium text-white md:text-5xl">{content.heroTitle}</h1>
            <p className="font-landing mt-4 text-lg font-light text-zinc-200">{content.heroSubtitle}</p>
          </div>
        </div>

        <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 md:h-auto md:min-h-0 md:w-1/2 md:my-3 md:mr-3 md:rounded-lg md:border md:border-white/10 md:bg-black/20 md:p-6 md:backdrop-blur-sm">
          <div className="absolute top-10 right-0 left-0 flex flex-col items-center gap-4 text-center md:hidden">
            <BrandLink mobile />
            <div className="max-w-xs rounded-full border border-white/10 bg-black/30 px-4 py-1.5 backdrop-blur-md">
              <p className="text-xs font-medium text-zinc-300">Desktop recommended for editing</p>
            </div>
          </div>

          <div className="flex w-full max-w-md flex-col items-center justify-center rounded-2xl bg-black/50 p-6 backdrop-blur-sm md:bg-transparent md:p-0 md:backdrop-blur-none">
            {mode === "login" ? <SignIn appearance={clerkAppearance} /> : <SignUp appearance={clerkAppearance} />}

            <div className="mt-8 text-center md:hidden">
              <Link href="/" className="flex items-center justify-center gap-2 text-sm font-normal text-zinc-400 transition-colors hover:text-white">
                <span>&larr; Back to home</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
