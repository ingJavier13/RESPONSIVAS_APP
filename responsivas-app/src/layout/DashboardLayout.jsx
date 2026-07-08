//src/layout/DashboardLayout.jsx
import { useState, useEffect, Fragment } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Menu, Transition, Dialog } from '@headlessui/react';
import { 
  HomeIcon, 
  PlusIcon, 
  DocumentTextIcon, 
  DocumentPlusIcon, 
  KeyIcon,
  Bars3Icon, 
  XMarkIcon,
  UsersIcon,
  ChevronDownIcon,
  UserCircleIcon
} from '@heroicons/react/24/solid';

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
  const [username, setUsername] = useState('Usuario');

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setIsSuperAdmin(payload.userId === 'admin-env' || payload.username === 'admin');
        if (payload.permisos) setUserPermisos(payload.permisos.split(','));
        if (payload.username) setUsername(payload.username);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const currentLink = navigationLinks.find((link) => link.to === pathname);
  const pageTitle = currentLink ? currentLink.text : 'Dashboard';

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Toaster 
        position="top-right"
        toastOptions={{
          success: { style: { background: '#D1FAE5', color: '#065F46' } },
          error: { style: { background: '#FEE2E2', color: '#991B1B' } },
        }}
      />

      {/* --- TOP NAVBAR FIJO --- */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm transition-all duration-300">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 max-w-[1600px] mx-auto w-full">
          <div className="flex items-center gap-x-4">
            <button 
              type="button" 
              onClick={() => setSidebarOpen(true)} 
              className="-m-2.5 p-2.5 rounded-md text-slate-600 hover:text-emerald-600 hover:bg-slate-50 transition-colors"
            >
              <span className="sr-only">Abrir menú</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex items-center gap-x-3 ml-2">
              <img src="/respig.png" alt="Logo RESPIG" className="h-8 w-auto drop-shadow-sm" />
              <span className="text-xl font-bold text-emerald-600 tracking-wider hidden sm:block">RESPIG</span>
            </div>
          </div>
          
          <div className="flex items-center gap-x-4">
             {/* Menú de Perfil (Dropdown) */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center gap-x-2 rounded-full px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors ring-1 ring-inset ring-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-600">
                <UserCircleIcon className="h-6 w-6 text-slate-500" aria-hidden="true" />
                <span className="hidden sm:block capitalize">{username}</span>
                <ChevronDownIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
              </Menu.Button>
              <Transition 
                as={Fragment} 
                enter="transition ease-out duration-100" 
                enterFrom="transform opacity-0 scale-95" 
                enterTo="transform opacity-100 scale-100" 
                leave="transition ease-in duration-75" 
                leaveFrom="transform opacity-100 scale-100" 
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-xl bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => ( 
                      <button 
                        onClick={handleLogout} 
                        className={`${active ? 'bg-slate-50 text-red-600' : 'text-slate-700'} block w-full text-left px-4 py-2 text-sm font-medium transition-colors`}
                      >
                        Cerrar sesión
                      </button> 
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </header>

      {/* --- DRAWER (Menú Lateral Deslizable) --- */}
      <Transition.Root show={isSidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setSidebarOpen}>
          <Transition.Child 
            as={Fragment} 
            enter="transition-opacity ease-linear duration-300" 
            enterFrom="opacity-0" 
            enterTo="opacity-100" 
            leave="transition-opacity ease-linear duration-300" 
            leaveFrom="opacity-100" 
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
          </Transition.Child>
          
          <div className="fixed inset-0 flex">
            <Transition.Child 
              as={Fragment} 
              enter="transition ease-in-out duration-300 transform" 
              enterFrom="-translate-x-full" 
              enterTo="translate-x-0" 
              leave="transition ease-in-out duration-300 transform" 
              leaveFrom="translate-x-0" 
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-2xl">
                  
                  {/* Cabecera del Menú Lateral */}
                  <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-x-3">
                      <img src="/respig.png" alt="Logo" className="h-8 w-auto drop-shadow-sm" />
                      <span className="text-lg font-bold text-emerald-600 tracking-wider">Menú</span>
                    </div>
                    <button type="button" className="-m-2.5 p-2.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" onClick={closeSidebar}>
                      <span className="sr-only">Cerrar menú</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  
                  {/* Enlaces del Menú */}
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigationLinks.map((item, index) => {
                             // Filtrado por permisos
                             if (!isSuperAdmin) {
                               if (item.module === 'usuarios') return null;
                               if (item.module === 'responsivas' && !userPermisos.includes('responsivas')) return null;
                               if (item.module === 'contrasenas' && !userPermisos.includes('contrasenas')) return null;
                               if (item.module === 'seguridad' && !userPermisos.includes('contrasenas')) return null; 
                             }
               
                             if (item.type === 'separator') { return <li key={`sep-${index}`}><hr className="my-3 border-slate-100" /></li>; }
                             if (item.type === 'title') { return <li key={`title-${index}`} className="px-3 pt-2 pb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">{item.text}</li>; }
                             if (item.type === 'link') {
                               const Icon = item.icon;
                               const isActive = pathname === item.to;
                               return (
                                 <li key={item.to}>
                                   <Link to={item.to} onClick={closeSidebar} className={`group flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 ease-in-out ${ isActive ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-sm ring-1 ring-emerald-500/20' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' }`}>
                                     <Icon className={`h-5 w-5 flex-shrink-0 transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-500'}`} />
                                     <span>{item.text}</span>
                                   </Link>
                                 </li>
                               );
                             }
                             return null;
                          })}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">{pageTitle}</h1>
        </div>
        
        {/* Outlet renderiza la página actual */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}