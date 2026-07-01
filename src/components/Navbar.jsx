import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        <div className="flex items-center gap-8">
          <span className="font-bold text-gray-900">Maqueda</span>
          <div className="flex items-center gap-1">
            <Link to="/dashboard" className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive('/dashboard') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
              Inicio
            </Link>
            <Link to="/nueva-cotizacion" className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive('/nueva-cotizacion') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
              Nueva Cotización
            </Link>
            <Link to="/historial" className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive('/historial') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
              Historial
            </Link>
            {profile?.rol === 'admin' && (
              <Link to="/admin" className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive('/admin') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                Admin
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{profile?.nombre}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${profile?.rol === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
            {profile?.rol}
          </span>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500 transition-colors">
            Salir
          </button>
        </div>

      </div>
    </nav>
  )
}

export default Navbar
