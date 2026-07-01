import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

const parseNum = (val) => parseFloat(String(val).replace(/,/g, '')) || 0

const calcular = (form) => {
  const precio = parseNum(form.precio_venta)
  const luz = parseNum(form.adeudo_luz)
  const agua = parseNum(form.adeudo_agua)
  const predial = parseNum(form.adeudo_predial)
  const infonavit = parseNum(form.adeudo_infonavit)
  const total_adeudos = luz + agua + predial + infonavit

  const comision = precio * (parseNum(form.comision_vendedor) / 100)
  const total_costos_operativos =
    parseNum(form.costo_remodelacion) +
    parseNum(form.costo_isr) +
    comision +
    parseNum(form.pago_cerrador) +
    parseNum(form.pago_prospeccion) +
    parseNum(form.tramites_varios) +
    parseNum(form.cancelacion_hipoteca) +
    parseNum(form.otros_gastos)

  const costo_total = total_adeudos + total_costos_operativos
  const utilidad_bruta = precio - costo_total
  const viable = utilidad_bruta > 0
  const oferta_a = utilidad_bruta * (parseNum(form.porcentaje_oferta_a) / 100)
  const oferta_b = oferta_a + parseNum(form.incremento_oferta_b)
  const oferta_c = oferta_b + parseNum(form.incremento_oferta_c)

  return { total_adeudos, total_costos_operativos, costo_total, utilidad_bruta, viable, oferta_a, oferta_b, oferta_c }
}

const fmt = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)

const EditarCotizacion = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(null)

  useEffect(() => {
    fetchCotizacion()
  }, [id])

  const fetchCotizacion = async () => {
    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .eq('id', id)
      .single()
    if (!error) setForm(data)
    setLoading(false)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

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
    }).eq('id', id)

    setSaving(false)
    if (!error) navigate(`/cotizacion/${id}`)
    else alert('Error al guardar: ' + error.message)
  }

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  const labelClass = "block text-xs font-medium text-gray-600 mb-1"

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center py-20 text-gray-400">Cargando...</div>
    </div>
  )

  const resultados = calcular(form)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <button onClick={() => navigate(`/cotizacion/${id}`)} className="text-sm text-gray-400 hover:text-gray-600 mb-2 flex items-center gap-1">
            ← Volver al detalle
          </button>
          <h1 className="text-xl font-bold text-gray-900">Editar Cotización</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Datos de la propiedad</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Nombre del propietario</label>
                  <input name="nombre_propietario" value={form.nombre_propietario || ''} onChange={handleChange} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Dirección</label>
                  <input name="direccion" value={form.direccion || ''} onChange={handleChange} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Link Google Maps</label>
                  <p className="text-xs text-gray-400 mb-1">Copia el link desde la barra del navegador en Google Maps (no uses el botón compartir)</p>
                  <input name="link_maps" value={form.link_maps || ''} onChange={handleChange} className={inputClass} placeholder="https://www.google.com/maps/place/..." />
                  {form.link_maps && form.link_maps.includes('google.com/maps') && (() => {
                    const match = form.link_maps.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
                    if (!match) return <p className="text-xs text-amber-500 mt-1">No se pudieron extraer las coordenadas, verifica el link.</p>
                    const lat = match[1]
                    const lng = match[2]
                    return (
                      <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                        <iframe
                          width="100%"
                          height="200"
                          style={{border: 0}}
                          loading="lazy"
                          allowFullScreen
                          src={`https://maps.google.com/maps?q=${lat},${lng}&z=17&output=embed`}
                        />
                      </div>
                    )
                  })()}
                </div>
                <div>
                  <label className={labelClass}>Tipo de inmueble</label>
                  <select name="tipo_inmueble" value={form.tipo_inmueble || 'Casa'} onChange={handleChange} className={inputClass}>
                    <option>Casa</option>
                    <option>Dúplex</option>
                    <option>Departamento</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Precio de venta</label>
                  <input name="precio_venta" type="text" value={form.precio_venta || ''} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Adeudos</h2>
              <div className="grid grid-cols-2 gap-4">
                {['adeudo_luz', 'adeudo_agua', 'adeudo_predial', 'adeudo_infonavit'].map(field => (
                  <div key={field}>
                    <label className={labelClass}>{field.replace('_', ' ').replace('adeudo ', 'Adeudo ').toUpperCase()}</label>
                    <input name={field} type="text" value={form[field] || ''} onChange={handleChange} className={inputClass} />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Costos operativos</h2>
              <div className="grid grid-cols-2 gap-4">
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
                    <label className={labelClass}>{label}</label>
                    <input name={name} type="text" value={form[name] || ''} onChange={handleChange} className={inputClass} />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Parámetros de oferta</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>% Oferta A</label>
                  <input name="porcentaje_oferta_a" type="text" value={form.porcentaje_oferta_a || ''} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Incremento B (+$)</label>
                  <input name="incremento_oferta_b" type="text" value={form.incremento_oferta_b || ''} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Incremento C (+$)</label>
                  <input name="incremento_oferta_c" type="text" value={form.incremento_oferta_c || ''} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Notas</h2>
              <textarea name="notas" value={form.notas || ''} onChange={handleChange} className={inputClass + ' resize-none'} rows={3} />
            </div>

          </div>

          <div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-6">
              <h2 className="font-semibold text-gray-800 mb-4">Resultados</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total adeudos</span>
                  <span className="font-medium text-red-600">{fmt(resultados.total_adeudos)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Costos operativos</span>
                  <span className="font-medium text-red-600">{fmt(resultados.total_costos_operativos)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
                  <span className="font-semibold text-gray-700">Costo total</span>
                  <span className="font-bold text-red-700">{fmt(resultados.costo_total)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
                  <span className="font-semibold text-gray-700">Utilidad bruta</span>
                  <span className={`font-bold ${resultados.utilidad_bruta >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmt(resultados.utilidad_bruta)}</span>
                </div>

                <div className={`rounded-xl p-3 text-center text-sm font-semibold mt-2 ${resultados.viable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {resultados.viable ? '✅ VIABLE' : '❌ NO VIABLE'}
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Oferta A ({form.porcentaje_oferta_a}%)</span>
                    <span className="font-bold text-blue-600">{fmt(resultados.oferta_a)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Oferta B</span>
                    <span className="font-bold text-blue-600">{fmt(resultados.oferta_b)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Oferta C</span>
                    <span className="font-bold text-blue-600">{fmt(resultados.oferta_c)}</span>
                  </div>
                </div>

                <button
                  onClick={handleGuardar}
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 mt-2"
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default EditarCotizacion
