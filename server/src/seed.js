require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Expense = require('./models/Expense');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/spendwise';

function getDateInCurrentMonth(day) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const maxDay = new Date(year, month + 1, 0).getDate();
  const safeDay = Math.min(day, maxDay);
  return new Date(year, month, safeDay, 10, 0, 0);
}

async function seedData() {
  try {
    console.log('🔄 Đang kết nối đến MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Kết nối MongoDB thành công!');

    console.log('🧹 Đang làm sạch dữ liệu cũ (Users & Expenses)...');
    await User.deleteMany({});
    await Expense.deleteMany({});
    console.log('✨ Đã xóa dữ liệu cũ!');

    console.log('👤 Đang tạo 2 tài khoản người dùng demo...');
    const user1 = new User({
      username: 'Nguyễn Văn An',
      email: 'an.nguyen@finflow.vn',
      password: 'password123',
    });
    await user1.save();

    const user2 = new User({
      username: 'Trần Thị Mai',
      email: 'mai.tran@finflow.vn',
      password: 'password123',
    });
    await user2.save();

    console.log('📝 Đang tạo các khoản Thu / Chi mẫu cho tháng hiện tại...');
    const expensesData = [
      // ── Giao dịch của Nguyễn Văn An (user1) ──────────────────────────────────
      {
        userId: user1._id,
        type: 'income',
        amount: 25000000,
        description: 'Lương tháng chính thức tại công ty TechHub',
        category: 'Lương',
        date: getDateInCurrentMonth(1),
        note: 'Chuyển khoản qua VCB',
      },
      {
        userId: user1._id,
        type: 'income',
        amount: 5000000,
        description: 'Thưởng hoàn thành xuất sắc KPI Quý',
        category: 'Thưởng',
        date: getDateInCurrentMonth(5),
        note: 'Thưởng dự án FinFlow Pro',
      },
      {
        userId: user1._id,
        type: 'income',
        amount: 3200000,
        description: 'Cổ tức chứng khoán danh mục đầu tư dài hạn',
        category: 'Đầu tư',
        date: getDateInCurrentMonth(10),
        note: 'Quỹ mở ETF & chứng khoán bluechip',
      },
      {
        userId: user1._id,
        type: 'expense',
        amount: 4500000,
        description: 'Chi phí ăn trưa văn phòng & đi chợ thực phẩm hàng tuần',
        category: 'Ăn uống',
        date: getDateInCurrentMonth(2),
        note: 'Siêu thị WinMart & quán cơm VP',
      },
      {
        userId: user1._id,
        type: 'expense',
        amount: 1800000,
        description: 'Tiền điện, nước & Internet cáp quang tốc độ cao',
        category: 'Hoá đơn',
        date: getDateInCurrentMonth(4),
        note: 'Thanh toán tự động qua Vietcombank Digibank',
      },
      {
        userId: user1._id,
        type: 'expense',
        amount: 1200000,
        description: 'Đổ xăng ô tô/xe máy & phí gửi xe định kỳ tháng',
        category: 'Di chuyển',
        date: getDateInCurrentMonth(6),
        note: 'Cây xăng Petrolimex & vé tháng Vincom',
      },
      {
        userId: user1._id,
        type: 'expense',
        amount: 2500000,
        description: 'Mua sắm trang phục công sở mùa hè & giày thể thao',
        category: 'Mua sắm',
        date: getDateInCurrentMonth(8),
        note: 'Uniqlo & Zara',
      },
      {
        userId: user1._id,
        type: 'expense',
        amount: 1100000,
        description: 'Vé xem phim cuối tuần & gia hạn tài khoản Netflix Premium',
        category: 'Giải trí',
        date: getDateInCurrentMonth(12),
        note: 'Gói Premium 4K gia đình & CGV Gold Class',
      },
      {
        userId: user1._id,
        type: 'expense',
        amount: 900000,
        description: 'Khám nha khoa định kỳ & mua vitamin bổ sung sức khỏe',
        category: 'Sức khoẻ',
        date: getDateInCurrentMonth(15),
        note: 'Nha khoa Paris & Pharmacity',
      },
      {
        userId: user1._id,
        type: 'expense',
        amount: 850000,
        description: 'Cà phê & liên hoan nhẹ cùng nhóm dự án đồng nghiệp',
        category: 'Ăn uống',
        date: getDateInCurrentMonth(18),
        note: 'Highlands Coffee, Phúc Long',
      },
      {
        userId: user1._id,
        type: 'expense',
        amount: 450000,
        description: 'GrabTaxi đi gặp khách hàng đối tác ký hợp đồng',
        category: 'Di chuyển',
        date: getDateInCurrentMonth(20),
        note: 'Hóa đơn công ty hỗ trợ thanh toán 50%',
      },

      // ── Giao dịch của Trần Thị Mai (user2) ──────────────────────────────────
      {
        userId: user2._id,
        type: 'income',
        amount: 18000000,
        description: 'Lương tháng vị trí Senior Marketing Specialist',
        category: 'Lương',
        date: getDateInCurrentMonth(1),
        note: 'Chuyển khoản qua Techcombank',
      },
      {
        userId: user2._id,
        type: 'income',
        amount: 6500000,
        description: 'Doanh thu kinh doanh cửa hàng thời trang thiết kế online',
        category: 'Kinh doanh',
        date: getDateInCurrentMonth(12),
        note: 'Tổng kết doanh thu tuần 2',
      },
      {
        userId: user2._id,
        type: 'expense',
        amount: 2200000,
        description: 'Tiền thuê căn hộ dịch vụ & phí quản lý chung cư tháng',
        category: 'Hoá đơn',
        date: getDateInCurrentMonth(3),
        note: 'Chuyển khoản chủ nhà đúng hạn',
      },
      {
        userId: user2._id,
        type: 'expense',
        amount: 3200000,
        description: 'Ăn uống hàng ngày & mua thực phẩm hữu cơ cho gia đình',
        category: 'Ăn uống',
        date: getDateInCurrentMonth(7),
        note: 'Bách Hóa Xanh & Farmers Market',
      },
      {
        userId: user2._id,
        type: 'expense',
        amount: 3800000,
        description: 'Mỹ phẩm chăm sóc da & bộ dưỡng body chính hãng',
        category: 'Mua sắm',
        date: getDateInCurrentMonth(14),
        note: 'Shopee Mall & Estee Lauder',
      },
      {
        userId: user2._id,
        type: 'expense',
        amount: 800000,
        description: 'Thư giãn cuối tuần & đi trà chiều sang trọng cùng bạn bè',
        category: 'Giải trí',
        date: getDateInCurrentMonth(19),
        note: 'Paul Bakery & Tea House',
      },
    ];

    await Expense.insertMany(expensesData);
    console.log(`🎉 Đã tạo thành công ${expensesData.length} giao dịch mẫu cho 2 người dùng!`);

    console.log('\n=============================================================');
    console.log('    📘 SỔ THU CHI FINFLOW PRO - DỮ LIỆU SEED THÀNH CÔNG 📘');
    console.log('=============================================================');
    console.log('👉 Tài khoản 1 (Nguyễn Văn An - 11 giao dịch):');
    console.log('   - Email   : an.nguyen@finflow.vn');
    console.log('   - Mật khẩu: password123');
    console.log('-------------------------------------------------------------');
    console.log('👉 Tài khoản 2 (Trần Thị Mai - 5 giao dịch):');
    console.log('   - Email   : mai.tran@finflow.vn');
    console.log('   - Mật khẩu: password123');
    console.log('=============================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
    process.exit(1);
  }
}

seedData();
