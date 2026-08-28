"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MarqueeTextProps {
  text: string;
  className?: string;
  speed?: number; // seconds for full cycle
}

export function MarqueeText({
  text,
  className,
  speed = 8,
}: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const check = () => {
      if (containerRef.current && textRef.current) {
        setIsOverflowing(
          textRef.current.scrollWidth > containerRef.current.clientWidth + 1
        );
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [text]);

  if (!isOverflowing) {
    return (
      <div ref={containerRef} className={cn("truncate", className)}>
        <span ref={textRef}>{text}</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "overflow-hidden relative whitespace-nowrap mask-[linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]",
        className
      )}
    >
      <div
        className="inline-flex gap-6 animate-marquee-slide hover:[animation-play-state:paused]"
        style={{ animationDuration: `${speed}s` }}
      >
        <span ref={textRef}>{text}</span>
        <span aria-hidden="true">{text}</span>
      </div>
    </div>
  );
}
