import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const API_URL_LICENCIAS = 'http://192.168.1.12:3001/api/licencias';
const API_URL_PROVEEDORES = 'http://192.168.1.12:3001/api/proveedores';

export default function GestionLicencias() {
    const [licencias, setLicencias] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filterProveedor, setFilterProveedor] = useState('');
    const [filterEstado, setFilterEstado] = useState('');

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentLicencia, setCurrentLicencia] = useState(null);

    const [formData, setFormData] = useState({
        servicio: '',
        proveedor_id: '',
        fecha_vencimiento: '',
        frecuencia_pago: 'anual',
        estado: 'activo'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resLicencias, resProveedores] = await Promise.all([
                fetch(API_URL_LICENCIAS),
                fetch(API_URL_PROVEEDORES)
            ]);
            const dataLicencias = await resLicencias.json();
            const dataProveedores = await resProveedores.json();
            setLicencias(dataLicencias);
            setProveedores(dataProveedores);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('No se pudieron cargar los datos');
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
                proveedor_id: licencia.proveedor_id,
                fecha_vencimiento: licencia.fecha_vencimiento.split('T')[0], // format to YYYY-MM-DD
                frecuencia_pago: licencia.frecuencia_pago,
                estado: licencia.estado
            });
        } else {
            setIsEdit(false);
            setCurrentLicencia(null);
            setFormData({
                servicio: '',
                proveedor_id: proveedores.length > 0 ? proveedores[0].id : '',
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
            if (!formData.proveedor_id) {
                toast.error('Debe seleccionar un proveedor');
                return;
            }

            const method = isEdit ? 'PUT' : 'POST';
            const url = isEdit ? `${API_URL_LICENCIAS}/${currentLicencia.id}` : API_URL_LICENCIAS;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(`Licencia ${isEdit ? 'actualizada' : 'creada'} con éxito`);
                setIsModalOpen(false);
                fetchData();
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
            const res = await fetch(`${API_URL_LICENCIAS}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Licencia eliminada');
                fetchData();
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
            const res = await fetch(`${API_URL_LICENCIAS}/${id}/renovar`, { method: 'POST' });
            if (res.ok) {
                toast.success('Licencia renovada exitosamente');
                fetchData();
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

    // Aplicar filtros
    const filteredLicencias = licencias.filter(lic => {
        const matchSearch = lic.servicio.toLowerCase().includes(searchTerm.toLowerCase());
        const matchProveedor = filterProveedor ? lic.proveedor_id.toString() === filterProveedor : true;
        
        let matchEstado = true;
        if (filterEstado) {
            const vencida = isVencida(lic.fecha_vencimiento) || lic.estado === 'vencido';
            const proxima = isProximaAVencer(lic.fecha_vencimiento);
            if (filterEstado === 'activo') matchEstado = !vencida && !proxima;
            if (filterEstado === 'vencido') matchEstado = vencida;
            if (filterEstado === 'proxima') matchEstado = proxima && !vencida;
        }

        return matchSearch && matchProveedor && matchEstado;
    });

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-slate-800">Gestión de Licencias y Suscripciones</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn-primary flex items-center justify-center gap-2"
                >
                    <PlusIcon className="h-5 w-5" />
                    Nueva Licencia
                </button>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Buscar Servicio</label>
                    <input
                        type="text"
                        className="input bg-white"
                        placeholder="Ej. Microsoft..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Filtrar por Proveedor</label>
                    <select
                        className="input bg-white"
                        value={filterProveedor}
                        onChange={(e) => setFilterProveedor(e.target.value)}
                    >
                        <option value="">Todos los proveedores</option>
                        {proveedores.map(p => (
                            <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Filtrar por Estado</label>
                    <select
                        className="input bg-white"
                        value={filterEstado}
                        onChange={(e) => setFilterEstado(e.target.value)}
                    >
                        <option value="">Todos los estados</option>
                        <option value="activo">Activo</option>
                        <option value="proxima">Por Vencer</option>
                        <option value="vencido">Vencido</option>
                    </select>
                </div>
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
                            {filteredLicencias.length > 0 ? (
                                filteredLicencias.map(lic => {
                                    const vencida = isVencida(lic.fecha_vencimiento) || lic.estado === 'vencido';
                                    const proxima = isProximaAVencer(lic.fecha_vencimiento);
                                    
                                    return (
                                        <tr key={lic.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                            <td className="p-3 font-medium text-slate-800">{lic.servicio}</td>
                                            <td className="p-3 text-slate-600 font-medium">{lic.proveedor_nombre}</td>
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
                                        No se encontraron licencias.
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
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-screen">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                            <h3 className="text-lg font-bold text-slate-800">
                                {isEdit ? 'Editar Licencia' : 'Nueva Licencia'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                &times;
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <form onSubmit={handleSubmit} className="space-y-4">
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
                                    <select
                                        required
                                        className="input"
                                        value={formData.proveedor_id}
                                        onChange={(e) => setFormData({...formData, proveedor_id: e.target.value})}
                                    >
                                        <option value="" disabled>Seleccione un proveedor</option>
                                        {proveedores.map(p => (
                                            <option key={p.id} value={p.id}>{p.nombre}</option>
                                        ))}
                                    </select>
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
                </div>
            )}
        </div>
    );
}
