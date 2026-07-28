import { useState, useEffect, useCallback } from 'react';
import Toast from './components/Toast.jsx';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import AuthModal from './components/AuthModal.jsx';
import { fetchCurrentUser } from './api/auth.js';

export default function App() {
  const [toasts, setToasts] = useState([]);
  const [activeTab, setTab] = useState('home');
  const [activeCategory, setCategory] = useState('');
  const [activeType, setType] = useState('');
  const [activeMonth, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('finflow_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('finflow_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => (t === 'light' ? 'dark' : 'light'));
  };

  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    fetchCurrentUser().then((u) => {
      if (u) {
        setUser(u);
        // Nếu đã đăng nhập thành công, tự động chuyển vào màn hình Tổng quan nếu đang ở Trang chủ
        setTab('overview');
      }
    });
  }, []);

  const addToast = useCallback((type, title, desc = '') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, type, title, desc }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('spendwise_token');
    setUser(null);
    setTab('home');
    addToast('info', 'Đã đăng xuất khỏi Sổ Thu Chi FinFlow');
  };

  const showSidebar = user && activeTab !== 'home';

  return (
    <div className="app">
      <Header
        user={user}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onGoHome={() => setTab('home')}
      />
      <div className="layout" style={{ gridTemplateColumns: showSidebar ? '260px 1fr' : '1fr' }}>
        {showSidebar && (
          <Sidebar
            activeTab={activeTab}
            onTab={setTab}
            activeCategory={activeCategory}
            onCategory={setCategory}
            activeMonth={activeMonth}
            onMonth={setMonth}
            activeType={activeType}
            onType={setType}
          />
        )}
        <main className="main" style={{ padding: showSidebar ? '28px 32px' : '0' }}>
          <Dashboard
            activeTab={activeTab}
            onTab={setTab}
            month={activeMonth}
            category={activeCategory}
            type={activeType}
            user={user}
            onOpenAuth={() => setShowAuthModal(true)}
            onToast={addToast}
          />
        </main>
      </div>
      
      {user && (
        <nav className="mobile-nav">
          <button className={`mobile-nav__btn ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setTab('home')}>
            <span className="icon">🏠</span>
            <span className="label">Trang chủ</span>
          </button>
          <button className={`mobile-nav__btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>
            <span className="icon">📊</span>
            <span className="label">Tổng quan</span>
          </button>
          <button className={`mobile-nav__btn ${activeTab === 'ledger' ? 'active' : ''}`} onClick={() => setTab('ledger')}>
            <span className="icon">📝</span>
            <span className="label">Ghi chép</span>
          </button>
          <button className={`mobile-nav__btn ${activeTab === 'budget' ? 'active' : ''}`} onClick={() => setTab('budget')}>
            <span className="icon">🎯</span>
            <span className="label">Hạn mức</span>
          </button>
        </nav>
      )}

      <Toast toasts={toasts} onRemove={removeToast} />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(u) => {
          setUser(u);
          setTab('overview');
          addToast('success', `Chào mừng ${u.username}!`, 'Đăng nhập Sổ FinFlow thành công');
        }}
      />
    </div>
  );
}
