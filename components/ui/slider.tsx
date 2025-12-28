import React from 'react';
import { cn } from '../../utils/cn';

interface SliderProps {
  value: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange: (value: number[]) => void;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({ value, min = 0, max = 100, step = 1, onValueChange, className }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange([parseFloat(e.target.value)]);
  };

  const percentage = ((value[0] - min) / (max - min)) * 100;

  return (
    <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
      <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-white/10">
        <div
            className="absolute h-full bg-gradient-to-r from-accent-indigo to-accent-blue rounded-full"
            style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={handleChange}
        className="absolute h-full w-full opacity-0 cursor-pointer"
      />
      <div
        className="absolute h-5 w-5 rounded-full bg-white shadow-glow-sm ring-2 ring-accent-indigo transition-all duration-150 pointer-events-none"
        style={{ left: `calc(${percentage}% - 10px)` }}
      />
    </div>
  );
};
