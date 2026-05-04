import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Eye, FileText, Calendar, User } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  category: string;
  author: string;
  publishDate: string;
  views: number;
  status: "published" | "draft";
  thumbnail: string;
}

const mockBlogs: BlogPost[] = [
  {
    id: "B001",
    title: "10 Bài Tập Chạy Bộ Hiệu Quả Cho Người Mới Bắt Đầu",
    category: "Chạy bộ",
    author: "Admin",
    publishDate: "20/04/2026",
    views: 1245,
    status: "published",
    thumbnail: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400",
  },
  {
    id: "B002",
    title: "Cách Chọn Giày Bóng Đá Phù Hợp Với Từng Vị Trí",
    category: "Bóng đá",
    author: "Admin",
    publishDate: "18/04/2026",
    views: 987,
    status: "published",
    thumbnail: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400",
  },
  {
    id: "B003",
    title: "Thực Đơn Dinh Dưỡng Cho Người Tập Gym",
    category: "Gym",
    author: "Admin",
    publishDate: "15/04/2026",
    views: 2134,
    status: "published",
    thumbnail: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400",
  },
];

export function BlogManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredBlogs = mockBlogs.filter(blog => {
    const matchSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "all" || blog.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-gray-900">Quản lý Blog</h2>
          <p className="text-sm text-gray-500 mt-1">Tạo và quản lý bài viết tư vấn thể thao</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-200">
          <Plus className="w-4 h-4" />
          Viết bài mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Tổng bài viết</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{mockBlogs.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Đã xuất bản</p>
          <p className="text-2xl font-black text-green-600 mt-1">
            {mockBlogs.filter(b => b.status === "published").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Bản nháp</p>
          <p className="text-2xl font-black text-yellow-600 mt-1">
            {mockBlogs.filter(b => b.status === "draft").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Tổng lượt xem</p>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {mockBlogs.reduce((sum, b) => sum + b.views, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài viết..."
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
          </select>
        </div>
        <p className="text-sm text-gray-600">Tìm thấy {filteredBlogs.length} bài viết</p>
      </div>

      {/* Blog List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBlogs.map((blog) => (
          <div key={blog.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
            <div className="relative aspect-video overflow-hidden">
              <img
                src={blog.thumbnail}
                alt={blog.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  blog.status === "published"
                    ? "bg-green-600 text-white"
                    : "bg-yellow-500 text-white"
                }`}>
                  {blog.status === "published" ? "Đã xuất bản" : "Bản nháp"}
                </span>
              </div>
            </div>

            <div className="p-4">
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full mb-2">
                {blog.category}
              </span>
              <h4 className="text-sm font-bold text-gray-900 line-clamp-2 mb-3 leading-snug">
                {blog.title}
              </h4>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {blog.author}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {blog.publishDate}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Eye className="w-3 h-3" />
                  {blog.views.toLocaleString()} lượt xem
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                    <Eye className="w-4 h-4 text-blue-600" />
                  </button>
                  <button className="p-1.5 hover:bg-yellow-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4 text-yellow-600" />
                  </button>
                  <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
