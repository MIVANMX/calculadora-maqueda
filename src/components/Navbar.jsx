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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 flex items-center justify-between h-16">

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#1B3A6B' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span className="text-sm font-bold" style={{ color: '#0D1B2A' }}>Maqueda</span>
          </div>

          <div className="flex items-center gap-1">
            {[
              { path: '/dashboard', label: 'Inicio' },
              { path: '/nueva-cotizacion', label: 'Nueva Cotización' },
              { path: '/historial', label: 'Historial' },
              ...(profile?.rol === 'admin' ? [{ path: '/admin', label: 'Admin' }] : []),
            ].map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${isActive(path)
                    ? 'font-semibold bg-blue-50 border border-blue-100'
                    : 'font-normal text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                style={isActive(path) ? { color: '#1B3A6B' } : {}}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Usuario */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/perfil')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '8px', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50">
              <span className="text-xs font-semibold" style={{color: '#1B3A6B'}}>
                {profile?.nombre?.charAt(0) || 'U'}
              </span>
            </div>
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#0D1B2A' }}>{profile?.nombre}</span>
          </button>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide"
            style={profile?.rol === 'admin'
              ? {background: '#f0f4ff', color: '#1B3A6B', border: '1px solid #dbeafe'}
              : {background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb'}
            }>
            {profile?.rol}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-red-500 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-all"
          >
            Salir
          </button>
        </div>

      </div>
    </nav>
  )
}

export default Navbar