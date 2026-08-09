export default function SkeletonCard() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-40 bg-border" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-border rounded w-2/3" />
        <div className="h-3 bg-border rounded w-1/3" />
        <div className="h-3 bg-border rounded w-full" />
      </div>
    </div>
  );
}
