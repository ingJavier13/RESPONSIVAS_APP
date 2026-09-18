import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const API_URL = 'http://192.168.1.12:3001/api/licencias';

export default function GestionLicencias() {
    const [licencias, setLicencias] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentLicencia, setCurrentLicencia] = useState(null);

    const [formData, setFormData] = useState({
        servicio: '',
        proveedor: '',
        fecha_vencimiento: '',
        frecuencia_pago: 'anual',
        estado: 'activo'
    });

    useEffect(() => {
        fetchLicencias();
    }, []);

    const fetchLicencias = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setLicencias(data);
        } catch (error) {
            console.error('Error fetching licencias:', error);
            toast.error('No se pudieron cargar las licencias');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (licencia = null) => {
        if (licencia) {
            setIsEdit(true);
            setCurrentLicencia(licencia);
            setFormData({
                servicio: licencia.servicio,
                proveedor: licencia.proveedor,
                fecha_vencimiento: licencia.fecha_vencimiento.split('T')[0], // format to YYYY-MM-DD
                frecuencia_pago: licencia.frecuencia_pago,
                estado: licencia.estado
            });
        } else {
            setIsEdit(false);
            setCurrentLicencia(null);
            setFormData({
                servicio: '',
                proveedor: '',
                fecha_vencimiento: '',
                frecuencia_pago: 'anual',
                estado: 'activo'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = isEdit ? 'PUT' : 'POST';
            const url = isEdit ? `${API_URL}/${currentLicencia.id}` : API_URL;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(`Licencia ${isEdit ? 'actualizada' : 'creada'} con éxito`);
                setIsModalOpen(false);
                fetchLicencias();
            } else {
                toast.error('Error al guardar la licencia');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error de red');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar esta licencia?')) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Licencia eliminada');
                fetchLicencias();
            } else {
                toast.error('Error al eliminar');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error de red');
        }
    };

    const handleRenovar = async (id) => {
        if (!confirm('¿Marcar como renovada/pagada? Esto actualizará la fecha de vencimiento.')) return;
        try {
            const res = await fetch(`${API_URL}/${id}/renovar`, { method: 'POST' });
            if (res.ok) {
                toast.success('Licencia renovada exitosamente');
                fetchLicencias();
            } else {
                toast.error('Error al renovar');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error de red');
        }
    };

    const formatearFecha = (fechaISO) => {
        if (!fechaISO) return 'N/A';
        const fecha = new Date(fechaISO);
        // Add one day to fix timezone offset for displaying
        fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
        return fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const isVencida = (fechaISO) => {
        const fechaVencimiento = new Date(fechaISO);
        const hoy = new Date();
        hoy.setHours(0,0,0,0);
        return fechaVencimiento < hoy;
    };

    const isProximaAVencer = (fechaISO) => {
        const fechaVencimiento = new Date(fechaISO);
        const hoy = new Date();
        hoy.setHours(0,0,0,0);
        const sieteDias = new Date(hoy);
        sieteDias.setDate(sieteDias.getDate() + 7);
        return fechaVencimiento >= hoy && fechaVencimiento <= sieteDias;
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Gestión de Licencias y Suscripciones</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn-primary flex items-center gap-2"
                >
                    <PlusIcon className="h-5 w-5" />
                    Nueva Licencia
                </button>
            </div>

            {loading ? (
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 rounded"></div>)}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                <th className="p-3 font-semibold text-sm">Servicio</th>
                                <th className="p-3 font-semibold text-sm">Proveedor</th>
                                <th className="p-3 font-semibold text-sm">Frecuencia</th>
                                <th className="p-3 font-semibold text-sm">Vencimiento</th>
                                <th className="p-3 font-semibold text-sm">Estado</th>
                                <th className="p-3 font-semibold text-sm">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {licencias.length > 0 ? (
                                licencias.map(lic => {
                                    const vencida = isVencida(lic.fecha_vencimiento) || lic.estado === 'vencido';
                                    const proxima = isProximaAVencer(lic.fecha_vencimiento);
                                    
                                    return (
                                        <tr key={lic.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                            <td className="p-3 font-medium text-slate-800">{lic.servicio}</td>
                                            <td className="p-3 text-slate-600">{lic.proveedor}</td>
                                            <td className="p-3 text-slate-600 capitalize">{lic.frecuencia_pago}</td>
                                            <td className="p-3 text-slate-600 font-medium">
                                                {formatearFecha(lic.fecha_vencimiento)}
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    vencida ? 'bg-red-100 text-red-700' 
                                                    : proxima ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                    {vencida ? 'Vencida' : proxima ? 'Por Vencer' : 'Activo'}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => handleRenovar(lic.id)}
                                                        title="Renovar / Pagar"
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                    >
                                                        <ArrowPathIcon className="h-5 w-5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleOpenModal(lic)}
                                                        title="Editar"
                                                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-50 rounded-md transition-colors"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(lic.id)}
                                                        title="Eliminar"
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-6 text-center text-slate-500">
                                        No hay licencias registradas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800">
                                {isEdit ? 'Editar Licencia' : 'Nueva Licencia'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Servicio / Software</label>
                                <input
                                    type="text"
                                    required
                                    className="input"
                                    value={formData.servicio}
                                    onChange={(e) => setFormData({...formData, servicio: e.target.value})}
                                    placeholder="Ej. Hostinger, Microsoft 365"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Proveedor</label>
                                <input
                                    type="text"
                                    required
                                    className="input"
                                    value={formData.proveedor}
                                    onChange={(e) => setFormData({...formData, proveedor: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Frecuencia de Pago</label>
                                <select
                                    className="input"
                                    value={formData.frecuencia_pago}
                                    onChange={(e) => setFormData({...formData, frecuencia_pago: e.target.value})}
                                >
                                    <option value="mensual">Mensual</option>
                                    <option value="anual">Anual</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Vencimiento</label>
                                <input
                                    type="date"
                                    required
                                    className="input"
                                    value={formData.fecha_vencimiento}
                                    onChange={(e) => setFormData({...formData, fecha_vencimiento: e.target.value})}
                                />
                            </div>
                            {isEdit && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                                    <select
                                        className="input"
                                        value={formData.estado}
                                        onChange={(e) => setFormData({...formData, estado: e.target.value})}
                                    >
                                        <option value="activo">Activo</option>
                                        <option value="vencido">Vencido</option>
                                    </select>
                                </div>
                            )}
                            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn-secondary"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                >
                                    {isEdit ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
