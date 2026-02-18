import Link from "next/link";
import { CardboardLogo } from "@/features/landing/components/icons/CardboardLogo";

type AuthMode = "login" | "signup";

type AuthField = {
  label: string;
  name: string;
  type: "text" | "email" | "password";
  placeholder: string;
};

type AuthContent = {
  heroTitle: string;
  heroSubtitle: string;
  cardTitle: string;
  cardSubtitle: string;
  footerText: string;
  footerLinkLabel: string;
  footerLinkHref: string;
  showPasskeyLink: boolean;
};

type AuthPageProps = {
  mode: AuthMode;
};

const FORM_LABEL_CLASSNAME = "mb-2 block text-base font-medium text-white";
const FORM_CONTROL_CLASSNAME =
  "h-12 w-full rounded-md border border-white/10 bg-zinc-800 px-4 text-base text-white outline-none transition-colors placeholder:text-white/45 focus:border-white/35";
const FORM_PRIMARY_BUTTON_CLASSNAME =
  "flex h-12 w-full items-center justify-center gap-2 rounded-md border border-white bg-white text-base font-medium text-black shadow-[0_0_0_1px_#fff,0_1px_1px_0_rgba(255,255,255,0.07)_inset,0_2px_3px_0_rgba(34,42,53,0.2),0_1px_1px_0_rgba(0,0,0,0.24)] transition-[filter] hover:brightness-95";
const FORM_SECONDARY_BUTTON_CLASSNAME =
  "flex h-12 w-full items-center justify-center gap-3 rounded-md border border-white/10 bg-transparent text-base font-medium text-white/70 transition-colors hover:bg-white/5";

const AUTH_CONTENT: Record<AuthMode, AuthContent> = {
  login: {
    heroTitle: "Welcome back.",
    heroSubtitle: "Let's continue shaping the story.",
    cardTitle: "Sign in to Cardboard",
    cardSubtitle: "Welcome back! Please sign in to continue",
    footerText: "Don't have an account?",
    footerLinkLabel: "Sign up",
    footerLinkHref: "/signup",
    showPasskeyLink: true,
  },
  signup: {
    heroTitle: "Ready to create?",
    heroSubtitle: "Your browser's about to become a studio.",
    cardTitle: "Create your account",
    cardSubtitle: "Welcome! Please fill in the details to get started.",
    footerText: "Already have an account?",
    footerLinkLabel: "Sign in",
    footerLinkHref: "/login",
    showPasskeyLink: false,
  },
};

const AUTH_FIELDS: Record<AuthMode, AuthField[][]> = {
  login: [[{ label: "Email address", name: "email", type: "email", placeholder: "Enter your email address" }]],
  signup: [
    [
      { label: "First name", name: "firstName", type: "text", placeholder: "First name" },
      { label: "Last name", name: "lastName", type: "text", placeholder: "Last name" },
    ],
    [{ label: "Email address", name: "email", type: "email", placeholder: "Enter your email address" }],
    [{ label: "Password", name: "password", type: "password", placeholder: "Enter your password" }],
  ],
};

const ContinueArrowIcon = () => (
  <svg className="size-3.5" viewBox="0 0 8 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path
      d="m7.25 5-3.5-2.25v4.5L7.25 5Z"
      fill="currentColor"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
);

const EyeIcon = () => (
  <svg className="size-4" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M8 9.607c.421 0 .825-.17 1.123-.47a1.617 1.617 0 0 0 0-2.273 1.578 1.578 0 0 0-2.246 0 1.617 1.617 0 0 0 0 2.272c.298.302.702.471 1.123.471Z" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.07 8.38a1.073 1.073 0 0 1 0-.763 6.42 6.42 0 0 1 2.334-2.99A6.302 6.302 0 0 1 8 3.5c2.704 0 5.014 1.71 5.93 4.12.094.246.093.518 0 .763a6.418 6.418 0 0 1-2.334 2.99A6.301 6.301 0 0 1 8 12.5c-2.704 0-5.013-1.71-5.93-4.12ZM10.54 8c0 .682-.267 1.336-.743 1.818A2.526 2.526 0 0 1 8 10.571c-.674 0-1.32-.27-1.796-.753A2.587 2.587 0 0 1 5.459 8c0-.682.268-1.336.745-1.818A2.525 2.525 0 0 1 8 5.429c.674 0 1.32.27 1.797.753.476.482.744 1.136.744 1.818Z"
    />
  </svg>
);

const AuthFieldInput = ({ field }: { field: AuthField }) => {
  const isPasswordField = field.type === "password";

  return (
    <label className="block">
      <span className={FORM_LABEL_CLASSNAME}>{field.label}</span>
      <span className="relative block">
        <input
          type={field.type}
          name={field.name}
          placeholder={field.placeholder}
          className={`${FORM_CONTROL_CLASSNAME} ${isPasswordField ? "pr-11" : ""}`}
        />
        {isPasswordField && (
          <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-white/45">
            <EyeIcon />
          </span>
        )}
      </span>
    </label>
  );
};

const AuthForm = ({ mode, showPasskeyLink }: { mode: AuthMode; showPasskeyLink: boolean }) => {
  const rows = AUTH_FIELDS[mode];

  return (
    <div className="space-y-4">
      {rows.map((row, rowIndex) => (
        <div key={`${mode}-row-${rowIndex}`} className={row.length > 1 ? "grid grid-cols-2 gap-3" : ""}>
          {row.map((field) => (
            <AuthFieldInput key={field.name} field={field} />
          ))}
        </div>
      ))}

      <button type="button" className={`${FORM_PRIMARY_BUTTON_CLASSNAME} ${mode === "signup" ? "mt-6" : ""}`}>
        <span>Continue</span>
        <ContinueArrowIcon />
      </button>

      {showPasskeyLink && (
        <Link href="/login" className="block text-center text-base font-medium text-white transition-opacity hover:opacity-80">
          Use passkey instead
        </Link>
      )}
    </div>
  );
};

const AuthCard = ({ mode }: { mode: AuthMode }) => {
  const content = AUTH_CONTENT[mode];

  return (
    <div className="w-full max-w-md overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-black/35">
      <div className="rounded-lg bg-zinc-900/90 px-10 py-8 shadow-[0_0_2px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.06),0_0_0_1px_rgba(255,255,255,0.03)]">
        <div className="mb-8 flex justify-center">
          <div className="size-10 text-white">
            <CardboardLogo />
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-xl leading-7 font-bold text-white">{content.cardTitle}</h2>
          <p className="mt-2 text-base text-white/65">{content.cardSubtitle}</p>
        </div>

        <div className="mt-6">
          <button type="button" className={FORM_SECONDARY_BUTTON_CLASSNAME}>
            <img src="https://img.clerk.com/static/google.svg?width=160" alt="Sign in with Google" className="size-5" />
            <span>Continue with Google</span>
          </button>
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <p className="text-sm text-white/65">or</p>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <AuthForm mode={mode} showPasskeyLink={content.showPasskeyLink} />
      </div>

      <div className="-mt-1.5 bg-zinc-800/95 px-10 py-4 text-center">
        <span className="text-base text-white/65">{content.footerText}</span>{" "}
        <Link href={content.footerLinkHref} className="text-base font-medium text-white hover:opacity-80">
          {content.footerLinkLabel}
        </Link>
      </div>
    </div>
  );
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
            <AuthCard mode={mode} />

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
