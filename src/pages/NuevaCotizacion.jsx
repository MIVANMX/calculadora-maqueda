import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

const parseNum = (val) => parseFloat(String(val).replace(/,/g, '')) || 0
const fmt = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)

const defaultCostos = {
  costo_remodelacion: 55000,
  costo_isr: 30000,
  comision_vendedor: 2.5,
  pago_cerrador: 10000,
  pago_prospeccion: 1000,
  tramites_varios: 6300,
  cancelacion_hipoteca: 5000,
  otros_gastos: 5000,
  porcentaje_oferta_a: 45,
  incremento_oferta_b: 5000,
  incremento_oferta_c: 2500,
}

const calcular = (form) => {
  const precio = parseNum(form.precio_venta)
  const luz = parseNum(form.adeudo_luz)
  const agua = parseNum(form.adeudo_agua)
  const predial = parseNum(form.adeudo_predial)
  const infonavit = parseNum(form.adeudo_infonavit)
  const total_adeudos = luz + agua + predial + infonavit
  const comision = precio * (parseNum(form.comision_vendedor) / 100)
  const total_costos_operativos =
    parseNum(form.costo_remodelacion) + parseNum(form.costo_isr) + comision +
    parseNum(form.pago_cerrador) + parseNum(form.pago_prospeccion) +
    parseNum(form.tramites_varios) + parseNum(form.cancelacion_hipoteca) + parseNum(form.otros_gastos)
  const costo_total = total_adeudos + total_costos_operativos
  const utilidad_bruta = precio - costo_total
  const viable = utilidad_bruta > 0
  const oferta_a = utilidad_bruta * (parseNum(form.porcentaje_oferta_a) / 100)
  const oferta_b = oferta_a + parseNum(form.incremento_oferta_b)
  const oferta_c = oferta_b + parseNum(form.incremento_oferta_c)
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
  const [form, setForm] = useState({
    nombre_propietario: '', direccion: '', link_maps: '', tipo_inmueble: 'Casa',
    precio_venta: '', adeudo_luz: '', adeudo_agua: '', adeudo_predial: '', adeudo_infonavit: '',
    notas: '', ...defaultCostos,
  })

  const resultados = calcular(form)
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleGuardar = async () => {
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
      costo_remodelacion: parseNum(form.costo_remodelacion),
      costo_isr: parseNum(form.costo_isr),
      comision_vendedor: parseNum(form.comision_vendedor),
      pago_cerrador: parseNum(form.pago_cerrador),
      pago_prospeccion: parseNum(form.pago_prospeccion),
      tramites_varios: parseNum(form.tramites_varios),
      cancelacion_hipoteca: parseNum(form.cancelacion_hipoteca),
      otros_gastos: parseNum(form.otros_gastos),
      porcentaje_oferta_a: parseNum(form.porcentaje_oferta_a),
      incremento_oferta_b: parseNum(form.incremento_oferta_b),
      incremento_oferta_c: parseNum(form.incremento_oferta_c),
      notas: form.notas,
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
      <Navbar />

      {/* Hero */}
      <div style={{ background: '#0D1B2A', padding: '40px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px' }}>
          <p style={{ fontSize: '12px', color: '#6b87a8', margin: '0 0 8px', letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: '500' }}>Nueva evaluación</p>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#ffffff', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Nueva Cotización</h1>
          <p style={{ fontSize: '14px', color: '#6b87a8', margin: 0 }}>Ingresa los datos de la propiedad para calcular su viabilidad</p>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>

          {/* Columna izquierda */}
          <div>

            {/* Datos de la propiedad */}
            <div style={cardStyle}>
              <p style={sectionTitle}>Datos de la propiedad</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  { name: 'costo_remodelacion', label: 'Remodelación' },
                  { name: 'costo_isr', label: 'Provisión ISR' },
                  { name: 'comision_vendedor', label: 'Comisión vendedor (%)' },
                  { name: 'pago_cerrador', label: 'Pago cerrador' },
                  { name: 'pago_prospeccion', label: 'Pago prospección' },
                  { name: 'tramites_varios', label: 'Trámites varios' },
                  { name: 'cancelacion_hipoteca', label: 'Cancelación hipoteca' },
                  { name: 'otros_gastos', label: 'Otros gastos' },
                ].map(({ name, label }) => (
                  <div key={name}>
                    <label style={labelStyle}>{label}</label>
                    <input name={name} type="text" value={form[name]} onChange={handleChange} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#2E6BE6'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  </div>
                ))}
              </div>
            </div>

            {/* Parámetros de oferta */}
            <div style={cardStyle}>
              <p style={sectionTitle}>Parámetros de oferta</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                {[
                  { name: 'porcentaje_oferta_a', label: '% Oferta A' },
                  { name: 'incremento_oferta_b', label: 'Incremento B (+$)' },
                  { name: 'incremento_oferta_c', label: 'Incremento C (+$)' },
                ].map(({ name, label }) => (
                  <div key={name}>
                    <label style={labelStyle}>{label}</label>
                    <input name={name} type="text" value={form[name]} onChange={handleChange} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#2E6BE6'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  </div>
                ))}
              </div>
            </div>

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
          <div style={{ position: 'sticky', top: '80px' }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                {[
                  { label: `Oferta A (${form.porcentaje_oferta_a}%)`, value: fmt(resultados.oferta_a), bg: '#EEF4FF', color: '#1B3A6B', border: '#dbeafe' },
                  { label: 'Oferta B', value: fmt(resultados.oferta_b), bg: '#f8fafc', color: '#0D1B2A', border: '#e5e7eb' },
                  { label: 'Oferta C', value: fmt(resultados.oferta_c), bg: '#f8fafc', color: '#0D1B2A', border: '#e5e7eb' },
                ].map(o => (
                  <div key={o.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: o.bg, borderRadius: '10px', padding: '12px 16px', border: `1px solid ${o.border}` }}>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>{o.label}</span>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: o.color }}>{o.value}</span>
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
    </div>
  )
}

export default NuevaCotizacion
