//src/layout/DashboardLayout.jsx
import { PlusIcon, DocumentTextIcon, DocumentPlusIcon, HomeIcon } from '@heroicons/react/24/solid'
import { Outlet, Link, useLocation } from 'react-router-dom'
import Header from '../components/Header'

const navigationLinks = [
  { to: '/', text: 'Inicio', icon: HomeIcon },
  { type: 'separator' },// Línea separadora
  { type: 'title', text: 'Módulo Responsivas' },// Título del módulo
  { to: '/crear', text: 'Nueva Responsiva', icon: PlusIcon },
  { to: '/ver', text: 'Ver Responsivas', icon: DocumentTextIcon },
  { to: '/subir', text: 'Responsiva Firmada', icon: DocumentPlusIcon },
  { type: 'separator' },
  { type: 'title', text: 'Módulo Credenciales' },// Título del módulo
  { to: '/crear-credencial', text: 'Nueva Credencial', icon: PlusIcon },
  { to: '/ver-credenciales', text: 'Ver Credenciales', icon: DocumentTextIcon },
]

export default function DashboardLayout() {
  const { pathname } = useLocation()

  const currentLink = navigationLinks.find((link) => link.to === pathname)
  const pageTitle = currentLink ? currentLink.text : 'Dashboard'

  return (
    <div className="flex h-screen bg-slate-100">
      <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600 tracking-wider">RESPIG</h1>
        </div>
        <nav className="mt-4 px-4">
          <ul className="space-y-2">

            {/* --- INICIO DE LA MODIFICACIÓN DEL .MAP() --- */}
            {navigationLinks.map((item, index) => {
              // Si el item es un separador
              if (item.type === 'separator') {
                return <li key={`sep-${index}`}><hr className="my-2 border-slate-200" /></li>;
              }

              // Si el item es un título
              if (item.type === 'title') {
                return (
                  <li key={`title-${index}`} className="px-4 pt-4 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {item.text}
                  </li>
                );
              }

              // Si es un link normal (código que ya tenías)
              const Icon = item.icon
              const isActive = pathname === item.to

              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ease-in-out ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.text}</span>
                  </Link>
                </li>
              )
            })}
            {/* --- FIN DE LA MODIFICACIÓN --- */}

          </ul>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Header pageTitle={pageTitle} />
          <div className="bg-white p-6 rounded-lg shadow-sm">
             <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}