import { Footer } from "@/features/landing/components/Footer";
import { Header } from "@/features/landing/components/Header";
import { LightRaysBackground } from "./components/LightRaysBackground";

type LegalPageProps = {
  html: string;
};

export const LegalPage = ({ html }: LegalPageProps) => (
  <div className="font-landing relative flex min-h-screen w-full flex-col items-center bg-black">
    <LightRaysBackground />

    <Header />

    <div className="contents" dangerouslySetInnerHTML={{ __html: html }} />

    <div className="z-10 mt-auto w-full">
      <Footer />
    </div>
  </div>
);
