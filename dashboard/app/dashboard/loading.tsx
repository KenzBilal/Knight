export default function DashboardLoading() {
  return (
    <div className="p-6 md:p-8 animate-pulse">
      {/* Period + date */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-56 bg-ink-800 rounded-lg" />
        <div className="h-10 w-48 bg-ink-800 rounded-lg" />
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[1,2,3,4].map((i) => (
          <div key={i} className="dash-card p-5 h-28">
            <div className="h-2.5 w-20 bg-ink-800 rounded mb-4" />
            <div className="h-8 w-16 bg-ink-800 rounded" />
          </div>
        ))}
      </div>
      {/* Chart + side */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-4 mb-6">
        <div className="dash-card p-6 h-64" />
        <div className="flex flex-col gap-4">
          <div className="dash-card p-5 h-40" />
          <div className="dash-card p-5 h-36" />
        </div>
      </div>
      {/* Table */}
      <div className="dash-card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <div className="h-4 w-32 bg-ink-800 rounded" />
        </div>
        {[1,2,3,4].map((i) => (
          <div key={i} className="flex items-center gap-6 px-6 py-4 border-b border-white/[0.04]">
            <div className="h-3 w-20 bg-ink-800 rounded" />
            <div className="h-3 w-32 bg-ink-800 rounded" />
            <div className="h-5 w-16 bg-ink-800 rounded-full" />
            <div className="h-3 w-12 bg-ink-800 rounded ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
