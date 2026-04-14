import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { ShoppingCart, Search, User, Menu, X, Zap, Heart, Package, Phone, ChevronDown, Gift, LogOut } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { products, sportCategories, formatPrice } from "@/constants/productsData";

interface HeaderProps {
  onMenuOpen: () => void;
}

export function Header({ onMenuOpen }: HeaderProps) {
  const { cartCount, wishlist } = useApp();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof products>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const q = searchQuery.toLowerCase();
      const results = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.sport.toLowerCase().includes(q)
      ).slice(0, 5);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-blue-700 shadow-lg">
      {/* Top bar */}
      <div className="bg-blue-900 text-blue-100 text-xs py-1.5 px-4 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Phone className="w-3 h-3" />
          Hotline: <strong>1900 1234</strong> (8:00 - 22:00)
        </span>
        <span className="hidden md:flex items-center gap-4">
          <Link to="/policy" className="hover:text-white transition-colors">Chính sách</Link>
          <Link to="/returns" className="hover:text-white transition-colors">Đổi trả</Link>
          <Link to="/track-order" className="hover:text-white transition-colors">Theo dõi đơn hàng</Link>
        </span>
      </div>

      {/* Main header */}
      <div className="px-4 py-3 flex items-center gap-3">
        {/* Hamburger */}
        <button
          onClick={onMenuOpen}
          className="p-2 text-white hover:bg-blue-600 rounded-lg transition-colors flex-shrink-0"
          aria-label="Menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-1.5 flex-shrink-0">
          <div className="bg-white rounded-lg p-1.5">
            <Zap className="w-5 h-5 text-blue-700 fill-blue-700" />
          </div>
          <span className="text-white font-black text-xl tracking-tight">Sport<span className="text-yellow-400">Zone</span></span>
        </Link>

        {/* Search bar - desktop */}
        <div className="hidden md:flex flex-1 mx-4 relative" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="w-full">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                className="w-full pl-4 pr-12 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 transition-all text-sm"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>
          {/* Search dropdown */}
          {searchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
              {searchResults.map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  onClick={() => { setSearchOpen(false); setSearchQuery(""); setSearchResults([]); }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors"
                >
                  <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-blue-600">{formatPrice(p.price)}</p>
                  </div>
                </Link>
              ))}
              <button
                onClick={handleSearchSubmit}
                className="w-full px-4 py-2.5 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors text-left"
              >
                Xem tất cả kết quả cho "<strong>{searchQuery}</strong>"
              </button>
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Mobile search */}
          <button
            className="md:hidden p-2 text-white hover:bg-blue-600 rounded-lg transition-colors"
            onClick={() => navigate("/products")}
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Wishlist */}
          <Link to="/account?tab=wishlist" className="relative p-2 text-white hover:bg-blue-600 rounded-lg transition-colors">
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Track order */}
          <Link to="/track-order" className="hidden sm:flex p-2 text-white hover:bg-blue-600 rounded-lg transition-colors">
            <Package className="w-5 h-5" />
          </Link>

          {/* Cart */}
          <Link to="/cart" className="relative p-2 text-white hover:bg-blue-600 rounded-lg transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-yellow-400 text-blue-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-black">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>

          {/* User */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1 p-2 text-white hover:bg-blue-600 rounded-lg transition-colors"
            >
              <User className="w-5 h-5" />
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {userMenuOpen && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />

                {/* Dropdown panel */}
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  {/* User info header */}
                  <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0 border-2 border-white/30">
                        NK
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">Nguyễn Văn Khách</p>
                        <p className="text-blue-200 text-xs truncate">khachhang@email.com</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="bg-yellow-400 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            ⭐ Thành viên Vàng
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Points bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-blue-200">Điểm tích lũy</span>
                        <span className="text-yellow-300 font-bold">2.450 điểm</span>
                      </div>
                      <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: "65%" }} />
                      </div>
                      <p className="text-blue-300 text-[10px] mt-1">Còn 550 điểm để lên hạng Bạch Kim</p>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-2">
                    <Link
                      to="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-blue-50 transition-colors group"
                    >
                      <div className="w-9 h-9 bg-blue-100 group-hover:bg-blue-200 rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-800 group-hover:text-blue-700 transition-colors">Tài khoản của tôi</p>
                        <p className="text-xs text-gray-400">Thông tin & đơn hàng</p>
                      </div>
                    </Link>

                    <Link
                      to="/account?tab=loyalty"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-blue-50 transition-colors group"
                    >
                      <div className="w-9 h-9 bg-yellow-100 group-hover:bg-yellow-200 rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
                        <Gift className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-800 group-hover:text-blue-700 transition-colors">Tích điểm đổi quà</p>
                        <p className="text-xs text-gray-400">2.450 điểm khả dụng</p>
                      </div>
                    </Link>

                    <div className="mx-5 my-1 border-t border-gray-100" />

                    <button
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 transition-colors group"
                    >
                      <div className="w-9 h-9 bg-red-100 group-hover:bg-red-200 rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
                        <LogOut className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-red-500 group-hover:text-red-600 transition-colors">Đăng xuất</p>
                        <p className="text-xs text-gray-400">Thoát khỏi tài khoản</p>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Nav categories - desktop */}
      <div className="hidden md:flex bg-blue-800 px-4 gap-1 overflow-x-auto scrollbar-hide">
        {sportCategories.slice(0, 8).map((cat) => (
          <Link
            key={cat.id}
            to={cat.id === "all" ? "/products" : `/products?sport=${encodeURIComponent(cat.id)}`}
            className="flex items-center gap-1.5 px-3 py-2 text-blue-100 hover:text-white hover:bg-blue-700 rounded-t-lg transition-colors text-sm whitespace-nowrap flex-shrink-0"
          >
            <span>{cat.icon}</span> {cat.name}
          </Link>
        ))}
        <Link
          to="/blog"
          className="flex items-center gap-1.5 px-3 py-2 text-yellow-300 hover:text-yellow-200 hover:bg-blue-700 rounded-t-lg transition-colors text-sm whitespace-nowrap flex-shrink-0 ml-auto"
        >
          <span>📝</span> Blog Thể Thao
        </Link>
      </div>
    </header>
  );
}