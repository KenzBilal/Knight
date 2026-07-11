export default function DashboardLoading() {
  return (
    <div className="p-6 md:p-8 max-w-5xl animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-5">
            <div className="h-2.5 w-20 bg-white/[0.04] rounded mb-4" />
            <div className="h-8 w-12 bg-white/[0.05] rounded" />
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-6">
          <div className="h-4 w-24 bg-white/[0.04] rounded mb-6" />
          <div className="space-y-3">
            <div className="h-9 bg-white/[0.03] rounded-lg" />
            <div className="h-9 bg-white/[0.03] rounded-lg" />
            <div className="h-9 bg-white/[0.04] rounded-lg" />
          </div>
        </div>
        <div className="card p-6">
          <div className="h-4 w-28 bg-white/[0.04] rounded mb-6" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between py-2 border-b border-white/[0.04]">
                <div className="h-3 w-24 bg-white/[0.04] rounded" />
                <div className="h-3 w-12 bg-white/[0.03] rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
