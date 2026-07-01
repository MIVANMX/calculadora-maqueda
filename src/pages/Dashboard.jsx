import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const Dashboard = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-6 py-10">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenido, {profile?.nombre} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            ¿Qué quieres hacer hoy?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <button
            onClick={() => navigate('/nueva-cotizacion')}
            className="bg-white border border-gray-200 rounded-2xl p-6 text-left hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
              <span className="text-xl">🏠</span>
            </div>
            <h2 className="font-semibold text-gray-900 mb-1">Nueva Cotización</h2>
            <p className="text-sm text-gray-500">Evalúa una nueva propiedad y calcula su viabilidad.</p>
          </button>

          <button
            onClick={() => navigate('/historial')}
            className="bg-white border border-gray-200 rounded-2xl p-6 text-left hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
              <span className="text-xl">📋</span>
            </div>
            <h2 className="font-semibold text-gray-900 mb-1">Historial</h2>
            <p className="text-sm text-gray-500">Consulta todas tus cotizaciones anteriores.</p>
          </button>

          {profile?.rol === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              className="bg-white border border-gray-200 rounded-2xl p-6 text-left hover:border-purple-300 hover:shadow-sm transition-all group"
            >
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                <span className="text-xl">⚙️</span>
              </div>
              <h2 className="font-semibold text-gray-900 mb-1">Panel Admin</h2>
              <p className="text-sm text-gray-500">Gestiona usuarios y cotizaciones del equipo.</p>
            </button>
          )}

        </div>
      </div>
    </div>
  )
}

export default Dashboard
