import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

const fmt = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)

const Admin = () => {
  const [cotizaciones, setCotizaciones] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [vista, setVista] = useState('cotizaciones')

  useEffect(() => {
    fetchData()
  }, [])

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

  const eliminarCotizacion = async (id) => {
    if (!confirm('¿Eliminar esta cotización?')) return
    const { error } = await supabase.from('quotations').delete().eq('id', id)
    if (!error) setCotizaciones(cotizaciones.filter(c => c.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">

        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Panel Admin</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestión global del sistema</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'cotizaciones', label: `Cotizaciones (${cotizaciones.length})` },
            { key: 'usuarios', label: `Usuarios (${usuarios.length})` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setVista(t.key)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${vista === t.key ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Cargando...</div>
        ) : vista === 'cotizaciones' ? (
          <div className="space-y-3">
            {cotizaciones.map(c => (
              <div key={c.id} className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.viable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {c.viable ? 'Viable' : 'No viable'}
                      </span>
                      <span className="text-xs text-gray-400">{c.tipo_inmueble}</span>
                      <span className="text-xs text-purple-600 font-medium">👤 {c.profiles?.nombre || c.profiles?.email}</span>
                    </div>
                    <p className="font-semibold text-gray-900">{c.nombre_propietario || 'Sin nombre'}</p>
                    <p className="text-sm text-gray-500">{c.direccion || 'Sin dirección'}</p>
                    {c.notas && <p className="text-xs text-gray-400 mt-1">📝 {c.notas}</p>}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900">{fmt(c.precio_venta)}</p>
                    <p className={`text-sm font-semibold ${c.utilidad_bruta >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmt(c.utilidad_bruta)}</p>
                    <p className="text-xs text-blue-600 font-bold mt-1">A: {fmt(c.oferta_a)}</p>
                  </div>

                  <button
                    onClick={() => eliminarCotizacion(c.id)}
                    className="text-red-400 hover:text-red-600 text-sm transition-colors shrink-0"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {usuarios.map(u => (
              <div key={u.id} className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{u.nombre}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${u.rol === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                  {u.rol}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default Admin