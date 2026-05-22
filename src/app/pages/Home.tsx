import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { ArrowRight, Truck, RotateCcw, Shield, Headphones, ChevronLeft, ChevronRight, Star, Zap, Clock, BookOpen } from "lucide-react";
import { formatPrice } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import productService, { Product } from "../../services/productService";
import blogService, { BlogPostDTO } from "../../services/blogService";
import reviewService, { Review } from "../../services/reviewService";
import heroVideo1 from "../../imports/_o___u_real.mp4?url";
import heroVideo2 from "../../imports/___th__thao_victor.mp4?url";
import heroVideo3 from "../../imports/Video_gi_y.mp4?url";

const heroSlides = [
  {
    rgb: "10, 20, 60",
    glow: "rgba(56, 120, 255, 0.45)",
    accent: "#facc15",
    badge: "👟 Bộ Sưu Tập Mới",
    title: "Giày Thể Thao",
    subtitle: "Công Nghệ Cao Cấp 2026",
    desc: "Trải nghiệm công nghệ đế giày tiên tiến, tối ưu từng bước chạy",
    cta: "Mua ngay",
    link: "/products?category=Giày thể thao",
    video: heroVideo3,
  },
  {
    rgb: "15, 23, 42",
    glow: "rgba(139, 92, 246, 0.4)",
    accent: "#a78bfa",
    badge: "✨ Victor Collection",
    title: "Bộ Sưu Tập",
    subtitle: "Đồ Thể Thao Victor 2026",
    desc: "Hàng mới về từ Victor - Chất liệu cao cấp, thiết kế thể thao chuyên nghiệp",
    cta: "Khám phá",
    link: "/products",
    video: heroVideo2,
  },
  {
    rgb: "5, 28, 18",
    glow: "rgba(34, 197, 94, 0.4)",
    accent: "#4ade80",
    badge: "⚽ Real Madrid",
    title: "Áo Đấu Mới",
    subtitle: "Real Madrid 2026",
    desc: "Áo đấu chính thức Real Madrid mùa giải mới - Chính hãng 100%",
    cta: "Xem ngay",
    link: "/products?sport=Bóng đá",
    video: heroVideo1,
  },
];

