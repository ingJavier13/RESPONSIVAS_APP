import { useState } from 'react';
import toast from 'react-hot-toast'; //

//componente para el spinner de carga
const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); //Nuevo estado para la carga

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true); // Inicia la carga

    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error('Credenciales incorrectas');
      
      const data = await res.json();
      localStorage.setItem('token', data.token);

      // Muestra el toast y retrasa la redirección
      toast.success('¡Inicio de sesión correcto!');
      setTimeout(() => {
        window.location.href = '/'; // Redirigimos después de ver el toast
      }, 1500); // 1.5 segundos de espera

    } catch (err) {
      setError(err.message);
      setIsLoading(false); // Detiene la carga si hay error
    }
  };

  return (
    // 4. Contenedor principal con la imagen de fondo
    <div 
      className="flex min-h-screen items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/grupoig.jpg')" }}
    >
      
      <div className="w-full max-w-md space-y-8 px-4">
        {/* Tarjeta del formulario con efecto de vidrio esmerilado */}
        <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-lg p-8">
          <div className="text-center">

            {/* Logo centrado en la parte superior del formulario */}
            <div
              className="mx-auto mb-4 h-20 w-20 bg-cover bg-center" // Centrado con mx-auto y margen inferior
              style={{ backgroundImage: "url('/logoig.png')" }}
            >
            </div>
            
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Iniciar Sesión</h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="text-sm font-medium text-slate-700">Usuario</label>
              <input id="username" name="username" type="text" required value={username} onChange={e => setUsername(e.target.value)} className="input mt-1" />
            </div>
            <div>
              <label htmlFor="password"  className="text-sm font-medium text-slate-700">Contraseña</label>
              <input id="password" name="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} className="input mt-1" />
            </div>
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            <div>
              {/*Botón con estado de carga */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full flex justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:bg-slate-400"
              >
                {isLoading && <Spinner />}
                {isLoading ? 'Iniciando...' : 'Entrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}