function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card animate-pulse">
      <div className="p-4 border-b border-white/[0.05] flex justify-between">
        <div className="h-3 w-20 bg-white/[0.04] rounded" />
        <div className="h-3 w-16 bg-white/[0.03] rounded" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-white/[0.04] last:border-0">
          <div className="w-7 h-7 bg-white/[0.04] rounded-full" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-40 bg-white/[0.04] rounded" />
            <div className="h-2.5 w-24 bg-white/[0.03] rounded" />
          </div>
          <div className="h-5 w-16 bg-white/[0.03] rounded" />
        </div>
      ))}
    </div>
  );
}

export default function GenericLoading() {
  return (
    <div className="p-6 md:p-8 animate-pulse">
      <div className="h-4 w-32 bg-white/[0.04] rounded mb-6" />
      <TableSkeleton />
    </div>
  );
}
