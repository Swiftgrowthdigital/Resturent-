import { CheckCircle2, Flame, Leaf, ShieldAlert, Sparkles } from 'lucide-react';

export function Badge({ children, tone = 'slate' }) {
  const tones = {
    slate: {
      className: 'border-white/10 bg-white/[0.05] text-slate-200',
      icon: Sparkles
    },
    orange: {
      className: 'border-orange-400/20 bg-orange-500/10 text-orange-100',
      icon: Flame
    },
    emerald: {
      className: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100',
      icon: CheckCircle2
    },
    rose: {
      className: 'border-rose-400/20 bg-rose-500/10 text-rose-100',
      icon: ShieldAlert
    },
    green: {
      className: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100',
      icon: Leaf
    }
  };

  const config = tones[tone] || tones.slate;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${config.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}
