import { useEffect } from 'react'

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500)
    return () => clearTimeout(timer)
  }, [])

  const config = {
    success: { bg: '#f0fdf4', border: '#bbf7d0', color: '#16a34a', icon: '✓' },
    error: { bg: '#fef2f2', border: '#fecaca', color: '#dc2626', icon: '⚠️' },
    info: { bg: '#f0f4ff', border: '#dbeafe', color: '#1B3A6B', icon: 'ℹ️' },
  }

  const c = config[type]

  return (
    <div style={{
      position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
      background: c.bg, border: `1px solid ${c.border}`, borderRadius: '12px',
      padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)', minWidth: '280px', maxWidth: '400px',
      animation: 'slideIn 0.2s ease',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <span style={{ fontSize: '16px' }}>{c.icon}</span>
      <p style={{ fontSize: '13px', fontWeight: '500', color: c.color, margin: 0, flex: 1 }}>{message}</p>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.color, fontSize: '16px', padding: '0', lineHeight: 1 }}>×</button>
      <style>{`@keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }`}</style>
    </div>
  )
}

export default Toast
