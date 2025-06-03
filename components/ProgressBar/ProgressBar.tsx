// components/ProgressBar.tsx
"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  if (totalSteps <= 1) return null;
  const percentage = currentStep === totalSteps - 1 ? 100 : (currentStep / (totalSteps - 1)) * 100;

  return (
    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
      <div
        className={cn("h-full rounded-full bg-primary transition-all duration-300 ease-in-out")}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
}