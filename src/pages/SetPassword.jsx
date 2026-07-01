import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const SetPassword = () => {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true)
      }
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false) }
    else navigate('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px', background: '#1B3A6B', borderRadius: '14px', marginBottom: '20px' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0D1B2A', margin: '0 0 6px' }}>Inmobiliaria Maqueda</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Configura tu contraseña</p>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '36px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#0D1B2A', margin: '0 0 8px' }}>Nueva contraseña</h2>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 24px' }}>Elige una contraseña segura para tu cuenta.</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', color: '#0D1B2A', outline: 'none', boxSizing: 'border-box', background: '#f9fafb' }}
                placeholder="Mínimo 8 caracteres"
                required
                onFocus={e => e.target.style.borderColor = '#2E6BE6'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Confirmar contraseña</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', color: '#0D1B2A', outline: 'none', boxSizing: 'border-box', background: '#f9fafb' }}
                placeholder="Repite tu contraseña"
                required
                onFocus={e => e.target.style.borderColor = '#2E6BE6'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', color: '#dc2626', margin: 0 }}>⚠️ {error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !ready}
              style={{ width: '100%', background: loading ? '#93afd4' : '#1B3A6B', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '13px', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { if (!loading) e.target.style.background = '#0D1B2A' }}
              onMouseLeave={e => { if (!loading) e.target.style.background = '#1B3A6B' }}
            >
              {loading ? 'Guardando...' : 'Guardar contraseña →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SetPassword
