import { useEffect, useState } from 'react'
import { ArrowUpTrayIcon, DocumentTextIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'

// Un pequeño componente para el icono de carga (spinner)
const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);


export default function SubirResponsiva() {
  const [archivo, setArchivo] = useState(null)
  const [responsivaId, setResponsivaId] = useState('')
  const [responsivas, setResponsivas] = useState([])
  
  // 1. Estado de carga para el fetch y el upload
  const [isLoading, setIsLoading] = useState(false)
  
  // 2. Mensaje de alerta mejorado (con tipo: 'success' o 'error')
  const [alerta, setAlerta] = useState({ msg: '', type: '' })

  useEffect(() => {
    // Aquí podrías poner un estado de carga si la lista tarda en llegar
    fetch('http://localhost:3001/api/responsivas/lista')
      .then(res => res.json())
      .then(data => setResponsivas(data))
      .catch(err => console.error('Error al cargar lista:', err))
  }, [])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!archivo || !responsivaId) return

    setIsLoading(true) // Inicia la carga
    setAlerta({ msg: '', type: '' }) // Limpia alertas previas

    const formData = new FormData()
    formData.append('archivo', archivo)
    formData.append('id', responsivaId)

    try {
      const res = await fetch('http://localhost:3001/api/responsivas/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!res.ok) throw new Error('Error en la respuesta del servidor');
      
      const data = await res.json()
      setAlerta({ msg: '✅ Archivo subido correctamente', type: 'success' })
      setArchivo(null)
      setResponsivaId('')
    } catch (err) {
      console.error('Error al subir archivo:', err)
      setAlerta({ msg: '❌ Error al subir el archivo. Inténtalo de nuevo.', type: 'error' })
    } finally {
      setIsLoading(false) // Termina la carga
    }
  }

  return (
    // Se ha eliminado el contenedor de aquí para usar el de DashboardLayout
    <div>
      {/* 3. Componente de Alerta más visible */}
      {alerta.msg && (
        <div 
          className={`p-4 mb-4 rounded-md flex items-center space-x-3 ${
            alerta.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {alerta.type === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <XCircleIcon className="h-5 w-5" />}
          <span className="text-sm font-medium">{alerta.msg}</span>
        </div>
      )}

      <form onSubmit={handleUpload} className="space-y-6">
        {/* 4. Estructura con Label + Input */}
        <div>
          <label htmlFor="responsiva" className="block text-sm font-medium text-slate-700 mb-1">
            Responsiva a Vincular
          </label>
          <select
            id="responsiva"
            value={responsivaId}
            onChange={(e) => setResponsivaId(e.target.value)}
            // 5. Clases de Tailwind para un select moderno
            className="input"
          >
            <option value="">Selecciona una responsiva...</option>
            {responsivas.map((r) => (
              <option key={r.id} value={r.id}>
                ID: {r.id} — {r.responsable} — {new Date(r.fecha).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Archivo Firmado (PDF)
          </label>
          {/* 6. Input de archivo rediseñado */}
          {!archivo ? (
            <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-slate-300 px-6 pt-5 pb-6">
              <div className="space-y-1 text-center">
                <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-slate-400" />
                <div className="flex text-sm text-slate-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none hover:text-blue-500">
                    <span>Sube un archivo</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="application/pdf" onChange={(e) => setArchivo(e.target.files[0])} />
                  </label>
                  <p className="pl-1">o arrástralo aquí</p>
                </div>
                <p className="text-xs text-slate-500">PDF hasta 10MB</p>
              </div>
            </div>
          ) : (
            // Vista cuando ya hay un archivo seleccionado
            <div className="mt-2 flex justify-between items-center bg-slate-50 p-3 rounded-md border border-slate-200">
                <div className="flex items-center space-x-2">
                    <DocumentTextIcon className="h-6 w-6 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">{archivo.name}</span>
                </div>
                <button type="button" onClick={() => setArchivo(null)} className="text-sm font-medium text-red-600 hover:text-red-500">
                    Cambiar
                </button>
            </div>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={!archivo || !responsivaId || isLoading} // 7. Botón deshabilitado si no hay datos o está cargando
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {isLoading ? <Spinner /> : null} {/* Muestra el spinner si está cargando */}
            {isLoading ? 'Subiendo...' : 'Subir Archivo'}
          </button>
        </div>
      </form>
    </div>
  )
}