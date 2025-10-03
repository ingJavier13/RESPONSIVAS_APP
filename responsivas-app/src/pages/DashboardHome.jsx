// src/pages/DashboardHome.jsx

import { useEffect, useState } from 'react';
import KpiCard, { KpiCardSkeleton } from '../components/KpiCard';
import { DocumentDuplicateIcon, ExclamationCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function DashboardHome() {
  const [stats, setStats] = useState({ total: 0, faltantes: 0 });
  const [reciente, setReciente] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        setLoading(true);
        // Hacemos las dos peticiones a la API en paralelo
        const [statsRes, recienteRes] = await Promise.all([
          fetch('http://localhost:3001/api/responsivas/kpis/stats'),
          fetch('http://localhost:3001/api/responsivas/kpis/reciente')
        ]);

        const statsData = await statsRes.json();
        const recienteData = await recienteRes.json();
        
        setStats(statsData);
        setReciente(recienteData);
      } catch (error) {
        console.error("Error al cargar los KPIs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchKpis();
  }, []);

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return 'N/A';
    const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(fechaISO).toLocaleDateString('es-MX', opciones);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCardSkeleton />
        <KpiCardSkeleton />
        <KpiCardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Sección de KPIs numéricos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard 
          title="Total de Responsivas" 
          value={stats.total} 
          icon={DocumentDuplicateIcon}
          colorClass="bg-blue-500" 
        />
        <KpiCard 
          title="Faltantes de Firma" 
          value={stats.faltantes} 
          icon={ExclamationCircleIcon}
          colorClass="bg-red-500"
        />
        {/* Aquí podrías agregar un tercer KPI numérico si quieres */}
      </div>

      {/* Sección de Última Actividad */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Última Actividad</h3>
        {reciente && reciente.id ? (
          <div className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-slate-100 rounded-full">
                <ClockIcon className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{reciente.responsable}</p>
                <p className="text-sm text-slate-500">Recibió {reciente.tipo_equipo} {reciente.marca}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-600">{formatearFecha(reciente.fecha)}</p>
          </div>
        ) : (
          <p className="text-slate-500">No hay actividad reciente registrada.</p>
        )}
      </div>
    </div>
  );
}