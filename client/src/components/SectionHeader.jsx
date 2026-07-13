import { motion } from 'framer-motion';

export function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.25 }}
      className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
    >
      <div>
        {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-300">{eyebrow}</p> : null}
        <h2 className="section-title mt-2">{title}</h2>
        {description ? <p className="section-subtitle mt-3">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </motion.div>
  );
}
