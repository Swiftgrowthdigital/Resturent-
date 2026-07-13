import { Search } from 'lucide-react';

export function SearchBar({ value, onChange }) {
  return (
    <div className="sticky top-[73px] z-30 bg-[#faf7f2]/95 px-4 py-3 backdrop-blur-xl">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search food..."
          className="h-14 w-full rounded-[18px] border border-stone-200 bg-white pl-12 pr-4 text-base font-normal text-stone-950 shadow-[0_10px_24px_rgba(28,25,23,0.06)] outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
          type="search"
        />
      </label>
    </div>
  );
}
