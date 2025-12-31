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
    <div className={cn("relative flex w-full touch-none select-none items-center h-5", className)}>
      <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200">
        <div
          className="absolute h-full bg-brand-blue rounded-full"
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
        className="absolute h-4 w-4 rounded-full bg-white border-2 border-brand-blue shadow-sm transition-all duration-150 pointer-events-none"
        style={{ left: `calc(${percentage}% - 8px)` }}
      />
    </div>
  );
};
