import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

const fmt = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)

const Historial = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cotizaciones, setCotizaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todas')

  useEffect(() => {
    fetchCotizaciones()
  }, [])

  const fetchCotizaciones = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setCotizaciones(data)
    setLoading(false)
  }

  const cotizacionesFiltradas = cotizaciones.filter(c => {
    if (filtro === 'viables') return c.viable === true
    if (filtro === 'no_viables') return c.viable === false
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Historial</h1>
            <p className="text-sm text-gray-500 mt-0.5">{cotizaciones.length} cotizaciones en total</p>
          </div>
          <button
            onClick={() => navigate('/nueva-cotizacion')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            + Nueva cotización
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'todas', label: 'Todas' },
            { key: 'viables', label: '✅ Viables' },
            { key: 'no_viables', label: '❌ No viables' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${filtro === f.key ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Cargando...</div>
        ) : cotizacionesFiltradas.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No hay cotizaciones</div>
        ) : (
          <div className="space-y-3">
            {cotizacionesFiltradas.map(c => (
              <div key={c.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-200 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.viable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {c.viable ? 'Viable' : 'No viable'}
                      </span>
                      <span className="text-xs text-gray-400">{c.tipo_inmueble}</span>
                    </div>
                    <p className="font-semibold text-gray-900 truncate">{c.nombre_propietario || 'Sin nombre'}</p>
                    <p className="text-sm text-gray-500 truncate">{c.direccion || 'Sin dirección'}</p>
                    {c.notas && <p className="text-xs text-gray-400 mt-1 truncate">📝 {c.notas}</p>}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400 mb-1">Precio venta</p>
                    <p className="font-bold text-gray-900">{fmt(c.precio_venta)}</p>
                    <p className={`text-sm font-semibold mt-1 ${c.utilidad_bruta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {fmt(c.utilidad_bruta)}
                    </p>
                    <p className="text-xs text-gray-400">utilidad bruta</p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400 mb-1">Oferta A</p>
                    <p className="font-bold text-blue-600">{fmt(c.oferta_a)}</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(c.created_at).toLocaleDateString('es-MX')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Historial