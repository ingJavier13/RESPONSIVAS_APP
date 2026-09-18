// src/pages/DashboardHome.jsx

import { useEffect, useState } from 'react';
import KpiCard, { KpiCardSkeleton } from '../components/KpiCard';
import { DocumentDuplicateIcon, ExclamationCircleIcon, ClockIcon, KeyIcon, ExclamationTriangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function DashboardHome() {
  const [stats, setStats] = useState({ total: 0, faltantes: 0 });
  const [licenciasStats, setLicenciasStats] = useState({ porVencer: 0, vencidas: 0, total: 0, activas: 0, activasPorProveedor: [], proximaVencerItem: null, vencidaItem: null });
  const [recienteResponsiva, setRecienteResponsiva] = useState(null);
  const [recientePassword, setRecientePassword] = useState(null); // 1. Nuevo estado
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        setLoading(true);
        // 2. Añadimos la nueva petición al Promise.all
        const [statsRes, recienteResponsivaRes, recientePasswordRes, licenciasStatsRes] = await Promise.all([
          fetch('http://192.168.1.12:3001/api/responsivas/kpis/stats'),//en desarrollo localhost:3001, en producion el puerto del servidor.
          fetch('http://192.168.1.12:3001/api/responsivas/kpis/reciente'),
          fetch('http://192.168.1.12:3001/api/passwords/kpis/reciente'),
          fetch('http://192.168.1.12:3001/api/licencias/kpis/stats')
        ]);

        const statsData = await statsRes.json();
        const recienteResponsivaData = await recienteResponsivaRes.json();
        const recientePasswordData = await recientePasswordRes.json();
        const licenciasData = await licenciasStatsRes.json();

        setStats(statsData);
        setLicenciasStats(licenciasData);
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

  const calcularDiasRestantes = (fechaISO) => {
    if (!fechaISO) return 0;
    const fechaVencimiento = new Date(fechaISO);
    // Ajustar por zona horaria para precisión local
    fechaVencimiento.setMinutes(fechaVencimiento.getMinutes() + fechaVencimiento.getTimezoneOffset());
    fechaVencimiento.setHours(0, 0, 0, 0);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const diffTime = fechaVencimiento - hoy;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <KpiCardSkeleton />
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
        <KpiCard
          title="Suscripciones Activas"
          value={licenciasStats.activas}
          icon={ShieldCheckIcon}
          colorClass="bg-indigo-500"
        >
          {licenciasStats.activasPorProveedor && licenciasStats.activasPorProveedor.length > 0 ? (
            <div className="mt-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Por Proveedor:</span>
              <div className="max-h-32 overflow-y-auto pr-1 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
                {licenciasStats.activasPorProveedor.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm py-1 border-b border-slate-50 last:border-0">
                    <span className="text-slate-600 truncate mr-2" title={item.proveedor_nombre || 'Sin Proveedor'}>
                      {item.proveedor_nombre || 'Sin Proveedor'}
                    </span>
                    <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full text-xs">
                      {item.cantidad}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <span className="text-sm text-slate-400 italic">No hay licencias activas</span>
          )}
        </KpiCard>
        <KpiCard
          title="Licencias por Vencer"
          value={licenciasStats.porVencer}
          icon={ClockIcon}
          colorClass="bg-yellow-500"
        >
          {licenciasStats.proximaVencerItem ? (
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Próxima a vencer:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-800">{licenciasStats.proximaVencerItem.servicio}</span>
                {licenciasStats.proximaVencerItem.tipo_servicio_nombre && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs border border-slate-200">
                    {licenciasStats.proximaVencerItem.tipo_servicio_nombre}
                  </span>
                )}
              </div>
              <div className="flex items-center mt-1">
                <span className="text-sm text-yellow-600 font-semibold">
                  {formatearFecha(licenciasStats.proximaVencerItem.fecha_vencimiento)}
                </span>
                {(() => {
                  const dias = calcularDiasRestantes(licenciasStats.proximaVencerItem.fecha_vencimiento);
                  const textoDias = dias === 0 ? 'Vence hoy' : dias === 1 ? 'Falta 1 día' : `Faltan ${dias} días`;
                  return (
                    <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 font-semibold rounded text-xs">
                      {textoDias}
                    </span>
                  );
                })()}
              </div>
            </div>
          ) : (
            <span className="text-sm text-slate-400 italic">Todo al día</span>
          )}
        </KpiCard>
        <KpiCard
          title="Licencias Vencidas"
          value={licenciasStats.vencidas}
          icon={ExclamationTriangleIcon}
          colorClass="bg-red-500"
        >
          {licenciasStats.vencidaItem ? (
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Requiere atención:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-800">{licenciasStats.vencidaItem.servicio}</span>
                {licenciasStats.vencidaItem.tipo_servicio_nombre && (
                  <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs border border-red-200">
                    {licenciasStats.vencidaItem.tipo_servicio_nombre}
                  </span>
                )}
              </div>
              <div className="flex items-center mt-1">
                <span className="text-sm text-red-600 font-semibold">
                  Venció: {formatearFecha(licenciasStats.vencidaItem.fecha_vencimiento)}
                </span>
                {(() => {
                  const dias = calcularDiasRestantes(licenciasStats.vencidaItem.fecha_vencimiento);
                  const diasAtraso = Math.abs(dias);
                  const textoAtraso = diasAtraso === 1 ? 'Atraso de 1 día' : `Atraso de ${diasAtraso} días`;
                  return (
                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 font-bold rounded text-xs shadow-sm">
                      {textoAtraso}
                    </span>
                  );
                })()}
              </div>
            </div>
          ) : (
            <span className="text-sm text-slate-400 italic">No hay atrasos</span>
          )}
        </KpiCard>
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