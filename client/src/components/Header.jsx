import React from 'react';

export default function Header({ user, theme, onToggleTheme, onOpenAuth, onLogout, onGoHome }) {
  return (
    <header className="app-header">
      <div className="header-brand" onClick={onGoHome} title="Về trang giới thiệu FinFlow Pro">
        <span className="header-logo" role="img" aria-label="finflow-logo">📘✨</span>
        <div>
          <h1 className="header-title">Sổ Thu Chi FinFlow <span className="header-badge">Pro</span></h1>
          <p className="header-subtitle">Ứng dụng ghi chép & kiểm soát dòng tiền cá nhân</p>
        </div>
      </div>

      <div className="header-actions">
        {/* Nút bật/tắt chế độ Sáng / Tối */}
        {onToggleTheme && (
          <button
            className="btn-theme-toggle"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
          >
            <span className="theme-icon">{theme === 'dark' ? '🌞' : '🌙'}</span>
            <span>{theme === 'dark' ? 'Giao diện Sáng' : 'Giao diện Tối'}</span>
          </button>
        )}

        {user ? (
          <div className="user-profile-badge">
            <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <span className="user-name">{user.username}</span>
              <span className="user-email">{user.email}</span>
            </div>
            <button className="btn-logout" onClick={onLogout} title="Đăng xuất khỏi Sổ Thu Chi FinFlow">
              Đăng xuất ↗
            </button>
          </div>
        ) : (
          <button className="btn-login-header" onClick={onOpenAuth}>
            🔐 Đăng nhập / Đăng ký Sổ
          </button>
        )}
      </div>
    </header>
  );
}
