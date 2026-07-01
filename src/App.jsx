import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NuevaCotizacion from './pages/NuevaCotizacion'
import Historial from './pages/Historial'
import Admin from './pages/Admin'
import DetalleCotizacion from './pages/DetalleCotizacion'
import EditarCotizacion from './pages/EditarCotizacion'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/dashboard" element={
        <PrivateRoute><Dashboard /></PrivateRoute>
      } />

      <Route path="/nueva-cotizacion" element={
        <PrivateRoute><NuevaCotizacion /></PrivateRoute>
      } />

      <Route path="/historial" element={
        <PrivateRoute><Historial /></PrivateRoute>
      } />

      <Route path="/cotizacion/:id" element={
        <PrivateRoute><DetalleCotizacion /></PrivateRoute>
      } />

      <Route path="/editar-cotizacion/:id" element={
        <PrivateRoute><EditarCotizacion /></PrivateRoute>
      } />

      <Route path="/admin" element={
        <PrivateRoute adminOnly={true}><Admin /></PrivateRoute>
      } />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
