"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Mesh, Program, Renderer, Triangle } from "ogl";

type RaysOrigin =
  | "top-left"
  | "top-center"
  | "top-right"
  | "left"
  | "right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

type LightRaysProps = {
  raysOrigin?: RaysOrigin;
  raysColor?: string;
  raysSpeed?: number;
  lightSpread?: number;
  rayLength?: number;
  pulsating?: boolean;
  fadeDistance?: number;
  saturation?: number;
  followMouse?: boolean;
  mouseInfluence?: number;
  noiseAmount?: number;
  distortion?: number;
  className?: string;
};

type UniformMap = {
  iTime: { value: number };
  iResolution: { value: [number, number] };
  rayPos: { value: [number, number] };
  rayDir: { value: [number, number] };
  raysColor: { value: [number, number, number] };
  raysSpeed: { value: number };
  lightSpread: { value: number };
  rayLength: { value: number };
  pulsating: { value: number };
  fadeDistance: { value: number };
  saturation: { value: number };
  mousePos: { value: [number, number] };
  mouseInfluence: { value: number };
  noiseAmount: { value: number };
  distortion: { value: number };
};

const DEFAULT_RAYS_COLOR = "#ffffff";

const hexToRgbNormalized = (hex: string): [number, number, number] => {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!match) return [1, 1, 1];

  return [
    parseInt(match[1], 16) / 255,
    parseInt(match[2], 16) / 255,
    parseInt(match[3], 16) / 255,
  ];
};

const getRayConfig = (origin: RaysOrigin, width: number, height: number) => {
  switch (origin) {
    case "top-left":
      return { anchor: [0, -0.2 * height] as [number, number], dir: [0, 1] as [number, number] };
    case "top-right":
      return { anchor: [width, -0.2 * height] as [number, number], dir: [0, 1] as [number, number] };
    case "left":
      return { anchor: [-0.2 * width, 0.5 * height] as [number, number], dir: [1, 0] as [number, number] };
    case "right":
      return { anchor: [1.2 * width, 0.5 * height] as [number, number], dir: [-1, 0] as [number, number] };
    case "bottom-left":
      return { anchor: [0, 1.2 * height] as [number, number], dir: [0, -1] as [number, number] };
    case "bottom-center":
      return {
        anchor: [0.5 * width, 1.2 * height] as [number, number],
        dir: [0, -1] as [number, number],
      };
    case "bottom-right":
      return { anchor: [width, 1.2 * height] as [number, number], dir: [0, -1] as [number, number] };
    case "top-center":
    default:
      return {
        anchor: [0.5 * width, -0.2 * height] as [number, number],
        dir: [0, 1] as [number, number],
      };
  }
};

