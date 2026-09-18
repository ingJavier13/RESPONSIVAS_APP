import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const API_URL = 'http://192.168.1.12:3001/api/proveedores';

export default function GestionProveedores() {
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentProveedor, setCurrentProveedor] = useState(null);

    const [formData, setFormData] = useState({
        nombre: ''
    });

    useEffect(() => {
        fetchProveedores();
    }, []);

    const fetchProveedores = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setProveedores(data);
        } catch (error) {
            console.error('Error fetching proveedores:', error);
            toast.error('No se pudieron cargar los proveedores');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (proveedor = null) => {
        if (proveedor) {
            setIsEdit(true);
            setCurrentProveedor(proveedor);
            setFormData({
                nombre: proveedor.nombre
            });
        } else {
            setIsEdit(false);
            setCurrentProveedor(null);
            setFormData({
                nombre: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = isEdit ? 'PUT' : 'POST';
            const url = isEdit ? `${API_URL}/${currentProveedor.id}` : API_URL;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(`Proveedor ${isEdit ? 'actualizado' : 'creado'} con éxito`);
                setIsModalOpen(false);
                fetchProveedores();
            } else {
                toast.error('Error al guardar el proveedor (probablemente el nombre ya existe)');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error de red');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este proveedor?')) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Proveedor eliminado');
                fetchProveedores();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Error al eliminar');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error de red');
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Catálogo de Proveedores</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn-primary flex items-center gap-2"
                >
                    <PlusIcon className="h-5 w-5" />
                    Nuevo Proveedor
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
                                <th className="p-3 font-semibold text-sm w-16">ID</th>
                                <th className="p-3 font-semibold text-sm">Nombre del Proveedor</th>
                                <th className="p-3 font-semibold text-sm text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proveedores.length > 0 ? (
                                proveedores.map(prov => (
                                    <tr key={prov.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                        <td className="p-3 text-slate-500">{prov.id}</td>
                                        <td className="p-3 font-medium text-slate-800">{prov.nombre}</td>
                                        <td className="p-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleOpenModal(prov)}
                                                    title="Editar"
                                                    className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-50 rounded-md transition-colors"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(prov.id)}
                                                    title="Eliminar"
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="p-6 text-center text-slate-500">
                                        No hay proveedores registrados.
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
                                {isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    required
                                    className="input"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                    placeholder="Ej. Microsoft, Hostinger"
                                />
                            </div>
                            
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
