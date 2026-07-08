import { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';

export default function FormularioUsuarioModal({ isOpen, onClose, onUserAdded, onUserUpdated, editingUser }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isEditing = !!editingUser;

  useEffect(() => {
    if (isEditing && isOpen) {
      setFormData({
        username: editingUser.username,
        password: '' // Contraseña en blanco al editar por seguridad
      });
    } else if (!isOpen) {
      setFormData({
        username: '',
        password: ''
      });
      setError('');
    }
  }, [editingUser, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username.trim()) {
      setError('El nombre de usuario es obligatorio.');
      return;
    }

    if (!isEditing && !formData.password) {
      setError('La contraseña es obligatoria al crear un nuevo usuario.');
      return;
    }

    const url = isEditing 
      ? `http://192.168.1.12:3001/api/usuarios/${editingUser.id}` 
      : 'http://192.168.1.12:3001/api/usuarios';
    
    const method = isEditing ? 'PUT' : 'POST';

    setLoading(true);
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'La respuesta del servidor no fue exitosa.');
      }
      
      const resultData = await res.json();
      
      if (isEditing) {
        onUserUpdated(resultData);
        toast.success('Usuario actualizado con éxito');
      } else {
        onUserAdded(resultData);
        toast.success('Usuario creado con éxito');
      }
      onClose();

    } catch (err) {
      setError(err.message || 'No se pudo guardar el registro. Inténtalo de nuevo.');
      console.error(err);
      toast.error('No se pudo guardar el usuario.');
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
                  {isEditing ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}
                </Dialog.Title>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-slate-700">Nombre de Usuario</label>
                    <input 
                      type="text" 
                      name="username" 
                      id="username" 
                      value={formData.username} 
                      onChange={handleChange} 
                      className="input mt-1" 
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">Contraseña</label>
                    <input 
                      type="password" 
                      name="password" 
                      id="password" 
                      placeholder={isEditing ? 'Dejar en blanco para no cambiarla' : 'Escribe una contraseña segura'} 
                      value={formData.password} 
                      onChange={handleChange} 
                      className="input mt-1" 
                      disabled={loading}
                    />
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <div className="mt-6 flex justify-end gap-x-4">
                    <button type="button" onClick={onClose} disabled={loading} className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50">Cancelar</button>
                    <button type="submit" disabled={loading} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50">
                      {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
