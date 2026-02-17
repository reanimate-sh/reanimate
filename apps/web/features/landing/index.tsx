"use client";

import { useState } from "react";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { CustomerLogosSection } from "./components/CustomerLogosSection";
import { FeaturesCarouselSection } from "./components/FeaturesCarouselSection";
import { SuperpowersSection } from "./components/SuperpowersSection";
import { CtaSection } from "./components/CtaSection";
import { Footer } from "./components/Footer";
import { VideoModal } from "./components/VideoModal";

export const LandingPage = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <div className="relative z-10 flex w-full max-w-[2000px] flex-col items-center">
      <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
      <Header />
      <HeroSection onWatchVideo={() => setIsVideoOpen(true)} />
      <CustomerLogosSection />
      <FeaturesCarouselSection />
      <SuperpowersSection />
      <CtaSection />
      <Footer />
    </div>
  );
};
