import { motion } from 'framer-motion';
import { RefreshCw, ServerCrash } from 'lucide-react';

export function ServerDownPage() {
  function retry() {
    window.location.assign('/menu');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] px-4 py-8 text-stone-950">
      <motion.section initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="w-full max-w-md rounded-[2rem] border border-orange-100 bg-white p-7 text-center shadow-[0_24px_70px_rgba(154,52,18,0.12)] sm:p-9">
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-50 text-orange-600">
          <motion.span animate={{ rotate: 360 }} transition={{ duration: 1.7, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 rounded-3xl border-2 border-dashed border-orange-300" />
          <ServerCrash className="h-8 w-8" />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-orange-600">Restaurant ordering</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-stone-950">Server Temporarily Unavailable</h1>
        <p className="mt-3 text-sm leading-6 text-stone-500">Our server is currently unavailable. Please try again in a few moments.</p>
        <button type="button" onClick={retry} className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(249,115,22,0.24)] transition hover:bg-orange-600 active:scale-[0.98]">
          <RefreshCw className="h-4 w-4" />Retry
        </button>
      </motion.section>
    </main>
  );
}
