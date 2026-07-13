import { motion } from 'framer-motion';

export function LoadingScreen({ label = 'Loading...', variant = 'menu' }) {
  const skeletons =
    variant === 'dashboard'
      ? Array.from({ length: 6 })
      : variant === 'cart'
        ? Array.from({ length: 3 })
        : Array.from({ length: 8 });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="skeleton mb-3 h-4 w-24 rounded-full" />
          <div className="skeleton h-7 w-64 rounded-2xl" />
        </div>
        <div className="skeleton h-10 w-28 rounded-2xl" />
      </div>
      <div className={variant === 'dashboard' ? 'grid gap-4 xl:grid-cols-3' : 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3'}>
        {skeletons.map((_, index) => (
          <div key={index} className="premium-card overflow-hidden p-4">
            <div className="skeleton aspect-[4/3] rounded-[24px]" />
            <div className="mt-4 space-y-3">
              <div className="skeleton h-4 w-2/3 rounded-full" />
              <div className="skeleton h-3 w-full rounded-full" />
              <div className="skeleton h-3 w-5/6 rounded-full" />
              <div className="skeleton h-10 w-full rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm text-slate-500">{label}</p>
    </motion.div>
  );
}
