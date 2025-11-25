import React from 'react';
import { cn } from '../../utils/cn';

interface ProgressProps {
  value: number;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value, className }) => {
  return (
    <div className={cn("relative h-4 w-full overflow-hidden rounded-full bg-cream-200", className)}>
      <div
        className="h-full w-full flex-1 bg-brand-yellow border-r-4 border-white transition-all duration-500 ease-in-out"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  );
};