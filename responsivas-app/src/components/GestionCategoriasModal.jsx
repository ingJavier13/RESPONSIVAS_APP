import { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';
import { TrashIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';

export default function GestionCategoriasModal({ isOpen, onClose, categorias, fetchCategorias }) {
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [loading, setLoading] = useState(false);

  // Resetea estados cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setNuevaCategoria('');
      setEditingId(null);
      setEditNombre('');
    }
  }, [isOpen]);

  const handleAddCategoria = async (e) => {
    e.preventDefault();
    if (!nuevaCategoria.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('http://192.168.1.12:3001/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nuevaCategoria.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al añadir categoría');
      }

      toast.success('Categoría añadida con éxito');
      setNuevaCategoria('');
      fetchCategorias(); // Actualizar la lista en el padre
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditNombre(cat.nombre);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNombre('');
  };

  const handleEditCategoria = async (id) => {
    if (!editNombre.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`http://192.168.1.12:3001/api/categorias/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: editNombre.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al editar categoría');
      }

      toast.success('Categoría actualizada con éxito');
      setEditingId(null);
      fetchCategorias();
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategoria = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

    setLoading(true);
    try {
      const res = await fetch(`http://192.168.1.12:3001/api/categorias/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al eliminar categoría');
      }

      toast.success('Categoría eliminada con éxito');
      fetchCategorias();
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-slate-900 border-b pb-2 mb-4">
                  Gestionar Categorías
                </Dialog.Title>
                
                {/* Formulario para añadir */}
                <form onSubmit={handleAddCategoria} className="mb-6 flex gap-2">
                  <input
                    type="text"
                    value={nuevaCategoria}
                    onChange={(e) => setNuevaCategoria(e.target.value)}
                    placeholder="Nueva categoría..."
                    className="input flex-1"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !nuevaCategoria.trim()}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
                  >
                    Añadir
                  </button>
                </form>

                {/* Lista de categorías */}
                <div className="max-h-60 overflow-y-auto pr-2">
                  {categorias.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No hay categorías disponibles.</p>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {categorias.map((cat) => (
                        <li key={cat.id} className="py-3 flex items-center justify-between">
                          {editingId === cat.id ? (
                            <div className="flex items-center gap-2 flex-1 mr-2">
                              <input
                                type="text"
                                value={editNombre}
                                onChange={(e) => setEditNombre(e.target.value)}
                                className="input py-1 text-sm flex-1"
                                autoFocus
                              />
                              <button onClick={() => handleEditCategoria(cat.id)} className="text-green-600 hover:text-green-800" title="Guardar">
                                <CheckIcon className="h-5 w-5" />
                              </button>
                              <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600" title="Cancelar">
                                <XMarkIcon className="h-5 w-5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="text-sm font-medium text-slate-700">{cat.nombre}</span>
                              <div className="flex items-center gap-2">
                                <button onClick={() => startEdit(cat)} className="text-slate-400 hover:text-blue-600" title="Editar">
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleDeleteCategoria(cat.id)} className="text-slate-400 hover:text-red-600" title="Eliminar">
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button type="button" onClick={onClose} className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 focus:outline-none">
                    Cerrar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
