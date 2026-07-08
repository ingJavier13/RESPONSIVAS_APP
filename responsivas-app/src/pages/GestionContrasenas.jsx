import { useEffect, useState, useMemo } from 'react'; // React y hooks
import toast from 'react-hot-toast'; // Para notificaciones
import { PlusIcon, MagnifyingGlassIcon, TrashIcon, PencilIcon, EyeIcon, EyeSlashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid'; // Iconos
import FormularioContrasenaModal from '../components/FormularioContrasenaModal';
import ModalConfirmacion from '../components/ModalConfirmacion'; // Modal genérico de confirmación
import { KpiCardSkeleton } from '../components/KpiCard'; // Skeleton para carga
import GestionCategoriasModal from '../components/GestionCategoriasModal';

export default function GestionContrasenas() {
  // --- Estados del Componente ---
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para los modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [passwordToDelete, setPasswordToDelete] = useState(null);
  const [isGestionCategoriasOpen, setIsGestionCategoriasOpen] = useState(false);

  // Estados para categorías dinámicas
  const [categoriasList, setCategoriasList] = useState([]);

  // Estados para los filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  
  // Estados para revelar contraseña
  const [revealedPasswordId, setRevealedPasswordId] = useState(null);
  const [revealedPasswordText, setRevealedPasswordText] = useState('');
  const [isRevealing, setIsRevealing] = useState(false);

  // Verificar si es admin
  const isSuperAdmin = useMemo(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.username === 'admin' || payload.userId === 'admin-env';
      }
    } catch (e) {
      return false;
    }
    return false;
  }, []);

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
  const fetchCategorias = async () => {
    try {
      const res = await fetch('http://192.168.1.12:3001/api/categorias');
      const data = await res.json();
      setCategoriasList(data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      toast.error('No se pudieron cargar las categorías.');
    }
  };

  useEffect(() => {
    const fetchPasswords = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://192.168.1.12:3001/api/passwords');//en desarrollo localhost:3001, en producion el puerto del servidor.
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
    fetchCategorias();
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
      const res = await fetch(`http://192.168.1.12:3001/api/passwords/${passwordToDelete.id}`, { method: 'DELETE' });//en desarrollo localhost:3001, en producion el puerto del servidor.
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
      const res = await fetch(`http://192.168.1.12:3001/api/passwords/${id}/reveal`);//en desarrollo localhost:3001, en producion el puerto del servidor.
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

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://192.168.1.12:3001/api/passwords/export', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error('Error al exportar contraseñas');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'respaldo_contrasenas.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Descarga iniciada');
    } catch (e) {
      toast.error('No tienes permisos para exportar o hubo un error.');
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
            <div className="flex mt-1 gap-2">
              <select id="category" name="category" className="input flex-1" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option>Todas</option>
                {categoriasList.map(cat => <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>)}
              </select>
              <button 
                type="button" 
                onClick={() => setIsGestionCategoriasOpen(true)}
                className="flex items-center justify-center rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-200"
                title="Gestionar Categorías"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="md:col-span-1 flex justify-end gap-2">
            {isSuperAdmin && (
              <button 
                type="button" 
                onClick={handleExport}
                className="w-full md:w-auto flex items-center justify-center gap-x-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
                title="Exportar a CSV"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />Exportar
              </button>
            )}
            <button type="button" onClick={() => openFormModal()} className="w-full md:w-auto flex items-center justify-center gap-x-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
              <PlusIcon className="h-5 w-5" />Añadir Contraseña
            </button>
          </div>
        </div>

        {/* Tabla de Contraseñas */}
        {/* Vista de Tabla para Escritorio */}
        <div className="hidden md:block overflow-x-auto card">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Usuario / Servicio</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Contraseña</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="4"><KpiCardSkeleton /></td></tr>
              ) : (
                filteredPasswords.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4"><div className="text-sm font-semibold text-slate-900">{p.servicio_o_usuario}</div><div className="text-sm text-slate-500 mt-1">{p.descripcion}</div></td>
                    <td className="px-6 py-4"><span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">{p.categoria}</span></td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">
                      <div className="flex items-center space-x-3">
                        <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100">{revealedPasswordId === p.id ? revealedPasswordText : '••••••••'}</span>
                        <button onClick={() => handleRevealPassword(p.id)} title="Mostrar/Ocultar" className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" disabled={isRevealing}>
                          {revealedPasswordId === p.id ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => openFormModal(p)} title="Editar" className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><PencilIcon className="h-5 w-5"/></button>
                        <button onClick={() => openDeleteModal(p)} title="Eliminar" className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><TrashIcon className="h-5 w-5"/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {!loading && filteredPasswords.length === 0 && (<p className="text-center text-slate-500 py-12">No se encontraron registros que coincidan con tu búsqueda.</p>)}
        </div>

        {/* Vista de Tarjetas para Móviles */}
        <div className="md:hidden space-y-4 pb-12">
          {loading ? (
             <KpiCardSkeleton />
          ) : filteredPasswords.length === 0 ? (
             <div className="card p-8 text-center text-slate-500">No se encontraron contraseñas.</div>
          ) : (
             filteredPasswords.map(p => (
               <div key={p.id} className="card p-5 space-y-4">
                 <div className="flex justify-between items-start">
                   <div className="pr-4">
                     <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 mb-3">
                       {p.categoria}
                     </span>
                     <h3 className="font-bold text-lg text-slate-900 leading-tight">{p.servicio_o_usuario}</h3>
                   </div>
                   <div className="flex space-x-1 shrink-0 bg-slate-50 p-1 rounded-lg border border-slate-100">
                     <button onClick={() => openFormModal(p)} className="p-2 text-slate-400 hover:text-emerald-600 active:bg-emerald-50 rounded-md"><PencilIcon className="h-5 w-5"/></button>
                     <button onClick={() => openDeleteModal(p)} className="p-2 text-slate-400 hover:text-red-600 active:bg-red-50 rounded-md"><TrashIcon className="h-5 w-5"/></button>
                   </div>
                 </div>
                 {p.descripcion && <p className="text-sm text-slate-500 leading-relaxed">{p.descripcion}</p>}
                 
                 <div className="pt-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 -mx-5 -mb-5 p-5">
                    <div className="flex-1 overflow-hidden">
                      {revealedPasswordId === p.id ? (
                        <span className="font-mono text-sm bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm block truncate">{revealedPasswordText}</span>
                      ) : (
                        <span className="text-slate-400 text-sm tracking-widest font-mono">••••••••</span>
                      )}
                    </div>
                    <button onClick={() => handleRevealPassword(p.id)} className="ml-4 flex items-center justify-center p-2 rounded-lg bg-white border border-slate-200 shadow-sm text-slate-600 hover:text-emerald-600 active:bg-slate-50 transition-colors">
                      {revealedPasswordId === p.id ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                 </div>
               </div>
             ))
          )}
        </div>
      </div>
      
      {/* Renderizado de Modales */}
      <FormularioContrasenaModal 
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        onPasswordAdded={handlePasswordAdded}
        onPasswordUpdated={handlePasswordUpdated}
        editingPassword={editingPassword}
        categorias={categoriasList}
      />
      
      <GestionCategoriasModal
        isOpen={isGestionCategoriasOpen}
        onClose={() => setIsGestionCategoriasOpen(false)}
        categorias={categoriasList}
        fetchCategorias={fetchCategorias}
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