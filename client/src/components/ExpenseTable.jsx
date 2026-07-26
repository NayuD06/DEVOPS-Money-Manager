import React, { useState } from 'react';
import { getCategoryMeta } from './Sidebar.jsx';

function fmt(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
}

function fmtDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function CategoryBadge({ name }) {
  const meta = getCategoryMeta(name);
  return (
    <span
      className="badge"
      style={{
        background: meta.color + '22',
        color: meta.color,
        border: `1px solid ${meta.color}44`,
      }}
    >
      <span>{meta.icon}</span> <span>{meta.name}</span>
    </span>
  );
}

export default function ExpenseTable({ expenses, loading, onEdit, onDelete }) {
  const [search, setSearch] = useState('');

  if (loading) {
    return (
      <div className="table-wrap">
        <div className="state-box">
          <div className="spinner" />
          <p>⏳ Đang đồng bộ sổ ghi chép...</p>
        </div>
      </div>
    );
  }

  if (!expenses || !expenses.length) {
    return (
      <div className="table-wrap">
        <div className="state-box">
          <span className="icon">📘</span>
          <p>Chưa có giao dịch nào trong tháng này.</p>
          <p style={{ fontSize: '0.86rem', color: 'var(--c-text-2)' }}>
            Hãy nhấn nút <strong>+ Ghi nhận Thu/Chi</strong> ở góc trên để bổ sung vào sổ!
          </p>
        </div>
      </div>
    );
  }

  const filtered = expenses.filter(exp => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const descMatch = exp.description?.toLowerCase().includes(q);
    const noteMatch = exp.note?.toLowerCase().includes(q);
    const catMatch  = exp.category?.toLowerCase().includes(q);
    return descMatch || noteMatch || catMatch;
  });

  return (
    <div className="table-wrap">
      {/* Quick search bar inside table header */}
      <div style={{ padding: '14px 18px', background: 'var(--c-surface2)', borderBottom: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--c-text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>📋 Sổ chi tiết</span>
          <span className="badge" style={{ background: 'var(--c-bg)', color: 'var(--c-accent)', border: 'none' }}>
            {filtered.length} / {expenses.length} giao dịch
          </span>
        </div>
        <div style={{ position: 'relative', width: '100%', maxWidth: 280 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem', opacity: 0.6 }}>🔍</span>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm theo từ khóa, danh mục..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 32, paddingRight: search ? 30 : 12, fontSize: '0.85rem', paddingY: 6 }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--c-text-3)', cursor: 'pointer', fontSize: '1rem' }}
              title="Xóa tìm kiếm"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="state-box" style={{ padding: '40px 20px' }}>
          <p>Không tìm thấy giao dịch nào khớp với từ khóa "<strong>{search}</strong>"</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Mô tả & Ghi chú</th>
                <th>Danh mục</th>
                <th style={{ textAlign: 'right' }}>Số tiền</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((exp) => {
                const isIncome = exp.type === 'income';
                return (
                  <tr key={exp._id}>
                    <td className="td-date">{fmtDate(exp.date)}</td>
                    <td>
                      <div className="td-desc">
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: isIncome ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: isIncome ? '#10b981' : '#ef4444',
                            marginRight: 8,
                            fontWeight: 800,
                            letterSpacing: '0.04em'
                          }}
                        >
                          {isIncome ? '+ THU' : '- CHI'}
                        </span>
                        {exp.description}
                      </div>
                      {exp.note && <div className="td-note">💬 {exp.note}</div>}
                    </td>
                    <td>
                      <CategoryBadge name={exp.category} />
                    </td>
                    <td
                      className="td-amount"
                      style={{
                        color: isIncome ? '#10b981' : '#ef4444',
                        fontWeight: 700,
                        fontSize: '1rem'
                      }}
                    >
                      {isIncome ? '+' : '-'}{fmt(exp.amount)}
                    </td>
                    <td>
                      <div className="td-actions">
                        <button
                          className="btn-icon"
                          title="Chỉnh sửa giao dịch"
                          onClick={() => onEdit(exp)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon danger"
                          title="Xóa giao dịch"
                          onClick={() => onDelete(exp)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
