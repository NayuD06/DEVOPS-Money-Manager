export default function DeleteConfirm({ expense, onConfirm, onClose, loading }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 400 }} role="alertdialog" aria-modal="true">
        <div className="modal__header" style={{ justifyContent: 'flex-end' }}>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="modal__body" style={{ textAlign: 'center', paddingTop: 0 }}>
          <div className="confirm-icon">🗑️</div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: 8 }}>Xoá khoản chi?</h2>
          <p className="confirm-msg" style={{ marginTop: 8 }}>
            Bạn chắc chắn muốn xoá <strong>"{expense?.description}"</strong>?<br />
            Thao tác này không thể hoàn tác.
          </p>
        </div>
        <div className="modal__footer" style={{ justifyContent: 'center', gap: 12 }}>
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
            Huỷ
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? '⏳ Đang xoá...' : '🗑️ Xoá'}
          </button>
        </div>
      </div>
    </div>
  )
}
