"use client";

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { motion, type PanInfo } from "framer-motion";
import { ArrowLeft, ArrowRight, Volume2, VolumeX } from "lucide-react";
import { CAROUSEL_VIDEOS } from "../data/superpowers";

type VideoCardProps = {
  src: string;
  isActive: boolean;
  portrait: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onEnded: () => void;
};

const CarouselVideoCard = ({ src, isActive, portrait, isMuted, onToggleMute, onEnded }: VideoCardProps) => {
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const blurVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const playVideo = (video: HTMLVideoElement) => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    };

    if (isActive) {
      if (mainVideoRef.current) {
        playVideo(mainVideoRef.current);
      }
      if (blurVideoRef.current) {
        playVideo(blurVideoRef.current);
      }
      return;
    }

    if (mainVideoRef.current) {
      mainVideoRef.current.pause();
      mainVideoRef.current.currentTime = 0;
    }
    if (blurVideoRef.current) {
      blurVideoRef.current.pause();
      blurVideoRef.current.currentTime = 0;
    }
  }, [isActive]);

  useEffect(() => {
    if (mainVideoRef.current) {
      mainVideoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleToggleMute = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggleMute();
  };

  if (!portrait) {
    return (
      <div className="relative h-full w-full bg-black">
        <video ref={mainVideoRef} src={src} muted={isMuted} playsInline onEnded={isActive ? onEnded : undefined} className="h-full w-full object-cover opacity-80" />
        {isActive && (
          <button onClick={handleToggleMute} className="absolute right-3 bottom-3 z-30 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm hover:bg-black/70 md:right-4 md:bottom-4">
            {isMuted ? <VolumeX className="h-2.5 w-2.5" /> : <Volume2 className="h-2.5 w-2.5" />}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <div className="absolute inset-0 opacity-50">
        <video ref={blurVideoRef} src={src} muted loop playsInline className="h-full w-full scale-110 object-cover blur-2xl" />
      </div>
      <div className="relative flex h-full w-full items-center justify-center">
        <video ref={mainVideoRef} src={src} muted={isMuted} playsInline onEnded={isActive ? onEnded : undefined} className="aspect-9/16 h-full object-cover shadow-2xl" />
        {isActive && (
          <button onClick={handleToggleMute} className="absolute right-3 bottom-3 z-30 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm hover:bg-black/70 md:right-4 md:bottom-4">
            {isMuted ? <VolumeX className="h-2.5 w-2.5" /> : <Volume2 className="h-2.5 w-2.5" />}
          </button>
        )}
      </div>
    </div>
  );
};

export const VideoCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(2);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);
    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

  const handleVideoEnded = () => {
    if (isPaused) {
      return;
    }

    setCurrentSlide((index) => (index + 1) % CAROUSEL_VIDEOS.length);
  };

  const handleCardDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const dragDistance = info.offset.x;

    if (dragDistance > 50) {
      setCurrentSlide((index) => (index - 1 + CAROUSEL_VIDEOS.length) % CAROUSEL_VIDEOS.length);
      return;
    }

    if (dragDistance < -50) {
      setCurrentSlide((index) => (index + 1) % CAROUSEL_VIDEOS.length);
    }
  };

  const getCardState = (index: number) => {
    let offset = (index - currentSlide + CAROUSEL_VIDEOS.length) % CAROUSEL_VIDEOS.length;

    if (offset > CAROUSEL_VIDEOS.length / 2) {
      offset -= CAROUSEL_VIDEOS.length;
    }
    if (offset < -CAROUSEL_VIDEOS.length / 2) {
      offset += CAROUSEL_VIDEOS.length;
    }

    const isCenter = offset === 0;
    const distanceFromCenter = Math.abs(offset);

    return {
      scale: isMobile ? (isCenter ? 1.25 : 1 - 0.1 * distanceFromCenter) : (isCenter ? 1.75 : 1 - 0.1 * distanceFromCenter),
      opacity: 1,
      zIndex: 10 - distanceFromCenter,
      x: (isMobile ? 160 : 260) * offset,
      filter: isCenter ? "blur(0px)" : "blur(2px)",
    };
  };

  return (
    <motion.div
      className="relative flex h-[350px] w-full items-center justify-center overflow-hidden md:h-[600px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onViewportLeave={() => setIsMuted(true)}
      viewport={{ amount: 0.1 }}
      ref={containerRef}
    >
      <div className="relative flex h-full w-full max-w-[1400px] items-center justify-center">
        {CAROUSEL_VIDEOS.map((video, index) => {
          const cardState = getCardState(index);

          return (
            <motion.div
              key={video.src}
              className="absolute flex h-[168px] w-[300px] cursor-grab flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl active:cursor-grabbing md:h-[280px] md:w-[480px]"
              initial={false}
              animate={{
                x: cardState.x,
                scale: cardState.scale,
                opacity: cardState.opacity,
                zIndex: cardState.zIndex,
                filter: cardState.filter,
              }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDragEnd={handleCardDragEnd}
              onClick={() => setCurrentSlide(index)}
            >
              <div className="relative flex-1 overflow-hidden bg-black">
                <CarouselVideoCard
                  src={video.src}
                  isActive={cardState.zIndex === 10}
                  portrait={video.portrait}
                  isMuted={isMuted}
                  onToggleMute={() => setIsMuted(!isMuted)}
                  onEnded={handleVideoEnded}
                />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
              </div>

              <motion.div
                className="absolute bottom-0 left-0 w-full origin-bottom-left p-4 md:p-6"
                animate={{ scale: 1 / cardState.scale }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
              >
                <h3 className="font-landing text-lg font-medium text-white md:text-xl">{video.title}</h3>
                <p className="mt-1 text-xs text-neutral-400 md:text-sm">{video.description}</p>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-0 z-20 mx-auto flex w-full max-w-[1400px] items-center justify-between px-8">
        <button
          onClick={() => setCurrentSlide((index) => (index - 1 + CAROUSEL_VIDEOS.length) % CAROUSEL_VIDEOS.length)}
          className="pointer-events-auto rounded-full border border-white/10 bg-black/40 p-3 text-white backdrop-blur-md transition-all hover:bg-white/10"
          aria-label="Previous slide"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>

        <button
          onClick={() => setCurrentSlide((index) => (index + 1) % CAROUSEL_VIDEOS.length)}
          className="pointer-events-auto rounded-full border border-white/10 bg-black/40 p-3 text-white backdrop-blur-md transition-all hover:bg-white/10"
          aria-label="Next slide"
        >
          <ArrowRight className="h-6 w-6" />
        </button>
      </div>

      <div className="absolute bottom-12 z-20 flex gap-2">
        {CAROUSEL_VIDEOS.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? "w-8 bg-white" : "w-1.5 bg-white/20 hover:bg-white/40"}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </motion.div>
  );
};