const LightRays = ({
  raysOrigin = "top-center",
  raysColor = DEFAULT_RAYS_COLOR,
  raysSpeed = 1,
  lightSpread = 1,
  rayLength = 2,
  pulsating = false,
  fadeDistance = 1,
  saturation = 1,
  followMouse = true,
  mouseInfluence = 0.1,
  noiseAmount = 0,
  distortion = 0,
  className = "",
}: LightRaysProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<Renderer | undefined>(undefined);
  const uniformsRef = useRef<UniformMap | undefined>(undefined);
  const meshRef = useRef<Mesh | undefined>(undefined);
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 });
  const smoothedMouseRef = useRef({ x: 0.5, y: 0.5 });
  const animationFrameRef = useRef<number | undefined>(undefined);
  const cleanupRef = useRef<(() => void) | undefined>(undefined);
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | undefined>(undefined);

  useEffect(() => {
    if (!containerRef.current || observerRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: "200px", threshold: 0 },
    );

    observerRef.current.observe(containerRef.current);

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = undefined;
    };
  }, []);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    cleanupRef.current?.();
    cleanupRef.current = undefined;

    let cancelled = false;

    const initialize = async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 10));
      if (cancelled || !containerRef.current) return;

      const renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio, 2),
        alpha: true,
      });
      rendererRef.current = renderer;

      const gl = renderer.gl;
      gl.canvas.style.width = "100%";
      gl.canvas.style.height = "100%";

      while (containerRef.current?.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      containerRef.current.appendChild(gl.canvas);

      const vertex = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

      const fragment = `precision highp float;

uniform float iTime;
uniform vec2  iResolution;

uniform vec2  rayPos;
uniform vec2  rayDir;
uniform vec3  raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2  mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;

varying vec2 vUv;

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
                  float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);

  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;

  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

  float distance = length(sourceToCoord);
  float maxDistance = iResolution.x * rayLength;
  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);

  float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
  float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0, 1.0
  );

  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);

  vec2 finalRayDir = rayDir;
  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  vec4 rays1 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349,
                           1.5 * raysSpeed);
  vec4 rays2 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234,
                           1.1 * raysSpeed);

  fragColor = rays1 * 0.5 + rays2 * 0.4;

  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
  }

  float brightness = 1.0 - (coord.y / iResolution.y);
  fragColor.x *= 0.1 + brightness * 0.8;
  fragColor.y *= 0.3 + brightness * 0.6;
  fragColor.z *= 0.5 + brightness * 0.5;

  if (saturation != 1.0) {
    float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
    fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
  }

  fragColor.rgb *= raysColor;
}

void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor  = color;
}`;

      const uniforms: UniformMap = {
        iTime: { value: 0 },
        iResolution: { value: [1, 1] },
        rayPos: { value: [0, 0] },
        rayDir: { value: [0, 1] },
        raysColor: { value: hexToRgbNormalized(raysColor) },
        raysSpeed: { value: raysSpeed },
        lightSpread: { value: lightSpread },
        rayLength: { value: rayLength },
        pulsating: { value: Number(Boolean(pulsating)) },
        fadeDistance: { value: fadeDistance },
        saturation: { value: saturation },
        mousePos: { value: [0.5, 0.5] },
        mouseInfluence: { value: mouseInfluence },
        noiseAmount: { value: noiseAmount },
        distortion: { value: distortion },
      };
      uniformsRef.current = uniforms;

      const camera = new Camera(gl);
      const geometry = new Triangle(gl);
      const program = new Program(gl, { vertex, fragment, uniforms });
      const mesh = new Mesh(gl, { geometry, program });
      meshRef.current = mesh;

      const resize = () => {
        if (!containerRef.current || !rendererRef.current || !uniformsRef.current) return;

        rendererRef.current.dpr = Math.min(window.devicePixelRatio, 2);
        const { clientWidth, clientHeight } = containerRef.current;
        rendererRef.current.setSize(clientWidth, clientHeight);

        const width = clientWidth * rendererRef.current.dpr;
        const height = clientHeight * rendererRef.current.dpr;
        uniformsRef.current.iResolution.value = [width, height];

        const { anchor, dir } = getRayConfig(raysOrigin, width, height);
        uniformsRef.current.rayPos.value = anchor;
        uniformsRef.current.rayDir.value = dir;
      };

      const animate = (time: number) => {
        const rendererValue = rendererRef.current;
        const uniformsValue = uniformsRef.current;
        const meshValue = meshRef.current;
        if (!rendererValue || !uniformsValue || !meshValue) return;

        uniformsValue.iTime.value = time * 0.001;

        if (followMouse && mouseInfluence > 0) {
          smoothedMouseRef.current.x =
            0.92 * smoothedMouseRef.current.x + 0.08 * targetMouseRef.current.x;
          smoothedMouseRef.current.y =
            0.92 * smoothedMouseRef.current.y + 0.08 * targetMouseRef.current.y;
          uniformsValue.mousePos.value = [
            smoothedMouseRef.current.x,
            smoothedMouseRef.current.y,
          ];
        }

        try {
          rendererValue.render({ scene: meshValue, camera });
          animationFrameRef.current = window.requestAnimationFrame(animate);
        } catch (error) {
          console.warn("WebGL rendering error:", error);
        }
      };

      window.addEventListener("resize", resize);
      resize();
      animationFrameRef.current = window.requestAnimationFrame(animate);

      cleanupRef.current = () => {
        if (animationFrameRef.current) {
          window.cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = undefined;
        }

        window.removeEventListener("resize", resize);

        try {
          const canvas = renderer.gl.canvas;
          renderer.gl.getExtension("WEBGL_lose_context")?.loseContext();
          if (canvas?.parentNode) {
            canvas.parentNode.removeChild(canvas);
          }
        } catch (error) {
          console.warn("Error during WebGL cleanup:", error);
        }

        rendererRef.current = undefined;
        uniformsRef.current = undefined;
        meshRef.current = undefined;
      };
    };

    initialize();

    return () => {
      cancelled = true;
      cleanupRef.current?.();
      cleanupRef.current = undefined;
    };
  }, [
    isVisible,
    distortion,
    fadeDistance,
    followMouse,
    lightSpread,
    mouseInfluence,
    noiseAmount,
    pulsating,
    rayLength,
    raysColor,
    raysOrigin,
    raysSpeed,
    saturation,
  ]);

  useEffect(() => {
    if (!uniformsRef.current || !containerRef.current || !rendererRef.current) return;

    uniformsRef.current.raysColor.value = hexToRgbNormalized(raysColor);
    uniformsRef.current.raysSpeed.value = raysSpeed;
    uniformsRef.current.lightSpread.value = lightSpread;
    uniformsRef.current.rayLength.value = rayLength;
    uniformsRef.current.pulsating.value = Number(Boolean(pulsating));
    uniformsRef.current.fadeDistance.value = fadeDistance;
    uniformsRef.current.saturation.value = saturation;
    uniformsRef.current.mouseInfluence.value = mouseInfluence;
    uniformsRef.current.noiseAmount.value = noiseAmount;
    uniformsRef.current.distortion.value = distortion;

    const { clientWidth, clientHeight } = containerRef.current;
    const width = clientWidth * rendererRef.current.dpr;
    const height = clientHeight * rendererRef.current.dpr;
    const { anchor, dir } = getRayConfig(raysOrigin, width, height);
    uniformsRef.current.rayPos.value = anchor;
    uniformsRef.current.rayDir.value = dir;
  }, [
    raysColor,
    raysSpeed,
    lightSpread,
    raysOrigin,
    rayLength,
    pulsating,
    fadeDistance,
    saturation,
    mouseInfluence,
    noiseAmount,
    distortion,
  ]);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (!containerRef.current || !rendererRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      targetMouseRef.current = {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
      };
    };

    if (!followMouse) return;

    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [followMouse]);

  return <div ref={containerRef} className={`light-rays-container ${className}`.trim()} />;
};

export const LightRaysBackground = () => {
  return (
    <motion.div
      className="fixed top-0 left-0 z-0 h-screen w-full"
      initial={{ opacity: 0, y: -100, filter: "blur(100px)" }}
      animate={{ opacity: 0.5, y: 0, filter: "blur(1px)" }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <LightRays
        raysOrigin="top-center"
        raysColor="#6FE7FF"
        raysSpeed={0.4}
        lightSpread={8}
        rayLength={4}
        followMouse
        mouseInfluence={0.05}
        noiseAmount={0.1}
        distortion={0}
      />
    </motion.div>
  );
};
