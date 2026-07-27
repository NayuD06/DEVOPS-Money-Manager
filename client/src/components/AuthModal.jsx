import React, { useState } from 'react';
import { login, register } from '../api/auth';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // ── Kiểm tra lỗi (Validation) bằng Javascript chuyên nghiệp thay cho HTML mặc định ──
    if (!isLogin && (!username || username.trim().length < 2)) {
      setError('❌ Tên người dùng phải có ít nhất 2 ký tự!');
      return;
    }
    if (!email || !email.trim()) {
      setError('❌ Vui lòng nhập địa chỉ Email!');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('❌ Định dạng Email không hợp lệ (ví dụ: name@example.com)!');
      return;
    }
    if (!password) {
      setError('❌ Vui lòng nhập mật khẩu bảo mật!');
      return;
    }
    if (password.length < 6) {
      setError('❌ Mật khẩu bảo mật phải có tối thiểu 6 ký tự!');
      return;
    }

    setLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await login(email, password);
      } else {
        res = await register(username, email, password);
      }
      localStorage.setItem('spendwise_token', res.token);
      onSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Đóng" title="Đóng">✕</button>
        
        <div className="auth-header">
          <div className="auth-logo">📘✨</div>
          <h2 style={{ color: 'var(--c-text)', fontWeight: 800 }}>{isLogin ? 'Chào mừng đến với FinFlow!' : 'Mở Sổ Tài Chính Mới'}</h2>
          <p style={{ color: 'var(--c-text-2)', fontSize: '0.88rem' }}>{isLogin ? 'Đăng nhập để ghi chép và kiểm soát hạn mức thu chi' : 'Bắt đầu hành trình tự do tài chính cùng Sổ Thu Chi FinFlow Pro'}</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            🔐 Đăng nhập
          </button>
          <button
            type="button"
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            ✨ Đăng ký Sổ
          </button>
        </div>

        {error && <div className="auth-error-alert" style={{ animation: 'fadeIn 0.2s ease' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="username">Tên người dùng <span className="req">*</span></label>
              <input
                id="username"
                className="form-control"
                type="text"
                placeholder="Ví dụ: Nguyễn Văn An"
                value={username}
                onChange={(e) => { setUsername(e.target.value); if (error) setError(''); }}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email <span className="req">*</span></label>
            <input
              id="email"
              className="form-control"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Mật khẩu <span className="req">*</span></label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                id="password"
                className="form-control"
                type={showPassword ? 'text' : 'password'}
                placeholder="Tối thiểu 6 ký tự..."
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                style={{ paddingRight: '44px', width: '100%' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.15rem',
                  color: 'var(--c-text-3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  transition: 'transform 0.2s ease',
                }}
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? '⏳ Đang xử lý...' : isLogin ? '🚀 Vào Sổ Thu Chi Ngay' : '🎉 Tạo Sổ Miễn Phí'}
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? (
            <span>Chưa có Sổ FinFlow? <button type="button" onClick={() => setIsLogin(false)}>Đăng ký ngay</button></span>
          ) : (
            <span>Đã có Sổ FinFlow? <button type="button" onClick={() => setIsLogin(true)}>Đăng nhập</button></span>
          )}
        </div>
      </div>
    </div>
  );
}
