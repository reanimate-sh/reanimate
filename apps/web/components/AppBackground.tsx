"use client";

import { useCallback, useEffect, useRef } from "react";

type Dot = {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  brightness: number;
  phase: number;
  breathingSpeed: number;
  glowIntensity: number;
  glowTarget: number;
  glowSpeed: number;
  nextGlowTime: number;
};

export const AppBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mousePositionRef = useRef({ x: -1000, y: -1000 });
  const previousMousePositionRef = useRef({ x: -1000, y: -1000 });
  const mouseVelocityRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef(0);
  const lastTimeRef = useRef(0);

  const dotGap = 14;
  const dotSize = 1;
  const dotColor = "var(--color-sky-700)";
  const glowColor = "var(--color-sky-700)";
  const mouseRadius = 100;
  const distortionStrength = 1.2;
  const breathingSpeed = 1;
  const opacity = 1;
  const returnSpeed = 0.06;

  const createDotGrid = useCallback((width: number, height: number) => {
    const dots: Dot[] = [];
    const columns = Math.ceil(width / dotGap) + 2;
    const rows = Math.ceil(height / dotGap) + 2;
    const offsetX = (width % dotGap) / 2;
    const offsetY = (height % dotGap) / 2;

    for (let column = 0; column < columns; column += 1) {
      for (let row = 0; row < rows; row += 1) {
        const x = column * dotGap + offsetX;
        const y = row * dotGap + offsetY;

        const brightness = Math.max(
          0.1,
          Math.min(
            1,
            0.3 +
              0.3 * Math.sin(0.3 * column + 0.2 * row) +
              0.2 * Math.sin(0.7 * column - 0.5 * row) +
              0.2 * Math.sin((column + row) * 0.4) +
              0.3 * Math.random(),
          ),
        );

        dots.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: 0,
          vy: 0,
          brightness,
          phase: Math.random() * Math.PI * 2,
          breathingSpeed: 0.5 + 0.5 * Math.random(),
          glowIntensity: 0,
          glowTarget: 0,
          glowSpeed: 0.002 + 0.003 * Math.random(),
          nextGlowTime: Math.random() * 3,
        });
      }
    }

    return dots;
  }, [dotGap]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const resolveColor = (value: string) => {
      if (value.startsWith("var(")) {
        const variable = value.match(/var\(([^)]+)\)/)?.[1];
        if (variable) {
          return getComputedStyle(container).getPropertyValue(variable).trim();
        }
      }

      return value;
    };

    let disposed = false;
    const devicePixelRatio = Math.max(1, window.devicePixelRatio || 1);
    let resolvedDotColor = resolveColor(dotColor);

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();

      canvas.width = Math.floor(width * devicePixelRatio);
      canvas.height = Math.floor(height * devicePixelRatio);
      canvas.style.width = `${Math.floor(width)}px`;
      canvas.style.height = `${Math.floor(height)}px`;

      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      dotsRef.current = createDotGrid(width, height);
      resolvedDotColor = resolveColor(dotColor);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    let shouldResetPointer = true;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nextX = event.clientX - rect.left;
      const nextY = event.clientY - rect.top;

      const isInside = nextX >= 0 && nextX <= rect.width && nextY >= 0 && nextY <= rect.height;

      if (isInside) {
        if (shouldResetPointer || mousePositionRef.current.x < 0) {
          mousePositionRef.current = { x: nextX, y: nextY };
          previousMousePositionRef.current = { x: nextX, y: nextY };
          mouseVelocityRef.current = { x: 0, y: 0 };
          shouldResetPointer = false;
        } else {
          previousMousePositionRef.current = { ...mousePositionRef.current };
          mousePositionRef.current = { x: nextX, y: nextY };
          mouseVelocityRef.current = {
            x: mousePositionRef.current.x - previousMousePositionRef.current.x,
            y: mousePositionRef.current.y - previousMousePositionRef.current.y,
          };
        }
      } else {
        mousePositionRef.current = { x: -1000, y: -1000 };
        mouseVelocityRef.current = { x: 0, y: 0 };
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    const resetAnimationState = () => {
      if (document.hidden) {
        return;
      }

      lastTimeRef.current = 0;
      mouseVelocityRef.current = { x: 0, y: 0 };

      for (const dot of dotsRef.current) {
        dot.vx = 0;
        dot.vy = 0;
        dot.x = dot.baseX;
        dot.y = dot.baseY;
        dot.glowIntensity = 0;
        dot.glowTarget = 0;
        dot.nextGlowTime = Math.random() * 2;
      }
    };

    document.addEventListener("visibilitychange", resetAnimationState);

    const animate = (timestamp: number) => {
      if (disposed) {
        return;
      }

      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
        animationFrameRef.current = window.requestAnimationFrame(animate);
        return;
      }

      const deltaMultiplier = Math.min((timestamp - lastTimeRef.current) / 16.67, 1.5);
      lastTimeRef.current = timestamp;

      const { width, height } = container.getBoundingClientRect();
      context.clearRect(0, 0, width, height);
      context.globalAlpha = opacity;

      const breathingTime = timestamp * 0.001 * breathingSpeed;
      const nowSeconds = timestamp * 0.001;
      const velocityMagnitude = Math.sqrt(
        mouseVelocityRef.current.x ** 2 + mouseVelocityRef.current.y ** 2,
      );

      for (const dot of dotsRef.current) {
        if (nowSeconds >= dot.nextGlowTime) {
          if (dot.glowTarget === 0) {
            dot.glowTarget = 0.6 + 0.4 * Math.random();
            dot.glowSpeed = 0.001 + 0.002 * Math.random();
          } else {
            dot.glowTarget = 0;
            dot.glowSpeed = 0.0005 + 0.001 * Math.random();
            dot.nextGlowTime = nowSeconds + 1 + 3 * Math.random();
          }
        }

        const glowDelta = dot.glowTarget - dot.glowIntensity;
        dot.glowIntensity += glowDelta * dot.glowSpeed * deltaMultiplier * 60;

        if (dot.glowTarget > 0 && Math.abs(glowDelta) < 0.05) {
          dot.nextGlowTime = nowSeconds + 2 + 3 * Math.random();
        }

        const deltaX = mousePositionRef.current.x - dot.baseX;
        const deltaY = mousePositionRef.current.y - dot.baseY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance < mouseRadius && velocityMagnitude > 0.5) {
          const influence = 1 - distance / mouseRadius;
          const force = influence * influence * distortionStrength;
          dot.vx += mouseVelocityRef.current.x * force * 0.3;
          dot.vy += mouseVelocityRef.current.y * force * 0.3;
        }

        dot.x += dot.vx * deltaMultiplier;
        dot.y += dot.vy * deltaMultiplier;

        const springX = (dot.baseX - dot.x) * returnSpeed * deltaMultiplier;
        const springY = (dot.baseY - dot.y) * returnSpeed * deltaMultiplier;
        dot.x += springX;
        dot.y += springY;

        dot.vx *= 0.92;
        dot.vy *= 0.92;

        dot.vx += (dot.baseX - dot.x) * 0.02 * deltaMultiplier;
        dot.vy += (dot.baseY - dot.y) * 0.02 * deltaMultiplier;

        const breathing = 0.15 * Math.sin(breathingTime * dot.breathingSpeed + dot.phase);
        const baseBrightness = Math.max(0.05, Math.min(1, dot.brightness + breathing));

        const movementGlow = Math.min(
          0.5,
          0.05 * Math.sqrt((dot.x - dot.baseX) ** 2 + (dot.y - dot.baseY) ** 2),
        );

        const alpha = Math.min(1, baseBrightness + movementGlow + dot.glowIntensity * 0.7);
        const hasStrongGlow = dot.glowIntensity > 0.1;

        if (alpha > 0.4 || hasStrongGlow) {
          const glowAmount = Math.max((alpha - 0.4) / 0.6, dot.glowIntensity);
          context.shadowColor = glowColor;
          context.shadowBlur = 10 + 20 * glowAmount;
        } else {
          context.shadowColor = "transparent";
          context.shadowBlur = 0;
        }

        context.globalAlpha = alpha * opacity;
        context.fillStyle = resolvedDotColor;
        context.beginPath();
        context.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2);
        context.fill();
      }

      mouseVelocityRef.current.x *= 0.9;
      mouseVelocityRef.current.y *= 0.9;

      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", resetAnimationState);
      resizeObserver.disconnect();
    };
  }, [
    breathingSpeed,
    createDotGrid,
    distortionStrength,
    dotColor,
    dotSize,
    glowColor,
    mouseRadius,
    opacity,
    returnSpeed,
  ]);

  return (
    <div ref={containerRef} className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-white dark:bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ display: "block" }} />
    </div>
  );
};
