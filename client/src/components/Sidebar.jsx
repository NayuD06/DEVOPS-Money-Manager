import React, { useState, useEffect } from 'react';

export const EXPENSE_CATEGORIES = [
  { name: 'Ăn uống',    icon: '🍜', color: '#ef4444' },
  { name: 'Di chuyển',  icon: '🚗', color: '#1677ff' },
  { name: 'Mua sắm',    icon: '🛍️', color: '#ec4899' },
  { name: 'Giải trí',   icon: '🎮', color: '#a855f7' },
  { name: 'Sức khoẻ',   icon: '💊', color: '#10b981' },
  { name: 'Hoá đơn',    icon: '📄', color: '#f59e0b' },
  { name: 'Khác',       icon: '📦', color: '#64748b' },
];

export const INCOME_CATEGORIES = [
  { name: 'Lương',          icon: '💰', color: '#10b981' },
  { name: 'Thưởng',         icon: '🎁', color: '#14b8a6' },
  { name: 'Đầu tư',         icon: '📈', color: '#1677ff' },
  { name: 'Kinh doanh',     icon: '🏢', color: '#8b5cf6' },
  { name: 'Quà tặng',       icon: '🎀', color: '#ec4899' },
  { name: 'Thu nhập khác',  icon: '💵', color: '#06b6d4' },
];

export const EMOJI_OPTIONS = [
  '🏠', '✈️', '👶', '📚', '🏋️', '🐾', '☕', '🎮', '🎁', '💡',
  '🛍️', '💖', '🚀', '🍷', '🚲', '💸', '💎', '🛠️', '🎓', '🏥',
  '🐶', '🐱', '🍏', '🍔', '🎨', '🏖️', '🚌', '📱', '📸', '⚡'
];

export const COLOR_OPTIONS = [
  '#0066cc', '#10b981', '#ef4444', '#ec4899', '#8b5cf6',
  '#f59e0b', '#06b6d4', '#14b8a6', '#6366f1', '#d97706',
  '#3b82f6', '#84cc16', '#f97316', '#e11d48', '#0f766e'
];

