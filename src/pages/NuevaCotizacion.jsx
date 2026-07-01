import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

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
const parseNum = (val) => parseFloat(String(val).replace(/,/g, '')) || 0

const NuevaCotizacion = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nombre_propietario: '',
    direccion: '',
    link_maps: '',
    tipo_inmueble: 'Casa',
    precio_venta: '',
    adeudo_luz: '',
    adeudo_agua: '',
    adeudo_predial: '',
    adeudo_infonavit: '',
    notas: '',
    ...defaultCostos,
  })

  const resultados = calcular(form)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

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

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  const labelClass = "block text-xs font-medium text-gray-600 mb-1"

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Nueva Cotización</h1>
          <p className="text-sm text-gray-500 mt-0.5">Llena los datos de la propiedad</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Columna izquierda — formulario */}
          <div className="lg:col-span-2 space-y-4">

            {/* Datos de la propiedad */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Datos de la propiedad</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Nombre del propietario</label>
                  <input name="nombre_propietario" value={form.nombre_propietario} onChange={handleChange} className={inputClass} placeholder="Ej. Juan Pérez" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Dirección</label>
                  <input name="direccion" value={form.direccion} onChange={handleChange} className={inputClass} placeholder="Calle, número, colonia" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Link Google Maps</label>
                  <input name="link_maps" value={form.link_maps} onChange={handleChange} className={inputClass} placeholder="https://maps.app.goo.gl/..." />
                </div>
                <div>
                  <label className={labelClass}>Tipo de inmueble</label>
                  <select name="tipo_inmueble" value={form.tipo_inmueble} onChange={handleChange} className={inputClass}>
                    <option>Casa</option>
                    <option>Dúplex</option>
                    <option>Departamento</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Precio de venta</label>
                  <input name="precio_venta" type="text" value={form.precio_venta} onChange={handleChange} className={inputClass} placeholder="0" />
                </div>
              </div>
            </div>

            {/* Adeudos */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Adeudos</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Adeudo LUZ</label>
                  <input name="adeudo_luz" type="text" value={form.adeudo_luz} onChange={handleChange} className={inputClass} placeholder="0" />
                </div>
                <div>
                  <label className={labelClass}>Adeudo AGUA</label>
                  <input name="adeudo_agua" type="text" value={form.adeudo_agua} onChange={handleChange} className={inputClass} placeholder="0" />
                </div>
                <div>
                  <label className={labelClass}>Adeudo PREDIAL</label>
                  <input name="adeudo_predial" type="text" value={form.adeudo_predial} onChange={handleChange} className={inputClass} placeholder="0" />
                </div>
                <div>
                  <label className={labelClass}>Adeudo INFONAVIT</label>
                  <input name="adeudo_infonavit" type="text" value={form.adeudo_infonavit} onChange={handleChange} className={inputClass} placeholder="0" />
                </div>
              </div>
            </div>

            {/* Costos operativos */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Costos operativos</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Remodelación</label>
                  <input name="costo_remodelacion" type="number" value={form.costo_remodelacion} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Provisión ISR</label>
                  <input name="costo_isr" type="number" value={form.costo_isr} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Comisión vendedor (%)</label>
                  <input name="comision_vendedor" type="number" value={form.comision_vendedor} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Pago cerrador</label>
                  <input name="pago_cerrador" type="number" value={form.pago_cerrador} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Pago prospección</label>
                  <input name="pago_prospeccion" type="number" value={form.pago_prospeccion} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Trámites varios</label>
                  <input name="tramites_varios" type="number" value={form.tramites_varios} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Cancelación hipoteca</label>
                  <input name="cancelacion_hipoteca" type="number" value={form.cancelacion_hipoteca} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Otros gastos</label>
                  <input name="otros_gastos" type="number" value={form.otros_gastos} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </div>

            {/* Parámetros de oferta */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Parámetros de oferta</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>% Oferta A</label>
                  <input name="porcentaje_oferta_a" type="number" value={form.porcentaje_oferta_a} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Incremento B (+$)</label>
                  <input name="incremento_oferta_b" type="number" value={form.incremento_oferta_b} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Incremento C (+$)</label>
                  <input name="incremento_oferta_c" type="number" value={form.incremento_oferta_c} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </div>

            {/* Notas */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Notas</h2>
              <textarea name="notas" value={form.notas} onChange={handleChange} className={inputClass + ' resize-none'} rows={3} placeholder="Observaciones, seguimiento..." />
            </div>

          </div>

          {/* Columna derecha — resultados */}
          <div className="space-y-4">
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
                  <span className="text-gray-700 font-medium">Costo total</span>
                  <span className="font-bold text-red-700">{fmt(resultados.costo_total)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
                  <span className="text-gray-700 font-medium">Utilidad bruta</span>
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
                  {saving ? 'Guardando...' : 'Guardar cotización'}
                </button>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default NuevaCotizacion
