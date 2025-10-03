// src/pages/DashboardHome.jsx

import { useEffect, useState } from 'react';
import KpiCard, { KpiCardSkeleton } from '../components/KpiCard';
import { DocumentDuplicateIcon, ExclamationCircleIcon, ClockIcon, KeyIcon } from '@heroicons/react/24/outline';

export default function DashboardHome() {
  const [stats, setStats] = useState({ total: 0, faltantes: 0 });
  const [recienteResponsiva, setRecienteResponsiva] = useState(null);
  const [recientePassword, setRecientePassword] = useState(null); // 1. Nuevo estado
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        setLoading(true);
        // 2. Añadimos la nueva petición al Promise.all
        const [statsRes, recienteResponsivaRes, recientePasswordRes] = await Promise.all([
          fetch('http://localhost:3001/api/responsivas/kpis/stats'),
          fetch('http://localhost:3001/api/responsivas/kpis/reciente'),
          fetch('http://localhost:3001/api/passwords/kpis/reciente')
        ]);

        const statsData = await statsRes.json();
        const recienteResponsivaData = await recienteResponsivaRes.json();
        const recientePasswordData = await recientePasswordRes.json();
        
        setStats(statsData);
        setRecienteResponsiva(recienteResponsivaData);
        setRecientePassword(recientePasswordData); // Guardamos el nuevo dato
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
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <KpiCardSkeleton />
          <KpiCardSkeleton />
          <KpiCardSkeleton />
        </div>
        {/* Skeleton para las tarjetas de actividad reciente */}
        <div className="bg-white p-6 rounded-lg shadow-sm h-24 animate-pulse"></div>
        <div className="bg-white p-6 rounded-lg shadow-sm h-24 animate-pulse"></div>
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
      </div>

      {/* Sección de Actividad Reciente */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Actividad Reciente</h3>
        <div className="space-y-4">
          {/* Tarjeta de Última Responsiva */}
          {recienteResponsiva && recienteResponsiva.id ? (
            <div className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-slate-100 rounded-full"><ClockIcon className="h-6 w-6 text-slate-600" /></div>
                <div>
                  <p className="font-semibold text-slate-800">{recienteResponsiva.responsable}</p>
                  <p className="text-sm text-slate-500">Recibió {recienteResponsiva.tipo_equipo} {recienteResponsiva.marca}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600">{formatearFecha(recienteResponsiva.fecha)}</p>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No hay actividad de responsivas registrada.</p>
          )}

          {/* Nueva tarjeta de Última Contraseña */}
          {recientePassword && recientePassword.id ? (
            <div className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-slate-100 rounded-full"><KeyIcon className="h-6 w-6 text-slate-600" /></div>
                <div>
                  <p className="font-semibold text-slate-800">{recientePassword.servicio_o_usuario}</p>
                  <p className="text-sm text-slate-500">Se añadió nueva contraseña en categoría "{recientePassword.categoria}"</p>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600">{formatearFecha(recientePassword.created_at)}</p>
            </div>
          ) : (
             <p className="text-slate-500 text-sm">No hay contraseñas recientes registradas.</p>
          )}
        </div>
      </div>
    </div>
  );
}