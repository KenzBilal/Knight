export default function GenericLoading() {
  return (
    <div className="p-6 md:p-8 animate-pulse">
      <div className="h-4 w-32 bg-ink-800 rounded mb-6" />
      <div className="dash-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06] flex justify-between">
          <div className="h-3 w-20 bg-ink-800 rounded" />
          <div className="h-3 w-16 bg-ink-800 rounded" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.04] last:border-0">
            <div className="w-8 h-8 bg-ink-800 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-40 bg-ink-800 rounded" />
              <div className="h-2.5 w-24 bg-ink-700 rounded" />
            </div>
            <div className="h-5 w-16 bg-ink-800 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
