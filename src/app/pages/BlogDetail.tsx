import { useParams, Link } from "react-router";
import { Clock, ChevronRight, ArrowLeft, Share2, Bookmark, ThumbsUp, Tag } from "lucide-react";
import { useState, useEffect } from "react";
import blogService, { BlogPostDTO } from "../../services/blogService";

export function BlogDetail() {
  const { id: slug } = useParams<{ id: string }>(); // Using 'id' from router, but it represents the slug
  const [post, setPost] = useState<BlogPostDTO | null>(null);
  const [related, setRelated] = useState<BlogPostDTO[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 80) + 20);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (slug) {
          const fetchedPost = await blogService.getBlogBySlug(slug);
          setPost(fetchedPost);
          
          // Optionally fetch all to find related
          const allPosts = await blogService.getAllBlogs();
          setRelated(allPosts.filter((p) => (p.sport === fetchedPost.sport || p.category === fetchedPost.category) && p.id !== fetchedPost.id).slice(0, 3));
        }
      } catch (error) {
        console.error("Lỗi khi tải chi tiết blog:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="text-center py-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-gray-600">Đang tải nội dung...</h2>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-gray-600 mb-4">Không tìm thấy bài viết</h2>
        <Link to="/blog" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
          Về trang Blog
        </Link>
      </div>
    );
  }

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

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 flex-wrap">
        <Link to="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-700 truncate max-w-xs">{post.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Link to="/blog" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm mb-5 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Quay lại Blog
          </Link>

          {/* Category + Title */}
          <div className="mb-4">
            <span className="inline-block bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full mb-3">
              {sportIcons[post.sport] || "📝"} {post.category}
            </span>
            <h1 className="text-gray-900 text-2xl md:text-3xl leading-snug mb-4">{post.title}</h1>
            <p className="text-gray-500 text-base leading-relaxed">{post.excerpt}</p>
          </div>

          {/* Author + Meta */}
          <div className="flex items-center gap-4 py-4 border-y border-gray-100 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold flex-shrink-0 text-xl">
              {post.author?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <p className="text-gray-800 text-sm">{post.author}</p>
              <p className="text-gray-400 text-xs">Biên tập viên</p>
            </div>
            <div className="ml-auto flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{Math.ceil(post.content.length / 1000)} phút đọc</span>
              </div>
              <span>{post.publishDate || "Gần đây"}</span>
            </div>
          </div>

          {/* Hero Image */}
          {post.imageUrl && (
            <div className="rounded-2xl overflow-hidden mb-7 aspect-video bg-gray-100">
              <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Content */}
          <div 
            className="prose max-w-none prose-blue prose-img:rounded-xl prose-img:shadow-md"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          <div className="mt-12 flex flex-wrap gap-2">
            <Tag className="w-4 h-4 text-gray-400 mt-0.5" />
            {post.tags && post.tags.split(',').map((tag) => tag.trim() && (
              <span key={tag} className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors cursor-pointer">
                #{tag.trim()}
              </span>
            ))}
          </div>

          {/* Like + Share */}
          <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm transition-all ${
                liked ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${liked ? "fill-blue-600" : ""}`} />
              <span>Hữu ích ({likeCount})</span>
            </button>
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm transition-all ${
                bookmarked ? "border-yellow-400 bg-yellow-50 text-yellow-700" : "border-gray-200 text-gray-500 hover:border-yellow-300 hover:text-yellow-600"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-yellow-500 text-yellow-500" : ""}`} />
              <span>{bookmarked ? "Đã lưu" : "Lưu bài"}</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600 text-sm transition-all ml-auto">
              <Share2 className="w-4 h-4" />
              <span>Chia sẻ</span>
            </button>
          </div>

          {/* Author Box */}
          <div className="mt-8 bg-blue-50 rounded-2xl p-5 flex gap-4">
            <div className="w-14 h-14 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 font-black text-lg flex-shrink-0">
              {post.author?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <p className="text-gray-800 mb-0.5">{post.author}</p>
              <p className="text-blue-600 text-sm mb-2">Biên tập viên</p>
              <p className="text-gray-500 text-sm leading-relaxed">
                Chuyên gia có nhiều năm kinh nghiệm trong lĩnh vực {post.sport}. Đồng hành cùng SportZone để chia sẻ kiến thức và giúp cộng đồng thể thao Việt Nam phát triển.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Related Posts */}
          {related.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-blue-600 rounded-full inline-block" />
                Bài Viết Liên Quan
              </h3>
              <div className="space-y-4">
                {related.map((p) => (
                  <Link key={p.id} to={`/blog/${p.slug}`} className="group flex gap-3">
                    <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      <img src={p.imageUrl || "https://placehold.co/100x100?text=No+Image"} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 text-sm leading-snug group-hover:text-blue-700 transition-colors line-clamp-2 mb-1">
                        {p.title}
                      </p>
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <Clock className="w-3 h-3" />
                        <span>{Math.ceil(p.content.length / 1000)} phút</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* All Posts Link */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-600 rounded-full inline-block" />
              Tất Cả Chủ Đề
            </h3>
            <div className="space-y-2">
              {[
                { label: "🏃 Chạy bộ", sport: "Chạy bộ" },
                { label: "💪 Gym & Fitness", sport: "Gym & Fitness" },
                { label: "⚽ Bóng đá", sport: "Bóng đá" },
                { label: "🧘 Yoga", sport: "Yoga" },
                { label: "🏊 Bơi lội", sport: "Bơi lội" },
                { label: "🚴 Xe đạp", sport: "Xe đạp" },
                { label: "🏸 Cầu lông", sport: "Cầu lông" },
              ].map((item) => (
                <Link
                  key={item.sport}
                  to={`/blog`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-blue-50 hover:text-blue-700 text-gray-600 text-sm transition-colors"
                >
                  <span>{item.label}</span>
                  <span className="text-xs text-gray-400">
                    {/* {blogPosts.filter((p) => p.sport === item.sport).length} bài */}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* CTA Box */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 text-white">
            <h3 className="text-white mb-2">Khám Phá Sản Phẩm</h3>
            <p className="text-blue-200 text-sm mb-4 leading-relaxed">
              Trang bị đầy đủ dụng cụ chuyên nghiệp để tập luyện hiệu quả hơn.
            </p>
            <Link
              to="/products"
              className="block text-center bg-white text-blue-700 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition-colors"
            >
              Xem sản phẩm ngay →
            </Link>
          </div>
        </div>
      </div>

      {/* More Posts */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-gray-900">Có Thể Bạn Quan Tâm</h2>
          <Link to="/blog" className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 transition-colors">
            Xem tất cả <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Note: In a real app we would fetch random posts. For now we use related */}
          {related.slice(0, 3).map((p) => (
            <Link key={p.id} to={`/blog/${p.slug}`} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-blue-100 transition-all">
              <div className="h-40 overflow-hidden bg-gray-100">
                <img src={p.imageUrl || "https://placehold.co/400x250?text=No+Image"} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4">
                <span className="text-xs text-blue-600 mb-1 block">{sportIcons[p.sport] || "📝"} {p.category}</span>
                <h4 className="text-gray-800 text-sm leading-snug group-hover:text-blue-700 transition-colors line-clamp-2 mb-2">
                  {p.title}
                </h4>
                <div className="flex items-center gap-1 text-gray-400 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>{Math.ceil(p.content.length / 1000)} phút đọc</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
