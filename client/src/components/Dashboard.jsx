import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import StatsCards from './StatsCards.jsx';
import ExpenseTable from './ExpenseTable.jsx';
import ExpenseForm from './ExpenseForm.jsx';
import DeleteConfirm from './DeleteConfirm.jsx';
import BudgetsView from './BudgetsView.jsx';
import WelcomePage from './WelcomePage.jsx';
import SmartInsights from './SmartInsights.jsx';
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

  // ── Previous month stats ────────────────────────────────
  const [prevStats, setPrevStats] = useState(null);

  // Helper: get previous month string "YYYY-MM"
  function getPrevMonth(m) {
    if (!m) return null;
    const [y, mo] = m.split('-').map(Number);
    const pm = mo === 1 ? 12 : mo - 1;
    const py = mo === 1 ? y - 1 : y;
    return `${py}-${String(pm).padStart(2, '0')}`;
  }

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
      // Also fetch previous month stats for Smart Insights
      const prevMonth = getPrevMonth(month);
      if (prevMonth) {
        fetchStats({ month: prevMonth })
          .then(data => setPrevStats(data))
          .catch(() => setPrevStats(null));
      } else {
        setPrevStats(null);
      }
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
      setShowForm(false);
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

  const handleExportXLSX = async () => {
    try {
      onToast('info', 'Đang tạo báo cáo Excel...', 'Vui lòng chờ trong giây lát');
      const res = await fetchExpenses({ month, category, type, page: 1, limit: 10000 });
      if (!res.expenses || res.expenses.length === 0) {
        return onToast('error', 'Không có dữ liệu', 'Không có giao dịch nào để xuất ra file.');
      }

      const fmt = (v) => new Intl.NumberFormat('vi-VN').format(v);
      const exps = res.expenses;
      const totalInc = exps.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
      const totalExp = exps.filter(e => e.type !== 'income').reduce((s, e) => s + e.amount, 0);
      const balance  = totalInc - totalExp;
      const savRate  = totalInc > 0 ? ((balance / totalInc) * 100).toFixed(1) : '0';
      const wb = XLSX.utils.book_new();

      /* ── Sheet 1: Tổng Quan ── */
      const s1Data = [
        ['BÁO CÁO THU CHI - ' + (month ? `THÁNG ${month.slice(5)}/${month.slice(0,4)}` : 'TẤT CẢ')],
        [],
        ['Chỉ số', 'Giá trị (VNĐ)'],
        ['Tổng Thu Nhập',  totalInc],
        ['Tổng Chi Tiêu',  totalExp],
        ['Số Dư (Thu - Chi)', balance],
        ['Tỷ lệ tiết kiệm', `${savRate}%`],
        ['Tổng số giao dịch', exps.length],
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(s1Data);
      ws1['!cols'] = [{ wch: 28 }, { wch: 20 }];
      // Style header
      ws1['A1'] = { v: s1Data[0][0], t: 's', s: { font: { bold: true, sz: 14 }, alignment: { horizontal: 'center' } } };
      XLSX.utils.book_append_sheet(wb, ws1, 'Tổng Quan');

      /* ── Sheet 2: Chi Tiết Giao Dịch ── */
      const s2Rows = [['STT', 'Ngày', 'Loại', 'Danh Mục', 'Mô Tả', 'Số Tiền (VNĐ)']];
      exps.forEach((exp, idx) => {
        s2Rows.push([
          idx + 1,
          new Date(exp.date).toLocaleDateString('vi-VN'),
          exp.type === 'income' ? 'Thu' : 'Chi',
          exp.category || '',
          exp.description || '',
          exp.amount,
        ]);
      });
      // Summary row
      s2Rows.push([]);
      s2Rows.push(['', '', '', '', 'TỔNG CỘNG', totalInc + totalExp]);
      const ws2 = XLSX.utils.aoa_to_sheet(s2Rows);
      ws2['!cols'] = [{ wch: 6 }, { wch: 14 }, { wch: 8 }, { wch: 18 }, { wch: 30 }, { wch: 18 }];
      XLSX.utils.book_append_sheet(wb, ws2, 'Chi Tiết Giao Dịch');

      /* ── Sheet 3: Theo Danh Mục ── */
      const catMap = {};
      exps.filter(e => e.type !== 'income').forEach(e => {
        catMap[e.category] = (catMap[e.category] || 0) + e.amount;
      });
      const s3Rows = [['Danh Mục', 'Tổng Chi (VNĐ)', '% Tổng Chi']];
      Object.entries(catMap)
        .sort((a, b) => b[1] - a[1])
        .forEach(([cat, total]) => {
          s3Rows.push([cat, total, totalExp > 0 ? `${((total / totalExp) * 100).toFixed(1)}%` : '0%']);
        });
      s3Rows.push([]);
      s3Rows.push(['TỔNG CỘNG', totalExp, '100%']);
      const ws3 = XLSX.utils.aoa_to_sheet(s3Rows);
      ws3['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, ws3, 'Theo Danh Mục');

      // Download
      XLSX.writeFile(wb, `BaoCao_SpendWise_${month || 'All'}.xlsx`);
      onToast('success', 'Xuất báo cáo thành công!', '3 Sheet: Tổng Quan, Chi Tiết, Theo Danh Mục.');
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
      {/* Top action bar */}
      <div className="dash-header">
        <div className="dash-header__text">
          <h2 className="dash-header__title">
            {activeTab === 'overview' && '📊 Báo Cáo & Tổng Quan'}
            {activeTab === 'ledger'   && '📝 Sổ Ghi Chép Giao Dịch'}
            {activeTab === 'budget'   && '🎯 Hạn Mức Chi Tiêu'}
          </h2>
          <p className="dash-header__sub">
            Tháng {month?.slice(5)}/{month?.slice(0, 4)} •{' '}
            Tài khoản của <strong style={{ color: 'var(--c-accent)' }}>{user.username}</strong>
          </p>
        </div>
        <div className="dash-header__actions">
          <button
            onClick={handleExportXLSX}
            className="btn btn-ghost"
            style={{ borderRadius: '99px', border: '1px solid var(--c-border2)' }}
            title="Xuất Excel"
          >
            <span>📥</span> <span className="hide-mobile">Xuất Excel</span>
          </button>
          <button
            id="btn-add-expense"
            className="btn btn-primary"
            style={{ borderRadius: '99px' }}
            onClick={() => { setEditTarget(null); setShowForm(true); }}
          >
            <span>➕</span> <span>Ghi nhận</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Overview & Reports */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <StatsCards stats={stats} loading={loadingStats} month={month} />

          <SmartInsights stats={stats} prevStats={prevStats} month={month} />

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
