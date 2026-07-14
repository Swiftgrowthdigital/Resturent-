import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { CategoryTabs } from '../components/menu/CategoryTabs';
import { EmptyState } from '../components/menu/EmptyState';
import { FoodCard } from '../components/menu/FoodCard';
import { Header } from '../components/menu/Header';
import { LoadingSkeleton } from '../components/menu/LoadingSkeleton';
import { OrderSummary } from '../components/menu/OrderSummary';
import { useMenu } from '../context/MenuContext';
import { useOrderSelection } from '../context/OrderSelectionContext';
import { toArray } from '../lib/arrays';
import { createClientOrderId } from '../lib/order';
import { placeMenuOrder } from '../services/menuService';

export function MenuPage() {
  const navigate = useNavigate();
  const { categories, foods, settings, restaurantName, availableSeats, loading, error, refresh } = useMenu();
  const [activeCategory, setActiveCategory] = useState('all');
  const deferredQuery = useDeferredValue('');
  const [seatNumber, setSeatNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const { quantities, clearSelection } = useOrderSelection();

  const safeCategories = toArray(categories);
  const safeFoods = toArray(foods);
  const safeAvailableSeats = toArray(availableSeats);
  const currencySymbol = settings?.currency || '';
  const seatStatus = !seatNumber ? 'idle' : safeAvailableSeats.some((seat) => String(seat) === seatNumber) ? 'valid' : 'invalid';

  const visibleFoods = useMemo(() => {
    const searchValue = deferredQuery.trim().toLowerCase();
    return safeFoods.filter((food) => {
      const categoryMatch = activeCategory === 'all' || food?.category?._id === activeCategory;
      const searchMatch = !searchValue || [food?.name, food?.description, food?.category?.name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchValue));
      return categoryMatch && searchMatch;
    });
  }, [activeCategory, deferredQuery, safeFoods]);

  const selectedItems = useMemo(
    () =>
      safeFoods
        .map((food) => {
          const quantity = Number(quantities[food._id] || 0);
          return quantity > 0
            ? {
                foodId: food._id,
                name: food.name,
                price: food.price,
                image: food.image,
                quantity
              }
            : null;
        })
        .filter(Boolean),
    [quantities, safeFoods]
  );

  const subtotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0),
    [selectedItems]
  );

  if (loading) return <LoadingSkeleton />;

  async function placeOrder() {
    if (seatStatus !== 'valid') {
      toast.error('Please select a seat number');
      return;
    }
    if (!selectedItems.length) {
      toast.error('Select at least one item');
      return;
    }

    setSubmitting(true);
    try {
      const response = await placeMenuOrder({
        clientOrderId: createClientOrderId(),
        seatNumber: seatNumber.trim(),
        items: selectedItems.map((item) => ({
          foodId: item.foodId,
          quantity: item.quantity
        }))
      });

      setSuccessOrder({ ...response.order, ...response });
      clearSelection();
      setSeatNumber('');
      toast.success('Order placed successfully');
      navigate('/order-success', { state: { order: response.order } });
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || requestError.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.24 }}
      className="min-h-screen bg-[#faf7f2] pb-32 text-stone-950"
    >
      <Header
        restaurantName={restaurantName}
        address={settings?.address || 'Dine-in ordering'}
        status={settings?.isOpen === false ? 'Closed' : 'Open Now'}
      />

      <CategoryTabs categories={safeCategories} activeCategory={activeCategory} onChange={setActiveCategory} />

      <main className="mx-auto max-w-3xl px-4 pb-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold leading-tight text-stone-950">Menu</h2>
            <p className="mt-1 text-sm font-normal text-stone-500">
              {visibleFoods.length} item{visibleFoods.length === 1 ? '' : 's'} available
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-white px-3 py-2 text-xs font-semibold text-stone-500 shadow-sm">
            Fresh today
          </span>
        </div>

        {error ? (
          <EmptyState title="No food available" description={error} onRetry={refresh} />
        ) : safeFoods.length === 0 ? (
          <EmptyState onRetry={refresh} />
        ) : visibleFoods.length === 0 ? (
          <EmptyState title="No food in this category" description="Choose another category to continue." />
        ) : (
          <div className="space-y-4">
            {visibleFoods.map((food, index) => (
              <FoodCard
                key={food._id}
                food={food}
                currencySymbol={currencySymbol}
                index={index}
              />
            ))}
          </div>
        )}
      </main>

      {!error && safeFoods.length > 0 ? (
        <OrderSummary
          selectedItems={selectedItems}
          subtotal={subtotal}
          currencySymbol={currencySymbol}
          seatNumber={seatNumber}
          seatStatus={seatStatus}
          availableSeats={safeAvailableSeats}
          onSeatNumberChange={setSeatNumber}
          onPlaceOrder={placeOrder}
          submitting={submitting}
        />
      ) : null}

      <footer className="mx-auto max-w-3xl px-4 pb-4 text-center text-xs text-stone-400">
        <div className="border-t border-stone-200 pt-5">
          <p className="font-semibold text-stone-500">{restaurantName}</p>
          <p>Designed &amp; Developed by</p>
          <a className="mt-1 inline-block font-semibold text-stone-500 transition hover:text-stone-900" href="https://swiftgrowthdigital.com" target="_blank" rel="noreferrer">SwiftGrowthDigital.com</a>
        </div>
      </footer>

      <AnimatePresence>
        {successOrder ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-950/70 px-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.94, y: 18 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 18 }}
              className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-[0_24px_70px_rgba(0,0,0,0.28)]"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h2 className="mt-5 text-2xl font-bold text-stone-950">Order Placed Successfully</h2>
              <p className="mt-2 text-sm font-normal leading-6 text-stone-500">
                Your order has been sent to the kitchen.
              </p>
              <p className="mt-4 rounded-2xl bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-700">
                {successOrder.orderNumber}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-left">
                <div className="rounded-2xl bg-stone-50 p-3">
                  <p className="text-xs font-medium text-stone-500">Seat Number</p>
                  <p className="mt-1 text-base font-bold text-stone-900">{successOrder.seatNumber}</p>
                </div>
                <div className="rounded-2xl bg-stone-50 p-3">
                  <p className="text-xs font-medium text-stone-500">Preparation</p>
                  <p className="mt-1 text-base font-bold text-stone-900">20–25 min</p>
                </div>
              </div>
              <Button className="mt-5 w-full" onClick={() => setSuccessOrder(null)}>
                Return to menu
              </Button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
