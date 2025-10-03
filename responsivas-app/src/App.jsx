import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DashboardLayout from './layout/DashboardLayout'
import CrearResponsiva from './pages/CrearResponsiva'
import VerResponsivas from './pages/VerResponsiva'
import SubirResponsiva from './pages/SubirResponisva'
import DashboardHome from './pages/DashboardHome';

//lugar donde se tienen que agregar los componentas para poder añadir al dashboard
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route path="crear" element={<CrearResponsiva />} />
          <Route path="ver" element={<VerResponsivas />} />
          <Route path='subir'element={<SubirResponsiva />} />
          <Route path='' element={<DashboardHome />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
