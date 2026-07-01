import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

const fmt = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)

const DetalleCotizacion = () => {
  const { id } = useParams()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [cotizacion, setCotizacion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchCotizacion() }, [id])

  const fetchCotizacion = async () => {
    const { data, error } = await supabase
      .from('quotations')
      .select('*, profiles(nombre, email)')
      .eq('id', id)
      .single()
    if (!error) setCotizacion(data)
    setLoading(false)
  }

  const handleEliminar = async () => {
    if (!confirm('¿Eliminar esta cotización? Esta acción no se puede deshacer.')) return
    setDeleting(true)
    const { error } = await supabase.from('quotations').delete().eq('id', id)
    if (!error) navigate('/historial')
    else alert('Error al eliminar: ' + error.message)
  }

  const getMapCoords = (url) => {
    if (!url) return null
    const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    return match ? { lat: match[1], lng: match[2] } : null
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px', color: '#9ca3af', fontSize: '14px' }}>Cargando...</div>
    </div>
  )

  if (!cotizacion) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px', color: '#9ca3af', fontSize: '14px' }}>Cotización no encontrada</div>
    </div>
  )

  const coords = getMapCoords(cotizacion.link_maps)
  const cardStyle = { background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', marginBottom: '16px' }
  const sectionTitle = { fontSize: '13px', fontWeight: '700', color: '#0D1B2A', margin: '0 0 16px', paddingBottom: '12px', borderBottom: '2px solid #f3f4f6', letterSpacing: '0.3px', textTransform: 'uppercase' }
  const rowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f9fafb' }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: '#0D1B2A', padding: '40px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px' }}>
          <div className="detalle-hero-inner" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <button
                onClick={() => navigate('/historial')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b87a8', fontSize: '13px', padding: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                ← Volver al historial
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '600', padding: '4px 12px', borderRadius: '20px', background: cotizacion.viable ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)', color: cotizacion.viable ? '#4ade80' : '#f87171', border: cotizacion.viable ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(248,113,113,0.3)', letterSpacing: '0.5px' }}>
                  {cotizacion.viable ? '✓ VIABLE' : '✗ NO VIABLE'}
                </span>
                <span style={{ fontSize: '11px', color: '#6b87a8', background: 'rgba(255,255,255,0.08)', padding: '4px 12px', borderRadius: '20px' }}>{cotizacion.tipo_inmueble}</span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
                {cotizacion.nombre_propietario || 'Sin nombre'}
              </h1>
              <p style={{ fontSize: '14px', color: '#6b87a8', margin: 0 }}>{cotizacion.direccion || 'Sin dirección'}</p>
            </div>
            <div className="detalle-btns" style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => navigate(`/editar-cotizacion/${id}`)}
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              >
                Editar
              </button>
              <button
                onClick={handleEliminar}
                disabled={deleting}
                style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,0.12)'}
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px' }}>
        <div className="detalle-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>

          {/* Columna izquierda */}
          <div>

            {/* Mapa */}
            {coords && (
              <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                <iframe width="100%" height="220" style={{ border: 0, display: 'block' }} loading="lazy"
                  src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=17&output=embed`} />
                <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>📍 {cotizacion.direccion}</p>
                  <a href={cotizacion.link_maps} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: '12px', color: '#2E6BE6', fontWeight: '600', textDecoration: 'none' }}>
                    Abrir en Maps →
                  </a>
                </div>
              </div>
            )}

            {/* Adeudos */}
            <div style={cardStyle}>
              <p style={sectionTitle}>Adeudos</p>
              {[
                { label: 'Adeudo LUZ', value: cotizacion.adeudo_luz },
                { label: 'Adeudo AGUA', value: cotizacion.adeudo_agua },
                { label: 'Adeudo PREDIAL', value: cotizacion.adeudo_predial },
                { label: 'Adeudo INFONAVIT', value: cotizacion.adeudo_infonavit },
              ].map(({ label, value }) => (
                <div key={label} style={rowStyle}>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>{label}</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#dc2626' }}>{fmt(value)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', marginTop: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#0D1B2A' }}>Total adeudos</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#dc2626' }}>{fmt(cotizacion.total_adeudos)}</span>
              </div>
            </div>

            {/* Costos operativos */}
            <div style={cardStyle}>
              <p style={sectionTitle}>Costos operativos</p>
              {[
                { label: 'Remodelación', value: cotizacion.costo_remodelacion },
                { label: 'Provisión ISR', value: cotizacion.costo_isr },
                { label: `Comisión vendedor (${cotizacion.comision_vendedor}%)`, value: cotizacion.precio_venta * (cotizacion.comision_vendedor / 100) },
                { label: 'Pago cerrador', value: cotizacion.pago_cerrador },
                { label: 'Pago prospección', value: cotizacion.pago_prospeccion },
                { label: 'Trámites varios', value: cotizacion.tramites_varios },
                { label: 'Cancelación hipoteca', value: cotizacion.cancelacion_hipoteca },
                { label: 'Otros gastos', value: cotizacion.otros_gastos },
              ].map(({ label, value }) => (
                <div key={label} style={rowStyle}>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>{label}</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{fmt(value)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', marginTop: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#0D1B2A' }}>Total costos operativos</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#374151' }}>{fmt(cotizacion.total_costos_operativos)}</span>
              </div>
            </div>

            {/* Notas */}
            {cotizacion.notes && (
              <div style={cardStyle}>
                <p style={sectionTitle}>Notas</p>
                <p style={{ fontSize: '14px', color: '#374151', margin: 0, lineHeight: '1.6' }}>{cotizacion.notas}</p>
              </div>
            )}

            {/* Info admin */}
            {profile?.rol === 'admin' && (
              <div style={{ ...cardStyle, background: '#f0f4ff', border: '1px solid #dbeafe' }}>
                <p style={{ fontSize: '12px', color: '#6b87a8', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.3px' }}>Creado por</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1B3A6B', margin: 0 }}>{cotizacion.profiles?.nombre || cotizacion.profiles?.email}</p>
                <p style={{ fontSize: '12px', color: '#6b87a8', margin: '4px 0 0' }}>{new Date(cotizacion.created_at).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            )}
          </div>

          {/* Panel resultados */}
          <div className="detalle-resultados" style={{ position: 'sticky', top: '80px' }}>
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af', margin: '0 0 20px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Resultados</p>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>Precio de venta</span>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#0D1B2A' }}>{fmt(cotizacion.precio_venta)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>Costo total</span>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#dc2626' }}>{fmt(cotizacion.costo_total)}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', padding: '16px 0', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Utilidad bruta</span>
                  <span style={{ fontSize: '18px', fontWeight: '700', color: cotizacion.utilidad_bruta >= 0 ? '#16a34a' : '#dc2626' }}>{fmt(cotizacion.utilidad_bruta)}</span>
                </div>
              </div>

              <div style={{ borderRadius: '10px', padding: '12px 16px', textAlign: 'center', marginBottom: '20px', background: cotizacion.viable ? '#f0fdf4' : '#fef2f2', border: cotizacion.viable ? '1px solid #bbf7d0' : '1px solid #fecaca' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: cotizacion.viable ? '#16a34a' : '#dc2626', letterSpacing: '0.5px' }}>
                  {cotizacion.viable ? '✓ VIABLE' : '✗ NO VIABLE'}
                </span>
              </div>

              <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 10px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Niveles de oferta</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: `Oferta A (${cotizacion.porcentaje_oferta_a}%)`, value: fmt(cotizacion.oferta_a), bg: '#EEF4FF', color: '#1B3A6B', border: '#dbeafe' },
                  { label: 'Oferta B', value: fmt(cotizacion.oferta_b), bg: '#f8fafc', color: '#0D1B2A', border: '#e5e7eb' },
                  { label: 'Oferta C', value: fmt(cotizacion.oferta_c), bg: '#f8fafc', color: '#0D1B2A', border: '#e5e7eb' },
                ].map(o => (
                  <div key={o.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: o.bg, borderRadius: '10px', padding: '12px 16px', border: `1px solid ${o.border}` }}>
                    <span style={{ fontSize: '12px', color: '#6b87a8', fontWeight: '500' }}>{o.label}</span>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: o.color }}>{o.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
  @media (max-width: 768px) {
    .detalle-hero-inner { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
    .detalle-btns { flex-direction: row !important; width: 100% !important; }
    .detalle-grid { grid-template-columns: 1fr !important; }
    .detalle-resultados { position: static !important; }
  }
`}</style>
    </div>
  )
}

export default DetalleCotizacion
