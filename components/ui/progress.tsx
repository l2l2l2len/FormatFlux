import React from 'react';
import { cn } from '../../utils/cn';

interface ProgressProps {
  value: number;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value, className }) => {
  return (
    <div className={cn("relative h-3 w-full overflow-hidden rounded-full bg-white/10", className)}>
      <div
        className="h-full w-full flex-1 bg-gradient-to-r from-accent-indigo to-accent-blue transition-all duration-500 ease-in-out rounded-full"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  );
};
