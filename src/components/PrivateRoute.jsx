import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, profile, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Cargando...</p>
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  if (adminOnly && profile?.rol !== 'admin') return <Navigate to="/dashboard" replace />

  return children
}

export default PrivateRoute
