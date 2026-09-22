import * as React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const variants: Record<Variant, string> = {
  // Principal — verde lima con relieve y elevación al hover.
  primary:
    'bg-brand-500 text-neutral-950 shadow-btn-brand hover:bg-brand-400 hover:shadow-btn-brand-hover hover:-translate-y-0.5 active:translate-y-0 active:bg-brand-600',
  // Secundario — negro/blanco con sombra sutil.
  secondary:
    'bg-neutral-900 text-white shadow-btn hover:bg-neutral-800 hover:-translate-y-0.5 active:translate-y-0 dark:bg-white dark:text-neutral-950 dark:hover:bg-white/90',
  ghost: 'bg-transparent hover:bg-muted text-foreground',
  outline: 'border border-border bg-card/60 text-foreground shadow-sm hover:bg-muted hover:-translate-y-0.5 active:translate-y-0',
  danger: 'bg-red-600 text-white shadow-btn hover:bg-red-700 hover:-translate-y-0.5 active:translate-y-0',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-[15px]',
  lg: 'h-[3.25rem] px-8 text-base',
  icon: 'h-10 w-10',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[var(--btn-radius,9999px)] font-medium',
        'transition-all duration-300 ease-premium',
        'disabled:opacity-50 disabled:pointer-events-none select-none',
        'active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
