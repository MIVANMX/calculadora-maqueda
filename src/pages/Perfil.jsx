import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

const Perfil = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [nombre, setNombre] = useState(profile?.nombre || '')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loadingNombre, setLoadingNombre] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [msgNombre, setMsgNombre] = useState('')
  const [msgPassword, setMsgPassword] = useState('')
  const [errorPassword, setErrorPassword] = useState('')

  const handleNombre = async (e) => {
    e.preventDefault()
    setLoadingNombre(true)
    setMsgNombre('')
    const { error } = await supabase
      .from('profiles')
      .update({ nombre })
      .eq('id', profile.id)
    setLoadingNombre(false)
    if (!error) setMsgNombre('Nombre actualizado correctamente')
    else setMsgNombre('Error al actualizar')
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    setErrorPassword('')
    setMsgPassword('')
    if (password !== confirm) { setErrorPassword('Las contraseñas no coinciden'); return }
    if (password.length < 8) { setErrorPassword('Mínimo 8 caracteres'); return }
    setLoadingPassword(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoadingPassword(false)
    if (!error) { setMsgPassword('Contraseña actualizada correctamente'); setPassword(''); setConfirm('') }
    else setErrorPassword(error.message)
  }

  const inputStyle = { width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', color: '#0D1B2A', background: '#f8fafc', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, system-ui, sans-serif' }
  const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px', letterSpacing: '0.3px', textTransform: 'uppercase' }
  const cardStyle = { background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '28px', marginBottom: '16px' }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: '#0D1B2A', padding: '40px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b87a8', fontSize: '13px', padding: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ← Volver al inicio
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', background: '#2E6BE6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff' }}>{profile?.nombre?.charAt(0) || 'U'}</span>
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', margin: '0 0 4px', letterSpacing: '-0.5px' }}>{profile?.nombre}</h1>
              <p style={{ fontSize: '14px', color: '#6b87a8', margin: 0 }}>{profile?.email} · <span style={{ color: '#60a5fa' }}>{profile?.rol}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px' }}>

        {/* Cambiar nombre */}
        <div style={cardStyle}>
          <p style={{ fontSize: '15px', fontWeight: '700', color: '#0D1B2A', margin: '0 0 20px', paddingBottom: '14px', borderBottom: '2px solid #f3f4f6' }}>
            Información personal
          </p>
          <form onSubmit={handleNombre}>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Nombre completo</label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#2E6BE6'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Correo electrónico</label>
              <input
                type="text"
                value={profile?.email || ''}
                disabled
                style={{ ...inputStyle, background: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed' }}
              />
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '6px 0 0' }}>El correo no se puede cambiar.</p>
            </div>
            {msgNombre && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', color: '#16a34a', margin: 0 }}>✓ {msgNombre}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loadingNombre}
              style={{ background: loadingNombre ? '#93afd4' : '#1B3A6B', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '11px 24px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              onMouseEnter={e => { if (!loadingNombre) e.currentTarget.style.background = '#0D1B2A' }}
              onMouseLeave={e => { if (!loadingNombre) e.currentTarget.style.background = '#1B3A6B' }}
            >
              {loadingNombre ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </div>

        {/* Cambiar contraseña */}
        <div style={cardStyle}>
          <p style={{ fontSize: '15px', fontWeight: '700', color: '#0D1B2A', margin: '0 0 20px', paddingBottom: '14px', borderBottom: '2px solid #f3f4f6' }}>
            Cambiar contraseña
          </p>
          <form onSubmit={handlePassword}>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Nueva contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={inputStyle}
                placeholder="Mínimo 8 caracteres"
                onFocus={e => e.target.style.borderColor = '#2E6BE6'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Confirmar contraseña</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                style={inputStyle}
                placeholder="Repite tu contraseña"
                onFocus={e => e.target.style.borderColor = '#2E6BE6'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            {errorPassword && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', color: '#dc2626', margin: 0 }}>⚠️ {errorPassword}</p>
              </div>
            )}
            {msgPassword && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', color: '#16a34a', margin: 0 }}>✓ {msgPassword}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loadingPassword}
              style={{ background: loadingPassword ? '#93afd4' : '#1B3A6B', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '11px 24px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              onMouseEnter={e => { if (!loadingPassword) e.currentTarget.style.background = '#0D1B2A' }}
              onMouseLeave={e => { if (!loadingPassword) e.currentTarget.style.background = '#1B3A6B' }}
            >
              {loadingPassword ? 'Actualizando...' : 'Cambiar contraseña'}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}

export default Perfil
