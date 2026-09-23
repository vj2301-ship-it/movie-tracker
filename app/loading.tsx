export default function Loading() {
  return (
    <div className="space-y-8" aria-busy>
      <div className="h-40 animate-pulse rounded-2xl bg-panel" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="aspect-[2/3] animate-pulse rounded-xl bg-panel" />
        ))}
      </div>
    </div>
  );
}