export function Home() {
  const [slide, setSlide] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [blogs, setBlogs] = useState<BlogPostDTO[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    const fetchTopSelling = productService.getTopSellingProducts(8).catch(err => {
      console.error("Failed to fetch top selling products", err);
      return [];
    });
    
    const fetchRecommendations = productService.getRecommendedProducts(10).catch(err => {
      console.error("Failed to fetch recommendations", err);
      return [];
    });
    
    const fetchAll = productService.getAllProducts().catch(err => {
      console.error("Failed to fetch all products", err);
      return [];
    });

    const fetchBlogs = blogService.getAllBlogs().catch(err => {
      console.error("Failed to fetch blogs", err);
      return [];
    });

    const fetchReviews = reviewService.getLatest5StarReviews().catch(err => {
      console.error("Failed to fetch reviews", err);
      return [];
    });

    Promise.all([fetchTopSelling, fetchRecommendations, fetchAll, fetchBlogs, fetchReviews])
      .then(([topSellingData, recommendedData, allData, blogsData, reviewsData]) => {
        setBestSellers(topSellingData);
        setAllProducts(recommendedData);
        setBlogs(blogsData);
        setReviews(reviewsData);
        
        // Filter promotion products (discount > 0)
        const sale = allData.filter(p => (p.discount || 0) > 0);
        setSaleProducts(sale.slice(0, 4));
        
        // New products
        setNewProducts(allData.slice(0, 8));
        
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const changeSlide = (next: number) => {
    setTransitioning(true);
    setTimeout(() => {
      setSlide(next);
      setTransitioning(false);
    }, 150);
  };

  const nextSlide = () => changeSlide((slide + 1) % heroSlides.length);
  const prevSlide = () => changeSlide((slide - 1 + heroSlides.length) % heroSlides.length);

  const handleVideoEnd = () => nextSlide();

  // Reset & play video khi slide thay đổi
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [slide]);

  const current = heroSlides[slide];
  const { rgb } = current;

  return (
    <div>
      {/* ── Hero Slider (Video) ── */}
      <section
        className="relative min-h-[460px] md:min-h-[540px] overflow-hidden"
        style={{
          backgroundColor: `rgb(${rgb})`,
          transition: "background-color 0.8s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Video: 78% từ bên phải */}
        <div className="absolute inset-y-0 right-0 w-[78%]">
          <video
            ref={videoRef}
            src={current.video}
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Layer 1: Gradient che cạnh trái mượt */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(to right,
              rgba(${rgb}, 1)    0%,
              rgba(${rgb}, 1)    16%,
              rgba(${rgb}, 0.95) 22%,
              rgba(${rgb}, 0.80) 28%,
              rgba(${rgb}, 0.55) 34%,
              rgba(${rgb}, 0.25) 40%,
              rgba(${rgb}, 0.08) 44%,
              rgba(${rgb}, 0)    48%
            )`,
            transition: "background 0.8s cubic-bezier(0.4,0,0.2,1)",
          }}
        />

        {/* Layer 2: Glow accent toả từ trái */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 55% 90% at 8% 55%, ${current.glow}, transparent)`,
            transition: "background 0.8s cubic-bezier(0.4,0,0.2,1)",
          }}
        />

        {/* Layer 3: Vignette cinematic trên/dưới */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/30 via-transparent to-black/40" />

        {/* Nội dung */}
        <div
          className="max-w-7xl mx-auto px-4 py-14 md:py-20 flex items-center relative z-10"
          style={{
            opacity: transitioning ? 0 : 1,
            transform: transitioning ? "translateY(8px)" : "translateY(0)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}
        >
          <div className="w-full max-w-xs md:max-w-sm">
            <span
              className="inline-flex items-center text-white/90 text-sm px-4 py-1.5 rounded-full mb-5 border border-white/20 backdrop-blur-sm"
              style={{ backgroundColor: `rgba(${rgb}, 0.55)` }}
            >
              {current.badge}
            </span>

            <h1 className="text-white mb-2 text-4xl md:text-6xl font-black leading-tight drop-shadow-xl">
              {current.title}
            </h1>

            <h2
              className="mb-4 text-2xl md:text-3xl font-bold drop-shadow-lg"
              style={{ color: current.accent }}
            >
              {current.subtitle}
            </h2>

            <p className="text-white/70 mb-8 max-w-md leading-relaxed">
              {current.desc}
            </p>

            <div className="flex gap-3 flex-wrap">
              <Link
                to={current.link}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl text-gray-900"
                style={{ backgroundColor: current.accent }}
              >
                {current.cta} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20"
              >
                Xem tất cả
              </Link>
            </div>
          </div>
        </div>

        {/* Slider controls */}
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/15 hover:bg-white/30 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all z-20 border border-white/20">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/15 hover:bg-white/30 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all z-20 border border-white/20">
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => changeSlide(i)}
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: i === slide ? "24px" : "8px",
                backgroundColor: i === slide ? current.accent : "rgba(255,255,255,0.4)",
              }}
            />
          ))}
        </div>
      </section>

      {/* ── Trust badges ── */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Truck className="w-5 h-5 text-white" />, title: "Giao hàng toàn quốc", desc: "Miễn phí từ 500K" },
              { icon: <RotateCcw className="w-5 h-5 text-white" />, title: "Đổi trả 30 ngày", desc: "Miễn phí, không lý do" },
              { icon: <Shield className="w-5 h-5 text-white" />, title: "Hàng chính hãng 100%", desc: "Cam kết hoàn tiền" },
              { icon: <Headphones className="w-5 h-5 text-white" />, title: "Hỗ trợ 24/7", desc: "Hotline 1900 1234" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-2xl border-2 border-orange-400 hover:border-orange-500 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Khuyến mãi HOT ── */}
      <section className="py-10 px-4 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-3xl p-8 shadow-2xl border-4 border-yellow-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center animate-pulse">
                <Zap className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h2 className="text-white text-2xl md:text-3xl font-black">KHUYẾN MÃI HOT</h2>
                <p className="text-yellow-100 text-sm">Giảm giá cực sốc - Số lượng có hạn!</p>
              </div>
            </div>
            <Link to="/products?filter=sale" className="hidden md:inline-flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-yellow-50 transition-all shadow-lg">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="bg-white/30 rounded-2xl h-60 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {saleProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
          <Link to="/products?filter=sale" className="md:hidden mt-4 w-full flex items-center justify-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-yellow-50 transition-all shadow-lg">
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Sản phẩm bán chạy ── */}
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
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {bestSellers.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* ── Sản phẩm dành cho bạn ── */}
      <section className="py-8 px-4 max-w-7xl mx-auto bg-gradient-to-b from-blue-50 to-white rounded-3xl">
        <div className="flex items-center justify-between mb-6 px-4 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">💎</span>
            <h2 className="text-gray-900">Sản phẩm dành cho bạn</h2>
          </div>
          <Link to="/products" className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 transition-colors">
            Xem thêm <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-4 pb-4">
            {[1,2,3,4,5].map(i => <div key={i} className="bg-blue-100 rounded-2xl h-56 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-4 pb-4">
            {allProducts.slice(0, 10).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* ── Promo Banners ── */}
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

      {/* ── Hàng mới về ── */}
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
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {newProducts.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* ── Blog ── */}
      <section className="py-10 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-gray-900">Blog Tư Vấn Thể Thao</h2>
          </div>
          <Link to="/blog" className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 transition-colors">
            Xem tất cả bài viết <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {blogs.slice(0, 3).map((post) => (
            <Link key={post.id} to={`/blog/${post.slug || post.id}`} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-blue-100 transition-all">
              <div className="h-44 overflow-hidden relative">
                <img src={post.imageUrl || '/default-blog.jpg'} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-3 left-3 bg-white/95 text-blue-700 text-xs px-2.5 py-1 rounded-full">{post.category}</span>
              </div>
              <div className="p-4">
                <h3 className="text-gray-900 text-sm leading-snug group-hover:text-blue-700 transition-colors line-clamp-2 mb-2">{post.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{post.author ? post.author.split(" ").slice(-2).join(" ") : "Admin"}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>5 phút đọc</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-blue-700 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-white mb-2">Khách hàng nói về chúng tôi</h2>
            <p className="text-blue-200">Hơn 50,000 khách hàng đã tin dùng SportZone</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.length > 0 ? reviews.map((t, i) => (
              <div key={t.id || i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map((s) => <Star key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-white/90 text-sm leading-relaxed mb-4 italic">"{t.comment}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold text-sm">{t.userName || "Khách hàng"}</p>
                    <p className="text-blue-200 text-xs">Đã mua & đánh giá 5 sao</p>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-blue-200 text-center col-span-3">Chưa có đánh giá nào.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
