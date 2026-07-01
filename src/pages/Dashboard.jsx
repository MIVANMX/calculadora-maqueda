import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const Dashboard = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const cards = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2E6BE6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
      iconBg: '#EEF4FF', title: 'Nueva Cotización',
      desc: 'Evalúa una propiedad, calcula costos, adeudos y determina su viabilidad en segundos.',
      action: () => navigate('/nueva-cotizacion'), cta: 'Evaluar propiedad →', ctaColor: '#2E6BE6',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D1B2A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      ),
      iconBg: '#f3f4f6', title: 'Historial',
      desc: 'Consulta, filtra y revisa todas tus cotizaciones anteriores con detalle completo.',
      action: () => navigate('/historial'), cta: 'Ver historial →', ctaColor: '#0D1B2A',
    },
    ...(profile?.rol === 'admin' ? [{
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B3A6B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
        </svg>
      ),
      iconBg: '#f0f4ff', title: 'Panel Admin',
      desc: 'Gestiona usuarios, revisa todas las cotizaciones del equipo y administra el sistema.',
      action: () => navigate('/admin'), cta: 'Ir al panel →', ctaColor: '#1B3A6B',
    }] : []),
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: '#0D1B2A', padding: '40px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div className="dashboard-hero" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#6b87a8', margin: '0 0 8px', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: '500' }}>
                {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#ffffff', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
                Bienvenida, {profile?.nombre?.split(' ')[0]}
              </h1>
              <p style={{ fontSize: '14px', color: '#6b87a8', margin: 0 }}>Plataforma de evaluación inmobiliaria</p>
            </div>
            <div className="dashboard-stats" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(46,107,230,0.12)', border: '1px solid rgba(46,107,230,0.25)', borderRadius: '10px', padding: '10px 16px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e' }} />
                <span style={{ fontSize: '13px', color: '#a0b4cc' }}>Sistema</span>
                <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: '600' }}>Activo</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 16px' }}>
                <span style={{ fontSize: '13px', color: '#a0b4cc' }}>Rol · </span>
                <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: '600' }}>{profile?.rol === 'admin' ? 'Administrador' : 'Vendedor'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>
        <p style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af', letterSpacing: '0.8px', textTransform: 'uppercase', margin: '0 0 16px' }}>
          Accesos rápidos
        </p>
        <div className="dashboard-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {cards.map((card) => (
            <button key={card.title} onClick={card.action} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '28px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', width: '100%' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#2E6BE6'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ width: '48px', height: '48px', background: card.iconBg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                {card.icon}
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#0D1B2A', margin: '0 0 8px' }}>{card.title}</h2>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 20px', lineHeight: '1.6' }}>{card.desc}</p>
              <span style={{ fontSize: '13px', fontWeight: '600', color: card.ctaColor }}>{card.cta}</span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: '32px', padding: '16px 20px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Sistema activo · Todos los datos se guardan automáticamente en tiempo real.</p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .dashboard-hero { flex-direction: column !important; align-items: flex-start !important; }
          .dashboard-stats { flex-direction: column !important; width: 100% !important; }
          .dashboard-cards { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

export default Dashboard