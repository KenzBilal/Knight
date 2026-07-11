export default function ProspectsLoading() {
  return (
    <div className="p-6 md:p-8 animate-pulse">
      <div className="h-9 w-48 bg-white/[0.04] rounded-lg mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card min-h-[480px] p-3">
            <div className="h-2.5 w-14 bg-white/[0.04] rounded mb-3" />
            <div className="space-y-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-16 bg-white/[0.03] rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
