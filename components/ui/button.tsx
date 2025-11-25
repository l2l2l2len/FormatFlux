import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-brand-yellow text-brand-black hover:bg-brand-yellow-hover border border-brand-black/10 shadow-sm font-bold',
      secondary: 'bg-white text-brand-black hover:bg-cream-100 border border-cream-200 shadow-sm',
      outline: 'border-2 border-brand-black bg-transparent hover:bg-brand-black hover:text-white text-brand-black font-semibold',
      ghost: 'hover:bg-brand-black/5 text-brand-black font-medium',
      destructive: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-medium',
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
          'inline-flex items-center justify-center rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
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