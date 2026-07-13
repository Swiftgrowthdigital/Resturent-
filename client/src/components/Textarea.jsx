export function Textarea({ className = '', label, error, hint, ...props }) {
  return (
    <label className="block">
      {label ? <span className="mb-2 block text-sm font-semibold text-slate-200">{label}</span> : null}
      <textarea
        className={`min-h-[110px] w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 ${className}`}
        {...props}
      />
      {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
      {error ? <span className="mt-1 block text-xs font-medium text-rose-300">{error}</span> : null}
    </label>
  );
}
