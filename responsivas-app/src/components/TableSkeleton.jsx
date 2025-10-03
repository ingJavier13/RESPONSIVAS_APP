// src/components/TableSkeleton.jsx

export default function TableSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Skeleton Header */}
      <div className="h-12 bg-slate-200 rounded-t-lg"></div>
      {/* Skeleton Rows */}
      <div className="space-y-2 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-slate-200 rounded"></div>
        ))}
      </div>
    </div>
  )
}