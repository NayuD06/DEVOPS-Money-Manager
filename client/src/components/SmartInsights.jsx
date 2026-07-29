import React from 'react';

/**
 * SmartInsights — So sánh thu/chi tháng này vs tháng trước
 * và hiển thị lời gợi ý thông minh cho người dùng.
 */
export default function SmartInsights({ stats, prevStats, month }) {
  if (!stats || !prevStats) return null;

  const { totalIncome: curIncome = 0, totalExpense: curExpense = 0, byCategory: curCats = [] } = stats;
  const { totalIncome: prevIncome = 0, totalExpense: prevExpense = 0 } = prevStats;

  // If no previous data at all, don't render
  if (prevIncome === 0 && prevExpense === 0) return null;

  const fmt = (v) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  // Calculate % changes
  const incomeDiff = prevIncome > 0 ? ((curIncome - prevIncome) / prevIncome) * 100 : null;
  const expenseDiff = prevExpense > 0 ? ((curExpense - prevExpense) / prevExpense) * 100 : null;

  // Get prev month label
  const prevMonthLabel = (() => {
    if (!month) return 'tháng trước';
    const [y, m] = month.split('-').map(Number);
    const pm = m === 1 ? 12 : m - 1;
    const py = m === 1 ? y - 1 : y;
    return `tháng ${pm}/${py}`;
  })();

  const curMonthLabel = month ? `tháng ${month.slice(5)}/${month.slice(0, 4)}` : 'tháng này';

  // Build insight items
  const insights = [];

  // Income insight
  if (incomeDiff !== null) {
    if (incomeDiff > 0) {
      insights.push({
        icon: '📈',
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.08)',
        border: 'rgba(16, 185, 129, 0.25)',
        title: `Thu nhập ${curMonthLabel} tăng ${incomeDiff.toFixed(1)}% so với ${prevMonthLabel}`,
        detail: `${prevMonthLabel}: ${fmt(prevIncome)} → ${curMonthLabel}: ${fmt(curIncome)}`,
      });
    } else if (incomeDiff < 0) {
      insights.push({
        icon: '📉',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.08)',
        border: 'rgba(245, 158, 11, 0.25)',
        title: `Thu nhập ${curMonthLabel} giảm ${Math.abs(incomeDiff).toFixed(1)}% so với ${prevMonthLabel}`,
        detail: `${prevMonthLabel}: ${fmt(prevIncome)} → ${curMonthLabel}: ${fmt(curIncome)}`,
      });
    } else {
      insights.push({
        icon: '➡️',
        color: '#6b7280',
        bg: 'rgba(107, 114, 128, 0.08)',
        border: 'rgba(107, 114, 128, 0.2)',
        title: `Thu nhập ${curMonthLabel} giữ nguyên so với ${prevMonthLabel}`,
        detail: `${fmt(curIncome)} / tháng`,
      });
    }
  }

  // Expense insight
  if (expenseDiff !== null) {
    if (expenseDiff > 20) {
      insights.push({
        icon: '⚠️',
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.08)',
        border: 'rgba(239, 68, 68, 0.25)',
        title: `Chi tiêu tăng mạnh ${expenseDiff.toFixed(1)}% so với ${prevMonthLabel}`,
        detail: `${prevMonthLabel}: ${fmt(prevExpense)} → ${curMonthLabel}: ${fmt(curExpense)}`,
      });
    } else if (expenseDiff > 0) {
      insights.push({
        icon: '🔔',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.08)',
        border: 'rgba(245, 158, 11, 0.25)',
        title: `Chi tiêu ${curMonthLabel} tăng nhẹ ${expenseDiff.toFixed(1)}% so với ${prevMonthLabel}`,
        detail: `${prevMonthLabel}: ${fmt(prevExpense)} → ${curMonthLabel}: ${fmt(curExpense)}`,
      });
    } else if (expenseDiff < 0) {
      insights.push({
        icon: '🎉',
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.08)',
        border: 'rgba(16, 185, 129, 0.25)',
        title: `Tuyệt vời! Chi tiêu giảm ${Math.abs(expenseDiff).toFixed(1)}% so với ${prevMonthLabel}`,
        detail: `${prevMonthLabel}: ${fmt(prevExpense)} → ${curMonthLabel}: ${fmt(curExpense)}`,
      });
    }
  }

  // Smart tip: expense grows faster than income
  if (incomeDiff !== null && expenseDiff !== null && expenseDiff > incomeDiff && expenseDiff > 10) {
    const topCat = curCats[0];
    insights.push({
      icon: '💡',
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.08)',
      border: 'rgba(139, 92, 246, 0.25)',
      title: 'Chi tiêu đang tăng nhanh hơn thu nhập',
      detail: topCat
        ? `Hãy xem lại khoản chi "${topCat._id}" — danh mục tốn kém nhất của bạn tháng này.`
        : 'Hãy kiểm soát chi tiêu để giữ số dư dương nhé!',
    });
  }

  if (insights.length === 0) return null;

  return (
    <div
      style={{
        background: 'var(--c-surface)',
        border: '1px solid var(--c-border)',
        borderRadius: 'var(--radius)',
        padding: '20px 24px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: '1.2rem' }}>🤖</span>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--c-text)', margin: 0 }}>
          Phân Tích Thông Minh
        </h3>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 99,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff',
            letterSpacing: '0.03em',
          }}
        >
          AI
        </span>
        <span style={{ fontSize: '0.8rem', color: 'var(--c-text-3)', marginLeft: 'auto' }}>
          So sánh {curMonthLabel} vs {prevMonthLabel}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {insights.map((ins, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: 14,
              padding: '12px 16px',
              borderRadius: 12,
              background: ins.bg,
              border: `1px solid ${ins.border}`,
              alignItems: 'flex-start',
            }}
          >
            <span style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: 1 }}>{ins.icon}</span>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: ins.color, marginBottom: 3 }}>
                {ins.title}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--c-text-2)' }}>
                {ins.detail}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
