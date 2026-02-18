"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { FeaturesCarouselSection } from "./components/FeaturesCarouselSection";
import { SuperpowersSection } from "./components/SuperpowersSection";
import { CtaSection } from "./components/CtaSection";
import { Footer } from "./components/Footer";
import { VideoModal } from "./components/VideoModal";
import { LoadingLogoOverlay } from "./components/LoadingLogoOverlay";

export const LandingPage = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [logoAnimationComplete, setLogoAnimationComplete] = useState(false);
  const [heroFramesLoaded, setHeroFramesLoaded] = useState(false);

  const isPageLoading = !logoAnimationComplete || !heroFramesLoaded;

  return (
    <div className="font-landing relative z-10 flex w-full flex-col items-center">
      <AnimatePresence>
        {isPageLoading && (
          <LoadingLogoOverlay onComplete={() => setLogoAnimationComplete(true)} />
        )}
      </AnimatePresence>
      <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
      <Header showLogo={!isPageLoading} />
      <HeroSection
        loading={isPageLoading}
        onFramesLoaded={() => setHeroFramesLoaded(true)}
        onWatchVideo={() => setIsVideoOpen(true)}
      />
      <FeaturesCarouselSection />
      <SuperpowersSection />
      <CtaSection />
      <div className="relative z-10 w-full">
        <Footer />
      </div>
    </div>
  );
};