export function getCustomCategories() {
  try {
    const saved = localStorage.getItem('finflow_custom_cats');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

export function saveCustomCategory(newCat) {
  const custom = getCustomCategories();
  const updated = [...custom.filter(c => c.name !== newCat.name), newCat];
  localStorage.setItem('finflow_custom_cats', JSON.stringify(updated));
  window.dispatchEvent(new Event('finflow_categories_changed'));
}

export function deleteCustomCategory(name) {
  const custom = getCustomCategories();
  const updated = custom.filter(c => c.name !== name);
  localStorage.setItem('finflow_custom_cats', JSON.stringify(updated));
  window.dispatchEvent(new Event('finflow_categories_changed'));
}

export function getCategoriesByType(type) {
  const custom = getCustomCategories();
  const customIncome = custom.filter(c => c.type === 'income');
  const customExpense = custom.filter(c => c.type === 'expense' || !c.type);
  if (type === 'income') return [...INCOME_CATEGORIES, ...customIncome];
  if (type === 'expense') return [...EXPENSE_CATEGORIES, ...customExpense];
  return [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES, ...custom];
}

export function getCategoryMeta(name) {
  const all = getCategoriesByType('');
  return all.find(c => c.name === name) || { name, icon: '📌', color: '#64748b' };
}

export default function Sidebar({
  activeTab = 'home',
  onTab = () => {},
  activeCategory,
  onCategory,
  activeMonth,
  onMonth,
  activeType,
  onType,
}) {
  const [customCats, setCustomCats] = useState(getCustomCategories());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state for new category
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState('expense');
  const [catIcon, setCatIcon] = useState('🏠');
  const [catColor, setCatColor] = useState('#0066cc');
  const [error, setError] = useState('');

  useEffect(() => {
    function handleSync() {
      setCustomCats(getCustomCategories());
    }
    window.addEventListener('finflow_categories_changed', handleSync);
    return () => window.removeEventListener('finflow_categories_changed', handleSync);
  }, []);

  const currentCategories = activeType === 'income'
    ? getCategoriesByType('income')
    : activeType === 'expense'
    ? getCategoriesByType('expense')
    : getCategoriesByType('');

  function handleCreateCategory(e) {
    e.preventDefault();
    if (!catName.trim()) {
      setError('Vui lòng nhập tên danh mục!');
      return;
    }
    if (catName.trim().length > 30) {
      setError('Tên danh mục tối đa 30 ký tự!');
      return;
    }
    saveCustomCategory({
      name: catName.trim(),
      icon: catIcon,
      color: catColor,
      type: catType,
      isCustom: true
    });
    setCatName('');
    setError('');
    setIsModalOpen(false);
  }

  function handleDeleteCustom(e, name) {
    e.stopPropagation();
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục tự chọn "${name}" không?`)) {
      deleteCustomCategory(name);
      if (activeCategory === name) onCategory('');
    }
  }

  return (
    <aside className="sidebar">
      {/* 1. Chọn tháng (Áp dụng cho các tab quản lý) */}
      <div className="sidebar__label">📅 Thời gian (Tháng)</div>
      <input
        type="month"
        value={activeMonth}
        onChange={e => onMonth(e.target.value)}
        style={{
          background: 'var(--c-surface2)', border: '1px solid var(--c-border)',
          borderRadius: 'var(--radius-sm)', color: 'var(--c-text)',
          padding: '9px 12px', fontSize: '.9rem', fontFamily: 'var(--font)',
          width: '100%', outline: 'none', fontWeight: 600,
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
        }}
      />

      {/* 2. Menu Chức Năng Chính */}
      <div className="sidebar__label" style={{ marginTop: 18 }}>📱 Điều Hướng</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <button
          className={`sidebar__item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => onTab('home')}
        >
          <span className="icon">🏠</span>
          <span>Trang Chủ & Giới Thiệu</span>
        </button>

        <button
          className={`sidebar__item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => onTab('overview')}
        >
          <span className="icon">📊</span>
          <span>Tổng Quan & Báo Cáo</span>
        </button>

        <button
          className={`sidebar__item ${activeTab === 'ledger' ? 'active' : ''}`}
          onClick={() => onTab('ledger')}
        >
          <span className="icon">📝</span>
          <span>Sổ Ghi Chép Thu/Chi</span>
        </button>

        <button
          className={`sidebar__item ${activeTab === 'budget' ? 'active' : ''}`}
          onClick={() => onTab('budget')}
        >
          <span className="icon">🎯</span>
          <span>Hạn Mức Chi Tiêu</span>
        </button>
      </div>

      {/* 3. Lọc theo Loại & Danh mục (Khi ở tab Tổng quan hoặc Sổ ghi chép) */}
      {(activeTab === 'overview' || activeTab === 'ledger' || activeTab === 'budget') && (
        <>
          <div className="sidebar__label" style={{ marginTop: 20 }}>🔍 Lọc Giao dịch</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, marginBottom: 8 }}>
            <button
              className={`sidebar__item ${!activeType ? 'active' : ''}`}
              style={{ padding: '7px 4px', fontSize: '.82rem', justifyContent: 'center', fontWeight: !activeType ? 700 : 500 }}
              onClick={() => { onType(''); onCategory(''); }}
            >
              Tất cả
            </button>
            <button
              className={`sidebar__item ${activeType === 'income' ? 'active' : ''}`}
              style={{ padding: '7px 4px', fontSize: '.82rem', justifyContent: 'center', color: '#10b981', fontWeight: activeType === 'income' ? 700 : 500 }}
              onClick={() => { onType('income'); onCategory(''); }}
            >
              📈 Thu
            </button>
            <button
              className={`sidebar__item ${activeType === 'expense' ? 'active' : ''}`}
              style={{ padding: '7px 4px', fontSize: '.82rem', justifyContent: 'center', color: '#ef4444', fontWeight: activeType === 'expense' ? 700 : 500 }}
              onClick={() => { onType('expense'); onCategory(''); }}
            >
              📉 Chi
            </button>
          </div>

          <div className="sidebar__label" style={{ marginTop: 12 }}>🏷️ Danh mục Thu / Chi</div>
          <button
            className={`sidebar__item ${activeCategory === '' ? 'active' : ''}`}
            onClick={() => onCategory('')}
            style={{ marginBottom: 2 }}
          >
            <span className="icon">🗂️</span>
            <span>Tất cả danh mục</span>
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
            {currentCategories.map(cat => (
              <button
                key={cat.name}
                className={`sidebar__item ${activeCategory === cat.name ? 'active' : ''}`}
                onClick={() => onCategory(activeCategory === cat.name ? '' : cat.name)}
                style={{ position: 'relative' }}
              >
                <span className="icon">{cat.icon}</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color, display: 'inline-block', flexShrink: 0 }} />
                {cat.isCustom && (
                  <span
                    onClick={e => handleDeleteCustom(e, cat.name)}
                    style={{
                      marginLeft: 4, padding: '2px 6px', fontSize: '0.75rem', color: 'var(--c-text-3)',
                      borderRadius: '4px', cursor: 'pointer', background: 'var(--c-surface)'
                    }}
                    title="Xóa danh mục tự chọn này"
                  >
                    🗑️
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-ghost"
            style={{ marginTop: 10, width: '100%', padding: '9px 12px', fontSize: '0.86rem', color: 'var(--c-accent)', border: '1px dashed var(--c-border2)' }}
          >
            ➕ Thêm Danh Mục Tùy Chọn
          </button>
        </>
      )}

      {/* Modal Tạo Danh Mục Mới */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 440, borderTop: '4px solid var(--c-accent)' }}>
            <div className="modal__header">
              <h3 className="modal__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>✨</span> <span>Tạo Danh Mục Tùy Chọn Mới</span>
              </h3>
              <button className="modal__close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateCategory}>
              <div className="modal__body">
                {error && <div className="form-error" style={{ marginBottom: 6 }}>{error}</div>}

                <div className="form-group">
                  <label className="form-label">Tên danh mục <span className="req">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="VD: Tiền nhà, Du lịch, Con cái..."
                    value={catName}
                    onChange={e => setCatName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phân loại giao dịch</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      className="btn"
                      style={{
                        flex: 1,
                        background: catType === 'expense' ? '#ef4444' : 'var(--c-surface2)',
                        color: catType === 'expense' ? '#fff' : 'var(--c-text-2)',
                        border: 'none', padding: '10px'
                      }}
                      onClick={() => setCatType('expense')}
                    >
                      📉 Khoản Chi
                    </button>
                    <button
                      type="button"
                      className="btn"
                      style={{
                        flex: 1,
                        background: catType === 'income' ? '#10b981' : 'var(--c-surface2)',
                        color: catType === 'income' ? '#fff' : 'var(--c-text-2)',
                        border: 'none', padding: '10px'
                      }}
                      onClick={() => setCatType('income')}
                    >
                      📈 Khoản Thu
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Chọn Biểu Tượng (Icon)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, maxHeight: 130, overflowY: 'auto', padding: 4, background: 'var(--c-surface2)', borderRadius: 'var(--radius-sm)' }}>
                    {EMOJI_OPTIONS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setCatIcon(emoji)}
                        style={{
                          fontSize: '1.4rem', padding: 6, borderRadius: 6, border: 'none', cursor: 'pointer',
                          background: catIcon === emoji ? 'var(--c-surface)' : 'transparent',
                          boxShadow: catIcon === emoji ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
                          transform: catIcon === emoji ? 'scale(1.1)' : 'none'
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Chọn Màu Sắc Đặc Trưng</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, padding: 4 }}>
                    {COLOR_OPTIONS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCatColor(c)}
                        style={{
                          width: 28, height: 28, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
                          boxShadow: catColor === c ? `0 0 0 3px var(--c-surface), 0 0 0 5px ${c}` : 'none',
                          transform: catColor === c ? 'scale(1.15)' : 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal__footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Huỷ</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>💾 Lưu Danh Mục</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
