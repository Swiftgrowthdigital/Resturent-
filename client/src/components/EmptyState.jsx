import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './Button';

export function EmptyState({ title, description, action, icon: Icon = Sparkles }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="premium-card mx-auto max-w-2xl overflow-hidden p-8 text-center"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500/20 to-white/5">
        <Icon className="h-7 w-7 text-brand-300" />
      </div>
      <h3 className="mt-5 text-2xl font-extrabold text-white">{title}</h3>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
      {!action ? (
        <div className="mt-6">
          <Button as={Link} to="/menu" variant="secondary" rightIcon={ArrowRight}>
            Back to Menu
          </Button>
        </div>
      ) : null}
    </motion.div>
  );
}
