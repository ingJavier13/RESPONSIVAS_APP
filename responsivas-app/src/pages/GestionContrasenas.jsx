// --- IMPORTACIONES ---
import { useEffect, useState, useMemo } from 'react';
import { PlusIcon, MagnifyingGlassIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import FormularioContrasenaModal from '../components/FormularioContrasenaModal';
import { KpiCardSkeleton } from '../components/KpiCard'; // Reutilizamos el skeleton

const CATEGORIAS = [
  "CORREOS HOSTING", "CORREO LICENCIA OFFICE", "SCRIPTCASE", 
  "VPN Y SERVIDOR", "ZKTIME", "TABLETS", "CARPETAS COMPARTIDAS", 
  "CAMARAS", "COMPUTADORAS", "CORREOS SIRA"
];

export default function GestionContrasenas() {
  // --- Estados del Componente ---
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados para los filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  
  // Estados para revelar la contraseña
  const [revealedPasswordId, setRevealedPasswordId] = useState(null);
  const [revealedPasswordText, setRevealedPasswordText] = useState('');
  const [isRevealing, setIsRevealing] = useState(false); // Para un futuro spinner

  // --- Lógica de Filtrado ---
  const filteredPasswords = useMemo(() => {
    if (!passwords) return []; // Guarda contra errores si passwords es null/undefined
    return passwords
      .filter(p => selectedCategory === 'Todas' || p.categoria === selectedCategory)
      .filter(p => {
        const term = searchTerm.toLowerCase();
        return p.servicio_o_usuario.toLowerCase().includes(term) || 
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
      } finally {
        setLoading(false);
      }
    };
    fetchPasswords();
  }, []);
  
  // --- Funciones Handler ---
  const handlePasswordAdded = (nuevaContrasena) => {
    setPasswords(prevPasswords => [nuevaContrasena, ...prevPasswords]);
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
      alert('Error al mostrar la contraseña.');
    } finally {
      setIsRevealing(false);
    }
  };

  const handlePasswordDeleted = async (id) => {
    // Aquí puedes añadir un modal de confirmación si quieres
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro?')) {
      try {
        await fetch(`http://localhost:3001/api/passwords/${id}`, { method: 'DELETE' });
        setPasswords(prevPasswords => prevPasswords.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('No se pudo eliminar el registro.');
      }
    }
  };

  return (
    <>
      <div className="space-y-6">
  {/* --- Controles: Búsqueda y Filtro --- */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
    <div className="md:col-span-1">
      <label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-1">Buscar</label>
      <div className="relative mt-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        </div>
        <input
          type="text"
          name="search"
          id="search"
          className="input pl-10" // Usamos clase .input
          placeholder="Usuario, servicio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
    <div className="md:col-span-1">
      <label htmlFor="category" className="block text-sm font-medium text-slate-700">Categoría</label>
      <select
        id="category"
        name="category"
        className="input mt-1" // Usamos .input
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option>Todas</option>
        {CATEGORIAS.sort().map(cat => <option key={cat}>{cat}</option>)}
      </select>
    </div>
    <div className="md:col-span-1">
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="w-full md:w-auto flex items-center justify-center gap-x-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
      >
        <PlusIcon className="h-5 w-5" />
        Añadir Contraseña
      </button>
    </div>
  </div>

  {/* --- Tabla de Contraseñas--- */}
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
                  <button onClick={() => handleRevealPassword(p.id)} title="Mostrar/Ocular" className="text-slate-400 hover:text-slate-600">
                    {isRevealing && revealedPasswordId !== p.id ? '...' : (revealedPasswordId === p.id ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />)}
                  </button>
                </div>
              </td>
              <td className="px-6 py-4 text-sm"><div className="flex items-center space-x-4"><button onClick={() => handlePasswordDeleted(p.id)} title="Eliminar" className="text-slate-500 hover:text-red-600"><TrashIcon className="h-5 w-5"/></button></div></td>
            </tr>
          ))
        )}
      </tbody>
    </table>
    {!loading && filteredPasswords.length === 0 && (<p className="text-center text-slate-500 py-8">No se encontraron registros.</p>)}
  </div>
</div>
      
      {/* Renderizado del Modal */}
      <FormularioContrasenaModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPasswordAdded={handlePasswordAdded}
      />
    </>
  );
}