import { useEffect, useState } from 'react'
import { TrashIcon, PencilIcon, DocumentCheckIcon } from '@heroicons/react/24/solid'
import TableSkeleton from '../components/TableSkeleton'
import ModalConfirmacion from '../components/ModalConfirmacion'

// Componente para los "badges" de estado
const EstadoBadge = ({ estado }) => {
  const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full";
  const colorClasses = estado === 'Activo'
    ? 'bg-green-100 text-green-800'
    : 'bg-slate-100 text-slate-800';
  return <span className={`${baseClasses} ${colorClasses}`}>{estado}</span>;
}

export default function VerResponsivas() {
  const [responsivas, setResponsivas] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [idAEliminar, setIdAEliminar] = useState(null)

  const abrirModal = (id) => {
    setIdAEliminar(id)
    setMostrarModal(true)
  }

  const cerrarModal = () => {
    setIdAEliminar(null)
    setMostrarModal(false)
  }

  const confirmarEliminacion = async () => {
    if (!idAEliminar) return;
    try {
      await fetch(`http://localhost:3001/api/responsivas/${idAEliminar}`, { method: 'DELETE' })
      setResponsivas(prev => prev.filter(r => r.id !== idAEliminar))
      cerrarModal()
    } catch (err) {
      console.error('Error al eliminar:', err)
    }
  }
  
  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return 'N/A';
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fechaISO).toLocaleDateString('es-MX', opciones);
  }

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:3001/api/responsivas')
      .then(res => res.json())
      .then(data => setResponsivas(data))
      .catch(err => console.error('Error al cargar responsivas:', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <>
      {responsivas.length === 0 ? (
        <p className="text-center text-slate-500 mt-8">No hay responsivas registradas.</p>
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
                        
                        {/* Corregido para usar el nombre de tu campo */}
                        {r.archivo_pdf ? (
                          <a
                            href={`http://localhost:3001/uploads/${r.archivo_pdf}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            title="Ver responsiva firmada"
                            className="text-slate-500 hover:text-blue-600"
                          >
                            <DocumentCheckIcon className="h-5 w-5" />
                          </a>
                        ) : (
                          <div className="w-5 h-5" />
                        )}
                        <button title="Eliminar" onClick={() => abrirModal(r.id)} className="text-slate-500 hover:text-red-600"><TrashIcon className="h-5 w-5"/></button>
                      </div>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <ModalConfirmacion 
        isOpen={mostrarModal}
        onClose={cerrarModal}
        onConfirm={confirmarEliminacion}
      />
    </>
  )
}