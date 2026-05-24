import { Search, Plus, Edit2, Trash2, X, Star, Layers } from "lucide-react";
import categoryService, { Category } from "../../../services/categoryService";
import { useState, useEffect } from "react";

export function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // State cho Sắp xếp và Phân trang
  const [sortBy, setSortBy] = useState("hierarchy");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        await categoryService.deleteCategory(id);
        fetchCategories();
      } catch (err) {
        alert("Xóa thất bại");
      }
    }
  };

  // Thuật toán sắp xếp và tạo cấu trúc cây danh mục
  const getSortedCategories = (list: Category[], sortOption: string) => {
    let filtered = list.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortOption === "hierarchy") {
      const roots: Category[] = [];
      const childrenMap: { [key: number]: Category[] } = {};
      const allIds = new Set(list.map(c => c.id));
      
      list.forEach(c => {
        if (!c.parentId || !allIds.has(c.parentId)) {
          roots.push(c);
        } else {
          if (!childrenMap[c.parentId]) {
            childrenMap[c.parentId] = [];
          }
          childrenMap[c.parentId].push(c);
        }
      });

      // Sắp xếp các danh mục gốc theo số thứ tự (ID) tăng dần
      roots.sort((a, b) => a.id - b.id);

      const result: (Category & { depth: number })[] = [];
      const traverse = (cat: Category, depth: number) => {
        const isMatch = filtered.some(f => f.id === cat.id);
        if (isMatch) {
          result.push({ ...cat, depth });
        }
        
        const children = childrenMap[cat.id] || [];
        // Danh mục con cũng sắp xếp theo số thứ tự (ID) tăng dần
        children.sort((a, b) => a.id - b.id);
        
        children.forEach(child => traverse(child, depth + 1));
      };

      roots.forEach(root => traverse(root, 0));

      // Đưa các danh mục bị mồ côi (nếu có) vào cuối danh sách
      const resultIds = new Set(result.map(r => r.id));
      filtered.forEach(f => {
        if (!resultIds.has(f.id)) {
          result.push({ ...f, depth: 0 });
        }
      });

      return result;
    }

    const sorted = [...filtered];
    switch (sortOption) {
      case "name_asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
        break;
      case "name_desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name, 'vi'));
        break;
      case "rating_desc":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "rating_asc":
        sorted.sort((a, b) => a.rating - b.rating);
        break;
      case "id_desc":
        sorted.sort((a, b) => b.id - a.id);
        break;
      case "id_asc":
        sorted.sort((a, b) => a.id - b.id);
        break;
    }
    return sorted.map(c => ({ ...c, depth: 0 }));
  };

  const processedCategories = getSortedCategories(categories, sortBy);
  const totalItems = processedCategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedCategories = processedCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Quản lý Danh mục</h2>
          <p className="text-gray-500 text-sm mt-1">Phân loại sản phẩm theo nhóm</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Thêm danh mục
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-500 whitespace-nowrap">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-sm font-bold text-gray-700 outline-none cursor-pointer"
            >
              <option value="hierarchy">Cấu trúc Cha - Con (Mặc định)</option>
              <option value="id_asc">Số thứ tự (ID tăng dần)</option>
              <option value="id_desc">Số thứ tự (ID giảm dần)</option>
              <option value="name_asc">Tên: A - Z</option>
              <option value="name_desc">Tên: Z - A</option>
              <option value="rating_desc">Đánh giá: Cao nhất</option>
              <option value="rating_asc">Đánh giá: Thấp nhất</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">ID</th>
                <th className="px-6 py-4 font-bold">Tên danh mục</th>
                <th className="px-6 py-4 font-bold">Slug</th>
                <th className="px-6 py-4 font-bold">Danh mục cha</th>
                <th className="px-6 py-4 font-bold">Đánh giá</th>
                <th className="px-6 py-4 font-bold">Trạng thái</th>
                <th className="px-6 py-4 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <p>Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy danh mục nào
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">#{category.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* Indentation for hierarchy tree */}
                        {category.depth > 0 && (
                          <div 
                            className="flex items-center text-gray-500 shrink-0 select-none"
                            style={{ width: `${category.depth * 24}px`, paddingLeft: `${(category.depth - 1) * 24}px` }}
                          >
                            <span className="text-lg font-bold">↳</span>
                          </div>
                        )}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 ${
                          category.depth > 0 ? "bg-gray-50 text-gray-500" : "bg-blue-50 text-blue-600"
                        }`}>
                          <Layers className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-bold text-gray-900 ${category.depth > 0 ? "text-sm text-gray-600 font-semibold" : ""}`}>
                            {category.name}
                          </span>
                          {category.depth > 0 && (
                            <span className="text-[10px] text-blue-500 font-bold tracking-wide uppercase mt-0.5">
                              Con của: {category.parentName}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{category.slug}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {category.parentName || <span className="text-gray-300 italic">Cấp cao nhất</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold text-gray-700">{category.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        category.status?.toLowerCase() === "active" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                      }`}>
                        {category.status?.toLowerCase() === "active" ? "Hoạt động" : "Tạm ẩn"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setSelectedCategory(category);
                            setShowEditModal(true);
                          }}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(category.id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-6 py-4 border border-gray-100 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Hiển thị</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white text-sm font-bold text-gray-700 cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-500">danh mục trên mỗi trang</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-sm font-medium"
            >
              Trước
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
              .map((page, idx, arr) => {
                const prev = arr[idx - 1];
                return (
                  <div key={page} className="flex items-center gap-1.5">
                    {prev && page - prev > 1 && <span className="px-1 text-gray-500">...</span>}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                        currentPage === page
                          ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                );
              })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-sm font-medium"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {showAddModal && (
        <CategoryFormModal 
          onClose={() => setShowAddModal(false)} 
          onRefresh={fetchCategories}
          allCategories={categories}
        />
      )}

      {showEditModal && selectedCategory && (
        <CategoryFormModal 
          category={selectedCategory} 
          onClose={() => setShowEditModal(false)} 
          onRefresh={fetchCategories}
          allCategories={categories}
        />
      )}
    </div>
  );
}

