import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export const Button = forwardRef(function Button(
  {
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    as: Component = 'button',
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    loading = false,
    ...props
  },
  ref
) {
  const styles = {
    primary:
      'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-[0_18px_40px_rgba(249,115,22,0.28)] hover:brightness-110 active:scale-[0.98]',
    secondary:
      'border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08] active:scale-[0.98]',
    ghost: 'border border-transparent bg-transparent text-slate-300 hover:bg-white/[0.05] hover:text-white'
  };

  const sizes = {
    sm: 'h-10 px-3 text-sm',
    md: 'h-11 px-4 text-sm',
    lg: 'h-12 px-5 text-base'
  };

  const disabled = loading || props.disabled;

  return (
    <Component
      ref={ref}
      className={[
        'focus-ring inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-200',
        styles[variant],
        sizes[size],
        disabled ? 'cursor-not-allowed opacity-60' : '',
        className
      ].join(' ')}
      aria-busy={loading || undefined}
      disabled={Component === 'button' ? disabled : undefined}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : LeftIcon ? <LeftIcon className="h-4 w-4" /> : null}
      <span>{children}</span>
      {RightIcon && !loading ? <RightIcon className="h-4 w-4" /> : null}
    </Component>
  );
});
