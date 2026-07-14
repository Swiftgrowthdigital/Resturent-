import { motion } from 'framer-motion';
import { Clock3, MapPin } from 'lucide-react';

export function Header({ restaurantName, address, status = 'Open Now' }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="sticky top-0 z-40 border-b border-stone-200/70 bg-white/90 backdrop-blur-xl"
    >
      <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-white shadow-[0_10px_24px_rgba(249,115,22,0.26)] ring-1 ring-orange-100">
          <img src="/icon-192.png" alt={`${restaurantName} logo`} className="h-full w-full object-cover" width="48" height="48" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="truncate text-base font-bold leading-tight text-stone-950">{restaurantName}</h1>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
              <Clock3 className="h-3 w-3" />
              {status}
            </span>
          </div>
          <p className="mt-1 flex min-w-0 items-center gap-1 truncate text-xs font-normal text-stone-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-orange-500" />
            {address}
          </p>
        </div>
      </div>
    </motion.header>
  );
}
