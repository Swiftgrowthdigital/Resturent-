import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency } from '../../lib/order';
import { useOrderSelection } from '../../context/OrderSelectionContext';
import { QuantitySelector } from './QuantitySelector';

export function FoodCard({ food, currencySymbol, index }) {
  const { quantities, increaseItem, decreaseItem } = useOrderSelection();
  const quantity = Number(quantities[food._id] || 0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.025, duration: 0.24 }}
      className="grid grid-cols-[104px_1fr] gap-3 rounded-3xl border border-stone-100 bg-white p-3 shadow-[0_12px_30px_rgba(28,25,23,0.08)] min-[390px]:grid-cols-[120px_1fr]"
    >
      <div className="relative h-[120px] overflow-hidden rounded-2xl min-[390px]:h-[132px]">
        {food.image && !imageFailed ? <>
          {!imageLoaded ? <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-orange-50 via-stone-100 to-orange-100" aria-hidden="true" /> : null}
          <img src={food.image} alt={food.name} className={`h-full w-full object-cover transition duration-300 ${imageLoaded ? 'scale-100 opacity-100' : 'scale-105 opacity-0'}`} loading="lazy" decoding="async" onLoad={() => setImageLoaded(true)} onError={() => setImageFailed(true)} />
        </> : <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-50 to-stone-100 text-xs font-semibold text-stone-400" aria-label={`${food.name} image unavailable`}>No image</div>}
        <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-lg border-2 border-white bg-white shadow-sm">
          <span className={`h-3 w-3 rounded-full ${food.veg ? 'bg-emerald-500' : 'bg-red-500'}`} />
        </span>
      </div>

      <div className="flex min-w-0 flex-col justify-between gap-3 py-1">
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-base font-bold leading-snug text-stone-950">{food.name}</h3>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
              <Star className="h-3 w-3 fill-current" />
              {food.rating || '4.5'}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm font-normal leading-5 text-stone-500">{food.description}</p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="block text-base font-bold text-orange-600">
              {formatCurrency(food.price, currencySymbol)}
            </span>
            <span className="mt-1 inline-flex items-center rounded-full bg-stone-50 px-2 py-1 text-[11px] font-semibold text-stone-500">
              {food.veg ? 'Veg' : 'Non Veg'}
            </span>
          </div>
          <QuantitySelector value={quantity} onDecrease={() => decreaseItem(food._id)} onIncrease={() => increaseItem(food._id)} disabled={food.outOfStock} />
        </div>
      </div>
    </motion.article>
  );
}
