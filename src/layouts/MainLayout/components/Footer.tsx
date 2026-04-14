import { Link } from "react-router";
import { Zap, Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-600 rounded-lg p-1.5">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-white font-black text-xl">Sport<span className="text-yellow-400">Zone</span></span>
          </div>
          <p className="text-sm leading-relaxed mb-4">
            Chuyên cung cấp dụng cụ và trang phục thể thao chính hãng chất lượng cao. Đồng hành cùng bạn trên mọi sân chơi.
          </p>
          <div className="flex gap-3">
            <a href="#" className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-500 transition-colors font-bold text-xs">
              FB
            </a>
            <a href="#" className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center text-white hover:bg-red-500 transition-colors font-bold text-xs">
              YT
            </a>
            <a href="#" className="w-9 h-9 bg-pink-600 rounded-lg flex items-center justify-center text-white hover:bg-pink-500 transition-colors font-bold text-xs">
              IG
            </a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-white mb-4">Danh mục sản phẩm</h4>
          <ul className="space-y-2 text-sm">
            {["Giày thể thao", "Quần áo thể thao", "Dụng cụ gym", "Bóng đá", "Bóng rổ", "Cầu lông & Tennis", "Bơi lội", "Phụ kiện"].map((item) => (
              <li key={item}>
                <Link to="/products" className="hover:text-white hover:translate-x-1 transition-all inline-block">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Policies */}
        <div>
          <h4 className="text-white mb-4">Hỗ trợ khách hàng</h4>
          <ul className="space-y-2 text-sm">
            {[
              { label: "Chính sách đổi trả", to: "/returns" },
              { label: "Chính sách bảo hành", to: "/policy?tab=warranty" },
              { label: "Chính sách vận chuyển", to: "/policy?tab=shipping" },
              { label: "Chính sách bảo mật", to: "/policy?tab=privacy" },
              { label: "Theo dõi đơn hàng", to: "/track-order" },
              { label: "Câu hỏi thường gặp", to: "/policy?tab=faq" },
              { label: "Tài khoản của tôi", to: "/account" },
              { label: "📝 Blog Thể Thao", to: "/blog" },
            ].map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="hover:text-white hover:translate-x-1 transition-all inline-block">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white mb-4">Liên hệ</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <span>123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span>1900 1234 (8:00 - 22:00)</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span>cskh@sportzone.vn</span>
            </li>
          </ul>

          <div className="mt-5">
            <p className="text-white text-sm mb-2">Nhận khuyến mãi qua email</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-1 min-w-0 px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <button className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm whitespace-nowrap">
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment methods */}
      <div className="border-t border-gray-800 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-sm text-gray-500">Phương thức thanh toán:</span>
            {["COD", "MoMo", "VNPay", "Thẻ ngân hàng", "Visa/MC"].map((m) => (
              <span key={m} className="px-3 py-1 bg-gray-800 rounded text-xs text-gray-400 border border-gray-700">{m}</span>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-sm text-gray-500">Vận chuyển:</span>
            {["GHN", "GHTK", "Viettel Post"].map((m) => (
              <span key={m} className="px-3 py-1 bg-gray-800 rounded text-xs text-gray-400 border border-gray-700">{m}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-gray-950 py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© 2026 SportZone. Tất cả quyền được bảo lưu.</p>
          <p>GPKD: 0123456789 | Sở KH&ĐT TP. Hồ Chí Minh</p>
        </div>
      </div>
    </footer>
  );
}