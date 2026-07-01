import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import Toast from '../components/Toast'
import Modal from '../components/Modal'
const fmt = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)

const EditarNombreUser = ({ usuario, onSuccess, onCancel }) => {
  const [nombre, setNombre] = useState(usuario.nombre || '')
  const [loading, setLoading] = useState(false)

  const handleGuardar = async (e) => {
    e.preventDefault()
    setLoading(true)
    await supabase.from('profiles').update({ nombre }).eq('id', usuario.id)
    setLoading(false)
    onSuccess()
  }

  return (
    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
      <form onSubmit={handleGuardar} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          style={{ flex: 1, padding: '9px 14px', border: '1.5px solid #2E6BE6', borderRadius: '10px', fontSize: '13px', color: '#0D1B2A', background: '#f8fafc', outline: 'none' }}
          placeholder="Nombre completo"
        />
        <button type="submit" disabled={loading}
          style={{ background: '#1B3A6B', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '9px 18px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" onClick={onCancel}
          style={{ background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '9px 18px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
          Cancelar
        </button>
      </form>
    </div>
  )
}

const InviteForm = ({ onSuccess }) => {
  const [email, setEmail] = useState('')
  const [nombre, setNombre] = useState('')
  const [rol, setRol] = useState('vendedor')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', color: '#0D1B2A', background: '#f8fafc', outline: 'none', boxSizing: 'border-box' }
  const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px', letterSpacing: '0.3px', textTransform: 'uppercase' }

  const handleInvite = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    setError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ email, nombre, rol }),
      })
      const result = await res.json()
      if (result.error) { setError(result.error); }
      else {
        setMsg(`Invitación enviada a ${email}`)
        setEmail('')
        setNombre('')
        setRol('vendedor')
        onSuccess()
      }
    } catch (err) {
      setError('Error al enviar la invitación')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleInvite}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 160px', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={labelStyle}>Nombre completo</label>
          <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} style={inputStyle} placeholder="Ej. Juan Pérez" required
            onFocus={e => e.target.style.borderColor = '#2E6BE6'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
        </div>
        <div>
          <label style={labelStyle}>Correo electrónico</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} placeholder="correo@ejemplo.com" required
            onFocus={e => e.target.style.borderColor = '#2E6BE6'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
        </div>
        <div>
          <label style={labelStyle}>Rol</label>
          <select value={rol} onChange={e => setRol(e.target.value)} style={inputStyle}>
            <option value="vendedor">Vendedor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {msg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', color: '#16a34a', margin: 0 }}>✓ {msg}</p>
        </div>
      )}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', color: '#dc2626', margin: 0 }}>⚠️ {error}</p>
        </div>
      )}

      <button type="submit" disabled={loading}
        style={{ background: loading ? '#93afd4' : '#1B3A6B', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '11px 24px', fontSize: '13px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#0D1B2A' }}
        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#1B3A6B' }}
      >
        {loading ? 'Enviando...' : 'Enviar invitación →'}
      </button>
    </form>
  )
}

