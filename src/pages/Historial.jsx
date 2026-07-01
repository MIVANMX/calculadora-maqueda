import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

const fmt = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)

const POR_PAGINA = 10

const Historial = () => {
  const navigate = useNavigate()
  const [cotizaciones, setCotizaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)

  useEffect(() => { fetchCotizaciones() }, [])
  useEffect(() => { setPagina(1) }, [filtro, busqueda])

  const fetchCotizaciones = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setCotizaciones(data)
    setLoading(false)
  }

  const viables = cotizaciones.filter(c => c.viable).length
  const noViables = cotizaciones.filter(c => !c.viable).length

  const filtradas = cotizaciones.filter(c => {
    const matchFiltro = filtro === 'todas' ? true : filtro === 'viables' ? c.viable : !c.viable
    const matchBusqueda = busqueda === '' ? true :
      (c.nombre_propietario || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (c.direccion || '').toLowerCase().includes(busqueda.toLowerCase())
    return matchFiltro && matchBusqueda
  })

  const totalPaginas = Math.ceil(filtradas.length / POR_PAGINA)
  const paginadas = filtradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: '#0D1B2A', padding: '40px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#6b87a8', margin: '0 0 8px', letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: '500' }}>Historial</p>
              <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#ffffff', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Cotizaciones</h1>
              <p style={{ fontSize: '14px', color: '#6b87a8', margin: 0 }}>Registro completo de propiedades evaluadas</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '1px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 24px', textAlign: 'center' }}>
                  <p style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff', margin: '0 0 2px' }}>{cotizaciones.length}</p>
                  <p style={{ fontSize: '11px', color: '#6b87a8', margin: 0 }}>Total</p>
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
              </div>
              <button
                onClick={() => navigate('/nueva-cotizacion')}
                style={{ background: '#2E6BE6', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '13px 22px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                onMouseEnter={e => e.currentTarget.style.background = '#1B3A6B'}
                onMouseLeave={e => e.currentTarget.style.background = '#2E6BE6'}
              >
                + Nueva cotización
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px' }}>

        {/* Búsqueda y filtros */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o dirección..."
              style={{ width: '100%', padding: '10px 14px 10px 40px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', color: '#0D1B2A', background: '#ffffff', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#2E6BE6'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { key: 'todas', label: 'Todas' },
              { key: 'viables', label: 'Viables' },
              { key: 'no_viables', label: 'No viables' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFiltro(f.key)}
                style={{
                  padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                  border: filtro === f.key ? '1px solid #1B3A6B' : '1px solid #e5e7eb',
                  background: filtro === f.key ? '#1B3A6B' : '#ffffff',
                  color: filtro === f.key ? '#ffffff' : '#6b7280',
                  transition: 'all 0.15s',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resultados */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#9ca3af', fontSize: '14px' }}>Cargando...</div>
        ) : paginadas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#9ca3af', fontSize: '14px' }}>
            {busqueda ? `Sin resultados para "${busqueda}"` : 'No hay cotizaciones'}
          </div>
        ) : (
          <>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 12px' }}>
              Mostrando {(pagina - 1) * POR_PAGINA + 1}–{Math.min(pagina * POR_PAGINA, filtradas.length)} de {filtradas.length} cotizaciones
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {paginadas.map(c => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/cotizacion/${c.id}`)}
                  style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '20px 24px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#1B3A6B'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(13,27,42,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', background: c.viable ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: c.viable ? '#16a34a' : '#dc2626', border: c.viable ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(239,68,68,0.2)' }}>
                        {c.viable ? 'Viable' : 'No viable'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#9ca3af', background: '#f3f4f6', padding: '3px 10px', borderRadius: '20px' }}>{c.tipo_inmueble}</span>
                    </div>
                    <p style={{ fontSize: '15px', fontWeight: '600', color: '#0D1B2A', margin: '0 0 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nombre_propietario || 'Sin nombre'}</p>
                    <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.direccion || 'Sin dirección'}</p>
                    {c.notas && <p style={{ fontSize: '12px', color: '#b0b8c4', margin: '4px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Nota: {c.notas}</p>}
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
                    <div style={{ color: '#d1d5db', fontSize: '18px' }}>›</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
                <button
                  onClick={() => setPagina(p => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#ffffff', color: pagina === 1 ? '#d1d5db' : '#0D1B2A', fontSize: '13px', fontWeight: '500', cursor: pagina === 1 ? 'not-allowed' : 'pointer' }}
                >
                  ← Anterior
                </button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setPagina(n)}
                    style={{ width: '36px', height: '36px', borderRadius: '8px', border: pagina === n ? '1px solid #1B3A6B' : '1px solid #e5e7eb', background: pagina === n ? '#1B3A6B' : '#ffffff', color: pagina === n ? '#ffffff' : '#6b7280', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#ffffff', color: pagina === totalPaginas ? '#d1d5db' : '#0D1B2A', fontSize: '13px', fontWeight: '500', cursor: pagina === totalPaginas ? 'not-allowed' : 'pointer' }}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Historial