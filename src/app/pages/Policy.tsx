import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ChevronRight, RotateCcw, Truck, Shield, Lock, HelpCircle, Phone } from "lucide-react";

const tabs = [
  { key: "return", label: "Đổi trả", icon: <RotateCcw className="w-4 h-4" /> },
  { key: "shipping", label: "Vận chuyển", icon: <Truck className="w-4 h-4" /> },
  { key: "warranty", label: "Bảo hành", icon: <Shield className="w-4 h-4" /> },
  { key: "privacy", label: "Bảo mật", icon: <Lock className="w-4 h-4" /> },
  { key: "faq", label: "Câu hỏi thường gặp", icon: <HelpCircle className="w-4 h-4" /> },
  { key: "contact", label: "Liên hệ", icon: <Phone className="w-4 h-4" /> },
];

export function Policy() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const activeTab = searchParams.get("tab") || "return";

  const setTab = (t: string) => {
    const p = new URLSearchParams(); p.set("tab", t);
    setSearchParams(p);
  };

  const faqs = [
    { q: "Tôi có thể đổi trả sản phẩm không?", a: "Có, SportZone chấp nhận đổi trả trong vòng 30 ngày kể từ ngày nhận hàng. Sản phẩm phải còn nguyên vẹn, có đầy đủ tem nhãn và hóa đơn mua hàng." },
    { q: "Thời gian giao hàng là bao lâu?", a: "Nội thành TP.HCM và Hà Nội: 1-2 ngày. Các tỉnh thành khác: 3-5 ngày. Khu vực vùng sâu: 5-7 ngày làm việc." },
    { q: "SportZone có bán hàng giả không?", a: "Tuyệt đối không. SportZone cam kết 100% hàng chính hãng từ các nhà phân phối ủy quyền. Hoàn tiền 100% nếu phát hiện hàng giả." },
    { q: "Tôi có thể thanh toán bằng phương thức nào?", a: "SportZone chấp nhận: COD (thanh toán khi nhận hàng), Ví MoMo, VNPay, Thẻ ATM nội địa, Visa/Mastercard/JCB." },
    { q: "Có được miễn phí vận chuyển không?", a: "Miễn phí vận chuyển cho đơn hàng từ 500.000đ trở lên toàn quốc. Đơn dưới 500.000đ: 30.000đ cho nội thành, 40.000đ cho ngoại thành." },
    { q: "Hàng bảo hành trong bao lâu?", a: "Thời hạn bảo hành tùy theo từng sản phẩm và nhà sản xuất: Giày: 6 tháng, Đồng hồ thể thao: 12 tháng, Thiết bị điện tử: 12-24 tháng." },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
        <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-800">Chính sách</span>
      </div>

      <h1 className="text-gray-900 mb-6">Chính sách & Hỗ trợ</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTab(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left border-b border-gray-50 last:border-0 ${
                  activeTab === tab.key ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className={activeTab === tab.key ? "text-blue-600" : "text-gray-400"}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-100">
          {activeTab === "return" && (
            <div>
              <h2 className="text-gray-900 mb-4 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-blue-600" />
                Chính sách đổi trả
              </h2>
              <div className="bg-blue-50 rounded-xl p-4 mb-5 border border-blue-100">
                <p className="text-blue-800 font-medium text-sm">🎯 Cam kết đổi trả 30 ngày - Miễn phí - Không cần lý do</p>
              </div>
              {[
                {
                  title: "Điều kiện đổi trả",
                  items: ["Sản phẩm còn nguyên vẹn, chưa qua sử dụng", "Còn đầy đủ tem nhãn gốc của nhà sản xuất", "Còn hóa đơn mua hàng hoặc mã đơn hàng", "Trong vòng 30 ngày kể từ ngày nhận hàng"],
                },
                {
                  title: "Sản phẩm không được đổi trả",
                  items: ["Đồ bơi (mũ bơi, kính bơi, quần bơi) đã qua sử dụng", "Sản phẩm cá nhân hóa theo yêu cầu", "Sản phẩm trong chương trình thanh lý/final sale"],
                },
                {
                  title: "Quy trình đổi trả",
                  items: ["Bước 1: Liên hệ hotline 1900 1234 hoặc email", "Bước 2: Nhân viên xác nhận và tạo phiếu đổi trả", "Bước 3: Gửi sản phẩm về kho SportZone (phí ship do SportZone chịu)", "Bước 4: Kiểm tra và xử lý trong 3-5 ngày làm việc", "Bước 5: Nhận hàng đổi hoặc hoàn tiền"],
                },
              ].map((section) => (
                <div key={section.title} className="mb-5">
                  <h4 className="text-gray-800 mb-2">{section.title}</h4>
                  <ul className="space-y-1.5">
                    {section.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-blue-400 mt-1">•</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {activeTab === "shipping" && (
            <div>
              <h2 className="text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                Chính sách vận chuyển
              </h2>
              <div className="overflow-x-auto mb-5">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="px-4 py-3 text-left text-gray-700 border border-gray-100">Khu vực</th>
                      <th className="px-4 py-3 text-left text-gray-700 border border-gray-100">Thời gian</th>
                      <th className="px-4 py-3 text-left text-gray-700 border border-gray-100">Phí vận chuyển</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["TP.HCM & Hà Nội (nội thành)", "1-2 ngày", "30.000đ (miễn phí từ 500K)"],
                      ["Ngoại thành TP.HCM & HN", "2-3 ngày", "40.000đ (miễn phí từ 500K)"],
                      ["Các tỉnh thành khác", "3-5 ngày", "40.000đ (miễn phí từ 500K)"],
                      ["Vùng sâu, vùng xa", "5-7 ngày", "50.000đ"],
                    ].map(([area, time, fee]) => (
                      <tr key={area} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-800 border border-gray-100">{area}</td>
                        <td className="px-4 py-3 text-gray-600 border border-gray-100">{time}</td>
                        <td className="px-4 py-3 text-gray-600 border border-gray-100">{fee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100 text-sm text-yellow-700">
                ⚡ <strong>Giao hàng nhanh:</strong> Có hỗ trợ giao trong ngày tại TP.HCM và Hà Nội với phụ phí 20.000đ (đặt hàng trước 14:00)
              </div>
            </div>
          )}

          {activeTab === "warranty" && (
            <div>
              <h2 className="text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Chính sách bảo hành
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-5">
                {[
                  { cat: "Giày thể thao", warranty: "6 tháng", note: "Lỗi sản xuất" },
                  { cat: "Quần áo thể thao", warranty: "30 ngày", note: "Lỗi may vá" },
                  { cat: "Thiết bị điện tử", warranty: "12-24 tháng", note: "Theo hãng" },
                  { cat: "Vợt/Gậy", warranty: "6 tháng", note: "Lỗi khung" },
                  { cat: "Xe đạp", warranty: "12 tháng", note: "Khung và linh kiện" },
                  { cat: "Dụng cụ gym", warranty: "12 tháng", note: "Theo nhà sản xuất" },
                ].map((item) => (
                  <div key={item.cat} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-sm font-medium text-gray-800">{item.cat}</p>
                    <p className="text-blue-700 mt-1">{item.warranty}</p>
                    <p className="text-xs text-gray-500">{item.note}</p>
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Bảo hành được áp dụng cho lỗi từ nhà sản xuất, không áp dụng cho hư hỏng do sử dụng sai cách</p>
                <p>• Mang sản phẩm đến cửa hàng hoặc liên hệ hotline để được hỗ trợ bảo hành</p>
                <p>• Cần có hóa đơn mua hàng để xác nhận bảo hành</p>
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div>
              <h2 className="text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                Chính sách bảo mật
              </h2>
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                <div>
                  <h4 className="text-gray-800 mb-2">Thu thập thông tin</h4>
                  <p>SportZone thu thập các thông tin cần thiết như tên, địa chỉ email, số điện thoại và địa chỉ giao hàng để xử lý đơn hàng và cung cấp dịch vụ tốt nhất cho bạn.</p>
                </div>
                <div>
                  <h4 className="text-gray-800 mb-2">Sử dụng thông tin</h4>
                  <p>Thông tin của bạn được sử dụng để: xử lý đơn hàng, gửi thông báo về trạng thái đơn hàng, cung cấp hỗ trợ khách hàng, gửi thông tin khuyến mãi (nếu bạn đồng ý).</p>
                </div>
                <div>
                  <h4 className="text-gray-800 mb-2">Bảo vệ thông tin</h4>
                  <p>Chúng tôi sử dụng công nghệ mã hóa SSL 256-bit để bảo vệ thông tin thanh toán. Mọi dữ liệu cá nhân được lưu trữ an toàn và không chia sẻ với bên thứ ba nếu không có sự đồng ý của bạn.</p>
                </div>
                <div>
                  <h4 className="text-gray-800 mb-2">Quyền của bạn</h4>
                  <p>Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa thông tin cá nhân bất kỳ lúc nào bằng cách liên hệ với chúng tôi qua hotline hoặc email.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "faq" && (
            <div>
              <h2 className="text-gray-900 mb-5 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                Câu hỏi thường gặp
              </h2>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-800 pr-4">{faq.q}</span>
                      <span className={`text-blue-600 flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}>▼</span>
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed bg-blue-50 border-t border-blue-100">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "contact" && (
            <div>
              <h2 className="text-gray-900 mb-5 flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-600" />
                Liên hệ hỗ trợ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {[
                  { icon: "📞", label: "Hotline", value: "1900 1234", desc: "8:00 - 22:00 mỗi ngày" },
                  { icon: "📧", label: "Email", value: "cskh@sportzone.vn", desc: "Phản hồi trong 2-4 giờ" },
                  { icon: "💬", label: "Chat trực tuyến", value: "Trên website", desc: "8:00 - 22:00 mỗi ngày" },
                  { icon: "📍", label: "Showroom", value: "123 Nguyễn Huệ, Q1, TP.HCM", desc: "Thứ 2 - CN: 8:00 - 22:00" },
                ].map((c) => (
                  <div key={c.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <span className="text-2xl mb-2 block">{c.icon}</span>
                    <p className="text-xs text-gray-500 mb-1">{c.label}</p>
                    <p className="text-sm font-medium text-gray-800">{c.value}</p>
                    <p className="text-xs text-gray-400">{c.desc}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h4 className="text-gray-800 mb-4">Gửi yêu cầu hỗ trợ</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Họ và tên" className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400" />
                    <input placeholder="Email" className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400" />
                  </div>
                  <input placeholder="Tiêu đề" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400" />
                  <textarea rows={4} placeholder="Mô tả vấn đề của bạn..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 resize-none" />
                  <button className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm transition-colors">
                    Gửi yêu cầu
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
