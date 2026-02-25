"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const VANTA_FOG_URL = "https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.fog.min.js";
const VANTA_FOG_SCRIPT_ID = "vanta-fog-script";

type VantaEffect = {
  destroy?: () => void;
  resize?: () => void;
};

declare global {
  interface Window {
    THREE?: typeof THREE;
    VANTA?: {
      FOG?: (options: Record<string, unknown>) => VantaEffect;
    };
  }
}

const loadScript = (url: string, id: string) => {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      const alreadyLoaded = existing.dataset.loaded === "true" || Boolean(window.VANTA?.FOG);

      if (alreadyLoaded) {
        resolve();
        return;
      }

      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${url}`)), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = url;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${url}`));
    document.body.appendChild(script);
  });
};

export const AppBackground = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const effectRef = useRef<VantaEffect | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let isMounted = true;

    const init = async () => {
      try {
        window.THREE = THREE;
        await loadScript(VANTA_FOG_URL, VANTA_FOG_SCRIPT_ID);

        if (!isMounted || !window.VANTA?.FOG) {
          return;
        }

        effectRef.current = window.VANTA.FOG({
          el: container,
          THREE: window.THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          highlightColor: 0x2f8f6d,
          midtoneColor: 0x14533f,
          lowlightColor: 0x071e17,
          baseColor: 0x000000,
          blurFactor: 0.9,
          speed: 1.25,
          zoom: 1.1,
        });
      } catch {
        effectRef.current = null;
      }
    };

    void init();

    return () => {
      isMounted = false;
      effectRef.current?.destroy?.();
      effectRef.current = null;
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div className="pointer-events-none absolute inset-0 h-full w-full opacity-70">
        <div ref={containerRef} className="h-full w-full" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_10%,rgba(60,142,110,0.11),transparent_44%),radial-gradient(circle_at_80%_16%,rgba(33,107,78,0.11),transparent_50%),radial-gradient(circle_at_52%_112%,rgba(56,136,102,0.05),transparent_58%),linear-gradient(180deg,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0.74)_100%)]" />
    </div>
  );
};