function CategoryFormModal({ 
  category, 
  onClose, 
  onRefresh, 
  allCategories 
}: { 
  category?: Category; 
  onClose: () => void; 
  onRefresh: () => void;
  allCategories: Category[];
}) {
  const isEdit = !!category;
  const [formData, setFormData] = useState<Partial<Category>>(() => {
    if (category) {
      return {
        ...category,
        status: category.status?.toLowerCase() || "active"
      };
    }
    return {
      name: "",
      slug: "",
      status: "active",
      rating: 5,
      parentId: null
    };
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEdit && formData.name) {
      const slug = formData.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đÐ]/g, "d")
        .replace(/([^0-9a-z-\s])/g, "")
        .replace(/(\s+)/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      alert("Vui lòng nhập đầy đủ tên và slug!");
      return;
    }
    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        status: formData.status?.toUpperCase()
      };
      if (isEdit && category) {
        await categoryService.updateCategory(category.id, dataToSubmit);
      } else {
        await categoryService.createCategory(dataToSubmit);
      }
      onRefresh();
      onClose();
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.error || "Lỗi khi lưu danh mục";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-xl font-black text-gray-900">
            {isEdit ? "Cập nhật danh mục" : "Thêm danh mục mới"}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Tên danh mục *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              placeholder="Ví dụ: Giày thể thao"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Slug (Đường dẫn) *</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm"
              placeholder="giay-the-thao"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Danh mục cha</label>
            <select
              value={formData.parentId || ""}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value ? Number(e.target.value) : null })}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            >
              <option value="">Không có (Danh mục gốc)</option>
              {allCategories
                .filter(c => c.id !== category?.id) // Prevent self-referencing
                .map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm ẩn</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Đánh giá (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:scale-100 active:scale-95 flex items-center justify-center gap-2"
            >
              {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {isEdit ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
