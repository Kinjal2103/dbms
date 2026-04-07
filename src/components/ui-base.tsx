import React from 'react';
import { cn } from '@/src/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'recessed' | 'glass';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl transition-all duration-300',
          variant === 'default' && 'bg-surface-lowest shadow-ambient',
          variant === 'recessed' && 'bg-surface-container',
          variant === 'glass' && 'glass-effect border border-white/20',
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'white';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-display font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
          variant === 'primary' && 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-container hover:scale-[1.02]',
          variant === 'secondary' && 'bg-surface-container text-on-surface hover:bg-outline-variant/20',
          variant === 'ghost' && 'text-primary hover:bg-primary/5',
          variant === 'white' && 'bg-white text-primary shadow-md hover:bg-primary hover:text-white',
          size === 'sm' && 'px-4 py-2 text-xs',
          size === 'md' && 'px-6 py-3 text-sm',
          size === 'lg' && 'px-8 py-4 text-base',
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-12 w-full rounded-xl bg-surface-container px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-on-surface-variant/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:bg-surface-lowest transition-all',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
