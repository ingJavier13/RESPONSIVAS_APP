import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/solid';
import FormularioUsuarioModal from '../components/FormularioUsuarioModal';
import ModalConfirmacion from '../components/ModalConfirmacion';
import { KpiCardSkeleton } from '../components/KpiCard';

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para los modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Filtro
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsuarios = useMemo(() => {
    if (!usuarios) return [];
    return usuarios.filter(u => {
      const term = searchTerm.toLowerCase();
      return u.username.toLowerCase().includes(term);
    });
  }, [usuarios, searchTerm]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://192.168.1.12:3001/api/usuarios');
        const data = await res.json();
        setUsuarios(data);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
        toast.error('No se pudieron cargar los usuarios.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarios();
  }, []);
  
  const handleUserAdded = (nuevoUsuario) => {
    setUsuarios(prev => [...prev, nuevoUsuario].sort((a, b) => a.username.localeCompare(b.username)));
  };

  const handleUserUpdated = (updatedUser) => {
    setUsuarios(prev => prev.map(u => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u)));
  };

  const handleUserDeleted = async () => {
    if (!userToDelete) return;
    try {
      const res = await fetch(`http://192.168.1.12:3001/api/usuarios/${userToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error en el servidor');
      setUsuarios(prev => prev.filter(u => u.id !== userToDelete.id));
      toast.success('Usuario eliminado.');
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('No se pudo eliminar el usuario.');
    } finally {
      closeDeleteModal();
    }
  };

  const openFormModal = (usuario = null) => {
    setEditingUser(usuario);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setEditingUser(null);
  };

  const openDeleteModal = (usuario) => {
    setUserToDelete(usuario);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="md:col-span-1">
            <label htmlFor="search" className="block text-sm font-medium text-slate-700">Buscar Usuario</label>
            <div className="relative mt-1">
              <input type="text" name="search" id="search" className="input" placeholder="Nombre de usuario..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="md:col-span-1 flex justify-end">
            <button type="button" onClick={() => openFormModal()} className="w-full md:w-auto flex items-center justify-center gap-x-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
              <PlusIcon className="h-5 w-5" />Añadir Usuario
            </button>
          </div>
        </div>

        {/* Vista de Tabla para Escritorio */}
        <div className="hidden md:block overflow-x-auto card">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre de Usuario</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="3"><KpiCardSkeleton /></td></tr>
              ) : (
                filteredUsuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">#{u.id}</td>
                    <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900">{u.username}</div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => openFormModal(u)} title="Editar Contraseña/Nombre" className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><PencilIcon className="h-5 w-5"/></button>
                        <button onClick={() => openDeleteModal(u)} title="Eliminar" className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><TrashIcon className="h-5 w-5"/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {!loading && filteredUsuarios.length === 0 && (<p className="text-center text-slate-500 py-12">No se encontraron usuarios.</p>)}
        </div>

        {/* Vista de Tarjetas para Móviles */}
        <div className="md:hidden space-y-4 pb-12">
          {loading ? (
             <KpiCardSkeleton />
          ) : filteredUsuarios.length === 0 ? (
             <div className="card p-8 text-center text-slate-500">No se encontraron usuarios.</div>
          ) : (
             filteredUsuarios.map(u => (
               <div key={u.id} className="card p-5 flex justify-between items-center">
                 <div>
                   <span className="text-xs font-medium text-slate-400 block mb-1">ID: #{u.id}</span>
                   <h3 className="font-bold text-lg text-slate-900">{u.username}</h3>
                 </div>
                 <div className="flex space-x-1 shrink-0 bg-slate-50 p-1 rounded-lg border border-slate-100">
                   <button onClick={() => openFormModal(u)} className="p-2 text-slate-400 hover:text-emerald-600 active:bg-emerald-50 rounded-md"><PencilIcon className="h-5 w-5"/></button>
                   <button onClick={() => openDeleteModal(u)} className="p-2 text-slate-400 hover:text-red-600 active:bg-red-50 rounded-md"><TrashIcon className="h-5 w-5"/></button>
                 </div>
               </div>
             ))
          )}
        </div>
      </div>
      
      <FormularioUsuarioModal 
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        onUserAdded={handleUserAdded}
        onUserUpdated={handleUserUpdated}
        editingUser={editingUser}
      />
      
      <ModalConfirmacion
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleUserDeleted}
        title="Eliminar Usuario"
        message="¿Estás seguro de que deseas eliminar este usuario? Ya no podrá acceder al sistema."
      />
    </>
  );
}
