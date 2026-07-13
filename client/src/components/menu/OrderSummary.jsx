import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ChevronDown, CircleAlert, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatCurrency } from '../../lib/order';
import { useOrderSelection } from '../../context/OrderSelectionContext';
import { QuantitySelector } from './QuantitySelector';

export function OrderSummary({
  selectedItems,
  subtotal,
  currencySymbol,
  seatNumber,
  seatStatus,
  availableSeats,
  onSeatNumberChange,
  onPlaceOrder,
  submitting
}) {
  const { increaseItem, decreaseItem } = useOrderSelection();
  const hasItems = selectedItems.length > 0;
  const [expanded, setExpanded] = useState(false);
  const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const canPlaceOrder = hasItems && seatStatus === 'valid' && !submitting;

  useEffect(() => {
    if (!hasItems) setExpanded(false);
  }, [hasItems]);

  return (
    <>
      <AnimatePresence>
        {expanded ? (
          <motion.button
            type="button"
            aria-label="Close selected items"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpanded(false)}
            className="fixed inset-0 z-40 cursor-default bg-stone-950/20 backdrop-blur-[2px]"
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {hasItems ? (
          <motion.aside
            initial={{ y: 112, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 112, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[82svh] rounded-t-[24px] border-t border-white/15 bg-[linear-gradient(135deg,rgba(28,25,23,0.96),rgba(12,10,9,0.94))] px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-1 text-white shadow-[0_-18px_60px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
          >
            <div className="mx-auto max-w-3xl">
              <button
                type="button"
                onClick={() => setExpanded((current) => !current)}
                aria-expanded={expanded}
                className="flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl px-1 py-1 text-left"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <ShoppingCart className="h-5 w-5 shrink-0 text-orange-300" />
                  <span>
                    <span className="block text-sm font-bold">{totalQuantity} Item{totalQuantity === 1 ? '' : 's'}</span>
                    <span className="block text-sm font-medium text-white/65">{formatCurrency(subtotal, currencySymbol)} Total</span>
                  </span>
                </span>
                <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex h-10 w-10 items-center justify-center text-white">
                  <ChevronDown className="h-5 w-5" />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {expanded ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0, y: 10 }}
                    animate={{ height: 'auto', opacity: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, y: 10 }}
                    transition={{ duration: 0.24, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="max-h-[calc(82svh-68px)] overflow-y-auto overscroll-contain pb-1 pr-1">
                      <div className="border-t border-white/10 pt-3">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">Selected Items</p>
                        <div className="mt-3 space-y-2">
                          {selectedItems.map((item) => (
                            <article key={item.foodId} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-2.5 shadow-[0_8px_22px_rgba(0,0,0,0.12)]">
                              <img src={item.image} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-white">{item.name}</p>
                                <p className="mt-1 text-xs font-medium text-white/55">{item.quantity} × {formatCurrency(item.price, currencySymbol)}</p>
                                <div className="mt-2">
                                  <QuantitySelector value={item.quantity} onDecrease={() => decreaseItem(item.foodId)} onIncrease={() => increaseItem(item.foodId)} />
                                </div>
                              </div>
                              <p className="shrink-0 text-sm font-bold text-white">{formatCurrency(item.price * item.quantity, currencySymbol)}</p>
                            </article>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-base font-bold text-white">
                        <div className="flex items-center justify-between"><span>Total</span><span>{formatCurrency(subtotal, currencySymbol)}</span></div>
                      </div>

                      <div className="mt-3">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-sm font-bold text-white">Seat Number <span className="text-orange-300">*</span></p>
                          {seatStatus === 'valid' ? <span className="flex items-center gap-1 text-xs font-semibold text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" /> Available</span> : null}
                        </div>
                        <div className={`rounded-2xl border p-1 transition ${seatStatus === 'valid' ? 'border-emerald-400/80 bg-emerald-400/10' : 'border-white/12 bg-white/[0.06]'}`}>
                          <select value={seatNumber} onChange={(event) => onSeatNumberChange(event.target.value)} className="h-12 w-full appearance-none rounded-xl bg-transparent px-3 text-base font-semibold text-white outline-none" aria-label="Seat number">
                            <option value="" className="bg-stone-900">Select Seat Number</option>
                            {availableSeats.map((seat) => <option key={seat} value={String(seat)} className="bg-stone-900">{seat}</option>)}
                          </select>
                        </div>
                        {!availableSeats.length ? <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-300"><CircleAlert className="h-3.5 w-3.5" /> No seats available</p> : null}
                      </div>

                      <div className="sticky bottom-0 mt-3 bg-stone-950/95 pb-1 pt-1 backdrop-blur-xl">
                        <motion.button whileTap={canPlaceOrder ? { scale: 0.98 } : undefined} onClick={onPlaceOrder} disabled={!canPlaceOrder} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 text-base font-bold text-white shadow-[0_14px_30px_rgba(249,115,22,0.32)] transition disabled:from-stone-700 disabled:to-stone-700 disabled:text-white/40 disabled:shadow-none">
                          {submitting ? 'Placing Order...' : 'Place Order'}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}
