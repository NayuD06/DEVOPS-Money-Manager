import React, { useState, useEffect } from 'react';
import { getCategoriesByType } from './Sidebar.jsx';

const EMPTY_FORM = {
  type: 'expense',
  amount: '',
  description: '',
  category: 'Ăn uống',
  date: new Date().toISOString().slice(0, 10),
  note: '',
};

export default function ExpenseForm({ initial, onSubmit, onClose, loading }) {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [customTick, setCustomTick] = useState(0);

  useEffect(() => {
    function handleSync() { setCustomTick(t => t + 1); }
    window.addEventListener('finflow_categories_changed', handleSync);
    return () => window.removeEventListener('finflow_categories_changed', handleSync);
  }, []);

  useEffect(() => {
    if (initial) {
      setForm({
        type:        initial.type ?? 'expense',
        amount:      initial.amount ?? '',
        description: initial.description ?? '',
        category:    initial.category ?? 'Ăn uống',
        date:        initial.date ? initial.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
        note:        initial.note ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [initial]);

  function set(field) {
    return e => {
      setForm(f => ({ ...f, [field]: e.target.value }));
      setErrors(er => ({ ...er, [field]: '' }));
    };
  }

  function handleTypeChange(newType) {
    const cats = getCategoriesByType(newType);
    const defaultCat = cats.length > 0 ? cats[0].name : 'Ăn uống';
    setForm(f => ({ ...f, type: newType, category: defaultCat }));
    setErrors({});
  }

  function validate() {
    const errs = {};
    const amount = Number(form.amount);
    if (!form.amount || isNaN(amount) || amount <= 0) errs.amount = 'Số tiền phải là số dương lớn hơn 0';
    if (amount > 1_000_000_000) errs.amount = 'Số tiền tối đa 1 tỷ VNĐ/lần';
    if (!form.description.trim()) errs.description = 'Mô tả không được để trống';
    if (form.description.trim().length > 200) errs.description = 'Mô tả tối đa 200 ký tự';
    if (!form.category) errs.category = 'Vui lòng chọn danh mục';
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit({
      type:        form.type,
      amount:      Number(form.amount),
      description: form.description.trim(),
      category:    form.category,
      date:        form.date || undefined,
      note:        form.note.trim(),
    });
  }

  const isEdit = Boolean(initial);
  const categories = getCategoriesByType(form.type);
  const isIncome = form.type === 'income';

  const backdropMouseDownRef = React.useRef(false);

  return (
    <div 
      className="modal-overlay" 
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          backdropMouseDownRef.current = true;
        } else {
          backdropMouseDownRef.current = false;
        }
      }}
      onMouseUp={(e) => {
        if (e.target === e.currentTarget && backdropMouseDownRef.current) {
          onClose();
        }
        backdropMouseDownRef.current = false;
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" style={{ borderTop: `4px solid ${isIncome ? '#10b981' : '#ef4444'}` }}>
        <div className="modal__header">
          <h2 className="modal__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{isEdit ? '✏️ Sửa giao dịch' : isIncome ? '📈 Ghi nhận Khoản Thu' : '📉 Ghi nhận Khoản Chi'}</span>
          </h2>
          <button className="modal__close" onClick={onClose} aria-label="Đóng modal">✕</button>
        </div>

        <div style={{ padding: '16px 24px 0', display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="btn"
            style={{
              flex: 1,
              background: !isIncome ? '#ef4444' : 'var(--c-surface2)',
              color: !isIncome ? '#fff' : 'var(--c-text-2)',
              border: !isIncome ? 'none' : '1px solid var(--c-border)',
              boxShadow: !isIncome ? '0 4px 12px rgba(239, 68, 68, 0.35)' : 'none',
              fontWeight: 700,
              paddingY: 12
            }}
            onClick={() => handleTypeChange('expense')}
          >
            📉 Khoản Chi
          </button>
          <button
            type="button"
            className="btn"
            style={{
              flex: 1,
              background: isIncome ? '#10b981' : 'var(--c-surface2)',
              color: isIncome ? '#fff' : 'var(--c-text-2)',
              border: isIncome ? 'none' : '1px solid var(--c-border)',
              boxShadow: isIncome ? '0 4px 12px rgba(16, 185, 129, 0.35)' : 'none',
              fontWeight: 700,
              paddingY: 12
            }}
            onClick={() => handleTypeChange('income')}
          >
            📈 Khoản Thu
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            {/* Amount */}
            <div className="form-group">
              <label className="form-label" htmlFor="f-amount">
                Số tiền (VNĐ) <span className="req">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="f-amount"
                  className={`form-control ${errors.amount ? 'error' : ''}`}
                  type="number"
                  min="0"
                  step="any"
                  placeholder={isIncome ? "VD: 15000000 (Lương, thưởng...)" : "VD: 50000 (Ăn trưa, cà phê...)"}
                  value={form.amount}
                  onChange={set('amount')}
                  style={{ fontSize: '1.1rem', fontWeight: 700, color: isIncome ? '#10b981' : '#ef4444', paddingRight: 50 }}
                  autoFocus
                />
                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--c-text-3)', fontSize: '0.85rem' }}>VNĐ</span>
              </div>
              {errors.amount && <span className="form-error">{errors.amount}</span>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="f-desc">
                Mô tả ngắn gọn <span className="req">*</span>
              </label>
              <input
                id="f-desc"
                className={`form-control ${errors.description ? 'error' : ''}`}
                type="text"
                placeholder={isIncome ? 'VD: Lương tháng 7, Thưởng dự án FinFlow...' : 'VD: Ăn trưa với đồng nghiệp, Mua sách...'}
                value={form.description}
                onChange={set('description')}
              />
              {errors.description && <span className="form-error">{errors.description}</span>}
            </div>

            {/* Category + Date row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="f-cat">
                  Danh mục <span className="req">*</span>
                </label>
                <select
                  id="f-cat"
                  className={`form-control ${errors.category ? 'error' : ''}`}
                  value={form.category}
                  onChange={set('category')}
                  style={{ fontWeight: 600 }}
                >
                  {categories.map(c => (
                    <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                  ))}
                </select>
                {errors.category && <span className="form-error">{errors.category}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="f-date">Ngày phát sinh</label>
                <input
                  id="f-date"
                  className="form-control"
                  type="date"
                  value={form.date}
                  onChange={set('date')}
                />
              </div>
            </div>

            {/* Note */}
            <div className="form-group">
              <label className="form-label" htmlFor="f-note">Ghi chú chi tiết</label>
              <textarea
                id="f-note"
                className="form-control"
                rows={2}
                placeholder="Thêm thông tin tuỳ chọn (quán ăn, địa điểm, người đi cùng...)"
                value={form.note}
                onChange={set('note')}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          <div className="modal__footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Huỷ bỏ
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                background: isIncome ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                boxShadow: isIncome ? '0 4px 14px rgba(16, 185, 129, 0.4)' : '0 4px 14px rgba(239, 68, 68, 0.4)',
                paddingLeft: 24, paddingRight: 24
              }}
              disabled={loading}
            >
              {loading ? '⏳ Đang lưu Sổ...' : isEdit ? '💾 Lưu thay đổi' : '➕ Ghi vào Sổ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
