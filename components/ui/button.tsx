import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-gradient-to-r from-accent-indigo to-accent-blue text-white hover:opacity-90 border border-white/10 shadow-glow-sm font-semibold',
      secondary: 'bg-ink/5 text-ink hover:bg-ink/10 border border-ink/10 shadow-sm',
      outline: 'border-2 border-ink/20 bg-transparent hover:bg-ink/5 text-ink font-semibold',
      ghost: 'hover:bg-ink/10 text-ink-light hover:text-ink font-medium',
      destructive: 'bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30 font-medium',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-11 px-5 py-2 text-sm',
      lg: 'h-14 px-8 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-indigo focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
