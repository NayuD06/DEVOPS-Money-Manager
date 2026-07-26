export default function Toast({ toasts, onRemove }) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' }

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span className="toast__icon">{icons[t.type] || 'ℹ️'}</span>
          <div className="toast__body">
            <div className="toast__title">{t.title}</div>
            {t.desc && <div className="toast__desc">{t.desc}</div>}
          </div>
          <button className="toast__close" onClick={() => onRemove(t.id)}>✕</button>
        </div>
      ))}
    </div>
  )
}
