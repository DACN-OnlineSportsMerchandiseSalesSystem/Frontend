import { Search, Plus, Edit2, Trash2, X, Upload, Star, ImageIcon } from "lucide-react";
import brandService, { Brand } from "../../../services/brandService";
import uploadService from "../../../services/uploadService";
import { useState, useEffect, useRef } from "react";

export function BrandsManagement() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  const fetchBrands = async () => {
    setIsLoading(true);
    try {
      const data = await brandService.getAllBrands();
      setBrands(data);
    } catch (err) {
      console.error("Failed to fetch brands", err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thương hiệu này?")) {
      try {
        await brandService.deleteBrand(id);
        fetchBrands();
      } catch (err) {
        alert("Xóa thất bại");
      }
    }
  };

  const filteredBrands = brands.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.detail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Quản lý Thương hiệu</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý các thương hiệu sản phẩm trong hệ thống</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-200"
        >
          <Plus className="w-4 h-4" />
          Thêm thương hiệu
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border-2 border-gray-300 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm thương hiệu theo tên, mô tả..."
            className="w-full pl-11 pr-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400"
          />
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-sm text-gray-600">Tìm thấy {filteredBrands.length} thương hiệu</span>
        </div>
      </div>

      {/* Brands Table */}
      <div className="bg-white rounded-2xl border-2 border-gray-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thương hiệu</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mô tả</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Đánh giá</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">Đang tải dữ liệu...</td>
                </tr>
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">Không tìm thấy thương hiệu nào</td>
                </tr>
              ) : (
                filteredBrands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img loading="lazy" decoding="async" 
                          src={brand.imageUrl || "https://via.placeholder.com/100"} 
                          alt={brand.name} 
                          className="w-12 h-12 rounded-lg object-cover border-2 border-gray-300 bg-gray-50" 
                        />
                        <span className="text-sm font-bold text-gray-900">{brand.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">{brand.detail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        brand.status?.toLowerCase() === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {brand.status?.toLowerCase() === 'active' ? 'Hoạt động' : 'Ẩn'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium text-gray-700">{brand.rating || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedBrand(brand);
                            setShowEditModal(true);
                          }}
                          className="p-2 hover:bg-yellow-50 rounded-lg transition-colors group"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4 text-gray-500 group-hover:text-yellow-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(brand.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4 text-gray-500 group-hover:text-red-500" />
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

      {/* Add Brand Modal */}
      {showAddModal && (
        <BrandFormModal 
          onClose={() => setShowAddModal(false)} 
          onRefresh={fetchBrands} 
        />
      )}

      {/* Edit Brand Modal */}
      {showEditModal && selectedBrand && (
        <BrandFormModal
          brand={selectedBrand}
          onClose={() => {
            setShowEditModal(false);
            setSelectedBrand(null);
          }}
          onRefresh={fetchBrands}
        />
      )}
    </div>
  );
}

function BrandFormModal({ brand, onClose, onRefresh }: { brand?: Brand; onClose: () => void; onRefresh: () => void }) {
  const isEdit = !!brand;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<Brand>>(() => {
    if (brand) {
      return {
        ...brand,
        status: brand.status?.toLowerCase() || "active"
      };
    }
    return {
      name: "",
      detail: "",
      imageUrl: "",
      status: "active",
      rating: 5
    };
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { url } = await uploadService.uploadImage(file);
      setFormData({ ...formData, imageUrl: url });
    } catch (err) {
      alert("Tải ảnh thất bại");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      alert("Vui lòng tải lên hình ảnh logo thương hiệu!");
      return;
    }
    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        status: formData.status?.toUpperCase()
      };
      if (isEdit && brand) {
        await brandService.updateBrand(brand.id, dataToSubmit);
      } else {
        await brandService.createBrand(dataToSubmit);
      }
      onRefresh();
      onClose();
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.error || "Thêm mới thất bại";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-xl font-bold text-gray-900">
            {isEdit ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu mới'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Logo thương hiệu</label>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden" 
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative group cursor-pointer border-2 border-dashed rounded-2xl overflow-hidden transition-all h-40 flex flex-col items-center justify-center gap-2 ${
                  formData.imageUrl ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                }`}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-xs text-blue-600 font-medium">Đang tải lên...</p>
                  </div>
                ) : formData.imageUrl ? (
                  <>
                    <img loading="lazy" decoding="async" src={formData.imageUrl} alt="Preview" className="w-full h-full object-contain p-4" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-sm font-medium flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Thay đổi ảnh
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <ImageIcon className="w-6 h-6 text-gray-500 group-hover:text-blue-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-700">Tải ảnh lên</p>
                      <p className="text-xs text-gray-500">PNG, JPG tối đa 5MB</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên thương hiệu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="Nhập tên thương hiệu (VD: Nike, Adidas...)"
                required
              />
            </div>

            {/* Detail */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả chi tiết</label>
              <textarea
                rows={3}
                value={formData.detail}
                onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                placeholder="Nhập mô tả về thương hiệu..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Ẩn</option>
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Đánh giá (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                isEdit ? 'Cập nhật' : 'Thêm mới'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
