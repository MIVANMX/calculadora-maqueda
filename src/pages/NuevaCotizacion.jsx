import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import Toast from '../components/Toast'

const parseNum = (val) => parseFloat(String(val).replace(/,/g, '')) || 0
const fmt = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)

const defaultCostos = {
  costos_operativos: 0,
  porcentaje_oferta_a: 30,
  porcentaje_oferta_b: 60,
  porcentaje_oferta_c: 75,
}


const calcular = (form) => {
  const precio = parseNum(form.precio_venta)
  const luz = parseNum(form.adeudo_luz)
  const agua = parseNum(form.adeudo_agua)
  const predial = parseNum(form.adeudo_predial)
  const infonavit = parseNum(form.adeudo_infonavit)
  const total_adeudos = luz + agua + predial + infonavit
  const total_costos_operativos = parseNum(form.costos_operativos)
  const costo_total = total_adeudos + total_costos_operativos
  const utilidad_bruta = precio - costo_total
  const viable = utilidad_bruta > 0
  const oferta_a = utilidad_bruta * (parseNum(form.porcentaje_oferta_a) / 100)
  const oferta_b = utilidad_bruta * (parseNum(form.porcentaje_oferta_b) / 100)
  const oferta_c = utilidad_bruta * (parseNum(form.porcentaje_oferta_c) / 100)
  return { total_adeudos, total_costos_operativos, costo_total, utilidad_bruta, viable, oferta_a, oferta_b, oferta_c }
}

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  border: '1.5px solid #e5e7eb',
  borderRadius: '10px',
  fontSize: '14px',
  color: '#0D1B2A',
  background: '#f8fafc',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'all 0.15s',
  fontFamily: 'Inter, system-ui, sans-serif',
}

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '6px',
  letterSpacing: '0.3px',
  textTransform: 'uppercase',
}

const cardStyle = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '16px',
  padding: '28px',
  marginBottom: '16px',
}

const sectionTitle = {
  fontSize: '14px',
  fontWeight: '700',
  color: '#0D1B2A',
  margin: '0 0 20px',
  paddingBottom: '14px',
  borderBottom: '2px solid #f3f4f6',
  letterSpacing: '-0.2px',
}

