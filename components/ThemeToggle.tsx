import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '../utils/cn';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative w-14 h-8 rounded-full p-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-indigo focus-visible:ring-offset-2",
        // Light mode styles
        "bg-ink/5 dark:bg-white/10",
        // Hover states
        "hover:bg-ink/10 dark:hover:bg-white/15",
        className
      )}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Track icons */}
      <div className="absolute inset-1 flex items-center justify-between px-1.5">
        <Sun
          size={14}
          className={cn(
            "transition-all duration-300",
            theme === 'light' ? "text-amber-500 opacity-0" : "text-amber-400/40 opacity-100"
          )}
        />
        <Moon
          size={14}
          className={cn(
            "transition-all duration-300",
            theme === 'dark' ? "text-accent-indigo opacity-0" : "text-accent-indigo/40 opacity-100"
          )}
        />
      </div>

      {/* Sliding thumb */}
      <div
        className={cn(
          "relative w-6 h-6 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center",
          // Position
          theme === 'dark' ? "translate-x-6" : "translate-x-0",
          // Background
          theme === 'dark'
            ? "bg-gradient-to-br from-accent-indigo to-accent-blue"
            : "bg-gradient-to-br from-amber-400 to-orange-500"
        )}
      >
        {theme === 'dark' ? (
          <Moon size={12} className="text-white" />
        ) : (
          <Sun size={12} className="text-white" />
        )}
      </div>
    </button>
  );
};

// Compact version for navbar
export const ThemeToggleCompact: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
        "glass hover:shadow-glow-sm",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-indigo",
        className
      )}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-5 h-5">
        {/* Sun icon */}
        <Sun
          size={20}
          className={cn(
            "absolute inset-0 transition-all duration-300",
            theme === 'dark'
              ? "opacity-0 rotate-90 scale-0"
              : "opacity-100 rotate-0 scale-100 text-amber-500"
          )}
        />
        {/* Moon icon */}
        <Moon
          size={20}
          className={cn(
            "absolute inset-0 transition-all duration-300",
            theme === 'dark'
              ? "opacity-100 rotate-0 scale-100 text-accent-indigo"
              : "opacity-0 -rotate-90 scale-0"
          )}
        />
      </div>
    </button>
  );
};
