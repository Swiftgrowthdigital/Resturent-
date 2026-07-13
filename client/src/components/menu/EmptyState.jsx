import { motion } from 'framer-motion';
import { RefreshCw, UtensilsCrossed } from 'lucide-react';

export function EmptyState({ title = 'No food available', description = 'The menu is being updated right now.', onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 rounded-3xl border border-stone-200 bg-white px-6 py-10 text-center shadow-[0_12px_30px_rgba(28,25,23,0.08)]"
    >
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-orange-50 text-orange-500">
        <UtensilsCrossed className="h-12 w-12" />
      </div>
      <h2 className="mt-5 text-xl font-bold text-stone-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm font-normal leading-6 text-stone-500">{description}</p>
      {onRetry ? (
        <button
          onClick={onRetry}
          className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(249,115,22,0.24)] transition hover:scale-[1.02] active:scale-[0.98]"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      ) : null}
    </motion.div>
  );
}