const NuevaCotizacion = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [preguntas, setPreguntas] = useState([])
  const [respuestas, setRespuestas] = useState({})
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => setToast({ message, type })
  const [form, setForm] = useState({
    nombre_propietario: '', direccion: '', link_maps: '', tipo_inmueble: 'Casa',
    precio_venta: '', adeudo_luz: '', adeudo_agua: '', adeudo_predial: '', adeudo_infonavit: '',
    notas: '',
    costos_operativos: '',
    porcentaje_oferta_a: 30,
    porcentaje_oferta_b: 60,
    porcentaje_oferta_c: 75,
  })

  useEffect(() => {
    const fetchPreguntas = async () => {
      const { data } = await supabase
        .from('questions')
        .select('*')
        .eq('activa', true)
        .order('orden', { ascending: true })
      if (data) setPreguntas(data)
    }
    fetchPreguntas()
  }, [])

  const handleRespuesta = (id, valor) => {
    setRespuestas({ ...respuestas, [id]: valor })
  }

  const resultados = calcular(form)
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleGuardar = async () => {
    // Validar que todas las preguntas estén respondidas
    const sinResponder = preguntas.filter(p => !respuestas[p.id] || respuestas[p.id].trim() === '')
    if (sinResponder.length > 0) {
      showToast(`Debes responder todas las preguntas antes de guardar`, 'error')
      return
    }
    setSaving(true)
    const { error } = await supabase.from('quotations').insert({
      user_id: user.id,
      nombre_propietario: form.nombre_propietario,
      direccion: form.direccion,
      link_maps: form.link_maps,
      tipo_inmueble: form.tipo_inmueble,
      precio_venta: parseNum(form.precio_venta),
      adeudo_luz: parseNum(form.adeudo_luz),
      adeudo_agua: parseNum(form.adeudo_agua),
      adeudo_predial: parseNum(form.adeudo_predial),
      adeudo_infonavit: parseNum(form.adeudo_infonavit),
      costos_operativos: parseNum(form.costos_operativos),
      costo_remodelacion: 0,
      costo_isr: 0,
      comision_vendedor: 0,
      pago_cerrador: 0,
      pago_prospeccion: 0,
      tramites_varios: 0,
      cancelacion_hipoteca: 0,
      otros_gastos: 0,
      porcentaje_oferta_a: parseNum(form.porcentaje_oferta_a),
      incremento_oferta_b: 0,
      incremento_oferta_c: 0,
      notas: form.notas,
      respuestas: preguntas.map(p => ({
        pregunta_id: p.id,
        pregunta: p.pregunta,
        respuesta: respuestas[p.id] || '',
      })),
      ...resultados,
    })
    setSaving(false)
    if (!error) navigate('/historial')
    else alert('Error al guardar: ' + error.message)
  }

  const getMapCoords = (url) => {
    if (!url) return null
    const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    return match ? { lat: match[1], lng: match[2] } : null
  }

  const coords = getMapCoords(form.link_maps)

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Navbar />

      {/* Hero */}
      <div className="cotizacion-hero" style={{ background: '#0D1B2A', padding: '40px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px' }}>
          <p style={{ fontSize: '12px', color: '#6b87a8', margin: '0 0 8px', letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: '500' }}>Nueva evaluación</p>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#ffffff', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Nueva Cotización</h1>
          <p style={{ fontSize: '14px', color: '#6b87a8', margin: 0 }}>Ingresa los datos de la propiedad para calcular su viabilidad</p>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px' }}>
        <div className="cotizacion-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>

          {/* Columna izquierda */}
          <div>

            {/* Datos de la propiedad */}
            <div style={cardStyle}>
              <p style={sectionTitle}>Datos de la propiedad</p>
              <div className="cotizacion-campos-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Nombre del propietario</label>
                  <input name="nombre_propietario" value={form.nombre_propietario} onChange={handleChange} style={inputStyle} placeholder="Ej. Juan Pérez García"
                    onFocus={e => e.target.style.borderColor = '#2E6BE6'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Dirección</label>
                  <input name="direccion" value={form.direccion} onChange={handleChange} style={inputStyle} placeholder="Calle, número, colonia, ciudad"
                    onFocus={e => e.target.style.borderColor = '#2E6BE6'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Link Google Maps</label>
                  <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 6px' }}>Copia el link desde la barra del navegador (no uses el botón compartir)</p>
                  <input name="link_maps" value={form.link_maps} onChange={handleChange} style={inputStyle} placeholder="https://www.google.com/maps/place/..."
                    onFocus={e => e.target.style.borderColor = '#2E6BE6'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  {coords && (
                    <div style={{ marginTop: '12px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                      <iframe width="100%" height="180" style={{ border: 0, display: 'block' }} loading="lazy"
                        src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=17&output=embed`} />
                      <div style={{ padding: '8px 12px', background: '#f8fafc' }}>
                        <a href={form.link_maps} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#2E6BE6', textDecoration: 'none', fontWeight: '500' }}>
                          📍 Abrir en Google Maps
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Tipo de inmueble</label>
                  <select name="tipo_inmueble" value={form.tipo_inmueble} onChange={handleChange} style={inputStyle}>
                    <option>Casa</option>
                    <option>Dúplex</option>
                    <option>Departamento</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Precio de venta</label>
                  <input name="precio_venta" type="text" value={form.precio_venta} onChange={handleChange} style={inputStyle} placeholder="620,000"
                    onFocus={e => e.target.style.borderColor = '#2E6BE6'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                </div>
              </div>
            </div>

            {/* Adeudos */}
            <div style={cardStyle}>
              <p style={sectionTitle}>Adeudos</p>
              <div className="cotizacion-campos-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  { name: 'adeudo_luz', label: 'Adeudo LUZ' },
                  { name: 'adeudo_agua', label: 'Adeudo AGUA' },
                  { name: 'adeudo_predial', label: 'Adeudo PREDIAL' },
                  { name: 'adeudo_infonavit', label: 'Adeudo INFONAVIT' },
                ].map(({ name, label }) => (
                  <div key={name}>
                    <label style={labelStyle}>{label}</label>
                    <input name={name} type="text" value={form[name]} onChange={handleChange} style={inputStyle} placeholder="0"
                      onFocus={e => e.target.style.borderColor = '#2E6BE6'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  </div>
                ))}
              </div>
            </div>

            {/* Costos operativos */}
            <div style={cardStyle}>
              <p style={sectionTitle}>Costos operativos</p>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 16px' }}>
                Ingresa el total de todos los costos operativos del proyecto (remodelación, ISR, comisiones, trámites, etc.)
              </p>
              <div>
                <label style={labelStyle}>Total costos operativos</label>
                <input name="costos_operativos" type="text" value={form.costos_operativos} onChange={handleChange} style={inputStyle} placeholder="0"
                  onFocus={e => e.target.style.borderColor = '#2E6BE6'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              </div>
            </div>

            {/* Parámetros de oferta */}
            <div style={cardStyle}>
              <p style={sectionTitle}>Parámetros de oferta</p>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 16px' }}>
                Porcentaje de la utilidad bruta que se ofrecerá en cada nivel.
              </p>
              <div className="cotizacion-campos-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>% Oferta A</label>
                  <input name="porcentaje_oferta_a" type="text" value={form.porcentaje_oferta_a} onChange={handleChange} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#2E6BE6'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                </div>
                <div>
                  <label style={labelStyle}>% Oferta B</label>
                  <input name="porcentaje_oferta_b" type="text" value={form.porcentaje_oferta_b} onChange={handleChange} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#2E6BE6'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                </div>
                <div>
                  <label style={labelStyle}>% Oferta C</label>
                  <input name="porcentaje_oferta_c" type="text" value={form.porcentaje_oferta_c} onChange={handleChange} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#2E6BE6'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                </div>
              </div>
            </div>

            {/* Preguntas */}
            {preguntas.length > 0 && (
              <div style={cardStyle}>
                <p style={sectionTitle}>Preguntas de evaluación</p>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 20px' }}>
                  Responde todas las preguntas antes de guardar la cotización.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {preguntas.map((p, index) => (
                    <div key={p.id}>
                      <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ background: '#f0f4ff', color: '#1B3A6B', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px' }}>{index + 1}</span>
                        {p.pregunta}
                        <span style={{ color: '#dc2626', fontSize: '12px' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={respuestas[p.id] || ''}
                        onChange={e => handleRespuesta(p.id, e.target.value)}
                        style={inputStyle}
                        placeholder="Escribe tu respuesta..."
                        required
                        onFocus={e => e.target.style.borderColor = '#2E6BE6'}
                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notas */}
            <div style={cardStyle}>
              <p style={sectionTitle}>Notas</p>
              <textarea name="notas" value={form.notas} onChange={handleChange}
                style={{ ...inputStyle, resize: 'none', height: '90px' }}
                placeholder="Observaciones, seguimiento, detalles importantes..."
                onFocus={e => e.target.style.borderColor = '#2E6BE6'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>

          </div>

          {/* Panel de resultados sticky */}
          <div className="cotizacion-resultados" style={{ position: 'sticky', top: '80px' }}>
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 20px', letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: '600' }}>Resultados</p>

              {/* Desglose */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {[
                  { label: 'Total adeudos', value: fmt(resultados.total_adeudos), color: '#dc2626' },
                  { label: 'Costos operativos', value: fmt(resultados.total_costos_operativos), color: '#dc2626' },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>{r.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: r.color }}>{r.value}</span>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div style={{ borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', padding: '16px 0', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>Costo total</span>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#dc2626' }}>{fmt(resultados.costo_total)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>Utilidad bruta</span>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: resultados.utilidad_bruta >= 0 ? '#16a34a' : '#dc2626' }}>{fmt(resultados.utilidad_bruta)}</span>
                </div>
              </div>

              {/* Badge viabilidad */}
              <div style={{ borderRadius: '10px', padding: '12px 16px', textAlign: 'center', marginBottom: '20px', background: resultados.viable ? '#f0fdf4' : '#fef2f2', border: resultados.viable ? '1px solid #bbf7d0' : '1px solid #fecaca' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: resultados.viable ? '#16a34a' : '#dc2626', letterSpacing: '0.5px' }}>
                  {resultados.viable ? '✓ VIABLE' : '✗ NO VIABLE'}
                </span>
              </div>

              {/* Ofertas */}
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 10px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Niveles de oferta</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                {[
                  { label: `Oferta A (${form.porcentaje_oferta_a}%)`, oferta: resultados.oferta_a },
                  { label: `Oferta B (${form.porcentaje_oferta_b}%)`, oferta: resultados.oferta_b },
                  { label: `Oferta C (${form.porcentaje_oferta_c}%)`, oferta: resultados.oferta_c },
                ].map(o => (
                  <div key={o.label} style={{ borderRadius: '10px', padding: '12px 16px', border: '1px solid #dbeafe', background: '#EEF4FF' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>{o.label}</span>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: '#1B3A6B' }}>{fmt(o.oferta)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #dbeafe', paddingTop: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>Ganancia Maqueda</span>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: resultados.utilidad_bruta - o.oferta >= 0 ? '#16a34a' : '#dc2626' }}>
                        {fmt(resultados.utilidad_bruta - o.oferta)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleGuardar}
                disabled={saving}
                style={{ width: '100%', background: saving ? '#93afd4' : '#1B3A6B', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '13px', fontSize: '14px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.2s', letterSpacing: '0.2px' }}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#0D1B2A' }}
                onMouseLeave={e => { if (!saving) e.currentTarget.style.background = '#1B3A6B' }}
              >
                {saving ? 'Guardando...' : 'Guardar cotización'}
              </button>
            </div>
          </div>

        </div>
      </div>

      <style>{`
  @media (max-width: 768px) {
    .cotizacion-grid { grid-template-columns: 1fr !important; }
    .cotizacion-resultados { position: static !important; }
    .cotizacion-hero { padding: 28px 20px !important; }
    .cotizacion-campos-2 { grid-template-columns: 1fr !important; }
    .cotizacion-campos-3 { grid-template-columns: 1fr !important; }
  }
`}</style>
    </div>
  )
}

export default NuevaCotizacion
