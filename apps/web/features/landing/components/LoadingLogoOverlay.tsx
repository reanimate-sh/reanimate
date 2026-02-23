"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { REANIMATE_LOGO_POLYGONS } from "./icons/reanimateLogoData";

const EASE_OUT: [number, number, number, number] = [0, 0, 0.2, 1];

type LoadingLogoOverlayProps = {
  onComplete?: () => void;
};

export const LoadingLogoOverlay = ({ onComplete }: LoadingLogoOverlayProps) => {
  const controls = useAnimationControls();
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let isMounted = true;

    const startAnimation = async () => {
      await controls.start("visible");
      if (isMounted) {
        onCompleteRef.current?.();
      }
    };

    startAnimation();

    return () => {
      isMounted = false;
    };
  }, [controls]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      <motion.div className="absolute inset-0 bg-black" exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />
      <div className="relative z-10 flex size-64 items-center justify-center">
        <motion.div layoutId="brand-logo" className="h-full w-full text-white">
          <svg className="h-full w-full" viewBox="0 0 498 510" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <motion.polygon
              points={REANIMATE_LOGO_POLYGONS[0]}
              fill="currentColor"
              initial={{ opacity: 0, x: 76, y: -44, rotate: 7, scale: 0.9, transformOrigin: "280px 128px" }}
              animate={controls}
              variants={{
                visible: {
                  opacity: [0, 1, 1],
                  x: [76, -7, 0],
                  y: [-44, 3, 0],
                  rotate: [7, -1.4, 0],
                  scale: [0.9, 1.03, 1],
                  transition: {
                    duration: 0.86,
                    times: [0, 0.72, 1],
                    ease: EASE_OUT,
                  },
                },
              }}
            />
            <motion.polygon
              points={REANIMATE_LOGO_POLYGONS[1]}
              fill="currentColor"
              initial={{ opacity: 0, y: 78, scale: 0.9, transformOrigin: "160px 320px" }}
              animate={controls}
              variants={{
                visible: {
                  opacity: [0, 1, 1],
                  y: [78, -5, 0],
                  scale: [0.9, 1.02, 1],
                  transition: {
                    delay: 0.1,
                    duration: 0.9,
                    times: [0, 0.74, 1],
                    ease: EASE_OUT,
                  },
                },
              }}
            />
          </svg>
        </motion.div>
      </div>
    </div>
  );
};
