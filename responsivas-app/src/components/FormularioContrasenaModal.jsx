// src/components/FormularioContrasenaModal.jsx

import { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';

// Lista de categorías disponibles
const CATEGORIAS = [
  "CORREOS HOSTING", "CORREO LICENCIA OFFICE", "SCRIPTCASE", 
  "VPN Y SERVIDOR", "ZKTIME", "TABLETS", "CARPETAS COMPARTIDAS", 
  "CAMARAS", "COMPUTADORAS", "CORREOS SIRA"
];

export default function FormularioContrasenaModal({ isOpen, onClose, onPasswordAdded, onPasswordUpdated, editingPassword }) {
  const [formData, setFormData] = useState({
    categoria: CATEGORIAS[0],
    servicio_o_usuario: '',
    contrasena: '',
    descripcion: ''
  });
  const [error, setError] = useState('');

  // Determina si estamos en modo "edición"
  const isEditing = !!editingPassword;

  // Efecto para rellenar o limpiar el formulario
  useEffect(() => {
    // Si estamos en modo edición, rellena el formulario con los datos existentes
    if (isEditing && isOpen) {
      setFormData({
        categoria: editingPassword.categoria,
        servicio_o_usuario: editingPassword.servicio_o_usuario,
        contrasena: '', // La contraseña siempre empieza vacía por seguridad
        descripcion: editingPassword.descripcion || ''
      });
    } 
    // Si no, resetea el formulario a sus valores por defecto
    else if (!isOpen) {
      setFormData({
        categoria: CATEGORIAS[0], 
        servicio_o_usuario: '', 
        contrasena: '', 
        descripcion: ''
      });
      setError(''); // Limpia cualquier error al cerrar
    }
  }, [editingPassword, isOpen]); // Se ejecuta cuando cambia el modo o la visibilidad

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.servicio_o_usuario) {
      setError('El campo "Usuario / Servicio" es obligatorio.');
      return;
    }

    // Al editar, la contraseña es opcional (solo si se quiere cambiar)
    if (!isEditing && !formData.contrasena) {
      setError('El campo "Contraseña" es obligatorio al crear un nuevo registro.');
      return;
    }

    const url = isEditing 
      ? `http://localhost:3001/api/passwords/${editingPassword.id}`
      : 'http://localhost:3001/api/passwords';
    
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('La respuesta del servidor no fue exitosa.');
      
      const resultData = await res.json();
      
      if (isEditing) {
        onPasswordUpdated(resultData);
      } else {
        onPasswordAdded(resultData);
      }
      onClose(); // Cierra el modal

    } catch (err) {
      setError('No se pudo guardar el registro. Inténtalo de nuevo.');
      console.error(err);
      toast.error('No se pudo guardar el registro.');
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
                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-slate-900">
                  {isEditing ? 'Editar Contraseña' : 'Añadir Nueva Contraseña'}
                </Dialog.Title>
                
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="categoria" className="block text-sm font-medium text-slate-700">Categoría</label>
                    <select name="categoria" id="categoria" value={formData.categoria} onChange={handleChange} className="input mt-1">
                      {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="servicio_o_usuario" className="block text-sm font-medium text-slate-700">Usuario / Servicio</label>
                    <input type="text" name="servicio_o_usuario" id="servicio_o_usuario" value={formData.servicio_o_usuario} onChange={handleChange} className="input mt-1" />
                  </div>
                  <div>
                    <label htmlFor="contrasena" className="block text-sm font-medium text-slate-700">Contraseña</label>
                    <input type="password" name="contrasena" id="contrasena" placeholder={isEditing ? 'Dejar en blanco para no cambiar' : ''} value={formData.contrasena} onChange={handleChange} className="input mt-1" />
                  </div>
                  <div>
                    <label htmlFor="descripcion" className="block text-sm font-medium text-slate-700">Descripción (Opcional)</label>
                    <textarea name="descripcion" id="descripcion" value={formData.descripcion} onChange={handleChange} rows={3} className="input mt-1"></textarea>
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <div className="mt-6 flex justify-end gap-x-4">
                    <button type="button" onClick={onClose} className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">Cancelar</button>
                    <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">Guardar</button>
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