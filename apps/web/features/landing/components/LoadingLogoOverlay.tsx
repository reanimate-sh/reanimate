"use client";

import { useEffect } from "react";
import { motion, useAnimationControls } from "framer-motion";

const LOGO_RECTS = [
  { x: 83, y: 421.744, width: 21.6163, height: 187.895 },
  { x: 919.384, y: 421.744, width: 21.6163, height: 187.895 },
  { x: 126.232, y: 536.477, width: 26.6047, height: 186.233 },
  { x: 126.232, y: 312, width: 21.6163, height: 166.279 },
  { x: 202.721, y: 247.151, width: 19.9535, height: 166.279 },
  { x: 305.814, y: 203.919, width: 19.9535, height: 164.616 },
  { x: 432.186, y: 173.988, width: 19.9535, height: 166.279 },
  { x: 563.546, y: 169, width: 19.9535, height: 166.279 },
  { x: 688.256, y: 200.593, width: 21.6163, height: 164.616 },
  { x: 794.674, y: 243.826, width: 21.6163, height: 164.616 },
  { x: 871.163, y: 536.477, width: 26.6047, height: 186.233 },
  { x: 871.163, y: 305.349, width: 26.6047, height: 186.233 },
  { x: 199.395, y: 598, width: 31.593, height: 186.233 },
  { x: 300.825, y: 642.895, width: 36.5814, height: 186.233 },
  { x: 423.872, y: 666.174, width: 41.5698, height: 187.895 },
  { x: 555.232, y: 666.174, width: 41.5698, height: 187.895 },
  { x: 683.268, y: 641.233, width: 36.5814, height: 187.895 },
  { x: 791.349, y: 594.674, width: 33.2558, height: 189.558 },
] as const;

const EASE_OUT: [number, number, number, number] = [0, 0, 0.2, 1];

const rectVariants = {
  hidden: {
    opacity: 0,
    transformOrigin: "512px 512px",
    y: 10,
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.02,
      duration: 0.5,
      ease: EASE_OUT,
    },
  }),
};

type LoadingLogoOverlayProps = {
  onComplete?: () => void;
};

export const LoadingLogoOverlay = ({ onComplete }: LoadingLogoOverlayProps) => {
  const controls = useAnimationControls();

  useEffect(() => {
    let isMounted = true;

    const startAnimation = async () => {
      await controls.start("visible");
      if (isMounted) {
        onComplete?.();
      }
    };

    startAnimation();

    return () => {
      isMounted = false;
    };
  }, [controls, onComplete]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        className="absolute inset-0 bg-black"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      />
      <div className="relative z-10 flex size-64 items-center justify-center">
        <motion.div layoutId="cardboard-logo" className="h-full w-full">
          <svg
            className="h-full w-full text-white"
            width="1024"
            height="1024"
            viewBox="0 0 1024 1024"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {LOGO_RECTS.map((rect, index) => (
              <motion.rect
                key={index}
                custom={index}
                variants={rectVariants}
                initial="hidden"
                animate={controls}
                fill="white"
                {...rect}
              />
            ))}
          </svg>
        </motion.div>
      </div>
    </div>
  );
};
