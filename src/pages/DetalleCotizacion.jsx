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

  useEffect(() => {
    fetchCotizacion()
  }, [id])

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center py-20 text-gray-400">Cargando...</div>
    </div>
  )

  if (!cotizacion) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center py-20 text-gray-400">Cotización no encontrada</div>
    </div>
  )

  const coords = getMapCoords(cotizacion.link_maps)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <button onClick={() => navigate('/historial')} className="text-sm text-gray-400 hover:text-gray-600 mb-2 flex items-center gap-1">
              ← Volver al historial
            </button>
            <h1 className="text-xl font-bold text-gray-900">{cotizacion.nombre_propietario || 'Sin nombre'}</h1>
            <p className="text-sm text-gray-500">{cotizacion.direccion || 'Sin dirección'}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cotizacion.viable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {cotizacion.viable ? '✅ Viable' : '❌ No viable'}
              </span>
              <span className="text-xs text-gray-400">{cotizacion.tipo_inmueble}</span>
              <span className="text-xs text-gray-400">{new Date(cotizacion.created_at).toLocaleDateString('es-MX')}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/editar-cotizacion/${id}`)}
              className="bg-white border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl hover:border-blue-300 transition-colors"
            >
              Editar
            </button>
            <button
              onClick={handleEliminar}
              disabled={deleting}
              className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-2 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Columna izquierda */}
          <div className="lg:col-span-2 space-y-4">

            {/* Mapa */}
            {coords && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <iframe
                  width="100%"
                  height="250"
                  style={{border: 0}}
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=17&output=embed`}
                />
                {cotizacion.link_maps && (
                  <div className="px-4 py-3">
                    <a href={cotizacion.link_maps} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      📍 Abrir en Google Maps
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Adeudos */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Adeudos</h2>
              <div className="space-y-2">
                {[
                  { label: 'Adeudo LUZ', value: cotizacion.adeudo_luz },
                  { label: 'Adeudo AGUA', value: cotizacion.adeudo_agua },
                  { label: 'Adeudo PREDIAL', value: cotizacion.adeudo_predial },
                  { label: 'Adeudo INFONAVIT', value: cotizacion.adeudo_infonavit },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-red-600">{fmt(value)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm border-t border-gray-100 pt-2 mt-2">
                  <span className="font-semibold text-gray-700">Total adeudos</span>
                  <span className="font-bold text-red-700">{fmt(cotizacion.total_adeudos)}</span>
                </div>
              </div>
            </div>

            {/* Costos operativos */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Costos operativos</h2>
              <div className="space-y-2">
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
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-700">{fmt(value)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm border-t border-gray-100 pt-2 mt-2">
                  <span className="font-semibold text-gray-700">Total costos operativos</span>
                  <span className="font-bold text-gray-800">{fmt(cotizacion.total_costos_operativos)}</span>
                </div>
              </div>
            </div>

            {/* Notas */}
            {cotizacion.notas && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-800 mb-2">Notas</h2>
                <p className="text-sm text-gray-600">{cotizacion.notas}</p>
              </div>
            )}

          </div>

          {/* Columna derecha — resultados */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-6">
              <h2 className="font-semibold text-gray-800 mb-4">Resultados</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Precio venta</span>
                  <span className="font-bold text-gray-900">{fmt(cotizacion.precio_venta)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Costo total</span>
                  <span className="font-bold text-red-600">{fmt(cotizacion.costo_total)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
                  <span className="font-semibold text-gray-700">Utilidad bruta</span>
                  <span className={`font-bold ${cotizacion.utilidad_bruta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {fmt(cotizacion.utilidad_bruta)}
                  </span>
                </div>

                <div className={`rounded-xl p-3 text-center text-sm font-semibold ${cotizacion.viable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {cotizacion.viable ? '✅ VIABLE' : '❌ NO VIABLE'}
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Oferta A ({cotizacion.porcentaje_oferta_a}%)</span>
                    <span className="font-bold text-blue-600">{fmt(cotizacion.oferta_a)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Oferta B</span>
                    <span className="font-bold text-blue-600">{fmt(cotizacion.oferta_b)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Oferta C</span>
                    <span className="font-bold text-blue-600">{fmt(cotizacion.oferta_c)}</span>
                  </div>
                </div>

                {profile?.rol === 'admin' && (
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-400">Creado por</p>
                    <p className="text-sm font-medium text-purple-600">{cotizacion.profiles?.nombre}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default DetalleCotizacion
