import { motion } from 'framer-motion';
import { ArrowLeft, Home, UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] px-4 py-8 text-stone-950">
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }} className="w-full max-w-md rounded-[2rem] border border-orange-100 bg-white p-7 text-center shadow-[0_24px_70px_rgba(154,52,18,0.12)] sm:p-9">
        <motion.div animate={{ y: [0, -7, 0], rotate: [0, -2, 2, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-[0_14px_30px_rgba(249,115,22,0.28)]">
          <UtensilsCrossed className="h-8 w-8" />
        </motion.div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-orange-600">Restaurant ordering</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-stone-950">404 - Page Not Found</h1>
        <p className="mt-3 text-sm leading-6 text-stone-500">This page is not on today’s menu. Let’s get you back to something delicious.</p>
        <div className="mt-7 grid grid-cols-2 gap-3">
          <Link to="/" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(249,115,22,0.24)] transition hover:bg-orange-600"><Home className="h-4 w-4" />Home</Link>
          <Link to="/menu" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-4 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"><ArrowLeft className="h-4 w-4" />Menu</Link>
        </div>
      </motion.section>
    </main>
  );
}
