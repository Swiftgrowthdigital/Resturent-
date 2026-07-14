import { motion } from 'framer-motion';
import { Coffee, Flame, Pizza, Sandwich, Sparkles, Star, UtensilsCrossed } from 'lucide-react';

const ICONS = {
  all: Star,
  pizza: Pizza,
  burger: Sandwich,
  pasta: UtensilsCrossed,
  'french fries': Sparkles,
  maggi: Flame,
  softy: Coffee
};

export function CategoryTabs({ categories, activeCategory, onChange }) {
  const tabs = [{ _id: 'all', name: 'All' }, ...categories];

  return (
    <div className="bg-[#faf7f2] px-4 pb-4">
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
        {tabs.map((category, index) => {
          const active = activeCategory === category._id;
          const Icon = iconFor(category.name);
          return (
            <motion.button
              key={category._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.025 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onChange(category._id)}
              className={`flex min-w-[84px] flex-col items-center gap-2 rounded-3xl border px-3 py-3 transition ${
                active
                  ? 'border-orange-500 bg-orange-500 text-white shadow-[0_14px_30px_rgba(249,115,22,0.24)]'
                  : 'border-stone-200 bg-white text-stone-700 shadow-[0_8px_18px_rgba(28,25,23,0.06)]'
              }`}
            >
              <span className={`flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl ${active ? 'bg-white/16' : 'bg-stone-50'}`}>
                {category.image ? <img src={category.image} alt="" className="h-full w-full object-cover" /> : <Icon className="h-5 w-5" />}
              </span>
              <span className="max-w-[74px] truncate text-sm font-semibold">{category.name}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function iconFor(name) {
  return ICONS[String(name || '').toLowerCase()] || UtensilsCrossed;
}