const Admin = () => {
  const [editandoUser, setEditandoUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(false)
  const [toast, setToast] = useState(null)
  const [modal, setModal] = useState(null)
  const [cotizaciones, setCotizaciones] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [vista, setVista] = useState('cotizaciones')
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const POR_PAGINA = 10

  useEffect(() => { fetchData() }, [])
  useEffect(() => { setPagina(1) }, [busqueda, vista])

  const fetchData = async () => {
    setLoading(true)
    const [{ data: cots }, { data: users }] = await Promise.all([
      supabase.from('quotations').select('*, profiles(nombre, email)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false })
    ])
    if (cots) setCotizaciones(cots)
    if (users) setUsuarios(users)
    setLoading(false)
  }

  const eliminarCotizacion = async (id, e) => {
    e.stopPropagation()
    if (!confirm('¿Eliminar esta cotización?')) return
    const { error } = await supabase.from('quotations').delete().eq('id', id)
    if (!error) setCotizaciones(cotizaciones.filter(c => c.id !== id))
  }

  const viables = cotizaciones.filter(c => c.viable).length
  const noViables = cotizaciones.filter(c => !c.viable).length

  const cotizacionesFiltradas = cotizaciones.filter(c =>
    busqueda === '' ? true :
      (c.nombre_propietario || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (c.direccion || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (c.profiles?.nombre || '').toLowerCase().includes(busqueda.toLowerCase())
  )

  const totalPaginas = Math.ceil(cotizacionesFiltradas.length / POR_PAGINA)
  const paginadas = cotizacionesFiltradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  const showToast = (message, type = 'success') => setToast({ message, type })
  const showModal = (title, message, onConfirm, danger = false, confirmText = 'Confirmar') => {
    setModal({ title, message, onConfirm, danger, confirmText })
  }

  const handleCambiarRol = async (userId, rolActual) => {
    const nuevoRol = rolActual === 'admin' ? 'vendedor' : 'admin'
    showModal(
      'Cambiar rol',
      `¿Cambiar el rol de este usuario a ${nuevoRol}?`,
      async () => {
        setModal(null)
        setLoadingUser(userId)
        const { error } = await supabase.from('profiles').update({ rol: nuevoRol }).eq('id', userId)
        if (!error) showToast(`Rol cambiado a ${nuevoRol} correctamente`)
        else showToast('Error al cambiar el rol', 'error')
        await fetchData()
        setLoadingUser(null)
      },
      false,
      `Hacer ${nuevoRol}`
    )
  }

  const handleEliminarUsuario = async (userId, email) => {
    showModal(
      'Eliminar usuario',
      `¿Estás seguro de eliminar a ${email}? Esta acción no se puede deshacer.`,
      async () => {
        setModal(null)
        setLoadingUser(userId)
        const { error } = await supabase.from('profiles').delete().eq('id', userId)
        if (!error) showToast('Usuario eliminado correctamente')
        else showToast('Error al eliminar el usuario', 'error')
        await fetchData()
        setLoadingUser(null)
      },
      true,
      'Eliminar'
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {modal && <Modal title={modal.title} message={modal.message} onConfirm={modal.onConfirm} onCancel={() => setModal(null)} danger={modal.danger} confirmText={modal.confirmText} />}
      <Navbar />

      {/* Hero */}
      <div style={{ background: '#0D1B2A', padding: '40px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#6b87a8', margin: '0 0 8px', letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: '500' }}>Administración</p>
              <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#ffffff', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Panel Admin</h1>
              <p style={{ fontSize: '14px', color: '#6b87a8', margin: 0 }}>Gestión global del sistema</p>
            </div>
            <div style={{ display: 'flex', gap: '1px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff', margin: '0 0 2px' }}>{cotizaciones.length}</p>
                <p style={{ fontSize: '11px', color: '#6b87a8', margin: 0 }}>Cotizaciones</p>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: '22px', fontWeight: '700', color: '#4ade80', margin: '0 0 2px' }}>{viables}</p>
                <p style={{ fontSize: '11px', color: '#6b87a8', margin: 0 }}>Viables</p>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: '22px', fontWeight: '700', color: '#f87171', margin: '0 0 2px' }}>{noViables}</p>
                <p style={{ fontSize: '11px', color: '#6b87a8', margin: 0 }}>No viables</p>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: '22px', fontWeight: '700', color: '#60a5fa', margin: '0 0 2px' }}>{usuarios.length}</p>
                <p style={{ fontSize: '11px', color: '#6b87a8', margin: 0 }}>Usuarios</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '24px' }}>
          {[
            { key: 'cotizaciones', label: `Cotizaciones (${cotizaciones.length})` },
            { key: 'usuarios', label: `Usuarios (${usuarios.length})` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setVista(t.key)}
              style={{
                padding: '9px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                border: vista === t.key ? '1px solid #1B3A6B' : '1px solid #e5e7eb',
                background: vista === t.key ? '#1B3A6B' : '#ffffff',
                color: vista === t.key ? '#ffffff' : '#6b7280',
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#9ca3af', fontSize: '14px' }}>Cargando...</div>
        ) : vista === 'cotizaciones' ? (
          <>
            {/* Búsqueda */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar por propietario, dirección o vendedor..."
                style={{ width: '100%', padding: '10px 14px 10px 40px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', color: '#0D1B2A', background: '#ffffff', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#2E6BE6'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {paginadas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px', color: '#9ca3af', fontSize: '14px' }}>No hay cotizaciones</div>
            ) : (
              <>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 12px' }}>
                  Mostrando {(pagina - 1) * POR_PAGINA + 1}–{Math.min(pagina * POR_PAGINA, cotizacionesFiltradas.length)} de {cotizacionesFiltradas.length} cotizaciones
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {paginadas.map(c => (
                    <div key={c.id} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#1B3A6B'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(13,27,42,0.08)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', background: c.viable ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: c.viable ? '#16a34a' : '#dc2626', border: c.viable ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(239,68,68,0.2)' }}>
                            {c.viable ? 'Viable' : 'No viable'}
                          </span>
                          <span style={{ fontSize: '11px', color: '#9ca3af', background: '#f3f4f6', padding: '3px 10px', borderRadius: '20px' }}>{c.tipo_inmueble}</span>
                          <span style={{ fontSize: '11px', color: '#1B3A6B', background: '#f0f4ff', padding: '3px 10px', borderRadius: '20px', fontWeight: '500' }}>
                            👤 {c.profiles?.nombre || c.profiles?.email}
                          </span>
                        </div>
                        <p style={{ fontSize: '15px', fontWeight: '600', color: '#0D1B2A', margin: '0 0 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nombre_propietario || 'Sin nombre'}</p>
                        <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.direccion || 'Sin dirección'}</p>
                      </div>

                      <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 3px' }}>Precio venta</p>
                          <p style={{ fontSize: '15px', fontWeight: '700', color: '#0D1B2A', margin: 0 }}>{fmt(c.precio_venta)}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 3px' }}>Utilidad bruta</p>
                          <p style={{ fontSize: '15px', fontWeight: '700', color: c.utilidad_bruta >= 0 ? '#16a34a' : '#dc2626', margin: 0 }}>{fmt(c.utilidad_bruta)}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 3px' }}>Oferta A</p>
                          <p style={{ fontSize: '15px', fontWeight: '700', color: '#2E6BE6', margin: 0 }}>{fmt(c.oferta_a)}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 3px' }}>Fecha</p>
                          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{new Date(c.created_at).toLocaleDateString('es-MX')}</p>
                        </div>
                        <button
                          onClick={(e) => eliminarCotizacion(c.id, e)}
                          style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                          onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginación */}
                {totalPaginas > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
                    <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#ffffff', color: pagina === 1 ? '#d1d5db' : '#0D1B2A', fontSize: '13px', fontWeight: '500', cursor: pagina === 1 ? 'not-allowed' : 'pointer' }}>
                      ← Anterior
                    </button>
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
                      <button key={n} onClick={() => setPagina(n)}
                        style={{ width: '36px', height: '36px', borderRadius: '8px', border: pagina === n ? '1px solid #1B3A6B' : '1px solid #e5e7eb', background: pagina === n ? '#1B3A6B' : '#ffffff', color: pagina === n ? '#ffffff' : '#6b7280', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                        {n}
                      </button>
                    ))}
                    <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#ffffff', color: pagina === totalPaginas ? '#d1d5db' : '#0D1B2A', fontSize: '13px', fontWeight: '500', cursor: pagina === totalPaginas ? 'not-allowed' : 'pointer' }}>
                      Siguiente →
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          /* Vista usuarios */
          <div>
            {/* Formulario invitar */}
            <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '28px', marginBottom: '20px' }}>
              <p style={{ fontSize: '15px', fontWeight: '700', color: '#0D1B2A', margin: '0 0 20px', paddingBottom: '14px', borderBottom: '2px solid #f3f4f6' }}>
                Invitar nuevo usuario
              </p>
              <InviteForm onSuccess={fetchData} />
            </div>

            {/* Lista usuarios */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {usuarios.map(u => (
                <div key={u.id} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '20px 24px', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#1B3A6B'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(13,27,42,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '16px', fontWeight: '700', color: '#1B3A6B' }}>{u.nombre?.charAt(0) || 'U'}</span>
                      </div>
                      <div>
                        <p style={{ fontSize: '15px', fontWeight: '600', color: '#0D1B2A', margin: '0 0 3px' }}>{u.nombre}</p>
                        <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>{u.email}</p>
                        <p style={{ fontSize: '11px', color: '#b0b8c4', margin: '2px 0 0' }}>Desde {new Date(u.created_at).toLocaleDateString('es-MX')}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', padding: '4px 14px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px',
                        background: u.rol === 'admin' ? '#f0f4ff' : '#f3f4f6',
                        color: u.rol === 'admin' ? '#1B3A6B' : '#6b7280',
                        border: u.rol === 'admin' ? '1px solid #dbeafe' : '1px solid #e5e7eb',
                      }}>
                        {u.rol}
                      </span>

                      <button
                        onClick={() => handleCambiarRol(u.id, u.rol)}
                        disabled={loadingUser === u.id}
                        style={{ background: '#f0f4ff', border: '1px solid #dbeafe', color: '#1B3A6B', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
                        onMouseLeave={e => e.currentTarget.style.background = '#f0f4ff'}
                      >
                        {u.rol === 'admin' ? 'Hacer vendedor' : 'Hacer admin'}
                      </button>

                      <button
                        onClick={() => setEditandoUser(editandoUser === u.id ? null : u.id)}
                        style={{ background: '#f8fafc', border: '1px solid #e5e7eb', color: '#6b7280', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                        onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                      >
                        Editar nombre
                      </button>

                      <button
                        onClick={() => handleEliminarUsuario(u.id, u.email)}
                        disabled={loadingUser === u.id}
                        style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {/* Panel editar nombre */}
                  {editandoUser === u.id && (
                    <EditarNombreUser
                      usuario={u}
                      onSuccess={() => { fetchData(); setEditandoUser(null) }}
                      onCancel={() => setEditandoUser(null)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin