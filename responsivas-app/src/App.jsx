import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import DashboardLayout from './layout/DashboardLayout'
import CrearResponsiva from './pages/CrearResponsiva'
import VerResponsivas from './pages/VerResponsiva'
import SubirResponsiva from './pages/SubirResponisva'
import DashboardHome from './pages/DashboardHome';
import GestionContrasenas from './pages/GestionContrasenas'

//lugar donde se tienen que agregar los componentas para poder añadir al dashboard
const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />, // Este es el "guardia"
    children: [
      {
        path: '/',
        element: <DashboardLayout />, // El layout principal está protegido
        children: [
          // Todas tus páginas del dashboard ahora son hijas y están protegidas
          { index: true, element: <DashboardHome /> },
          { path: 'crear', element: <CrearResponsiva /> },
          { path: 'ver', element: <VerResponsivas /> },
          { path: 'contrasenas', element: <GestionContrasenas /> },
          {path: 'subir', element: <SubirResponsiva />},
          {path: '*', element: <div>404 Not Found</div>},
        ],
      },
    ],
  },
]);import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return <RouterProvider router={router} />;
}

export default App
