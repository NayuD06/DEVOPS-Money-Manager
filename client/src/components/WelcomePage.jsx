import React from 'react';

export default function WelcomePage({ user, onOpenAuth, onGoDashboard }) {
  return (
    <div className="welcome-page">
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <span>✨</span> <span>Phiên bản Mới 2026 • Tông Màu Xanh Biển Chuyên Nghiệp</span>
        </div>
        <h1 className="hero-title">
          Sổ Thu Chi FinFlow <span style={{ color: 'var(--c-accent)' }}>Pro</span> — Kiểm Soát Dòng Tiền Thông Minh
        </h1>
        <p className="hero-subtitle">
          Ứng dụng ghi chép thu chi thuần túy, tập trung 100% vào sự tiện lợi trong đời sống hàng ngày. Giúp bạn kiểm soát hạn mức ngân sách tháng và theo dõi báo cáo phân bổ một cách trực quan, không rối rắm.
        </p>
        <div className="hero-cta">
          {user ? (
            <button
              className="btn btn-primary"
              style={{ padding: '14px 32px', fontSize: '1.05rem', borderRadius: '99px', boxShadow: 'var(--shadow-blue)' }}
              onClick={onGoDashboard}
            >
              🚀 Vào Sổ Ghi Chép Ngay (Dashboard)
            </button>
          ) : (
            <button
              className="btn btn-primary"
              style={{ padding: '14px 32px', fontSize: '1.05rem', borderRadius: '99px', boxShadow: 'var(--shadow-blue)' }}
              onClick={onOpenAuth}
            >
              🔐 Mở Sổ Miễn Phí Ngay
            </button>
          )}
          <a
            href="#features-section"
            className="btn btn-ghost"
            style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: '99px' }}
          >
            ⚡ Khám Phá Tính Năng
          </a>
        </div>
      </section>

      {/* 2. Features Grid */}
      <section id="features-section">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--c-text)' }}>
            Tại Sao Chọn Sổ Thu Chi FinFlow Pro?
          </h2>
          <p style={{ color: 'var(--c-text-2)', fontSize: '0.95rem', marginTop: 6 }}>
            Bộ công cụ được thiết kế tối giản, loại bỏ hoàn toàn sự rườm rà để bạn kiên trì ghi chép mỗi ngày.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Ghi Chép Nhanh 24/7</h3>
            <p>
              Ghi nhận các khoản Thu nhập và Chi tiêu chỉ trong vài giây. Phân loại theo các danh mục quen thuộc trong đời sống (Ăn uống, Di chuyển, Mua sắm, Lương...).
            </p>
          </div>

          <div className="feature-card" style={{ borderColor: 'var(--c-accent)' }}>
            <div className="feature-icon" style={{ background: 'var(--c-accent)', color: '#fff' }}>🎯</div>
            <h3>Kiểm Soát Hạn Mức & AI</h3>
            <p>
              Thiết lập ngân sách chi tiêu tối đa cho từng tháng. Hệ thống tự động cảnh báo theo ngưỡng % màu sắc và gợi ý thông minh số tiền tối đa được phép chi mỗi ngày.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Báo Cáo Phân Bổ Trực Quan</h3>
            <p>
              Theo dõi dòng tiền vào ra với các thông số minh bạch: Tổng thu, Tổng chi, Số dư thực tế cùng thanh tỷ trọng phần trăm chi tiêu cho từng hạng mục.
            </p>
          </div>
        </div>
      </section>

      {/* 3. About & Contact Grid */}
      <section className="about-contact-grid">
        {/* About Us */}
        <div className="info-box">
          <h3><span>📘</span> Về FinFlow Team (About Us)</h3>
          <p>
            Chúng tôi hiểu rằng việc duy trì thói quen quản lý tài chính cá nhân thường bị cản trở bởi những ứng dụng quá phức tạp, nhồi nhét vô số cổng thanh toán hoặc quảng cáo phiền toái.
          </p>
          <p>
            <strong>FinFlow Pro</strong> ra đời với sứ mệnh: <em>Trở thành cuốn sổ tay tài chính số hóa thuần túy và tin cậy nhất</em>. Chúng tôi loại bỏ các giao dịch thanh toán tự động không cần thiết để trả lại quyền kiểm soát thực sự cho bạn thông qua tự tay ghi chép và tự nhận thức chi tiêu.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
            <span className="badge" style={{ background: 'var(--c-surface2)', color: 'var(--c-accent)' }}>🔒 100% Bảo mật dữ liệu</span>
            <span className="badge" style={{ background: 'var(--c-surface2)', color: '#10b981' }}>⚡ Tốc độ tức thì</span>
          </div>
        </div>

        {/* Contact Us */}
        <div className="info-box">
          <h3><span>🎧</span> Liên Hệ Hỗ Trợ (Contact Us)</h3>
          <p>
            Bạn có góp ý về tính năng mới hay cần hỗ trợ kỹ thuật trong quá trình sử dụng Sổ? Đội ngũ chăm sóc khách hàng của FinFlow luôn sẵn sàng lắng nghe bạn!
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
            <div className="contact-item">
              <span className="icon">✉️</span>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--c-text-3)', fontWeight: 600 }}>EMAIL HỖ TRỢ</div>
                <strong>support@finflowpro.vn</strong>
              </div>
            </div>

            <div className="contact-item">
              <span className="icon">📞</span>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--c-text-3)', fontWeight: 600 }}>HOTLINE & ZALO SUPPORT</div>
                <strong>1900 6868 99</strong> <span style={{ fontSize: '0.8rem', color: 'var(--c-text-2)' }}>(08:00 - 18:00 hàng ngày)</span>
              </div>
            </div>

            <div className="contact-item">
              <span className="icon">🏢</span>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--c-text-3)', fontWeight: 600 }}>VĂN PHÒNG CHÍNH</div>
                <span>Tòa nhà TechHub Innovation, Quận 1, TP. Hồ Chí Minh</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer style={{ textAlign: 'center', paddingTop: 32, borderTop: '1px solid var(--c-border)', color: 'var(--c-text-3)', fontSize: '0.86rem' }}>
        <p>© 2026 Sổ Thu Chi FinFlow Pro. Bản quyền thuộc về FinFlow Team. Designed for Personal Finance Freedom.</p>
      </footer>
    </div>
  );
}
