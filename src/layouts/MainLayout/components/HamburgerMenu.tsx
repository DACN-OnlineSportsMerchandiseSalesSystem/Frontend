import { useState } from "react";
import { Link } from "react-router";
import { X, ChevronRight, Home, Package, ShoppingCart, Phone, FileText, RotateCcw, Star, ChevronDown, BookOpen } from "lucide-react";
import { sportCategories, brands } from "@/constants/productsData";

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [openSection, setOpenSection] = useState<string>("sports");

  const toggleSection = (s: string) => setOpenSection((prev) => (prev === s ? "" : s));

  const priceRanges = [
    { label: "Dưới 200.000đ", min: 0, max: 200000 },
    { label: "200.000đ - 500.000đ", min: 200000, max: 500000 },
    { label: "500.000đ - 1.000.000đ", min: 500000, max: 1000000 },
    { label: "1.000.000đ - 3.000.000đ", min: 1000000, max: 3000000 },
    { label: "Trên 3.000.000đ", min: 3000000, max: 100000000 },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Slide Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-[320px] max-w-[85vw] bg-white z-50 shadow-2xl transition-transform duration-300 flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-blue-700 text-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <span className="font-black text-lg">SportZone</span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-blue-600 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Quick links */}
          <div className="p-4 border-b border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 px-1">Điều hướng nhanh</p>
            <div className="space-y-1">
              {[
                { icon: <Home className="w-4 h-4" />, label: "Trang chủ", to: "/" },
                { icon: <Package className="w-4 h-4" />, label: "Tất cả sản phẩm", to: "/products" },
                { icon: <ShoppingCart className="w-4 h-4" />, label: "Giỏ hàng", to: "/cart" },
                { icon: <Package className="w-4 h-4" />, label: "Theo dõi đơn hàng", to: "/track-order" },
                { icon: <RotateCcw className="w-4 h-4" />, label: "Đổi trả hàng", to: "/returns" },
                { icon: <FileText className="w-4 h-4" />, label: "Chính sách", to: "/policy" },
                { icon: <BookOpen className="w-4 h-4" />, label: "Blog Thể Thao", to: "/blog" },
                { icon: <Phone className="w-4 h-4" />, label: "Liên hệ", to: "/policy?tab=contact" },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-colors group"
                >
                  <span className="text-gray-400 group-hover:text-blue-600 transition-colors">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-gray-300 group-hover:text-blue-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Sport Filter */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection("sports")}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-gray-800 flex items-center gap-2">
                <span>🏅</span> Lọc theo môn thể thao
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSection === "sports" ? "rotate-180" : ""}`} />
            </button>
            {openSection === "sports" && (
              <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                {sportCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={cat.id === "all" ? "/products" : `/products?sport=${encodeURIComponent(cat.id)}`}
                    onClick={onClose}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-700 transition-colors group border border-gray-100 hover:border-blue-200"
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-xs">{cat.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Price Filter */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection("price")}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-gray-800 flex items-center gap-2">
                <span>💰</span> Lọc theo giá
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSection === "price" ? "rotate-180" : ""}`} />
            </button>
            {openSection === "price" && (
              <div className="px-4 pb-4 space-y-2">
                {priceRanges.map((range) => (
                  <Link
                    key={range.label}
                    to={`/products?minPrice=${range.min}&maxPrice=${range.max}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-colors text-sm cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                    {range.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Brand Filter */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection("brands")}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-gray-800 flex items-center gap-2">
                <span>🏷️</span> Lọc theo thương hiệu
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openSection === "brands" ? "rotate-180" : ""}`} />
            </button>
            {openSection === "brands" && (
              <div className="px-4 pb-4 flex flex-wrap gap-2">
                {brands.map((brand) => (
                  <Link
                    key={brand}
                    to={`/products?brand=${encodeURIComponent(brand)}`}
                    onClick={onClose}
                    className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-700 text-xs transition-colors border border-gray-200 hover:border-blue-300"
                  >
                    {brand}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Promotion badges */}
          <div className="p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 px-1">Ưu đãi đặc biệt</p>
            <div className="space-y-2">
              <Link to="/products?filter=sale" onClick={onClose} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition-colors text-sm">
                🔥 Đang giảm giá
              </Link>
              <Link to="/products?filter=new" onClick={onClose} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 transition-colors text-sm">
                ✨ Hàng mới về
              </Link>
              <Link to="/products?filter=bestseller" onClick={onClose} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-700 transition-colors text-sm">
                ⭐ Bán chạy nhất
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4 text-blue-600" />
            <span>Hotline: <strong className="text-blue-700">1900 1234</strong></span>
          </div>
        </div>
      </div>
    </>
  );
}