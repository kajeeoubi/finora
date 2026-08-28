"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { BudgetStatus } from "@/types";

interface HatchProgressBarProps {
  percentage: number; // 0 - 100+
  status?: BudgetStatus;
  className?: string;
  height?: string;
  customSolidColor?: string;
  animateOnMount?: boolean;
}

export function HatchProgressBar({
  percentage,
  status = "NORMAL",
  className,
  height = "h-4",
  customSolidColor,
  animateOnMount = true,
}: HatchProgressBarProps) {
  const targetWidth = Math.min(100, Math.max(0, percentage));
  const [displayWidth, setDisplayWidth] = useState(animateOnMount ? 0 : targetWidth);

  useEffect(() => {
    // Start at 0 and spring to target width on mount and percentage change
    const timer = setTimeout(() => {
      setDisplayWidth(targetWidth);
    }, 60);
    return () => clearTimeout(timer);
  }, [targetWidth]);

  // Determine solid color based on status or custom override
  let solidBgClass = "bg-[#6C4EF5]"; // Default violet
  if (customSolidColor) {
    solidBgClass = "";
  } else if (status === "NORMAL") {
    solidBgClass = "bg-[#6C4EF5]";
  } else if (status === "WARNING") {
    solidBgClass = "bg-[#F59E0B]";
  } else if (status === "EXCEEDED") {
    solidBgClass = "bg-[#EF4444]";
  }

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-hatch-pattern dark:bg-hatch-pattern-dark",
        height,
        className
      )}
    >
      {/* Solid filled bar for active used budget with smooth progress transition */}
      <div
        className={cn(
          "h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]",
          solidBgClass
        )}
        style={{
          width: `${displayWidth}%`,
          backgroundColor: customSolidColor || undefined,
        }}
      />
    </div>
  );
}
