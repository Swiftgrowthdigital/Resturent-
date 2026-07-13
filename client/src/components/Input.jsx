import { Search } from 'lucide-react';

export function Input({
  className = '',
  label,
  error,
  hint,
  leftIcon: LeftIcon,
  rightSlot,
  inputClassName = '',
  ...props
}) {
  return (
    <label className="block">
      {label ? <span className="mb-2 block text-sm font-semibold text-slate-200">{label}</span> : null}
      <div className={`flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 transition focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-400/20 ${className}`}>
        {LeftIcon ? <LeftIcon className="h-4 w-4 shrink-0 text-slate-400" /> : props.type === 'search' ? <Search className="h-4 w-4 shrink-0 text-slate-400" /> : null}
        <input
          className={`min-w-0 w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none ${inputClassName}`}
          {...props}
        />
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>
      {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
      {error ? <span className="mt-1 block text-xs font-medium text-rose-300">{error}</span> : null}
    </label>
  );
}
