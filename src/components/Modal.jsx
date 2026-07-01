const Modal = ({ title, message, onConfirm, onCancel, confirmText = 'Confirmar', danger = false }) => {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      background: 'rgba(13,27,42,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{
        background: '#ffffff', borderRadius: '16px', padding: '32px',
        maxWidth: '420px', width: '100%', border: '1px solid #e5e7eb',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        animation: 'modalIn 0.2s ease',
      }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', background: danger ? '#fef2f2' : '#f0f4ff' }}>
            <span style={{ fontSize: '20px' }}>{danger ? '🗑️' : '❓'}</span>
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0D1B2A', margin: '0 0 8px' }}>{title}</h3>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: '1.6' }}>{message}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel}
            style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#ffffff', color: '#6b7280', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
            onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
          >
            Cancelar
          </button>
          <button onClick={onConfirm}
            style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: danger ? '#dc2626' : '#1B3A6B', color: '#ffffff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = danger ? '#b91c1c' : '#0D1B2A'}
            onMouseLeave={e => e.currentTarget.style.background = danger ? '#dc2626' : '#1B3A6B'}
          >
            {confirmText}
          </button>
        </div>
        <style>{`@keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
      </div>
    </div>
  )
}

export default Modal
