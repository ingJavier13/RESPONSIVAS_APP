import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Verificar permisos por ruta
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isSuperAdmin = payload.userId === 'admin-env' || payload.username === 'admin';
    const permisos = payload.permisos ? payload.permisos.split(',') : [];

    if (!isSuperAdmin) {
      const path = location.pathname;
      
      if (path.startsWith('/crear') || path.startsWith('/ver') || path.startsWith('/subir')) {
        if (!permisos.includes('responsivas')) return <Navigate to="/" replace />;
      }
      
      if (path.startsWith('/contrasenas')) {
        if (!permisos.includes('contrasenas')) return <Navigate to="/" replace />;
      }
      
      if (path.startsWith('/usuarios')) {
        return <Navigate to="/" replace />; // Solo admin
      }
    }
  } catch (e) {
    console.error("Error validando permisos de token", e);
  }

  return <Outlet />;
}