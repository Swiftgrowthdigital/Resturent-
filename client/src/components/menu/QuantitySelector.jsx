import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';

export function QuantitySelector({ value, onDecrease, onIncrease, disabled = false }) {
  return (
    <div className="flex h-12 items-center gap-2 rounded-2xl bg-stone-50 p-1">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onDecrease}
        disabled={disabled || value <= 0}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-stone-600 shadow-sm transition disabled:bg-stone-100 disabled:text-stone-300"
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </motion.button>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="block min-w-7 text-center text-base font-bold text-stone-950"
        >
          {value}
        </motion.span>
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onIncrease}
        disabled={disabled}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-[0_8px_18px_rgba(249,115,22,0.28)] transition hover:scale-[1.02] disabled:bg-stone-300 disabled:shadow-none"
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </motion.button>
    </div>
  );
}
