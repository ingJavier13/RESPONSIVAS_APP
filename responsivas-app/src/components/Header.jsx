// src/components/Header.jsx

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon, UserCircleIcon } from '@heroicons/react/24/solid'

// El componente recibe el título de la página como una "prop"
export default function Header({ pageTitle = 'Dashboard' }) {
  return (
    <header className="bg-white shadow-sm mb-8 p-4 rounded-lg flex justify-between items-center">
      {/* Título de la página, que viene desde DashboardLayout */}
      <h1 className="text-2xl font-bold text-slate-800">{pageTitle}</h1>
      
      {/* Menú de Usuario Interactivo */}
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="inline-flex w-full justify-center items-center gap-x-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <UserCircleIcon className="h-7 w-7 text-slate-500" aria-hidden="true" />
            <span className="hidden sm:inline">Javier Romo</span> {/* Nombre de ejemplo */}
            <ChevronDownIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
          </Menu.Button>
        </div>

        {/* Dropdown del menú con transición */}
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <a href="#" className={`${active ? 'bg-slate-100 text-slate-900' : 'text-slate-700'} block px-4 py-2 text-sm`}>
                    Mi Perfil
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <a href="#" className={`${active ? 'bg-slate-100 text-slate-900' : 'text-slate-700'} block px-4 py-2 text-sm`}>
                    Configuración
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button type="submit" className={`${active ? 'bg-slate-100 text-slate-900' : 'text-slate-700'} block w-full px-4 py-2 text-left text-sm`}>
                    Cerrar sesión
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </header>
  )
}