import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Eye, Calendar, User, X, Save, Image as ImageIcon, FileText, Upload } from "lucide-react";
import blogService, { BlogPostDTO } from "../../../services/blogService";
import categoryService from "../../../services/categoryService";
import uploadService from "../../../services/uploadService";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export function BlogManagement() {
  const [blogs, setBlogs] = useState<BlogPostDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPostDTO | null>(null);
  const [viewingBlog, setViewingBlog] = useState<BlogPostDTO | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [formData, setFormData] = useState<BlogPostDTO>({
    title: "",
    slug: "",
    category: "",
    sport: "",
    author: "Admin",
    excerpt: "",
    content: "",
    tags: "",
    imageUrl: ""
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data.filter((c: any) => !c.parentId));
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const data = await blogService.getAllBlogs();
      setBlogs(data);
    } catch (error) {
      console.error("Failed to load blogs", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadService.uploadImage(file);
      setFormData({ ...formData, imageUrl: result.url });
    } catch (error) {
      alert("Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchSearch = blog.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "all" || blog.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này? Hành động không thể hoàn tác.")) {
      try {
        await blogService.deleteBlog(id);
        setBlogs(blogs.filter(b => b.id !== id));
      } catch (error) {
        alert("Lỗi khi xóa bài viết.");
      }
    }
  };

  const openAddModal = () => {
    setEditingBlog(null);
    setFormData({
      title: "",
      slug: "",
      category: "",
      sport: "",
      author: "Admin",
      excerpt: "",
      content: "",
      tags: "",
      imageUrl: ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = (blog: BlogPostDTO) => {
    setEditingBlog(blog);
    setFormData({ ...blog });
    setIsModalOpen(true);
  };

  const openViewModal = (blog: BlogPostDTO) => {
    setViewingBlog(blog);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if content is empty (ReactQuill might be empty string or just <p><br></p>)
    const plainTextContent = formData.content.replace(/<[^>]*>?/gm, '').trim();
    if (!plainTextContent && formData.content !== "<img") { // Allow if there is an image only
      if (!formData.content.includes("<img")) {
        alert("Vui lòng nhập nội dung chi tiết bài viết (không được bỏ trống).");
        return;
      }
    }

    if (!formData.slug.trim()) {
      alert("Đường dẫn tĩnh (Slug) không được bỏ trống.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Sanitize imageUrl in case it's an object due to old state
      let finalImageUrl = formData.imageUrl;
      if (typeof finalImageUrl === 'object' && finalImageUrl !== null && (finalImageUrl as any).url) {
        finalImageUrl = (finalImageUrl as any).url;
      }
      
      const payload = {
        ...formData,
        imageUrl: finalImageUrl
      };

      if (editingBlog && editingBlog.id) {
        const updated = await blogService.updateBlog(editingBlog.id, payload);
        setBlogs(blogs.map(b => b.id === editingBlog.id ? updated : b));
      } else {
        const created = await blogService.createBlog(payload);
        setBlogs([created, ...blogs]);
      }
      setIsModalOpen(false);
    } catch (error) {
      alert("Lỗi khi lưu bài viết.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to auto-generate slug
  const generateSlug = (text: string) => {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, "-");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Quản lý Blog</h2>
          <p className="text-sm text-gray-500 mt-1">Tạo và quản lý bài viết tư vấn thể thao</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-200 font-bold"
        >
          <Plus className="w-5 h-5" />
          Viết bài mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tổng bài viết</p>
          <p className="text-3xl font-black text-gray-900 mt-2">{blogs.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đã xuất bản</p>
          <p className="text-3xl font-black text-green-600 mt-2">
            {blogs.filter(b => b.status === "published" || !b.status).length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bản nháp</p>
          <p className="text-3xl font-black text-yellow-600 mt-2">
            {blogs.filter(b => b.status === "draft").length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tổng lượt xem</p>
          <p className="text-3xl font-black text-blue-600 mt-2">
            {blogs.reduce((sum, b) => sum + (b.views || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài viết..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-400 focus:bg-white transition-colors font-medium"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-400 font-medium text-gray-700 cursor-pointer transition-colors"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
          </select>
        </div>
        <p className="text-sm font-bold text-gray-400">Đang hiển thị {filteredBlogs.length} bài viết</p>
      </div>

      {/* Blog List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-bold text-gray-600">Không tìm thấy bài viết nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <div key={blog.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group flex flex-col">
              <div className="relative aspect-video overflow-hidden bg-gray-50">
                {blog.imageUrl ? (
                  <img
                    src={blog.imageUrl}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-300">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                    blog.status === "draft"
                      ? "bg-yellow-500 text-white"
                      : "bg-green-500 text-white"
                  }`}>
                    {blog.status === "draft" ? "Bản nháp" : "Đã xuất bản"}
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                    {blog.category}
                  </span>
                  <span className="inline-block px-3 py-1 bg-gray-50 text-gray-600 text-xs font-bold rounded-full">
                    {blog.sport}
                  </span>
                </div>
                
                <h4 className="text-lg font-black text-gray-900 line-clamp-2 mb-2 leading-snug group-hover:text-blue-600 transition-colors">
                  {blog.title}
                </h4>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                  {blog.excerpt}
                </p>

                <div className="flex items-center justify-between text-xs font-bold text-gray-400 mb-5">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    {blog.author}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {blog.publishDate ? new Date(blog.publishDate).toLocaleDateString("vi-VN") : "N/A"}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs font-black text-blue-600">
                    <Eye className="w-4 h-4" />
                    {(blog.views || 0).toLocaleString()} lượt xem
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openViewModal(blog)}
                      className="p-2 hover:bg-green-50 text-gray-400 hover:text-green-600 rounded-xl transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => openEditModal(blog)}
                      className="p-2 hover:bg-yellow-50 text-gray-400 hover:text-yellow-600 rounded-xl transition-colors"
                      title="Sửa"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => blog.id && handleDelete(blog.id)}
                      className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl my-8 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-3xl">
              <h3 className="text-2xl font-black text-gray-900">
                {editingBlog ? "Chỉnh sửa Bài viết" : "Viết bài mới"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tiêu đề bài viết *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      title: e.target.value,
                      slug: !editingBlog ? generateSlug(e.target.value) : formData.slug 
                    })}
                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors font-medium text-lg"
                    placeholder="VD: Top 5 đôi giày chạy bộ tốt nhất..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Đường dẫn tĩnh (Slug) *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Ảnh Thumbnail *</label>
                  <div className="flex items-center gap-4">
                    {formData.imageUrl && (
                      <img src={formData.imageUrl} alt="Thumbnail" className="w-16 h-16 object-cover rounded-xl" />
                    )}
                    <label className="flex-1 cursor-pointer">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      <div className="w-full px-5 py-3 bg-gray-50 border border-gray-200 border-dashed rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                        {isUploading ? (
                          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-gray-500" />
                            <span className="text-sm font-bold text-gray-600">Chọn ảnh từ máy tính</span>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Danh mục *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors font-medium text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Môn thể thao *</label>
                  <select
                    required
                    value={formData.sport}
                    onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors font-medium text-sm cursor-pointer"
                  >
                    <option value="" disabled>Chọn môn thể thao</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tác giả</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors font-medium text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Từ khóa (Tags)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors font-medium text-sm"
                    placeholder="VD: the thao, giay dep, v.v."
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Trích dẫn ngắn (Excerpt)</label>
                  <textarea
                    rows={2}
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors font-medium text-sm resize-none"
                    placeholder="Đoạn văn ngắn tóm tắt bài viết..."
                  />
                </div>

                <div className={isFullscreen ? "fixed inset-0 z-[100] bg-gray-50 p-6 flex flex-col" : "col-span-2"}>
                  <style>{`
                    .quill-editor-container .ql-container {
                      flex: 1;
                      display: flex;
                      flex-direction: column;
                      min-height: 0;
                    }
                    .quill-editor-container .ql-editor {
                      flex: 1;
                      font-size: 16px;
                    }
                  `}</style>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-gray-700">Nội dung chi tiết (HTML) *</label>
                    <button 
                      type="button" 
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="text-blue-700 font-semibold hover:bg-blue-100 px-4 py-1.5 rounded-lg text-sm transition-colors border border-blue-200 shadow-sm bg-white flex items-center gap-2"
                    >
                      {isFullscreen ? "↙️ Thu nhỏ lại" : "↗️ Phóng to toàn màn hình"}
                    </button>
                  </div>
                  <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden flex-1 flex flex-col quill-editor-container shadow-sm ${isFullscreen ? 'h-full' : ''}`}>
                    <ReactQuill 
                      theme="snow" 
                      value={formData.content} 
                      onChange={(content) => setFormData({ ...formData, content })}
                      className={`flex-1 flex flex-col ${isFullscreen ? 'h-full' : 'h-[500px] pb-10'}`}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-200"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {editingBlog ? "Cập nhật bài viết" : "Đăng bài viết"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewingBlog(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8">
            <button
              onClick={() => setViewingBlog(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              ✕
            </button>
            <h2 className="text-3xl font-black text-gray-900 mb-4">{viewingBlog.title}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">{viewingBlog.category}</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">{viewingBlog.sport}</span>
              <span>•</span>
              <span>Tác giả: {viewingBlog.author}</span>
            </div>
            
            {viewingBlog.imageUrl && (
              <img src={viewingBlog.imageUrl} alt={viewingBlog.title} className="w-full h-80 object-cover rounded-xl mb-8 shadow-md" />
            )}
            
            {viewingBlog.excerpt && (
              <p className="text-xl text-gray-600 italic mb-8 border-l-4 border-blue-500 pl-4">{viewingBlog.excerpt}</p>
            )}

            <div 
              className="prose max-w-none prose-blue"
              dangerouslySetInnerHTML={{ __html: viewingBlog.content }}
            />
            
            {viewingBlog.tags && (
              <div className="mt-8 pt-6 border-t border-gray-100 flex gap-2 flex-wrap">
                {viewingBlog.tags.split(',').map(tag => tag.trim() && (
                  <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
