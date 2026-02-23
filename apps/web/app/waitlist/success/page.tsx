import Link from "next/link";
import { ReanimateLogo } from "@/features/landing/components/icons/ReanimateLogo";
import { SocialLinks } from "@/features/landing/components/SocialLinks";

const BrandLink = ({ mobile = false }: { mobile?: boolean }) => (
  <Link href="/" className="flex items-center gap-3">
    <div className="size-10 text-white">
      <ReanimateLogo />
    </div>
    <h3 className={`font-landing font-normal text-white ${mobile ? "text-2xl" : "text-2xl"}`}>Reanimate</h3>
  </Link>
);

export default function WaitlistSuccessPage() {
  return (
    <div className="font-landing relative flex min-h-screen w-full flex-col overflow-x-hidden bg-black text-white">
      <div className="fixed inset-0 z-0">
        <video autoPlay loop muted playsInline className="h-full w-full object-cover">
          <source src="/videos/hero-720.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-10 flex min-h-screen w-full flex-col md:flex-row">
        <div className="hidden w-full flex-col justify-between p-8 md:flex md:w-1/2 md:p-16">
          <BrandLink />

          <div className="w-full max-w-2xl">
            <h1 className="font-landing text-4xl leading-tight font-medium text-white md:text-6xl">You&apos;re on the waitlist.</h1>
            <p className="font-landing mt-4 text-xl font-light text-zinc-200/75">
              We&apos;ll email you as soon as your early access spot opens.
            </p>
          </div>
        </div>

        <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 md:h-auto md:min-h-0 md:w-1/2 md:my-3 md:mr-3 md:rounded-lg md:border md:border-white/10 md:bg-black/20 md:p-6 md:backdrop-blur-sm">
          <div className="absolute top-10 right-0 left-0 flex flex-col items-center gap-4 text-center md:hidden">
            <BrandLink mobile />
            <div className="max-w-xs rounded-full border border-white/10 bg-black/30 px-4 py-1.5 backdrop-blur-md">
              <p className="text-sm font-medium text-zinc-300">You&apos;re in line for early access</p>
            </div>
          </div>

          <div className="flex w-full max-w-md flex-col items-center justify-center rounded-2xl bg-black/50 p-6 text-center backdrop-blur-sm md:bg-transparent md:p-0 md:backdrop-blur-none">
            <p className="mb-3 inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
              Waitlist confirmed
            </p>
            <h2 className="font-landing text-3xl leading-tight font-medium text-white md:text-4xl">See you soon.</h2>
            <p className="mt-4 text-base text-zinc-300">
              While we review spots, join our socials for product updates and early drops.
            </p>

            <SocialLinks
              className="mt-8 flex items-center justify-center gap-3"
              linkClassName="group inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-zinc-300 transition-all hover:scale-105 hover:border-white/35 hover:bg-white/10 hover:text-white active:scale-95"
              iconClassName="size-5.5"
            />

            <div className="mt-8 flex items-center gap-3">
              <Link href="/" className="rounded-lg border border-white/20 px-4 py-2 text-sm text-zinc-200 transition-colors hover:border-white/40 hover:text-white">
                Back to home
              </Link>
              <Link href="/login" className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200">
                Go to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
