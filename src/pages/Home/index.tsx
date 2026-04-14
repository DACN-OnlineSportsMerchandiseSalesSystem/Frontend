import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Truck, RotateCcw, Shield, Headphones, ChevronLeft, ChevronRight, Star, Zap, Clock, BookOpen } from "lucide-react";
import { products, sportCategories, formatPrice } from "@/constants/productsData";
import { ProductCard } from "@/components/common/ProductCard/ProductCard";
import { blogPosts } from "@/constants/blogData";

const heroSlides = [
  {
    bg: "from-blue-900 via-blue-800 to-blue-700",
    badge: "🔥 Siêu Sale Hè 2026",
    title: "Giảm đến 40%",
    subtitle: "Giày & Dụng cụ Chạy Bộ",
    desc: "Nâng tầm hiệu suất với dòng sản phẩm Pro Series mới nhất",
    cta: "Mua ngay",
    link: "/products?sport=Chạy bộ",
    img: "https://images.unsplash.com/photo-1769876457918-1871f21d63bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=700",
    accent: "yellow",
  },
  {
    bg: "from-slate-900 via-slate-800 to-blue-900",
    badge: "✨ Hàng Mới Về",
    title: "Bộ Sưu Tập",
    subtitle: "Gym & Fitness 2026",
    desc: "Trang bị đầy đủ dụng cụ tập luyện, đạt mục tiêu nhanh hơn",
    cta: "Khám phá",
    link: "/products?sport=Gym & Fitness",
    img: "https://images.unsplash.com/photo-1589955898954-9c8d4bb86823?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=700",
    accent: "blue",
  },
  {
    bg: "from-blue-950 via-blue-900 to-indigo-800",
    badge: "⚽ Mùa Giải Mới",
    title: "Đồ Bóng Đá",
    subtitle: "Chính Hãng - Giá Tốt",
    desc: "Đồng phục, giày bóng đá và phụ kiện từ các thương hiệu hàng đầu",
    cta: "Xem ngay",
    link: "/products?sport=Bóng đá",
    img: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=700",
    accent: "green",
  },
];

