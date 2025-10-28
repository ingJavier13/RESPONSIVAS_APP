import { useEffect, useState } from 'react';
import toast from 'react-hot-toast'; // Importa toast para notificaciones
import { TrashIcon, PencilIcon, DocumentCheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid'; // Añade ícono de búsqueda
import TableSkeleton from '../components/TableSkeleton';
import ModalConfirmacion from '../components/ModalConfirmacion';
// import Paginacion from '../components/Paginacion'; // Descomenta si quieres añadir paginación aquí

// Componente para los "badges" de estado
const EstadoBadge = ({ estado }) => {
  const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full";
  const colorClasses = estado === 'Activo'
    ? 'bg-green-100 text-green-800'
    : 'bg-slate-100 text-slate-800';
  return <span className={`${baseClasses} ${colorClasses}`}>{estado}</span>;
}

export default function VerResponsivas() {
  const [responsivas, setResponsivas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState(null);

  // Estado para el término de búsqueda (actualización directa)
  const [searchTerm, setSearchTerm] = useState('');

  // useEffect ahora solo depende de searchTerm
  useEffect(() => {
    const fetchResponsivas = async () => {
      // Muestra el esqueleto solo en la carga inicial o si la búsqueda está vacía
      if (responsivas.length === 0 || searchTerm === '') {
        setLoading(true);
      } else {
        // Para búsquedas posteriores, no mostramos el esqueleto completo,
        // pero podemos indicar carga si queremos (opcional)
        // setLoading(true); // Descomenta si quieres un indicador de carga en cada búsqueda
      }

      try {
        const url = `http://192.168.1.12:3001/api/responsivas?search=${searchTerm}`;//En Local es localhost y en producción es la IP
        const token = localStorage.getItem('token');
        const options = {
          headers: {
            // Asegúrate de incluir 'Authorization' si tus rutas están protegidas
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        };
        const res = await fetch(url, options);

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            toast.error('Sesión inválida o expirada.');
            // Considera redirigir al login: window.location.href = '/login';
          } else {
            throw new Error('Error al cargar datos');
          }
          setResponsivas([]); // Limpia los datos si hay error
          return;
        }
        const result = await res.json();
        setResponsivas(result || []);
      } catch (err) {
        console.error('Error al cargar responsivas:', err);
        if (!(err.message.includes('401') || err.message.includes('403'))) {
          toast.error('No se pudieron cargar los registros.');
        }
        setResponsivas([]); // Limpia los datos si hay error
      }
      finally {
        setLoading(false);
      }
    };
    fetchResponsivas();
  }, [searchTerm]); // Depende directamente de searchTerm

  // --- Funciones Handler ---
  const abrirModal = (id) => { setIdAEliminar(id); setMostrarModal(true); };
  const cerrarModal = () => { setIdAEliminar(null); setMostrarModal(false); };

  const confirmarEliminacion = async () => {
    if (!idAEliminar) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://192.168.1.12:3001/api/responsivas/${idAEliminar}`, { //En Local es localhost y en producción es la IP
        method: 'DELETE',
        headers: { ...(token && { 'Authorization': `Bearer ${token}` }) }
      });
      if (!res.ok) throw new Error('Error al eliminar');
      setResponsivas(prev => prev.filter(r => r.id !== idAEliminar));
      toast.success('Responsiva eliminada.');
    } catch (err) {
      console.error('Error al eliminar:', err);
      toast.error('No se pudo eliminar la responsiva.');
    } finally {
      cerrarModal();
    }
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return 'N/A';
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    try {
      return new Date(fechaISO).toLocaleDateString('es-MX', opciones);
    } catch (e) {
      return 'Fecha inválida'; // Manejo por si la fecha no es válida
    }
  };

  // Función handleSearchChange SIMPLIFICADA
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <>
      {/* --- Barra de Búsqueda --- */}
      <div className="mb-6 max-w-sm">
        <label htmlFor="search-responsivas" className="block text-sm font-medium text-slate-700 mb-1">
          Buscar Responsiva
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          </div>
          <input
            type="text"
            name="search-responsivas"
            id="search-responsivas"
            className="input pl-10" // Usa tu clase .input
            placeholder="Responsable, equipo, serie..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* --- Tabla y Lógica de Carga/Vacío --- */}
      {loading ? (
        <TableSkeleton />
      ) : responsivas.length === 0 ? (
        <p className="text-center text-slate-500 mt-8">No se encontraron responsivas {searchTerm && 'que coincidan con tu búsqueda'}.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {['Responsable', 'Tipo', 'Marca', 'Estado', 'Fecha de Creación', 'Acciones'].map(header => (
                  <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {responsivas.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{r.responsable}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{r.tipo_equipo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{r.marca}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600"><EstadoBadge estado={r.estado} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatearFecha(r.fecha)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                     <div className="flex items-center space-x-4">
                       {r.archivo_pdf ? ( <a href={`http://192.168.1.12:3001/uploads/${r.archivo_pdf}`} target="_blank" rel="noopener noreferrer" title="Ver responsiva firmada" className="text-slate-500 hover:text-blue-600"><DocumentCheckIcon className="h-5 w-5" /></a> ) : ( <div className="w-5 h-5" /> )}
                       <button onClick={() => abrirModal(r.id)} title="Eliminar" className="text-slate-500 hover:text-red-600"><TrashIcon className="h-5 w-5"/></button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- Modal de Confirmación --- */}
      <ModalConfirmacion
        isOpen={mostrarModal}
        onClose={cerrarModal}
        onConfirm={confirmarEliminacion}
        title="Eliminar Responsiva"
        message="¿Estás seguro de que deseas eliminar esta responsiva? Esta acción es permanente."
      />
    </>
  );
}