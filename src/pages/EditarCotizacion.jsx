import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import HojaCostos from '../components/HojaCostos'
import { PRESUPUESTO_MARKER } from '../lib/hojaCostos'

const parseNum = (val) => parseFloat(String(val).replace(/,/g, '')) || 0

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
  padding: '7px 10px',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  fontSize: '13px',
  color: '#0D1B2A',
  background: '#ffffff',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'Inter, system-ui, sans-serif',
}

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '600',
  color: '#475569',
  marginBottom: '4px',
  letterSpacing: '0.4px',
  textTransform: 'uppercase',
}

const EditarCotizacion = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(null)
  const [preguntas, setPreguntas] = useState([])
  const [respuestas, setRespuestas] = useState({})
  const [detalle, setDetalle] = useState({})

  const fetchCotizacion = async () => {
    const { data, error } = await supabase.from('quotations').select('*').eq('id', id).single()
    if (!error) {
      setForm({
        ...data,
        porcentaje_oferta_b: data.porcentaje_oferta_b ?? 60,
        porcentaje_oferta_c: data.porcentaje_oferta_c ?? 75,
      })
      const marker = (data.respuestas || []).find(r => r.pregunta_id === PRESUPUESTO_MARKER)
      if (marker) {
        try { setDetalle(JSON.parse(marker.respuesta) || {}) } catch { setDetalle({}) }
      }
      const map = {}
      ;(data.respuestas || []).forEach(r => { if (r.pregunta_id !== PRESUPUESTO_MARKER) map[r.pregunta_id] = r.respuesta })
      setRespuestas(map)
    }
    setLoading(false)
  }

  useEffect(() => { fetchCotizacion() }, [id])

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

  const handleCambioItem = (item, campo, valor) => {
    if (item.campo && campo === 'estimado') {
      setForm(f => ({ ...f, [item.campo]: valor }))
    }
    setDetalle(d => ({
      ...d,
      [item.id]: { ...(d[item.id] || {}), [campo]: valor },
    }))
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleGuardar = async () => {
    setSaving(true)
    const resultados = calcular(form)
    const { error } = await supabase.from('quotations').update({
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
      porcentaje_oferta_b: parseNum(form.porcentaje_oferta_b),
      porcentaje_oferta_c: parseNum(form.porcentaje_oferta_c),
      incremento_oferta_b: 0,
      incremento_oferta_c: 0,
      notas: form.notas,
      respuestas: [
        ...preguntas.map(p => ({
          pregunta_id: p.id,
          pregunta: p.pregunta,
          respuesta: respuestas[p.id] || '',
        })),
        { pregunta_id: PRESUPUESTO_MARKER, pregunta: 'Hoja de costos', respuesta: JSON.stringify(detalle) },
      ],
      ...resultados,
    }).eq('id', id)
    setSaving(false)
    if (!error) navigate(`/cotizacion/${id}`)
    else alert('Error al guardar: ' + error.message)
  }

  const getMapCoords = (url) => {
    if (!url) return null
    const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    return match ? { lat: match[1], lng: match[2] } : null
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px', color: '#9ca3af' }}>Cargando...</div>
    </div>
  )

  const resultados = calcular(form)
  const resumen = {
    totalAdeudos: resultados.total_adeudos,
    costosOperativos: resultados.total_costos_operativos,
    costoTotal: resultados.costo_total,
    utilidad: resultados.utilidad_bruta,
    viable: resultados.viable,
    ofertas: [
      { label: `Oferta A (${form.porcentaje_oferta_a}%)`, monto: resultados.oferta_a, ganancia: resultados.utilidad_bruta - resultados.oferta_a },
      { label: `Oferta B (${form.porcentaje_oferta_b}%)`, monto: resultados.oferta_b, ganancia: resultados.utilidad_bruta - resultados.oferta_b },
      { label: `Oferta C (${form.porcentaje_oferta_c}%)`, monto: resultados.oferta_c, ganancia: resultados.utilidad_bruta - resultados.oferta_c },
    ],
  }
  const coords = getMapCoords(form.link_maps)

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: '#0D1B2A', padding: '32px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px' }}>
          <button onClick={() => navigate(`/cotizacion/${id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b87a8', fontSize: '13px', padding: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ← Volver al detalle
          </button>
          <p style={{ fontSize: '12px', color: '#6b87a8', margin: '0 0 6px', letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: '500' }}>Edición</p>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#ffffff', margin: '0 0 4px', letterSpacing: '-0.5px' }}>Editar Cotización</h1>
          <p style={{ fontSize: '14px', color: '#6b87a8', margin: 0 }}>{form.nombre_propietario || 'Sin nombre'} — {form.direccion || 'Sin dirección'}</p>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 32px 40px' }}>

        {/* Datos de la propiedad — grid compacto */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '18px 20px', marginBottom: '16px' }}>
          <div className="prop-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px 16px' }}>
            <div className="prop-item">
              <label style={labelStyle}>Nombre del propietario</label>
              <input name="nombre_propietario" value={form.nombre_propietario || ''} onChange={handleChange} style={inputStyle} />
            </div>
            <div className="prop-item">
              <label style={labelStyle}>Dirección</label>
              <input name="direccion" value={form.direccion || ''} onChange={handleChange} style={inputStyle} />
            </div>
            <div className="prop-item">
              <label style={labelStyle}>Tipo de inmueble</label>
              <select name="tipo_inmueble" value={form.tipo_inmueble || 'Casa'} onChange={handleChange} style={inputStyle}>
                <option>Casa</option>
                <option>Dúplex</option>
                <option>Departamento</option>
              </select>
            </div>
            <div className="prop-item">
              <label style={labelStyle}>Precio de venta</label>
              <input name="precio_venta" type="text" value={form.precio_venta || ''} onChange={handleChange} style={inputStyle} />
            </div>
            <div className="prop-item span-2" style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Link Google Maps</label>
              <input name="link_maps" value={form.link_maps || ''} onChange={handleChange} style={inputStyle} placeholder="https://www.google.com/maps/place/..." />
            </div>
          </div>

          {coords && (
            <div style={{ marginTop: '12px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <iframe width="100%" height="160" style={{ border: 0, display: 'block' }} loading="lazy"
                src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=17&output=embed`} />
              <div style={{ padding: '6px 12px', background: '#f8fafc' }}>
                <a href={form.link_maps} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#2E6BE6', textDecoration: 'none', fontWeight: '500' }}>
                  📍 Abrir en Google Maps
                </a>
              </div>
            </div>
          )}

          {/* Parámetros de oferta */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
            {[
              { name: 'porcentaje_oferta_a', label: '% Oferta A' },
              { name: 'porcentaje_oferta_b', label: '% Oferta B' },
              { name: 'porcentaje_oferta_c', label: '% Oferta C' },
            ].map(({ name, label }) => (
              <div key={name}>
                <label style={labelStyle}>{label}</label>
                <input name={name} type="text" value={form[name] || ''} onChange={handleChange} style={{ ...inputStyle, width: '86px' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Hoja de costos */}
        <HojaCostos form={form} detalle={detalle} onCambio={handleCambioItem} resumen={resumen} />

        {/* Preguntas */}
        {preguntas.length > 0 && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px 20px', marginTop: '16px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#0D1B2A', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px' }}>Preguntas de evaluación</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {preguntas.map((p, index) => (
                <div key={p.id}>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: '#f0f4ff', color: '#1B3A6B', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px' }}>{index + 1}</span>
                    {p.pregunta}
                  </label>
                  <input
                    type="text"
                    value={respuestas[p.id] || ''}
                    onChange={e => handleRespuesta(p.id, e.target.value)}
                    style={inputStyle}
                    placeholder="Escribe tu respuesta..."
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notas */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px 20px', marginTop: '16px' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#0D1B2A', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px' }}>Notas</p>
          <textarea name="notas" value={form.notas || ''} onChange={handleChange}
            style={{ ...inputStyle, resize: 'none', height: '60px' }}
            placeholder="Observaciones, seguimiento, detalles importantes..." />
        </div>

        {/* Botón */}
        <button
          onClick={handleGuardar}
          disabled={saving}
          style={{ width: '100%', background: saving ? '#93afd4' : '#1B3A6B', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '13px', fontSize: '14px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.2s', marginTop: '20px' }}
          onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#0D1B2A' }}
          onMouseLeave={e => { if (!saving) e.currentTarget.style.background = '#1B3A6B' }}
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .prop-grid { grid-template-columns: 1fr !important; }
          .prop-item.span-2 { grid-column: span 1 !important; }
        }
      `}</style>
    </div>
  )
}

export default EditarCotizacion