export function Home() {
  const [slide, setSlide] = useState(0);
  const bestSellers = products.filter((p) => p.isBestSeller);
  const newProducts = products.filter((p) => p.isNew);
  const saleProducts = products.filter((p) => p.isOnSale);

  const nextSlide = () => setSlide((s) => (s + 1) % heroSlides.length);
  const prevSlide = () => setSlide((s) => (s - 1 + heroSlides.length) % heroSlides.length);

  const current = heroSlides[slide];

  return (
    <div>
      {/* Hero Slider */}
      <section className={`relative bg-gradient-to-r ${current.bg} min-h-[420px] md:min-h-[500px] overflow-hidden transition-all duration-700`}>
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 flex items-center">
          <div className="flex-1 z-10 relative">
            <span className="inline-block bg-white/20 text-white text-sm px-4 py-1.5 rounded-full mb-4 backdrop-blur-sm">
              {current.badge}
            </span>
            <h1 className="text-white mb-2 text-4xl md:text-6xl font-black leading-tight">{current.title}</h1>
            <h2 className="text-yellow-400 mb-4 text-2xl md:text-3xl font-bold">{current.subtitle}</h2>
            <p className="text-blue-100 mb-8 max-w-md">{current.desc}</p>
            <div className="flex gap-3">
              <Link
                to={current.link}
                className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-blue-900 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 shadow-lg"
              >
                {current.cta} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-colors backdrop-blur-sm"
              >
                Xem tất cả
              </Link>
            </div>
          </div>
          <div className="hidden lg:block flex-1 relative h-80">
            <img
              src={current.img}
              alt="Hero"
              className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-60"
            />
          </div>
        </div>
        {/* Slider controls */}
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors z-20">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors z-20">
          <ChevronRight className="w-5 h-5" />
        </button>
        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`h-2 rounded-full transition-all ${i === slide ? "w-6 bg-white" : "w-2 bg-white/50"}`}
            />
          ))}
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Truck className="w-5 h-5 text-blue-600" />, title: "Giao hàng toàn quốc", desc: "Miễn phí từ 500K" },
            { icon: <RotateCcw className="w-5 h-5 text-blue-600" />, title: "Đổi trả 30 ngày", desc: "Miễn phí, không lý do" },
            { icon: <Shield className="w-5 h-5 text-blue-600" />, title: "Hàng chính hãng 100%", desc: "Cam kết hoàn tiền" },
            { icon: <Headphones className="w-5 h-5 text-blue-600" />, title: "Hỗ trợ 24/7", desc: "Hotline 1900 1234" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="text-sm text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sports Categories */}
      <section className="py-10 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-900">Danh mục thể thao</h2>
          <Link to="/products" className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 transition-colors">
            Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-3">
          {sportCategories.map((cat) => (
            <Link
              key={cat.id}
              to={cat.id === "all" ? "/products" : `/products?sport=${encodeURIComponent(cat.id)}`}
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl hover:bg-blue-50 hover:border-blue-200 border border-gray-100 transition-all group hover:shadow-md"
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-xs text-gray-600 group-hover:text-blue-700 text-center leading-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-8 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <h2 className="text-gray-900">Sản phẩm bán chạy</h2>
          </div>
          <Link to="/products?filter=bestseller" className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 transition-colors">
            Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {bestSellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-6 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-700 to-blue-500 p-6 flex items-center justify-between min-h-[160px]">
            <div>
              <p className="text-blue-100 text-sm mb-1">Ưu đãi đặc biệt</p>
              <h3 className="text-white text-2xl font-black mb-2">Mua 2 Tặng 1</h3>
              <p className="text-blue-100 text-sm mb-4">Áp dụng cho quần áo thể thao</p>
              <Link to="/products?category=Quần áo thể thao" className="inline-flex items-center gap-1.5 bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors">
                Mua ngay <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="text-6xl opacity-30">🎽</div>
          </div>
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-800 to-slate-700 p-6 flex items-center justify-between min-h-[160px]">
            <div>
              <p className="text-slate-300 text-sm mb-1">Flash Sale hàng ngày</p>
              <h3 className="text-white text-2xl font-black mb-2">Giảm đến 50%</h3>
              <p className="text-slate-300 text-sm mb-4">Giày & Dụng cụ gym</p>
              <Link to="/products?filter=sale" className="inline-flex items-center gap-1.5 bg-yellow-400 text-slate-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-300 transition-colors">
                Săn deal <Zap className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="text-6xl opacity-30">🔥</div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-8 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h2 className="text-gray-900">Hàng mới về</h2>
          </div>
          <Link to="/products?filter=new" className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 transition-colors">
            Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {newProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Sale products */}
      <section className="py-8 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <h2 className="text-gray-900">Đang giảm giá</h2>
          </div>
          <Link to="/products?filter=sale" className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 transition-colors">
            Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {saleProducts.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>



      {/* Testimonials */}
      <section className="bg-blue-700 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-white mb-2">Khách hàng nói về chúng tôi</h2>
            <p className="text-blue-200">Hơn 50,000 khách hàng đã tin dùng SportZone</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Trần Minh Khoa", text: "Sản phẩm chất lượng, giao hàng nhanh. Mình đã mua nhiều lần và luôn hài lòng!", rating: 5, sport: "🏃 Runner" },
              { name: "Nguyễn Thu Hà", text: "Áo DryFit mặc rất thoáng, không bị bí khi tập gym. Sẽ tiếp tục ủng hộ SportZone!", rating: 5, sport: "💪 Gym lover" },
              { name: "Lê Văn Đức", text: "Bóng đá chính hãng, giá tốt. Đội mình đã đặt cả chục quả và rất satisfying!", rating: 5, sport: "⚽ Cầu thủ" },
            ].map((t, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-blue-100 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{t.name}</p>
                    <p className="text-blue-300 text-xs">{t.sport}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}