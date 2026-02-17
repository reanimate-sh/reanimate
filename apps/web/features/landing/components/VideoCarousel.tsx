"use client";

import { useState, useEffect, useRef } from "react";
import { CAROUSEL_VIDEOS } from "../data/superpowers";

export const VideoCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % CAROUSEL_VIDEOS.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + CAROUSEL_VIDEOS.length) % CAROUSEL_VIDEOS.length);

  useEffect(() => {
    const video = videoRefs.current[currentSlide];
    if (!video) return;
    const handleEnded = () => nextSlide();
    video.addEventListener("ended", handleEnded);
    return () => video.removeEventListener("ended", handleEnded);
  }, [currentSlide]);

  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === currentSlide) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [currentSlide]);

  const getCardStyle = (index: number): React.CSSProperties => {
    const total = CAROUSEL_VIDEOS.length;
    let offset = index - currentSlide;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    const absOffset = Math.abs(offset);

    if (absOffset === 0) {
      return { transform: "scale(1.75)", filter: "blur(0px)", zIndex: 10, opacity: 1, userSelect: "none", touchAction: "pan-y" };
    } else if (absOffset === 1) {
      const translateX = offset * 260;
      return { transform: `translateX(${translateX}px) scale(0.9)`, filter: "blur(2px)", zIndex: 9, opacity: 1, userSelect: "none", touchAction: "pan-y" };
    } else if (absOffset === 2) {
      const translateX = offset * 260;
      return { transform: `translateX(${translateX}px) scale(0.8)`, filter: "blur(2px)", zIndex: 8, opacity: 1, userSelect: "none", touchAction: "pan-y" };
    } else {
      return { opacity: 0, pointerEvents: "none", zIndex: 0 };
    }
  };

  const getLabelStyle = (index: number): React.CSSProperties => {
    const total = CAROUSEL_VIDEOS.length;
    let offset = index - currentSlide;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    const absOffset = Math.abs(offset);
    if (absOffset === 0) return { transform: `scale(${1 / 1.75})` };
    if (absOffset === 1) return { transform: `scale(${1 / 0.9})` };
    return { transform: `scale(${1 / 0.8})` };
  };

  return (
    <div className="relative flex h-[350px] w-full items-center justify-center overflow-hidden md:h-[600px]">
      <div className="relative flex h-full w-full max-w-[1400px] items-center justify-center">
        {CAROUSEL_VIDEOS.map((video, index) => (
          <div
            key={index}
            className="absolute flex cursor-grab flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl active:cursor-grabbing h-[168px] w-[300px] md:h-[280px] md:w-[480px] transition-all duration-500"
            draggable={false}
            style={getCardStyle(index)}
            onClick={() => index !== currentSlide && setCurrentSlide(index)}
          >
            <div className="relative flex-1 overflow-hidden bg-black">
              {video.portrait ? (
                <div className="relative h-full w-full overflow-hidden bg-black">
                  <div className="absolute inset-0 opacity-50">
                    <video src={video.src} muted loop playsInline className="h-full w-full scale-110 object-cover blur-2xl" />
                  </div>
                  <div className="relative flex h-full w-full items-center justify-center">
                    <video
                      ref={(el) => { videoRefs.current[index] = el; }}
                      src={video.src}
                      muted
                      loop
                      playsInline
                      className="aspect-[9/16] h-full object-cover shadow-2xl"
                    />
                  </div>
                </div>
              ) : (
                <div className="relative h-full w-full bg-black">
                  <video
                    ref={(el) => { videoRefs.current[index] = el; }}
                    src={video.src}
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-cover opacity-80"
                  />
                  {index === currentSlide && (
                    <button className="absolute right-3 bottom-3 z-30 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm hover:bg-black/70 md:right-4 md:bottom-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5">
                        <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/>
                        <line x1="22" x2="16" y1="9" y2="15"/>
                        <line x1="16" x2="22" y1="9" y2="15"/>
                      </svg>
                    </button>
                  )}
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 w-full origin-bottom-left p-4 md:p-6" style={getLabelStyle(index)}>
              <h3 className="font-landing text-lg font-medium text-white md:text-xl">{video.title}</h3>
              <p className="mt-1 text-xs text-neutral-400 md:text-sm">{video.description}</p>
            </div>
          </div>
        ))}

        {/* Navigation arrows */}
        <div className="pointer-events-none absolute inset-0 z-20 mx-auto flex w-full max-w-[1400px] items-center justify-between px-8">
          <button
            className="pointer-events-auto rounded-full border border-white/10 bg-black/40 p-3 text-white backdrop-blur-md transition-all hover:bg-white/10"
            aria-label="Previous slide"
            onClick={prevSlide}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
            </svg>
          </button>
          <button
            className="pointer-events-auto rounded-full border border-white/10 bg-black/40 p-3 text-white backdrop-blur-md transition-all hover:bg-white/10"
            aria-label="Next slide"
            onClick={nextSlide}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </button>
        </div>

        {/* Dots */}
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
      </div>
    </div>
  );
};
