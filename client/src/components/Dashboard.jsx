import React, { useState, useEffect, useCallback } from 'react';
import StatsCards from './StatsCards.jsx';
import ExpenseTable from './ExpenseTable.jsx';
import ExpenseForm from './ExpenseForm.jsx';
import DeleteConfirm from './DeleteConfirm.jsx';
import BudgetsView from './BudgetsView.jsx';
import WelcomePage from './WelcomePage.jsx';
import { fetchExpenses, fetchStats, createExpense, updateExpense, deleteExpense } from '../api/expenses.js';

export default function Dashboard({ activeTab = 'home', onTab, month, category, type, user, onOpenAuth, onToast }) {
  // ── Data state ─────────────────────────────────────────
  const [expenses,   setExpenses]   = useState([]);
  const [stats,      setStats]      = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page,       setPage]       = useState(1);

  // ── Loading states ─────────────────────────────────────
  const [loadingList,  setLoadingList]  = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingMut,   setLoadingMut]   = useState(false);

  // ── Modal state ────────────────────────────────────────
  const [showForm,     setShowForm]     = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Fetch list ─────────────────────────────────────────
  const loadExpenses = useCallback(async (pg = 1) => {
    if (!user) return;
    setLoadingList(true);
    try {
      const data = await fetchExpenses({ month, category, type, page: pg, limit: 15 });
      setExpenses(data.expenses || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      if (err.message.includes('401') || err.message.includes('đăng nhập')) {
        // Not logged in or token expired
      } else {
        onToast('error', 'Không tải được danh sách', err.message);
      }
    } finally {
      setLoadingList(false);
    }
  }, [month, category, type, user, onToast]);

  // ── Fetch stats ────────────────────────────────────────
  const loadStats = useCallback(async () => {
    if (!user) return;
    setLoadingStats(true);
    try {
      const data = await fetchStats({ month, type });
      setStats(data);
    } catch (err) {
      console.warn('Stats load error:', err.message);
    } finally {
      setLoadingStats(false);
    }
  }, [month, type, user]);

  // Reset page về 1 khi filter thay đổi
  useEffect(() => { setPage(1); }, [month, category, type, user]);

  useEffect(() => {
    if (user && activeTab !== 'home') {
      loadExpenses(page);
    } else if (!user) {
      setExpenses([]);
      setStats(null);
    }
  }, [loadExpenses, page, user, activeTab]);

  useEffect(() => {
    if (user && activeTab !== 'home') {
      loadStats();
    }
  }, [loadStats, user, activeTab]);

  // ── Create ─────────────────────────────────────────────
  async function handleCreate(data) {
    setLoadingMut(true);
    try {
      await createExpense(data);
      onToast('success', 'Đã thêm giao dịch thành công!');
      setShowForm(false);
      await Promise.all([loadExpenses(1), loadStats()]);
      setPage(1);
    } catch (err) {
      onToast('error', 'Thêm thất bại', err.message);
    } finally {
      setLoadingMut(false);
    }
  }

  // ── Update ─────────────────────────────────────────────
  async function handleUpdate(data) {
    setLoadingMut(true);
    try {
      await updateExpense(editTarget._id, data);
      onToast('success', 'Đã cập nhật giao dịch!');
      setEditTarget(null);
      await Promise.all([loadExpenses(page), loadStats()]);
    } catch (err) {
      onToast('error', 'Cập nhật thất bại', err.message);
    } finally {
      setLoadingMut(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────
  async function handleDelete() {
    setLoadingMut(true);
    try {
      await deleteExpense(deleteTarget._id);
      onToast('success', 'Đã xoá giao dịch!');
      setDeleteTarget(null);
      await Promise.all([loadExpenses(page), loadStats()]);
    } catch (err) {
      onToast('error', 'Xoá thất bại', err.message);
    } finally {
      setLoadingMut(false);
    }
  }

  // ── Pagination ─────────────────────────────────────────
  function goPage(p) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const handleExportCSV = async () => {
    try {
      onToast('info', 'Đang tạo báo cáo Excel (CSV)...', 'Vui lòng chờ trong giây lát');
      const res = await fetchExpenses({ month, category, type, page: 1, limit: 10000 });
      if (!res.expenses || res.expenses.length === 0) {
        return onToast('error', 'Không có dữ liệu', 'Không có giao dịch nào để xuất ra file.');
      }
      
      // Tạo tiêu đề (Header) cho file CSV (Thêm BOM \uFEFF để Excel hiển thị tiếng Việt có dấu chuẩn xác)
      const csvRows = ['\uFEFFNgày,Loại,Danh mục,Mô tả & Ghi chú,Số tiền (VNĐ)'];
      
      res.expenses.forEach(exp => {
        const date = new Date(exp.date).toLocaleDateString('vi-VN');
        const expType = exp.type === 'income' ? 'Thu' : 'Chi';
        const cat = `"${exp.category}"`;
        const desc = `"${(exp.description || '').replace(/"/g, '""')}"`;
        const amount = exp.amount;
        csvRows.push(`${date},${expType},${cat},${desc},${amount}`);
      });
      
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `BaoCao_SoThuChi_${month || 'All'}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      onToast('success', 'Xuất báo cáo thành công!', 'File Excel (CSV) đã được tải về máy của bạn.');
    } catch (err) {
      onToast('error', 'Xuất file thất bại', err.message);
    }
  };

  // Nếu chưa đăng nhập HOẶC đang chọn Tab Trang Chủ (home) -> Hiện WelcomePage
  if (!user || activeTab === 'home') {
    return (
      <WelcomePage
        user={user}
        onOpenAuth={onOpenAuth}
        onGoDashboard={() => {
          if (onTab) onTab('overview');
        }}
      />
    );
  }

  return (
    <>
      {/* Top action bar: Always visible across management tabs for fast input */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, background: 'var(--c-surface)', padding: '16px 22px', borderRadius: 'var(--radius)', border: '1px solid var(--c-border)', boxShadow: 'var(--shadow-sm)' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--c-text)' }}>
            {activeTab === 'overview' && '📊 Báo Cáo & Tổng Quan Tài Chính'}
            {activeTab === 'ledger'   && '📝 Sổ Ghi Chép Giao Dịch Thu/Chi'}
            {activeTab === 'budget'   && '🎯 Hạn Mức Chi Tiêu & Gợi Ý AI'}
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--c-text-2)', marginTop: 2 }}>
            Tháng {month?.slice(5)}/{month?.slice(0, 4)} • Tài khoản Sổ FinFlow của <strong style={{ color: 'var(--c-accent)' }}>{user.username}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleExportCSV}
            className="btn btn-ghost"
            style={{ padding: '11px 20px', fontSize: '0.95rem', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--c-border2)' }}
            title="Tải bảng kê chi tiết ra file Excel (CSV)"
          >
            <span>📥</span> <span className="hide-mobile">Xuất Excel</span>
          </button>
          <button
            id="btn-add-expense"
            className="btn btn-primary"
            style={{ padding: '11px 22px', fontSize: '0.95rem', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={() => { setEditTarget(null); setShowForm(true); }}
          >
            <span>➕</span> <span>Ghi nhận Thu/Chi</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Overview & Reports */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <StatsCards stats={stats} loading={loadingStats} month={month} />
          
          <div style={{ marginTop: 8 }}>
            <div className="section-header" style={{ marginBottom: 14 }}>
              <div className="section-title">⏱️ Giao dịch gần đây nhất</div>
            </div>
            <ExpenseTable
              expenses={expenses.slice(0, 5)}
              loading={loadingList}
              onEdit={exp => { setEditTarget(exp); setShowForm(true); }}
              onDelete={exp => setDeleteTarget(exp)}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Transaction Ledger */}
      {activeTab === 'ledger' && (
        <div>
          <div className="section-header" style={{ marginBottom: 16 }}>
            <div className="section-title">
              📑 Tất cả khoản Thu & Chi trong tháng
              {pagination.total > 0 && (
                <span style={{ marginLeft: 8, fontSize: '.84rem', color: 'var(--c-text-3)', fontWeight: 500 }}>
                  (Tổng {pagination.total} giao dịch)
                </span>
              )}
            </div>
          </div>

          <ExpenseTable
            expenses={expenses}
            loading={loadingList}
            onEdit={exp => { setEditTarget(exp); setShowForm(true); }}
            onDelete={exp => setDeleteTarget(exp)}
          />

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button className="page-btn" disabled={page <= 1} onClick={() => goPage(page - 1)}>← Trước</button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                .filter(p => Math.abs(p - page) <= 2 || p === 1 || p === pagination.pages)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  typeof p === 'number'
                    ? <button key={i} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => goPage(p)}>{p}</button>
                    : <span key={i} className="page-info">{p}</span>
                )
              }
              <button className="page-btn" disabled={page >= pagination.pages} onClick={() => goPage(page + 1)}>Sau →</button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Monthly Budget */}
      {activeTab === 'budget' && (
        <BudgetsView stats={stats} month={month} userId={user?._id || user?.username} />
      )}

      {/* Create / Edit modal */}
      {showForm && (
        <ExpenseForm
          initial={editTarget}
          onSubmit={editTarget ? handleUpdate : handleCreate}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
          loading={loadingMut}
        />
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <DeleteConfirm
          expense={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={loadingMut}
        />
      )}
    </>
  );
}
