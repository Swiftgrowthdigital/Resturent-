import { motion } from 'framer-motion';
import { CheckCircle2, Clock3, Hash, MessageCircle, ShoppingBag, Table2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getSocket } from '../lib/socket';
import { SectionHeader } from '../components/SectionHeader';
import { StatusPill } from '../components/StatusPill';
import { Button } from '../components/Button';
import { useMenu } from '../context/MenuContext';

export function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(location.state?.order || readStoredOrder());
  const { restaurantName } = useMenu();

  useEffect(() => {
    if (!order) return;
    const socket = getSocket();
    socket.connect();
    socket.on(`order:${order.orderNumber}`, (updated) => {
      setOrder(updated);
      localStorage.setItem('restaurant_last_order', JSON.stringify(updated));
    });
    return () => {
      socket.off(`order:${order.orderNumber}`);
    };
  }, [order]);

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl">
        <SectionHeader
          eyebrow="Order Success"
          title="No order to show"
          description="Place an order from the cart to see its confirmation here."
        />
        <Button onClick={() => navigate('/menu')} leftIcon={ShoppingBag}>
          Back to menu
        </Button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl">
      <div className="premium-card overflow-hidden p-5 sm:p-6 lg:p-8">
        <div className="relative flex flex-col items-center gap-5 text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.8, 1.08, 1] }}
            transition={{ duration: 0.6, times: [0, 0.7, 1] }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25"
          >
            <CheckCircle2 className="h-10 w-10 text-white" />
          </motion.div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-300">Order placed successfully</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">
              Your order is on the way to the kitchen.
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              {restaurantName} has received your request in real time. You can monitor status updates instantly.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Metric label="Order number" value={order.orderNumber} icon={Hash} />
          <Metric
            label="WhatsApp Support"
            value="+91 91285 96738"
            helperText="Tap to Chat"
            icon={MessageCircle}
            iconClassName="text-green-500"
            href="https://wa.me/919128596738"
          />
          <Metric label="Seat number" value={order.seatNumber || 'Not set'} icon={Table2} />
          <Metric label="Status" value={<StatusPill status={order.status} />} icon={CheckCircle2} />
          <Metric
            label="Estimated time"
            value={estimateTime(order.status)}
            icon={Clock3}
          />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => navigate('/menu')} leftIcon={ShoppingBag}>
            Back to menu
          </Button>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Refresh status
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function Metric({ label, value, helperText, icon: Icon, iconClassName = 'text-brand-300', href }) {
  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">{label}</p>
        <Icon className={`h-4 w-4 ${iconClassName}`} />
      </div>
      <div className="mt-3 text-sm font-semibold text-white">{value}</div>
      {helperText ? <p className="mt-1 text-xs text-slate-400">{helperText}</p> : null}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="block rounded-[24px] border border-white/10 bg-white/[0.04] p-4"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
      {content}
    </div>
  );
}

function estimateTime(status) {
  if (status === 'Completed') return 'Ready';
  if (status === 'Preparing') return '5 - 10 min';
  return '10 - 15 min';
}

function readStoredOrder() {
  try {
    return JSON.parse(localStorage.getItem('restaurant_last_order') || 'null');
  } catch {
    return null;
  }
}
