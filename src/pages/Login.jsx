import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await login(email, password)
    if (error) {
      setError('Correo o contraseña incorrectos')
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Panel izquierdo — solo desktop */}
      <div className="login-panel-left" style={{ flex: 1, background: '#0D1B2A', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', border: '1px solid rgba(46,107,230,0.2)' }} />
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', border: '1px solid rgba(46,107,230,0.15)' }} />
        <div style={{ position: 'absolute', bottom: '-100px', left: '-60px', width: '360px', height: '360px', borderRadius: '50%', border: '1px solid rgba(46,107,230,0.1)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 1 }}>
          <div style={{ width: '40px', height: '40px', background: '#2E6BE6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>Inmobiliaria Maqueda</span>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(46,107,230,0.15)', border: '1px solid rgba(46,107,230,0.3)', borderRadius: '20px', padding: '6px 14px', marginBottom: '24px' }}>
            <span style={{ fontSize: '12px', color: '#2E6BE6', fontWeight: '500' }}>Calculadora de Flipping</span>
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: '700', color: '#ffffff', margin: '0 0 16px', lineHeight: '1.2' }}>
            Evalúa propiedades<br />
            <span style={{ color: '#2E6BE6' }}>con precisión.</span>
          </h1>
          <p style={{ fontSize: '15px', color: '#6b87a8', margin: '0 0 40px', lineHeight: '1.7', maxWidth: '340px' }}>
            Calcula costos, adeudos y utilidad bruta en segundos. Toma mejores decisiones de inversión.
          </p>
          <div style={{ display: 'flex', gap: '32px' }}>
            {[
              { num: '100%', label: 'Cálculo automático' },
              { num: 'A·B·C', label: 'Niveles de oferta' },
              { num: '3 seg', label: 'Por cotización' },
            ].map(s => (
              <div key={s.num}>
                <p style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', margin: '0 0 4px' }}>{s.num}</p>
                <p style={{ fontSize: '12px', color: '#6b87a8', margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: '12px', color: '#3d5a73', position: 'relative', zIndex: 1 }}>© 2026 Inmobiliaria Maqueda. Acceso privado.</p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="login-panel-right" style={{ width: '480px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>

          {/* Logo solo móvil */}
          <div className="login-mobile-logo" style={{ display: 'none', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
            <div style={{ width: '36px', height: '36px', background: '#1B3A6B', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#0D1B2A', margin: 0 }}>Inmobiliaria Maqueda</p>
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>Calculadora de Flipping</p>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0D1B2A', margin: '0 0 8px' }}>Bienvenido</h2>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Correo electrónico</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', color: '#0D1B2A', outline: 'none', boxSizing: 'border-box', background: '#ffffff' }}
                placeholder="correo@ejemplo.com" required
                onFocus={e => e.target.style.borderColor = '#2E6BE6'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', color: '#0D1B2A', outline: 'none', boxSizing: 'border-box', background: '#ffffff' }}
                placeholder="••••••••" required
                onFocus={e => e.target.style.borderColor = '#2E6BE6'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', color: '#dc2626', margin: 0 }}>⚠️ {error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width: '100%', background: loading ? '#93afd4' : '#1B3A6B', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '13px', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { if (!loading) e.target.style.background = '#0D1B2A' }}
              onMouseLeave={e => { if (!loading) e.target.style.background = '#1B3A6B' }}
            >
              {loading ? 'Verificando...' : 'Iniciar sesión →'}
            </button>
          </form>

          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', margin: 0 }}>Acceso exclusivo para el equipo Maqueda</p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .login-panel-left { display: none !important; }
          .login-panel-right { width: 100% !important; padding: 32px 24px !important; background: #ffffff !important; }
          .login-mobile-logo { display: flex !important; }
        }
      `}</style>
    </div>
  )
}

export default Login