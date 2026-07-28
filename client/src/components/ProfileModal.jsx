import React, { useState } from 'react';
import { updateProfile } from '../api/auth.js';

export default function ProfileModal({ user, onClose, onUpdate, onToast }) {
  const [username, setUsername] = useState(user?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  
  // URL cho Backend server
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar ? `${API_URL}${user.avatar}` : ''
  );
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        return onToast('error', 'Chỉ được tải lên file ảnh');
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('username', username);
      if (currentPassword) formData.append('currentPassword', currentPassword);
      if (newPassword) formData.append('newPassword', newPassword);
      if (avatarFile) formData.append('avatar', avatarFile);

      const res = await updateProfile(formData);
      onToast('success', 'Thành công', res.message);
      onUpdate(res.user);
      onClose();
    } catch (err) {
      onToast('error', 'Thất bại', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <button className="btn-close" onClick={onClose} title="Đóng">&times;</button>
        <h2 className="modal-title">Hồ Sơ Của Tôi</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: 'center' }}>
            <div 
              style={{
                width: '100px', 
                height: '100px', 
                borderRadius: '50%', 
                margin: '0 auto 10px',
                backgroundColor: 'var(--primary-color)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 'bold',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '3px solid var(--border-color)'
              }}
              onClick={() => document.getElementById('avatar-upload').click()}
              title="Nhấn để đổi ảnh"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                username.charAt(0).toUpperCase()
              )}
            </div>
            <input 
              type="file" 
              id="avatar-upload" 
              accept="image/*" 
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <label htmlFor="avatar-upload" style={{ cursor: 'pointer', color: 'var(--primary-color)', fontSize: '0.9rem' }}>
              Thay đổi ảnh đại diện
            </label>
          </div>

          <div className="form-group">
            <label>Tên hiển thị</label>
            <input 
              type="text" 
              className="form-control" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required
            />
          </div>

          <div className="form-group">
            <label>Email (Đăng nhập)</label>
            <input 
              type="email" 
              className="form-control" 
              value={user?.email} 
              disabled 
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
            />
          </div>

          <hr style={{ margin: '20px 0', borderColor: 'var(--border-color)' }} />
          <h4 style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Đổi mật khẩu (Bỏ qua nếu không đổi)</h4>

          <div className="form-group">
            <label>Mật khẩu hiện tại</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="Nhập mật khẩu cũ..."
              value={currentPassword} 
              onChange={e => setCurrentPassword(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu mới</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="Nhập mật khẩu mới..."
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Hủy
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
