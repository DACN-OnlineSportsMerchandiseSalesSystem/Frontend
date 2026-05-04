import { useState } from "react";
import { Link } from "react-router";
import { Clock, Search, TrendingUp, Bookmark } from "lucide-react";
import { blogPosts, blogCategories } from "../data/blog";

export function Blog() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = blogPosts.filter((post) => {
    const matchCat = activeCategory === "all" || post.category === activeCategory;
    const matchSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const featured = blogPosts.filter((p) => p.featured);

  const sportIcons: Record<string, string> = {
    "Chạy bộ": "🏃",
    "Gym & Fitness": "💪",
    "Bóng đá": "⚽",
    "Yoga": "🧘",
    "Đa môn": "🎽",
    "Bơi lội": "🏊",
    "Xe đạp": "🚴",
    "Cầu lông": "🏸",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm mb-3">
          <TrendingUp className="w-4 h-4" />
          Blog Thể Thao
        </div>
        <h1 className="text-gray-900 text-4xl mb-3">Tư Vấn & Kiến Thức Thể Thao</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Những bài viết chuyên sâu từ các chuyên gia, huấn luyện viên hàng đầu giúp bạn tập luyện đúng cách và đạt kết quả tốt nhất.
        </p>
      </div>

      {/* Featured Posts */}
      <div className="mb-12">
        <h2 className="text-gray-800 mb-5 flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-blue-600" />
          Bài Viết Nổi Bật
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Main featured */}
          <div className="md:col-span-2">
            <Link to={`/blog/${featured[0].id}`} className="group block h-full">
              <div className="relative h-72 md:h-80 rounded-2xl overflow-hidden mb-4">
                <img
                  src={featured[0].image}
                  alt={featured[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="inline-block bg-blue-600 text-white text-xs px-3 py-1 rounded-full mb-2">
                    {sportIcons[featured[0].sport] || "📝"} {featured[0].category}
                  </span>
                  <h3 className="text-white text-xl leading-snug group-hover:text-blue-200 transition-colors">
                    {featured[0].title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2 text-white/70 text-sm">
                    <span>{featured[0].author}</span>
                    <span>·</span>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{featured[0].readTime} phút đọc</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Side featured */}
          <div className="flex flex-col gap-4">
            {featured.slice(1, 3).map((post) => (
              <Link key={post.id} to={`/blog/${post.id}`} className="group flex gap-3 bg-white rounded-xl p-3 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-blue-600 mb-1 block">{sportIcons[post.sport] || "📝"} {post.category}</span>
                  <h4 className="text-gray-800 text-sm leading-snug group-hover:text-blue-700 transition-colors line-clamp-2 mb-2">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>{post.readTime} phút đọc</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-7">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 bg-white text-sm text-gray-700 placeholder-gray-400"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {blogCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm transition-all border ${
                activeCategory === cat.id
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">🔍</div>
          <p>Không tìm thấy bài viết phù hợp</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => (
            <Link key={post.id} to={`/blog/${post.id}`} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-blue-100 transition-all">
              <div className="h-48 overflow-hidden relative">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-blue-700 text-xs px-2.5 py-1 rounded-full">
                  {sportIcons[post.sport] || "📝"} {post.category}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-gray-900 mb-2 leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs">
                      {post.authorAvatar}
                    </div>
                    <div>
                      <p className="text-xs text-gray-700 truncate max-w-[100px]">{post.author.split(" ").slice(-2).join(" ")}</p>
                      <p className="text-xs text-gray-400">{post.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>{post.readTime} phút</span>
                  </div>
                </div>
                {/* Tags */}
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="bg-gray-50 text-gray-500 text-xs px-2 py-0.5 rounded-full border border-gray-100">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Newsletter CTA */}
      <div className="mt-14 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-center text-white">
        <h2 className="text-white mb-2">Đăng ký nhận bản tin thể thao</h2>
        <p className="text-blue-200 text-sm mb-5">Nhận các bài viết mới nhất, tips tập luyện và ưu đãi đặc biệt từ SportZone mỗi tuần.</p>
        <div className="flex gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Email của bạn..."
            className="flex-1 px-4 py-2.5 rounded-xl text-gray-800 text-sm focus:outline-none placeholder-gray-400"
          />
          <button className="bg-white text-blue-700 px-5 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition-colors whitespace-nowrap">
            Đăng ký ngay
          </button>
        </div>
      </div>
    </div>
  );
}
