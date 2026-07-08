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

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Nombre de Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan="3"><KpiCardSkeleton /></td></tr>
              ) : (
                filteredUsuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-500">{u.id}</td>
                    <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">{u.username}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center space-x-4">
                        <button onClick={() => openFormModal(u)} title="Editar Contraseña/Nombre" className="text-slate-500 hover:text-green-600"><PencilIcon className="h-5 w-5"/></button>
                        <button onClick={() => openDeleteModal(u)} title="Eliminar" className="text-slate-500 hover:text-red-600"><TrashIcon className="h-5 w-5"/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {!loading && filteredUsuarios.length === 0 && (<p className="text-center text-slate-500 py-8">No se encontraron usuarios.</p>)}
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
