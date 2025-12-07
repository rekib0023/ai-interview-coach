"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, ReactNode, RefObject } from "react";
import { cn } from "@/lib/utils";

interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
  velocities?: number[];
  offset?: number;
  direction?: 1 | -1;
  stiffness?: number;
  damping?: number;
  containerRef?: RefObject<HTMLElement | null>; // Updated type
}

export function ParallaxSection({
  children,
  className,
  offset = 50,
  direction = 1,
  stiffness = 100,
  damping = 30,
  containerRef,
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Use containerRef if provided, otherwise default to viewport
  const { scrollYProgress } = useScroll({
    target: ref,
    container: containerRef as RefObject<HTMLElement>, // Cast for framer-motion compatibility
    offset: ["start end", "end start"],
  });

  const springConfig = { stiffness, damping, restDelta: 0.001 };
  const smoothProgress = useSpring(scrollYProgress, springConfig);

  const y = useTransform(
    smoothProgress,
    [0, 1],
    [offset * direction, -offset * direction]
  );

  return (
    <div
      ref={ref}
      className={cn("relative z-10 snap-start scroll-mt-0", className)} // Added snap-start
    >
      <motion.div style={{ y }} className="w-full">
        {children}
      </motion.div>
    </div>
  );
}

interface FloatingElementProps {
  className?: string;
  depth?: number;
  containerRef?: RefObject<HTMLElement | null>; // Updated type
}

export function FloatingDataElement({
  className,
  depth = 1,
  containerRef
}: FloatingElementProps) {
  // Track scroll of container or window
  const { scrollY } = useScroll({ container: containerRef as RefObject<HTMLElement> });

  const y = useTransform(scrollY, (val) => val * 0.1 * depth);
  const rotate = useTransform(scrollY, (val) => val * 0.05 * depth);

  return (
    <motion.div
      style={{ y, rotate }}
      className={cn("absolute pointer-events-none opacity-20 z-0", className)}
      aria-hidden="true"
    />
  );
}
