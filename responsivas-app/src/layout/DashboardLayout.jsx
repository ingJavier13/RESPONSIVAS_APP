//src/layout/DashboardLayout.jsx
import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // <-- 1. AÑADE ESTA LÍNEA DE NUEVO
import { 
  HomeIcon, 
  PlusIcon, 
  DocumentTextIcon, 
  DocumentPlusIcon, 
  KeyIcon,
  Bars3Icon, 
  XMarkIcon 
} from '@heroicons/react/24/solid';
import Header from '../components/Header';

const navigationLinks = [
  { to: '/', text: 'Inicio', icon: HomeIcon, type: 'link' },
  { type: 'separator' },
  { type: 'title', text: 'Módulo Responsivas' },
  { to: '/crear', text: 'Nueva Responsiva', icon: PlusIcon, type: 'link' },
  { to: '/ver', text: 'Ver Responsivas', icon: DocumentTextIcon, type: 'link' },
  { to: '/subir', text: 'Responsiva Firmada', icon: DocumentPlusIcon, type: 'link' },
  { type: 'separator' },
  { type: 'title', text: 'Módulo Seguridad' },
  { to: '/contrasenas', text: 'Gestionar Contraseñas', icon: KeyIcon, type: 'link' },
];

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const currentLink = navigationLinks.find((link) => link.to === pathname);
  const pageTitle = currentLink ? currentLink.text : 'Dashboard';

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="relative min-h-screen md:flex bg-slate-100">
      
      {/* --- 2. Y AÑADE ESTE COMPONENTE DE NUEVO --- */}
      <Toaster 
        position="top-right"
        toastOptions={{
          success: { style: { background: '#D1FAE5', color: '#065F46' } },
          error: { style: { background: '#FEE2E2', color: '#991B1B' } },
        }}
      />

      {/* Overlay para móvil */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
        onClick={closeSidebar}
      ></div>
      
      {/* --- SIDEBAR --- */}
      <aside className={`fixed inset-y-0 left-0 bg-white w-64 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out border-r border-slate-200 z-40 flex-shrink-0`}>
        {/* ... (el resto del código del sidebar no cambia) ... */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-x-3">
            <img src="/respig.png" alt="Logo RESPIG" className="h-8 w-auto" />
            <h1 className="text-xl font-bold text-green-600 tracking-wider">RESPIG</h1>
          </div>
          <button onClick={closeSidebar} className="md:hidden text-slate-500 hover:text-slate-800">
            <XMarkIcon className="h-6 w-6"/>
          </button>
        </div>
        <nav className="overflow-y-auto p-4">
          <ul className="space-y-1">
            {navigationLinks.map((item, index) => {
              if (item.type === 'separator') { return <li key={`sep-${index}`}><hr className="my-2 border-slate-200" /></li>; }
              if (item.type === 'title') { return <li key={`title-${index}`} className="px-4 pt-4 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">{item.text}</li>; }
              if (item.type === 'link') {
                const Icon = item.icon;
                const isActive = pathname === item.to;
                return (
                  <li key={item.to}>
                    <Link to={item.to} onClick={closeSidebar} className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 ease-in-out ${ isActive ? 'bg-green-50 text-green-700 font-semibold border-l-4 border-green-500' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900' }`}>
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span>{item.text}</span>
                    </Link>
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </nav>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
        <button 
          onClick={() => setSidebarOpen(!isSidebarOpen)} 
          className="md:hidden p-2 mb-4 rounded-md text-slate-500 bg-white shadow-sm"
          aria-label="Abrir menú"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <div className="max-w-7xl mx-auto">
          <Header pageTitle={pageTitle} />
          <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
             <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}