import { ChevronLeft, ChevronRight } from 'lucide-react';
import { memo, useMemo } from 'react';

function getPageItems(currentPage, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  if (currentPage <= 3) [2, 3, 4, 5].forEach((page) => pages.add(page));
  if (currentPage >= totalPages - 2) [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1].forEach((page) => pages.add(page));

  const sorted = [...pages].filter((page) => page > 0 && page <= totalPages).sort((a, b) => a - b);
  return sorted.reduce((items, page, index) => {
    if (index && page - sorted[index - 1] > 1) items.push(`ellipsis-${page}`);
    items.push(page);
    return items;
  }, []);
}

export const Pagination = memo(function Pagination({ currentPage, totalPages, totalItems, pageSize, onPageChange }) {
  const safePage = Math.min(Math.max(currentPage, 1), Math.max(totalPages, 1));
  const start = totalItems ? (safePage - 1) * pageSize + 1 : 0;
  const end = Math.min(safePage * pageSize, totalItems);
  const pageItems = useMemo(() => getPageItems(safePage, totalPages), [safePage, totalPages]);

  if (totalItems === 0) return null;

  const buttonClass = 'focus-ring inline-flex h-9 min-w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold text-slate-300 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.09] hover:text-white disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <nav className="flex flex-col gap-3 border-t border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5" aria-label="Pagination">
      <p className="text-xs font-medium text-slate-400" aria-live="polite">Showing {start}–{end} of {totalItems} items</p>
      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <button type="button" className={buttonClass} onClick={() => onPageChange(safePage - 1)} disabled={safePage === 1} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" /><span>Previous</span>
        </button>
        <div className="hidden items-center gap-1 sm:flex">
          {pageItems.map((item) => typeof item === 'string' ? <span key={item} className="w-5 text-center text-slate-500" aria-hidden="true">…</span> : <button key={item} type="button" onClick={() => onPageChange(item)} aria-label={`Page ${item}`} aria-current={item === safePage ? 'page' : undefined} className={`${buttonClass} px-2.5 ${item === safePage ? 'border-orange-400 bg-orange-500 text-white shadow-[0_8px_24px_rgba(249,115,22,0.28)] hover:bg-orange-400 hover:text-white' : ''}`}>{item}</button>)}
        </div>
        <span className="min-w-12 text-center text-sm font-bold text-white sm:hidden">{safePage} / {totalPages}</span>
        <button type="button" className={buttonClass} onClick={() => onPageChange(safePage + 1)} disabled={safePage === totalPages} aria-label="Next page">
          <span>Next</span><ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
});
