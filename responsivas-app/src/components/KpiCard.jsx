// src/components/KpiCard.jsx

export default function KpiCard({ title, value, icon: Icon, colorClass }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
      </div>
      <div className={`flex-shrink-0 p-3 rounded-full ${colorClass}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  );
}

// Componente para el estado de carga
export function KpiCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="animate-pulse flex items-start justify-between">
        <div>
          <div className="h-4 w-24 bg-slate-200 rounded"></div>
          <div className="h-8 w-12 bg-slate-200 rounded mt-2"></div>
        </div>
        <div className="h-12 w-12 bg-slate-200 rounded-full"></div>
      </div>
    </div>
  );
}