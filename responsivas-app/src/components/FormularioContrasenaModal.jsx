// src/components/FormularioContrasenaModal.jsx

import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

// Traemos la misma lista de categorías
const CATEGORIAS = [
  "CORREOS HOSTING", "CORREO LICENCIA OFFICE", "SCRIPTCASE", 
  "VPN Y SERVIDOR", "ZKTIME", "TABLETS", "CARPETAS COMPARTIDAS", 
  "CAMARAS", "COMPUTADORAS", "CORREOS SIRA"
];

export default function FormularioContrasenaModal({ isOpen, onClose, onPasswordAdded }) {
  const [formData, setFormData] = useState({
    categoria: CATEGORIAS[0],
    servicio_o_usuario: '',
    contrasena: '',
    descripcion: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validación simple
    if (!formData.servicio_o_usuario || !formData.contrasena) {
      setError('El usuario y la contraseña son obligatorios.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/passwords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Error al guardar en el servidor');

      const nuevaContrasena = await res.json();
      onPasswordAdded(nuevaContrasena); // Llama a la función del padre para actualizar la lista
      onClose(); // Cierra el modal
    } catch (err) {
      setError('No se pudo guardar la contraseña. Inténtalo de nuevo.');
      console.error(err);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        {/* ... (código del fondo y overlay del modal, similar a los otros modales) ... */}
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-slate-900">
                  Añadir Nueva Contraseña
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  {/* ... campos del formulario ... */}
                  <div>
                    <label htmlFor="categoria" className="block text-sm font-medium text-slate-700">Categoría</label>
                    <select name="categoria" id="categoria" value={formData.categoria} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      {CATEGORIAS.map(cat => <option key={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="servicio_o_usuario" className="block text-sm font-medium text-slate-700">Usuario / Servicio</label>
                    <input type="text" name="servicio_o_usuario" id="servicio_o_usuario" value={formData.servicio_o_usuario} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
                  </div>
                  <div>
                    <label htmlFor="contrasena" className="block text-sm font-medium text-slate-700">Contraseña</label>
                    <input type="password" name="contrasena" id="contrasena" value={formData.contrasena} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
                  </div>
                  <div>
                    <label htmlFor="descripcion" className="block text-sm font-medium text-slate-700">Descripción (Opcional)</label>
                    <textarea name="descripcion" id="descripcion" value={formData.descripcion} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm"></textarea>
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