// src/pages/LoginPage.jsx
import { useState } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error('Credenciales incorrectas');
      
      const data = await res.json();
      localStorage.setItem('token', data.token); // Guardamos el token
      window.location.href = '/'; // Redirigimos al dashboard

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md space-y-8">
        <div className="bg-white shadow-md rounded-lg p-8">
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">Iniciar Sesión</h2>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username">Usuario</label>
              <input id="username" name="username" type="text" required value={username} onChange={e => setUsername(e.target.value)} className="input mt-1" />
            </div>
            <div>
              <label htmlFor="password">Contraseña</label>
              <input id="password" name="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} className="input mt-1" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div>
              <button type="submit" className="w-full flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Entrar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}