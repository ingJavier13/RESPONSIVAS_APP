// GestionContrasenas.jsx
import { useEffect, useState, useMemo } from 'react'; // React y hooks
import toast from 'react-hot-toast'; // Para notificaciones
import { PlusIcon, MagnifyingGlassIcon, TrashIcon, PencilIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid'; // Iconos
import FormularioContrasenaModal from '../components/FormularioContrasenaModal';
import ModalConfirmacion from '../components/ModalConfirmacion'; // Modal genérico de confirmación
import { KpiCardSkeleton } from '../components/KpiCard'; // Skeleton para carga

// Lista de categorías disponibles (mantener consistente con FormularioContrasenaModal)
const CATEGORIAS = [
  "CORREOS HOSTING", "CORREO LICENCIA OFFICE", "SCRIPTCASE", 
  "VPN Y SERVIDOR", "ZKTIME", "TABLETS", "CARPETAS COMPARTIDAS", 
  "CAMARAS", "COMPUTADORAS", "CORREOS SIRA"
];

export default function GestionContrasenas() {
  // --- Estados del Componente ---
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para los modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [passwordToDelete, setPasswordToDelete] = useState(null);

  // Estados para los filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  
  // Estados para revelar contraseña
  const [revealedPasswordId, setRevealedPasswordId] = useState(null);
  const [revealedPasswordText, setRevealedPasswordText] = useState('');
  const [isRevealing, setIsRevealing] = useState(false);

  // --- Lógica de Filtrado ---
  const filteredPasswords = useMemo(() => {
    if (!passwords) return [];
    return passwords
      .filter(p => selectedCategory === 'Todas' || p.categoria === selectedCategory)
      .filter(p => {
        const term = searchTerm.toLowerCase();
        return (p.servicio_o_usuario && p.servicio_o_usuario.toLowerCase().includes(term)) || 
               (p.descripcion && p.descripcion.toLowerCase().includes(term));
      });
  }, [passwords, searchTerm, selectedCategory]);

  // --- Cargar Datos Iniciales ---
  useEffect(() => {
    const fetchPasswords = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:3001/api/passwords');
        const data = await res.json();
        setPasswords(data);
      } catch (error) {
        console.error("Error al cargar contraseñas:", error);
        toast.error('No se pudieron cargar los registros.');
      } finally {
        setLoading(false);
      }
    };
    fetchPasswords();
  }, []);
  
  // --- Funciones Handler para CRUD ---
  const handlePasswordAdded = (nuevaContrasena) => {
    setPasswords(prev => [nuevaContrasena, ...prev].sort((a, b) => a.categoria.localeCompare(b.categoria)));
    toast.success('¡Registro guardado con éxito!');
  };

  const handlePasswordUpdated = (updatedPassword) => {
    setPasswords(prev => prev.map(p => (p.id === updatedPassword.id ? { ...p, ...updatedPassword } : p)));
    toast.success('¡Registro actualizado!');
  };

  const handlePasswordDeleted = async () => {
    if (!passwordToDelete) return;
    try {
      const res = await fetch(`http://localhost:3001/api/passwords/${passwordToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error en el servidor');
      setPasswords(prev => prev.filter(p => p.id !== passwordToDelete.id));
      toast.success('Registro eliminado.');
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('No se pudo eliminar el registro.');
    } finally {
      closeDeleteModal();
    }
  };

  const handleRevealPassword = async (id) => {
    if (revealedPasswordId === id) {
      setRevealedPasswordId(null);
      setRevealedPasswordText('');
      return;
    }
    try {
      setIsRevealing(true);
      const res = await fetch(`http://localhost:3001/api/passwords/${id}/reveal`);
      if (!res.ok) throw new Error('No se pudo obtener la contraseña');
      const data = await res.json();
      setRevealedPasswordId(id);
      setRevealedPasswordText(data.password);
    } catch (error) {
      console.error(error);
      toast.error('Error al mostrar la contraseña.');
    } finally {
      setIsRevealing(false);
    }
  };

  // --- Funciones para controlar los modales ---
  const openFormModal = (password = null) => {
    setEditingPassword(password);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setEditingPassword(null);
  };

  const openDeleteModal = (password) => {
    setPasswordToDelete(password);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setPasswordToDelete(null);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Controles: Búsqueda, Filtro y Botón de Añadir */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-1">
            <label htmlFor="search" className="block text-sm font-medium text-slate-700">Buscar</label>
            <div className="relative mt-1">
              <input type="text" name="search" id="search" className="input pl-10" placeholder="Usuario, servicio..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="md:col-span-1">
            <label htmlFor="category" className="block text-sm font-medium text-slate-700">Categoría</label>
            <select id="category" name="category" className="input mt-1" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option>Todas</option>
              {CATEGORIAS.sort().map(cat => <option key={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="md:col-span-1">
            <button type="button" onClick={() => openFormModal()} className="w-full md:w-auto flex items-center justify-center gap-x-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
              <PlusIcon className="h-5 w-5" />Añadir Contraseña
            </button>
          </div>
        </div>

        {/* Tabla de Contraseñas */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Usuario / Servicio</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Contraseña</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan="4"><KpiCardSkeleton /></td></tr>
              ) : (
                filteredPasswords.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4"><div className="text-sm font-medium text-slate-900">{p.servicio_o_usuario}</div><div className="text-sm text-slate-500">{p.descripcion}</div></td>
                    <td className="px-6 py-4 text-sm text-slate-600">{p.categoria}</td>
                    <td className="px-6 py-4 text-sm font-mono">
                      <div className="flex items-center space-x-2">
                        <span>{revealedPasswordId === p.id ? revealedPasswordText : '********'}</span>
                        <button onClick={() => handleRevealPassword(p.id)} title="Mostrar/Ocultar" className="text-slate-400 hover:text-slate-600" disabled={isRevealing}>
                          {revealedPasswordId === p.id ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center space-x-4">
                        <button onClick={() => openFormModal(p)} title="Editar" className="text-slate-500 hover:text-green-600"><PencilIcon className="h-5 w-5"/></button>
                        <button onClick={() => openDeleteModal(p)} title="Eliminar" className="text-slate-500 hover:text-red-600"><TrashIcon className="h-5 w-5"/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {!loading && filteredPasswords.length === 0 && (<p className="text-center text-slate-500 py-8">No se encontraron registros que coincidan con tu búsqueda.</p>)}
        </div>
      </div>
      
      {/* Renderizado de Modales */}
      <FormularioContrasenaModal 
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        onPasswordAdded={handlePasswordAdded}
        onPasswordUpdated={handlePasswordUpdated}
        editingPassword={editingPassword}
      />
      
      <ModalConfirmacion
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handlePasswordDeleted}
        title="Eliminar Registro"
        message="¿Estás seguro de que deseas eliminar este registro? Esta acción es permanente."
      />
    </>
  );
}