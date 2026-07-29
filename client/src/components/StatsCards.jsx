import React, { useState } from 'react';
import { getCategoryMeta } from './Sidebar.jsx';
import PieChart from './PieChart.jsx';

function fmt(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
}

export default function StatsCards({ stats, loading, month }) {
  const [showPie, setShowPie] = useState(() => {
    try { return localStorage.getItem('spendwise_showPie') !== 'false'; }
    catch { return true; }
  });

  function togglePie() {
    setShowPie(prev => {
      const next = !prev;
      try { localStorage.setItem('spendwise_showPie', String(next)); } catch {}
      return next;
    });
  }
  if (loading) {
    return (
      <div className="stats-row">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card" style={{ opacity: 0.5, minHeight: 110 }}>
            <div className="spinner" style={{ margin: 'auto', width: 24, height: 24 }} />
          </div>
        ))}
      </div>
    );
  }

  const {
    total = 0,
    count = 0,
    totalIncome = 0,
    totalExpense = 0,
    balance = 0,
    byCategory = [],
  } = stats || {};

  // Top category
  const topCat = byCategory[0];
  const topMeta = topCat ? getCategoryMeta(topCat._id) : null;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  return (
    <>
      <div className="stats-row">
        {/* Tổng Thu */}
        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="stat-card__label">📈 Tổng thu nhập tháng {month?.slice(5)}/{month?.slice(0, 4)}</div>
          <div className="stat-card__value" style={{ color: '#10b981' }}>
            {fmt(totalIncome)}
          </div>
          <div className="stat-card__sub">
            <span style={{ color: '#10b981', fontWeight: 600 }}>●</span> Dòng tiền vào
          </div>
        </div>

        {/* Tổng Chi */}
        <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="stat-card__label">📉 Tổng chi tiêu tháng {month?.slice(5)}/{month?.slice(0, 4)}</div>
          <div className="stat-card__value" style={{ color: '#ef4444' }}>
            {fmt(totalExpense)}
          </div>
          <div className="stat-card__sub">
            <span style={{ color: '#ef4444', fontWeight: 600 }}>●</span> Chi phí tiêu dùng ({count} giao dịch)
          </div>
        </div>

        {/* Số Dư */}
        <div className="stat-card" style={{ borderLeft: balance >= 0 ? '4px solid #1677ff' : '4px solid #ef4444' }}>
          <div className="stat-card__label">💰 Số dư (Thu - Chi)</div>
          <div
            className="stat-card__value"
            style={{ color: balance >= 0 ? '#1677ff' : '#ef4444' }}
          >
            {balance >= 0 ? '+' : ''}{fmt(balance)}
          </div>
          <div className="stat-card__sub">
            {balance >= 0 ? (
              <span style={{ color: '#10b981' }}>👍 Tiết kiệm được {savingsRate > 0 ? `${savingsRate.toFixed(1)}%` : '0%'}</span>
            ) : (
              <span style={{ color: '#ef4444' }}>⚠️ Cảnh báo bội chi vượt thu!</span>
            )}
          </div>
        </div>

        {/* Top danh mục */}
        <div className="stat-card" style={{ borderLeft: '4px solid #ec4899' }}>
          <div className="stat-card__label">🏆 Chi tiêu nhiều nhất</div>
          <div
            className="stat-card__value"
            style={{
              fontSize: '1.25rem',
              color: topMeta ? topMeta.color : '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {topCat ? `${topMeta.icon} ${topCat._id}` : '—'}
          </div>
          <div className="stat-card__sub">
            {topCat ? `${fmt(topCat.total)} (${totalExpense > 0 ? ((topCat.total / totalExpense) * 100).toFixed(1) : 0}% tổng chi)` : 'Chưa có dữ liệu'}
          </div>
        </div>
      </div>

      {/* Category breakdown bars + Pie Chart */}
      {byCategory.length > 0 && (() => {
        const pieData = byCategory.map((cat) => {
          const meta = getCategoryMeta(cat._id);
          return { label: `${meta.icon} ${cat._id}`, value: cat.total, color: meta.color };
        });
        return (
          <div className="table-wrap" style={{ padding: '24px', marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--c-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                📊 Phân bổ chi tiêu trong tháng theo danh mục
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="badge" style={{ background: 'var(--c-surface2)', color: 'var(--c-text-2)' }}>
                  Tổng chi: {fmt(totalExpense)}
                </span>
                <button
                  onClick={togglePie}
                  title={showPie ? 'Ẩn biểu đồ tròn' : 'Hiện biểu đồ tròn'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 12px', borderRadius: 99, cursor: 'pointer',
                    fontSize: '0.78rem', fontWeight: 600, border: '1px solid var(--c-border2)',
                    background: showPie ? 'var(--c-accent)' : 'var(--c-surface2)',
                    color: showPie ? '#fff' : 'var(--c-text-2)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{ fontSize: '0.9rem' }}>{showPie ? '🥧' : '📊'}</span>
                  {showPie ? 'Ẩn biểu đồ' : 'Hiện biểu đồ'}
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: byCategory.length > 1 ? '1fr auto' : '1fr', gap: 32, alignItems: 'center' }}>
              {/* Bar chart */}
              <div className="cat-bars">
                {byCategory.map((cat) => {
                  const meta = getCategoryMeta(cat._id);
                  const pct = totalExpense > 0 ? (cat.total / totalExpense) * 100 : 0;
                  return (
                    <div key={cat._id} className="cat-bar-row">
                      <div className="cat-bar-meta">
                        <span className="cat-bar-label">
                          <span style={{ fontSize: '1.1rem' }}>{meta.icon}</span> {cat._id}
                        </span>
                        <span className="cat-bar-val">
                          {fmt(cat.total)} <span style={{ color: 'var(--c-text-3)', fontWeight: 500 }}>({pct.toFixed(1)}%)</span>
                        </span>
                      </div>
                      <div className="cat-bar-track">
                        <div
                          className="cat-bar-fill"
                          style={{ width: `${Math.min(pct, 100)}%`, background: meta.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Pie Chart — toggleable */}
              {showPie && byCategory.length >= 1 && (
                <div style={{ width: 190, flexShrink: 0, animation: 'fadeIn 0.3s ease' }}>
                  <PieChart data={pieData} size={190} />
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </>
  );
}
