import React, { useState, useEffect } from 'react';
import { getCategoriesByType } from './Sidebar.jsx';

function fmt(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
}

export default function BudgetsView({ stats, month, userId }) {
  const storageKey = `finflow_budget_total_${userId || 'guest'}_${month}`;
  const catStorageKey = `finflow_budget_cats_${userId || 'guest'}_${month}`;

  const [totalBudget, setTotalBudget] = useState(15000000); // Default 15M
  const [catBudgets, setCatBudgets]   = useState({});
  const [isEditing, setIsEditing]     = useState(false);
  const [inputVal, setInputVal]       = useState('');
  const [customTick, setCustomTick]   = useState(0);

  useEffect(() => {
    function handleSync() { setCustomTick(t => t + 1); }
    window.addEventListener('finflow_categories_changed', handleSync);
    return () => window.removeEventListener('finflow_categories_changed', handleSync);
  }, []);

  // Load from localStorage on mount or when month/userId changes
  useEffect(() => {
    const savedTotal = localStorage.getItem(storageKey);
    if (savedTotal) {
      setTotalBudget(Number(savedTotal));
    } else {
      setTotalBudget(15000000);
    }

    const savedCats = localStorage.getItem(catStorageKey);
    if (savedCats) {
      try { setCatBudgets(JSON.parse(savedCats)); } catch (e) { setCatBudgets({}); }
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

  // Calculate percentage & remaining
  const pct = totalBudget > 0 ? (totalExpense / totalBudget) * 100 : 0;
  const remaining = totalBudget - totalExpense;

  // Days calculation for smart daily suggestion
  const now = new Date();
  const [yearStr, monthStr] = (month || now.toISOString().slice(0, 7)).split('-');
  const y = Number(yearStr);
  const m = Number(monthStr);
  const daysInMonth = new Date(y, m, 0).getDate();
  
  let remainingDays = daysInMonth;
  if (now.getFullYear() === y && (now.getMonth() + 1) === m) {
    remainingDays = Math.max(1, daysInMonth - now.getDate() + 1);
  }

  const dailySuggested = remaining > 0 ? remaining / remainingDays : 0;

  // Color threshold
  let progressColor = '#10b981'; // Green < 70%
  let statusText = '🛡️ An toàn (Dưới 70% hạn mức)';
  if (pct >= 70 && pct <= 90) {
    progressColor = '#f59e0b'; // Yellow 70-90%
    statusText = '⚠️ Cảnh báo (Đã chi 70% - 90% hạn mức)';
  } else if (pct > 90 && pct <= 100) {
    progressColor = '#f97316'; // Orange > 90%
    statusText = '🚨 Nguy cơ vượt hạn mức (Sắp hết ngân sách)!';
  } else if (pct > 100) {
    progressColor = '#ef4444'; // Red > 100%
    statusText = '💥 BỘI CHI! Bạn đã tiêu vượt quá hạn mức đặt ra!';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. Main Budget Overview Card */}
      <div className="budget-card" style={{ borderTop: `4px solid ${progressColor}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              🎯 HẠN MỨC CHI TIÊU THÁNG {month?.slice(5)}/{month?.slice(0, 4)}
            </div>
            {isEditing ? (
              <form onSubmit={handleSaveTotal} style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                <input
                  type="number"
                  className="form-control"
                  style={{ width: 180, fontWeight: 700, fontSize: '1.2rem', color: 'var(--c-accent)' }}
                  placeholder="VD: 15000000"
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px' }}>Lưu</button>
                <button type="button" className="btn btn-ghost" style={{ padding: '8px 14px' }} onClick={() => setIsEditing(false)}>Huỷ</button>
              </form>
            ) : (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 6 }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--c-text)' }}>
                  {fmt(totalBudget)}
                </span>
                <button
                  className="btn-icon"
                  style={{ fontSize: '0.9rem', color: 'var(--c-accent)', fontWeight: 600 }}
                  onClick={() => { setInputVal(totalBudget.toString()); setIsEditing(true); }}
                >
                  ✏️ Đổi hạn mức
                </button>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'right', background: 'var(--c-surface2)', padding: '12px 18px', borderRadius: 'var(--radius)', border: '1px solid var(--c-border)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--c-text-2)', fontWeight: 600 }}>ĐÃ CHI TIÊU</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: progressColor }}>
              {fmt(totalExpense)} <span style={{ fontSize: '0.9rem', color: 'var(--c-text-3)' }}>({pct.toFixed(1)}%)</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
            <span style={{ color: progressColor }}>{statusText}</span>
            <span style={{ color: remaining >= 0 ? '#10b981' : '#ef4444' }}>
              {remaining >= 0 ? `Còn lại: ${fmt(remaining)}` : `Vượt mức: ${fmt(-remaining)}`}
            </span>
          </div>
          <div className="budget-progress-track">
            <div
              className="budget-progress-fill"
              style={{
                width: `${Math.min(pct, 100)}%`,
                backgroundColor: progressColor,
                boxShadow: `0 0 12px ${progressColor}88`
              }}
            />
          </div>
        </div>

        {/* Smart Daily Suggestion Banner */}
        <div style={{ background: 'linear-gradient(135deg, rgba(22, 119, 255, 0.15), rgba(16, 185, 129, 0.1))', padding: '16px 20px', borderRadius: 'var(--radius)', border: '1px solid rgba(22, 119, 255, 0.3)', display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
          <div style={{ fontSize: '2.4rem' }}>💡</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--c-text)' }}>
              Gợi ý chi tiêu thông minh từ FinFlow AI
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--c-text-2)', marginTop: 2 }}>
              Tháng {m} còn <strong>{remainingDays} ngày</strong>. Để giữ đúng hạn mức, bạn chỉ nên tiêu tối đa:
            </div>
          </div>
          <div style={{ textAlign: 'right', background: 'var(--c-surface)', padding: '10px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--c-border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--c-text-3)', fontWeight: 600 }}>TỐI ĐA MỖI NGÀY</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: dailySuggested > 0 ? '#10b981' : '#ef4444' }}>
              {fmt(dailySuggested)} / ngày
            </div>
          </div>
        </div>
      </div>

      {/* 2. Category Budgets Table */}
      <div className="table-wrap" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--c-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
              🏷️ Kiểm soát hạn mức theo từng Danh mục Chi tiêu
            </h3>
            <p style={{ fontSize: '0.83rem', color: 'var(--c-text-2)', marginTop: 2 }}>
              Theo dõi chi tiết số tiền đã tiêu ở từng hạng mục so với hạn mức bạn mong muốn.
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Danh mục</th>
                <th style={{ textAlign: 'right' }}>Thực tế đã chi</th>
                <th style={{ textAlign: 'right', width: '220px' }}>Hạn mức danh mục</th>
                <th style={{ textAlign: 'right' }}>Tình trạng</th>
                <th style={{ width: '25%' }}>Tiến độ</th>
              </tr>
            </thead>
            <tbody>
              {getCategoriesByType('expense').map(cat => {
                const stat = byCategory.find(c => c._id === cat.name);
                const spent = stat ? stat.total : 0;
                const catBudget = catBudgets[cat.name] || 0;
                const catPct = catBudget > 0 ? (spent / catBudget) * 100 : 0;

                let catColor = '#10b981';
                if (catPct >= 70 && catPct <= 100) catColor = '#f59e0b';
                if (catPct > 100) catColor = '#ef4444';

                return (
                  <tr key={cat.name}>
                    <td>
                      <span className="badge" style={{ background: cat.color + '22', color: cat.color, fontSize: '0.86rem' }}>
                        <span>{cat.icon}</span> <span>{cat.name}</span>
                      </span>
                    </td>
                    <td className="td-amount" style={{ color: spent > 0 ? 'var(--c-text)' : 'var(--c-text-3)' }}>
                      {fmt(spent)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Đặt hạn mức..."
                        value={catBudgets[cat.name] ?? ''}
                        onChange={e => handleCatChange(cat.name, e.target.value)}
                        style={{ textAlign: 'right', padding: '6px 10px', fontSize: '0.86rem', width: 140, marginLeft: 'auto' }}
                      />
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, fontSize: '0.85rem' }}>
                      {catBudget > 0 ? (
                        <span style={{ color: catColor }}>
                          {catPct > 100 ? `Vượt ${fmt(spent - catBudget)}` : `Còn ${fmt(catBudget - spent)}`}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--c-text-3)', fontStyle: 'italic' }}>Chưa đặt hạn mức</span>
                      )}
                    </td>
                    <td>
                      {catBudget > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="budget-progress-track" style={{ flex: 1, height: 8 }}>
                            <div
                              className="budget-progress-fill"
                              style={{ width: `${Math.min(catPct, 100)}%`, backgroundColor: catColor }}
                            />
                          </div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, width: '42px', textAlign: 'right', color: catColor }}>
                            {catPct.toFixed(0)}%
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--c-text-3)' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
