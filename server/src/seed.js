require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Expense = require('./models/Expense');

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/spendwise';

// Helper: get a date in a specific month offset (0 = current, -1 = last month, -2 = 2 months ago)
function getDate(monthOffset, day, hour = 10) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + monthOffset; // can be negative, Date handles it
  const maxDay = new Date(year, month + 1, 0).getDate();
  const safeDay = Math.min(day, maxDay);
  return new Date(year, month, safeDay, hour, 0, 0);
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

    console.log('📝 Đang tạo dữ liệu 3 tháng liên tiếp...');

    // ════════════════════════════════════════════════════════════
    //  USER 1 — Nguyễn Văn An (Kỹ sư phần mềm)
    // ════════════════════════════════════════════════════════════
    const user1Data = [

      // ── THÁNG HIỆN TẠI (month 0) ─────────────────────────────
      { userId: user1._id, type: 'income',  amount: 25000000, category: 'Lương',     description: 'Lương tháng chính thức tại công ty TechHub',             date: getDate(0, 1),  note: 'Chuyển khoản qua VCB' },
      { userId: user1._id, type: 'income',  amount: 5000000,  category: 'Thưởng',    description: 'Thưởng hoàn thành xuất sắc KPI Quý',                    date: getDate(0, 5),  note: 'Thưởng dự án FinFlow Pro' },
      { userId: user1._id, type: 'income',  amount: 3200000,  category: 'Đầu tư',    description: 'Cổ tức chứng khoán danh mục đầu tư dài hạn',            date: getDate(0, 10), note: 'Quỹ mở ETF & chứng khoán bluechip' },
      { userId: user1._id, type: 'expense', amount: 4500000,  category: 'Ăn uống',   description: 'Chi phí ăn trưa văn phòng & đi chợ thực phẩm hàng tuần',date: getDate(0, 2),  note: 'Siêu thị WinMart & quán cơm VP' },
      { userId: user1._id, type: 'expense', amount: 850000,   category: 'Ăn uống',   description: 'Cà phê & liên hoan nhẹ cùng nhóm dự án đồng nghiệp',    date: getDate(0, 18), note: 'Highlands Coffee, Phúc Long' },
      { userId: user1._id, type: 'expense', amount: 650000,   category: 'Ăn uống',   description: 'Buffet sinh nhật bạn thân cuối tuần',                    date: getDate(0, 25), note: 'Kichi Kichi' },
      { userId: user1._id, type: 'expense', amount: 1800000,  category: 'Hoá đơn',   description: 'Tiền điện, nước & Internet cáp quang tốc độ cao',        date: getDate(0, 4),  note: 'Thanh toán tự động qua VCB Digibank' },
      { userId: user1._id, type: 'expense', amount: 1200000,  category: 'Di chuyển', description: 'Đổ xăng ô tô/xe máy & phí gửi xe định kỳ tháng',       date: getDate(0, 6),  note: 'Cây xăng Petrolimex & vé tháng Vincom' },
      { userId: user1._id, type: 'expense', amount: 450000,   category: 'Di chuyển', description: 'GrabTaxi đi gặp khách hàng đối tác ký hợp đồng',        date: getDate(0, 20), note: 'Hóa đơn công ty hỗ trợ thanh toán 50%' },
      { userId: user1._id, type: 'expense', amount: 2500000,  category: 'Mua sắm',   description: 'Mua sắm trang phục công sở mùa hè & giày thể thao',     date: getDate(0, 8),  note: 'Uniqlo & Zara' },
      { userId: user1._id, type: 'expense', amount: 1100000,  category: 'Giải trí',  description: 'Vé xem phim cuối tuần & gia hạn tài khoản Netflix',      date: getDate(0, 12), note: 'Gói Premium 4K & CGV Gold Class' },
      { userId: user1._id, type: 'expense', amount: 900000,   category: 'Sức khoẻ',  description: 'Khám nha khoa định kỳ & mua vitamin bổ sung sức khỏe',   date: getDate(0, 15), note: 'Nha khoa Paris & Pharmacity' },
      { userId: user1._id, type: 'expense', amount: 500000,   category: 'Khác',      description: 'Quà tặng sinh nhật đồng nghiệp',                         date: getDate(0, 22), note: 'Gift voucher The Coffee House' },

      // ── THÁNG TRƯỚC (month -1) ───────────────────────────────
      { userId: user1._id, type: 'income',  amount: 25000000, category: 'Lương',     description: 'Lương tháng chính thức tại công ty TechHub',             date: getDate(-1, 1),  note: 'Chuyển khoản qua VCB' },
      { userId: user1._id, type: 'income',  amount: 2800000,  category: 'Đầu tư',    description: 'Lãi suất tiết kiệm ngân hàng kỳ hạn 3 tháng',           date: getDate(-1, 8),  note: 'Tiết kiệm BIDV' },
      { userId: user1._id, type: 'expense', amount: 3800000,  category: 'Ăn uống',   description: 'Chi phí ăn trưa văn phòng & thực phẩm hàng tuần',       date: getDate(-1, 3),  note: 'WinMart & quán cơm gần VP' },
      { userId: user1._id, type: 'expense', amount: 720000,   category: 'Ăn uống',   description: 'Cà phê sáng & ăn vặt buổi chiều',                       date: getDate(-1, 14), note: 'The Coffee House & KOI The' },
      { userId: user1._id, type: 'expense', amount: 1750000,  category: 'Hoá đơn',   description: 'Tiền điện, nước & cước internet hàng tháng',             date: getDate(-1, 5),  note: 'EVNHCMC & Viettel' },
      { userId: user1._id, type: 'expense', amount: 900000,   category: 'Di chuyển', description: 'Xăng xe & phí gửi xe tháng',                            date: getDate(-1, 7),  note: 'Petrolimex' },
      { userId: user1._id, type: 'expense', amount: 1500000,  category: 'Mua sắm',   description: 'Sách & khóa học online nâng cao kỹ năng',                date: getDate(-1, 11), note: 'Tiki & Udemy' },
      { userId: user1._id, type: 'expense', amount: 650000,   category: 'Giải trí',  description: 'Xem phim & ăn tối nhẹ cuối tuần',                       date: getDate(-1, 16), note: 'CGV & The Pizza Company' },
      { userId: user1._id, type: 'expense', amount: 400000,   category: 'Sức khoẻ',  description: 'Mua thuốc & vitamin hàng tháng',                         date: getDate(-1, 20), note: 'Long Chau' },
      { userId: user1._id, type: 'expense', amount: 300000,   category: 'Khác',      description: 'Phí dịch vụ chung cư tháng',                             date: getDate(-1, 25), note: 'Ban quan ly chung cu' },

      // ── THÁNG 2 TRƯỚC (month -2) ─────────────────────────────
      { userId: user1._id, type: 'income',  amount: 25000000, category: 'Lương',     description: 'Lương tháng chính thức tại công ty TechHub',             date: getDate(-2, 1),  note: 'Chuyển khoản qua VCB' },
      { userId: user1._id, type: 'income',  amount: 8000000,  category: 'Thưởng',    description: 'Thưởng cuối năm & phụ cấp tháng đặc biệt',              date: getDate(-2, 3),  note: 'Thưởng hiệu suất quý' },
      { userId: user1._id, type: 'expense', amount: 5200000,  category: 'Ăn uống',   description: 'Ăn uống, tiệc họp lớp & liên hoan đồng nghiệp',         date: getDate(-2, 5),  note: 'Nhiều địa điểm' },
      { userId: user1._id, type: 'expense', amount: 1600000,  category: 'Hoá đơn',   description: 'Hoá đơn điện nước & internet tháng',                     date: getDate(-2, 4),  note: 'Thanh toán tự động' },
      { userId: user1._id, type: 'expense', amount: 3500000,  category: 'Mua sắm',   description: 'Mua đồ điện tử & phụ kiện laptop làm việc',              date: getDate(-2, 9),  note: 'Thegioididong & Apple Store' },
      { userId: user1._id, type: 'expense', amount: 800000,   category: 'Di chuyển', description: 'Đổ xăng & vé xe tháng',                                 date: getDate(-2, 6),  note: 'Petrolimex' },
      { userId: user1._id, type: 'expense', amount: 1400000,  category: 'Giải trí',  description: 'Vé du lịch ngắn ngày & khách sạn mini',                 date: getDate(-2, 15), note: 'Vung Tau 2 ngay 1 dem' },
      { userId: user1._id, type: 'expense', amount: 600000,   category: 'Sức khoẻ',  description: 'Gói khám sức khỏe tổng quát định kỳ',                    date: getDate(-2, 18), note: 'Benh vien FV' },
    ];

    // ════════════════════════════════════════════════════════════
    //  USER 2 — Trần Thị Mai (Marketing + Kinh doanh)
    // ════════════════════════════════════════════════════════════
    const user2Data = [

      // ── THÁNG HIỆN TẠI (month 0) ─────────────────────────────
      { userId: user2._id, type: 'income',  amount: 18000000, category: 'Lương',     description: 'Lương tháng vị trí Senior Marketing Specialist',         date: getDate(0, 1),  note: 'Chuyển khoản qua Techcombank' },
      { userId: user2._id, type: 'income',  amount: 6500000,  category: 'Kinh doanh',description: 'Doanh thu cửa hàng thời trang thiết kế online',           date: getDate(0, 12), note: 'Tổng kết doanh thu tuần 2' },
      { userId: user2._id, type: 'income',  amount: 2000000,  category: 'Đầu tư',    description: 'Tiền cho thuê phòng trọ nhỏ',                             date: getDate(0, 5),  note: 'Tiền nhà tháng này' },
      { userId: user2._id, type: 'expense', amount: 3200000,  category: 'Ăn uống',   description: 'Ăn uống hàng ngày & mua thực phẩm hữu cơ cho gia đình',  date: getDate(0, 7),  note: 'Bach Hoa Xanh & Farmers Market' },
      { userId: user2._id, type: 'expense', amount: 550000,   category: 'Ăn uống',   description: 'Trà sữa & đồ ăn vặt cuối tuần cùng bạn bè',              date: getDate(0, 21), note: 'Gong Cha & Boba Tea' },
      { userId: user2._id, type: 'expense', amount: 2200000,  category: 'Hoá đơn',   description: 'Tiền thuê căn hộ dịch vụ & phí quản lý chung cư tháng',  date: getDate(0, 3),  note: 'Chuyển khoản chủ nhà đúng hạn' },
      { userId: user2._id, type: 'expense', amount: 3800000,  category: 'Mua sắm',   description: 'Mỹ phẩm chăm sóc da & bộ dưỡng body chính hãng',         date: getDate(0, 14), note: 'Shopee Mall & Estee Lauder' },
      { userId: user2._id, type: 'expense', amount: 1200000,  category: 'Mua sắm',   description: 'Quần áo & phụ kiện thời trang mùa hè',                    date: getDate(0, 19), note: 'Zara & H&M' },
      { userId: user2._id, type: 'expense', amount: 800000,   category: 'Giải trí',  description: 'Thư giãn cuối tuần & đi trà chiều cùng bạn bè',           date: getDate(0, 23), note: 'Paul Bakery & Tea House' },
      { userId: user2._id, type: 'expense', amount: 450000,   category: 'Di chuyển', description: 'Grab & xe công nghệ đi làm hàng tuần',                    date: getDate(0, 10), note: 'GrabCar & GoViet' },
      { userId: user2._id, type: 'expense', amount: 700000,   category: 'Sức khoẻ',  description: 'Đăng ký lớp yoga & gym tháng này',                        date: getDate(0, 8),  note: 'California Fitness' },

      // ── THÁNG TRƯỚC (month -1) ───────────────────────────────
      { userId: user2._id, type: 'income',  amount: 18000000, category: 'Lương',     description: 'Lương tháng vị trí Senior Marketing Specialist',         date: getDate(-1, 1),  note: 'Chuyển khoản qua Techcombank' },
      { userId: user2._id, type: 'income',  amount: 4200000,  category: 'Kinh doanh',description: 'Doanh thu bán hàng online tháng trước',                   date: getDate(-1, 10), note: 'Shopee & TikTok Shop' },
      { userId: user2._id, type: 'expense', amount: 2900000,  category: 'Ăn uống',   description: 'Chi phí ăn uống & thực phẩm tháng trước',                date: getDate(-1, 6),  note: 'Bach Hoa Xanh & quan an' },
      { userId: user2._id, type: 'expense', amount: 2200000,  category: 'Hoá đơn',   description: 'Tiền nhà & điện nước tháng trước',                        date: getDate(-1, 3),  note: 'Chu nha & EVNHCMC' },
      { userId: user2._id, type: 'expense', amount: 2500000,  category: 'Mua sắm',   description: 'Mua nguyên liệu nhập hàng kinh doanh',                    date: getDate(-1, 15), note: 'Nhập hàng từ nhà cung cấp' },
      { userId: user2._id, type: 'expense', amount: 600000,   category: 'Giải trí',  description: 'Xem phim & cà phê bạn bè cuối tuần',                      date: getDate(-1, 18), note: 'CGV & Phuc Long' },
      { userId: user2._id, type: 'expense', amount: 380000,   category: 'Di chuyển', description: 'Grab đi làm & đi gặp đối tác',                            date: getDate(-1, 12), note: 'GrabCar' },
      { userId: user2._id, type: 'expense', amount: 500000,   category: 'Sức khoẻ',  description: 'Phí gym tháng trước',                                     date: getDate(-1, 7),  note: 'California Fitness' },

      // ── THÁNG 2 TRƯỚC (month -2) ─────────────────────────────
      { userId: user2._id, type: 'income',  amount: 18000000, category: 'Lương',     description: 'Lương tháng vị trí Senior Marketing Specialist',         date: getDate(-2, 1),  note: 'Chuyển khoản qua Techcombank' },
      { userId: user2._id, type: 'income',  amount: 9800000,  category: 'Kinh doanh',description: 'Doanh thu kinh doanh đỉnh điểm mùa sale',                date: getDate(-2, 8),  note: 'Sale lớn cuối tháng' },
      { userId: user2._id, type: 'expense', amount: 4100000,  category: 'Ăn uống',   description: 'Ăn uống & tiệc tùng dịp đặc biệt',                       date: getDate(-2, 5),  note: 'Nhiều địa điểm' },
      { userId: user2._id, type: 'expense', amount: 2200000,  category: 'Hoá đơn',   description: 'Tiền nhà & hoá đơn tháng',                                date: getDate(-2, 3),  note: 'Dinh ky' },
      { userId: user2._id, type: 'expense', amount: 5500000,  category: 'Mua sắm',   description: 'Mua hàng tồn kho cho cửa hàng & mỹ phẩm cá nhân',        date: getDate(-2, 12), note: 'Nhap hang lon sale 11/11' },
      { userId: user2._id, type: 'expense', amount: 1200000,  category: 'Giải trí',  description: 'Du lịch ngắn ngày & vui chơi cuối tuần',                  date: getDate(-2, 16), note: 'Vung Tau & Mui Ne' },
      { userId: user2._id, type: 'expense', amount: 500000,   category: 'Di chuyển', description: 'Grab & xăng xe tháng',                                    date: getDate(-2, 9),  note: 'Di lai nhieu hon thuong le' },
    ];

    const allExpenses = [...user1Data, ...user2Data];
    await Expense.insertMany(allExpenses);

    console.log(`\n🎉 Đã tạo thành công ${allExpenses.length} giao dịch mẫu cho 2 người dùng trong 3 tháng!`);
    console.log('\n=============================================================');
    console.log('    📘 SỔ THU CHI FINFLOW PRO - DỮ LIỆU SEED THÀNH CÔNG 📘');
    console.log('=============================================================');
    console.log('👉 Tài khoản 1 — Nguyễn Văn An (Kỹ sư phần mềm):');
    console.log('   - Email   : an.nguyen@finflow.vn');
    console.log('   - Mật khẩu: password123');
    console.log('   - Dữ liệu : 3 tháng | Thu ~33M/tháng | Chi ~14M/tháng');
    console.log('-------------------------------------------------------------');
    console.log('👉 Tài khoản 2 — Trần Thị Mai (Marketing + Kinh doanh):');
    console.log('   - Email   : mai.tran@finflow.vn');
    console.log('   - Mật khẩu: password123');
    console.log('   - Dữ liệu : 3 tháng | Thu ~26M/tháng | Chi ~12M/tháng');
    console.log('=============================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
    process.exit(1);
  }
}

seedData();
