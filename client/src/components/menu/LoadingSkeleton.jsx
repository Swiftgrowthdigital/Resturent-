export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#faf7f2] pb-8">
      <div className="sticky top-0 z-40 border-b border-stone-200/70 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="h-12 w-12 rounded-2xl skeleton bg-stone-200" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-36 rounded-full skeleton bg-stone-200" />
            <div className="h-3 w-48 rounded-full skeleton bg-stone-200" />
          </div>
          <div className="h-12 w-16 rounded-2xl skeleton bg-stone-200" />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-4">
        <div className="h-14 rounded-[18px] skeleton bg-stone-200" />
      </div>

      <div className="no-scrollbar flex gap-3 overflow-hidden px-4 pb-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-24 min-w-[84px] rounded-3xl skeleton bg-stone-200" />
        ))}
      </div>

      <div className="mx-auto max-w-3xl space-y-4 px-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="grid grid-cols-[104px_1fr] gap-3 rounded-3xl bg-white p-3">
            <div className="h-[120px] rounded-2xl skeleton bg-stone-200" />
            <div className="space-y-3 py-1">
              <div className="h-5 w-4/5 rounded-full skeleton bg-stone-200" />
              <div className="h-4 w-full rounded-full skeleton bg-stone-200" />
              <div className="h-4 w-2/3 rounded-full skeleton bg-stone-200" />
              <div className="flex items-center justify-between pt-3">
                <div className="h-5 w-16 rounded-full skeleton bg-stone-200" />
                <div className="h-11 w-32 rounded-2xl skeleton bg-stone-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
