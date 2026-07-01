import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  const links = [
    { path: '/dashboard', label: 'Inicio' },
    { path: '/nueva-cotizacion', label: 'Nueva Cotización' },
    { path: '/historial', label: 'Historial' },
    ...(profile?.rol === 'admin' ? [{ path: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <>
      <nav style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 50, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: '#1B3A6B', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#0D1B2A' }}>Maqueda</span>
          </div>

          {/* Links desktop */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="nav-links-desktop">
            {links.map(({ path, label }) => (
              <Link key={path} to={path} style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '13px', textDecoration: 'none',
                fontWeight: isActive(path) ? '600' : '400',
                color: isActive(path) ? '#1B3A6B' : '#6b7280',
                background: isActive(path) ? '#f0f4ff' : 'transparent',
                border: isActive(path) ? '1px solid #dbeafe' : '1px solid transparent',
                transition: 'all 0.15s',
              }}>
                {label}
              </Link>
            ))}
          </div>

          {/* Usuario desktop */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="nav-user-desktop">
            <button onClick={() => navigate('/perfil')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '8px' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <div style={{ width: '30px', height: '30px', background: '#f0f4ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#1B3A6B' }}>{profile?.nombre?.charAt(0) || 'U'}</span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#0D1B2A' }}>{profile?.nombre}</span>
            </button>
            <span style={{ fontSize: '10px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px',
              background: profile?.rol === 'admin' ? '#f0f4ff' : '#f3f4f6',
              color: profile?.rol === 'admin' ? '#1B3A6B' : '#6b7280',
              border: profile?.rol === 'admin' ? '1px solid #dbeafe' : '1px solid #e5e7eb',
            }}>
              {profile?.rol}
            </span>
            <button onClick={handleLogout} style={{ fontSize: '13px', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: '8px' }}
              onMouseEnter={e => { e.target.style.color = '#dc2626'; e.target.style.background = '#fef2f2' }}
              onMouseLeave={e => { e.target.style.color = '#9ca3af'; e.target.style.background = 'none' }}
            >
              Salir
            </button>
          </div>

          {/* Hamburguesa móvil */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="nav-hamburger"
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}
          >
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0D1B2A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0D1B2A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>

        </div>

        {/* Menú móvil desplegable */}
        {menuOpen && (
          <div className="nav-mobile-menu" style={{ background: '#ffffff', borderTop: '1px solid #f3f4f6', padding: '12px 20px 20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
              {links.map(({ path, label }) => (
                <Link key={path} to={path} onClick={() => setMenuOpen(false)} style={{
                  padding: '12px 14px', borderRadius: '10px', fontSize: '14px', textDecoration: 'none', fontWeight: '500',
                  color: isActive(path) ? '#1B3A6B' : '#374151',
                  background: isActive(path) ? '#f0f4ff' : 'transparent',
                }}>
                  {label}
                </Link>
              ))}
            </div>
            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button onClick={() => { navigate('/perfil'); setMenuOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>
                <div style={{ width: '36px', height: '36px', background: '#f0f4ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#1B3A6B' }}>{profile?.nombre?.charAt(0) || 'U'}</span>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#0D1B2A', margin: 0 }}>{profile?.nombre}</p>
                  <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{profile?.rol}</p>
                </div>
              </button>
              <button onClick={handleLogout} style={{ fontSize: '13px', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontWeight: '500' }}>
                Salir
              </button>
            </div>
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .nav-user-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  )
}

export default Navbar