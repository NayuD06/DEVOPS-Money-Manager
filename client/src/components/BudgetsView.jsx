import React, { useState, useEffect } from 'react';
import { getCategoriesByType } from './Sidebar.jsx';

function fmt(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
}

export default function BudgetsView({ stats, month, userId }) {
  const storageKey    = `finflow_budget_total_${userId || 'guest'}_${month}`;
  const catStorageKey = `finflow_budget_cats_${userId || 'guest'}_${month}`;

  const [totalBudget, setTotalBudget] = useState(15000000);
  const [catBudgets, setCatBudgets]   = useState({});
  const [isEditing, setIsEditing]     = useState(false);
  const [inputVal, setInputVal]       = useState('');
  const [customTick, setCustomTick]   = useState(0);

  useEffect(() => {
    function handleSync() { setCustomTick(t => t + 1); }
    window.addEventListener('finflow_categories_changed', handleSync);
    return () => window.removeEventListener('finflow_categories_changed', handleSync);
  }, []);

  useEffect(() => {
    const savedTotal = localStorage.getItem(storageKey);
    setTotalBudget(savedTotal ? Number(savedTotal) : 15000000);
    const savedCats = localStorage.getItem(catStorageKey);
    if (savedCats) {
      try { setCatBudgets(JSON.parse(savedCats)); } catch { setCatBudgets({}); }
    } else {
      setCatBudgets({});
    }
  }, [storageKey, catStorageKey]);

  function handleSaveTotal(e) {
    e.preventDefault();
    const val = Number(inputVal);
    if (isNaN(val) || val < 0) return;
    setTotalBudget(val);
    localStorage.setItem(storageKey, val.toString());
    setIsEditing(false);
  }

  function handleCatChange(catName, valStr) {
    const val = Number(valStr);
    const updated = { ...catBudgets, [catName]: isNaN(val) ? 0 : val };
    setCatBudgets(updated);
    localStorage.setItem(catStorageKey, JSON.stringify(updated));
  }

  const { totalExpense = 0, byCategory = [] } = stats || {};
  const pct       = totalBudget > 0 ? (totalExpense / totalBudget) * 100 : 0;
  const remaining = totalBudget - totalExpense;

  const now = new Date();
  const [yearStr, monthStr] = (month || now.toISOString().slice(0, 7)).split('-');
  const y = Number(yearStr), m = Number(monthStr);
  const daysInMonth = new Date(y, m, 0).getDate();
  let remainingDays = daysInMonth;
  if (now.getFullYear() === y && (now.getMonth() + 1) === m) {
    remainingDays = Math.max(1, daysInMonth - now.getDate() + 1);
  }
  const dailySuggested = remaining > 0 ? remaining / remainingDays : 0;

  let progressColor = '#10b981';
  let statusIcon = '\uD83D\uDEE1\uFE0F';
  let statusText = 'An toàn';
  if (pct >= 70 && pct <= 90)      { progressColor = '#f59e0b'; statusIcon = '\u26A0\uFE0F'; statusText = 'Cần chú ý'; }
  else if (pct > 90 && pct <= 100) { progressColor = '#f97316'; statusIcon = '\uD83D\uDEA8'; statusText = 'Sắp vượt!'; }
  else if (pct > 100)              { progressColor = '#ef4444'; statusIcon = '\uD83D\uDCA5'; statusText = 'Bội chi!'; }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* 1. Main Budget Overview */}
      <div className="budget-card" style={{ borderTop: `4px solid ${progressColor}` }}>

        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          🎯 Hạn mức tháng {month?.slice(5)}/{month?.slice(0, 4)}
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveTotal} style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="number"
              className="form-control"
              style={{ flex: 1, minWidth: 140, fontWeight: 700, fontSize: '1.1rem', color: 'var(--c-accent)' }}
              placeholder="VD: 15000000"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px' }}>Lưu</button>
            <button type="button" className="btn btn-ghost" style={{ padding: '8px 14px' }} onClick={() => setIsEditing(false)}>Huỷ</button>
          </form>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--c-text)' }}>
              {fmt(totalBudget)}
            </span>
            <button
              className="btn btn-ghost"
              style={{ padding: '4px 12px', fontSize: '0.82rem', borderRadius: 99 }}
              onClick={() => { setInputVal(totalBudget.toString()); setIsEditing(true); }}
            >
              ✏️ Đổi
            </button>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, flexWrap: 'wrap', gap: 6 }}>
          <div style={{ fontSize: '0.88rem', color: 'var(--c-text-2)', fontWeight: 500 }}>
            Đã chi: <strong style={{ color: progressColor }}>{fmt(totalExpense)}</strong>
            <span style={{ color: 'var(--c-text-3)', marginLeft: 4 }}>({pct.toFixed(1)}%)</span>
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: remaining >= 0 ? '#10b981' : '#ef4444' }}>
            {remaining >= 0 ? `Còn ${fmt(remaining)}` : `Vượt ${fmt(-remaining)}`}
          </div>
        </div>

        <div className="budget-progress-track" style={{ marginTop: 8 }}>
          <div
            className="budget-progress-fill"
            style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: progressColor, boxShadow: `0 0 10px ${progressColor}66` }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: progressColor }}>
            {statusIcon} {statusText}
          </span>
          <div style={{ background: 'var(--c-surface2)', border: '1px solid var(--c-border)', borderRadius: 'var(--radius-sm)', padding: '6px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--c-text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tối đa/ngày</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: dailySuggested > 0 ? '#10b981' : '#ef4444' }}>
              {fmt(dailySuggested)}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Per-category budget cards */}
      <div>
        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--c-text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          🏷️ Hạn mức theo danh mục
          <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--c-text-3)' }}>– nhập số tiền để đặt</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {getCategoriesByType('expense').map(cat => {
            const stat      = byCategory.find(c => c._id === cat.name);
            const spent     = stat ? stat.total : 0;
            const catBudget = catBudgets[cat.name] || 0;
            const catPct    = catBudget > 0 ? (spent / catBudget) * 100 : 0;

            let catColor = '#10b981';
            if (catPct >= 70 && catPct <= 100) catColor = '#f59e0b';
            if (catPct > 100) catColor = '#ef4444';

            return (
              <div
                key={cat.name}
                className="budget-card"
                style={{ padding: '14px 16px', gap: 8, borderLeft: `4px solid ${cat.color}` }}
              >
                {/* Row 1: category name + spent amount */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge" style={{ background: cat.color + '22', color: cat.color, fontSize: '0.88rem' }}>
                    <span>{cat.icon}</span> <span>{cat.name}</span>
                  </span>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: spent > 0 ? 'var(--c-text)' : 'var(--c-text-3)' }}>
                    {fmt(spent)}
                  </span>
                </div>

                {/* Row 2: budget input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--c-text-3)', fontWeight: 600, flexShrink: 0 }}>Hạn mức:</span>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Chưa đặt..."
                    value={catBudgets[cat.name] ?? ''}
                    onChange={e => handleCatChange(cat.name, e.target.value)}
                    style={{ flex: 1, padding: '6px 10px', fontSize: '0.88rem', fontWeight: 700, textAlign: 'right' }}
                  />
                </div>

                {/* Row 3: progress */}
                {catBudget > 0 ? (
                  <>
                    <div className="budget-progress-track" style={{ height: 8, marginTop: 2 }}>
                      <div
                        className="budget-progress-fill"
                        style={{ width: `${Math.min(catPct, 100)}%`, backgroundColor: catColor }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700 }}>
                      <span style={{ color: catColor }}>
                        {catPct > 100 ? `Vượt ${fmt(spent - catBudget)}` : `Còn ${fmt(catBudget - spent)}`}
                      </span>
                      <span style={{ color: catColor }}>{catPct.toFixed(0)}%</span>
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: '0.78rem', color: 'var(--c-text-3)', fontStyle: 'italic' }}>Chưa đặt hạn mức</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
