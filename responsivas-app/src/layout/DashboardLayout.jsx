//src/layout/DashboardLayout.jsx
import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // <-- 1. AÑADE ESTA LÍNEA DE NUEVO
import { 
  HomeIcon, 
  PlusIcon, 
  DocumentTextIcon, 
  DocumentPlusIcon, 
  KeyIcon,
  Bars3Icon, 
  XMarkIcon,
  UsersIcon
} from '@heroicons/react/24/solid';
import Header from '../components/Header';

const navigationLinks = [
  { to: '/', text: 'Inicio', icon: HomeIcon, type: 'link' },
  { type: 'separator', module: 'responsivas' },
  { type: 'title', text: 'Módulo Responsivas', module: 'responsivas' },
  { to: '/crear', text: 'Nueva Responsiva', icon: PlusIcon, type: 'link', module: 'responsivas' },
  { to: '/ver', text: 'Ver Responsivas', icon: DocumentTextIcon, type: 'link', module: 'responsivas' },
  { to: '/subir', text: 'Responsiva Firmada', icon: DocumentPlusIcon, type: 'link', module: 'responsivas' },
  { type: 'separator', module: 'seguridad' },
  { type: 'title', text: 'Módulo Seguridad', module: 'seguridad' },
  { to: '/contrasenas', text: 'Gestionar Contraseñas', icon: KeyIcon, type: 'link', module: 'contrasenas' },
  { to: '/usuarios', text: 'Gestionar Usuarios', icon: UsersIcon, type: 'link', module: 'usuarios' },
];

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  const [userPermisos, setUserPermisos] = useState([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setIsSuperAdmin(payload.userId === 'admin-env' || payload.username === 'admin');
        if (payload.permisos) {
          setUserPermisos(payload.permisos.split(','));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

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
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-x-3">
            <img src="/respig.png" alt="Logo RESPIG" className="h-8 w-auto drop-shadow-sm" />
            <h1 className="text-xl font-bold text-emerald-600 tracking-wider">RESPIG</h1>
          </div>
          <button onClick={closeSidebar} className="md:hidden text-slate-400 hover:text-slate-600 transition-colors">
            <XMarkIcon className="h-6 w-6"/>
          </button>
        </div>
        <nav className="overflow-y-auto p-4">
          <ul className="space-y-1">
            {navigationLinks.map((item, index) => {
              // Filtrado por permisos
              if (!isSuperAdmin) {
                if (item.module === 'usuarios') return null;
                if (item.module === 'responsivas' && !userPermisos.includes('responsivas')) return null;
                if (item.module === 'contrasenas' && !userPermisos.includes('contrasenas')) return null;
                if (item.module === 'seguridad' && !userPermisos.includes('contrasenas')) return null; // Oculta titulo/separador de seguridad
              }

              if (item.type === 'separator') { return <li key={`sep-${index}`}><hr className="my-2 border-slate-200" /></li>; }
              if (item.type === 'title') { return <li key={`title-${index}`} className="px-4 pt-4 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">{item.text}</li>; }
              if (item.type === 'link') {
                const Icon = item.icon;
                const isActive = pathname === item.to;
                return (
                  <li key={item.to}>
                    <Link to={item.to} onClick={closeSidebar} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out ${ isActive ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-sm ring-1 ring-emerald-500/20' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' }`}>
                      <Icon className={`h-5 w-5 flex-shrink-0 transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
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
      <main className="flex-1 overflow-y-auto">
        <div className="md:hidden p-4 bg-white/70 backdrop-blur-md sticky top-0 z-20 border-b border-slate-200/50 flex items-center shadow-sm">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)} 
            className="p-2 -ml-2 mr-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Abrir menú"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <img src="/respig.png" alt="Logo" className="h-6 w-auto mr-2" />
          <span className="font-bold text-emerald-600 tracking-wider">RESPIG</span>
        </div>
        <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
          <Header pageTitle={pageTitle} />
          {/* Outlet renderiza la página actual. Ya no necesitamos una tarjeta blanca genérica para todo, 
              cada página (DashboardHome, GestionContrasenas) se encargará de dibujar sus propias tarjetas (cards) */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
             <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}