import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '../utils/cn';

interface ThemeToggleProps {
  className?: string;
}

// Slider-style toggle
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative flex items-center w-16 h-8 rounded-full p-1 transition-all duration-300",
        isDark
          ? "bg-midnight-lighter border border-white/10"
          : "bg-paper-dark border border-ink/10 shadow-soft",
        className
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Background icons */}
      <Sun
        size={14}
        className={cn(
          "absolute left-2 transition-opacity duration-300",
          isDark ? "opacity-30 text-text-muted" : "opacity-0"
        )}
      />
      <Moon
        size={14}
        className={cn(
          "absolute right-2 transition-opacity duration-300",
          isDark ? "opacity-0" : "opacity-30 text-slate"
        )}
      />

      {/* Sliding knob */}
      <div
        className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 shadow-md",
          isDark
            ? "translate-x-8 bg-accent-indigo"
            : "translate-x-0 bg-white"
        )}
      >
        {isDark ? (
          <Moon size={14} className="text-white" />
        ) : (
          <Sun size={14} className="text-amber-500" />
        )}
      </div>
    </button>
  );
};

// Compact icon button toggle
export const ThemeToggleCompact: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "p-2.5 rounded-xl transition-all duration-300",
        isDark
          ? "bg-white/5 hover:bg-white/10 text-text-primary border border-white/10"
          : "bg-ink/5 hover:bg-ink/10 text-ink border border-ink/10 shadow-soft",
        className
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-5 h-5">
        <Sun
          size={20}
          className={cn(
            "absolute inset-0 transition-all duration-300",
            isDark
              ? "opacity-0 rotate-90 scale-0"
              : "opacity-100 rotate-0 scale-100 text-amber-500"
          )}
        />
        <Moon
          size={20}
          className={cn(
            "absolute inset-0 transition-all duration-300",
            isDark
              ? "opacity-100 rotate-0 scale-100 text-accent-indigo"
              : "opacity-0 -rotate-90 scale-0"
          )}
        />
      </div>
    </button>
  );
};
