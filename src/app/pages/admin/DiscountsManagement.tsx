import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Tag, Calendar, PercentIcon, X, Loader2, AlertCircle } from "lucide-react";
import discountService, { DiscountDTO } from "../../../services/discountService";
import categoryService, { Category } from "../../../services/categoryService";
import brandService, { Brand } from "../../../services/brandService";

export function DiscountsManagement() {
  const [discounts, setDiscounts] = useState<DiscountDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchDiscounts = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await discountService.getAllDiscounts();
      setDiscounts(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể tải danh sách khuyến mãi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chương trình khuyến mãi này?")) return;
    try {
      await discountService.deleteDiscount(id);
      setDiscounts(prev => prev.filter(d => d.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Xóa thất bại");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-gray-900 font-black">Quản lý khuyến mãi</h2>
          <p className="text-sm text-gray-500 mt-1">Các chương trình giảm giá theo hệ thống, danh mục hoặc thương hiệu</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl transition-all shadow-lg shadow-indigo-200 font-bold uppercase tracking-widest text-xs"
        >
          <Plus className="w-4 h-4" />
          Tạo khuyến mãi mới
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="font-bold">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-gray-500 font-bold">Đang tải danh sách khuyến mãi...</p>
        </div>
      ) : discounts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <PercentIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-bold">Chưa có chương trình khuyến mãi nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {discounts.map((discount) => (
            <div key={discount.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Tag className="w-7 h-7 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-gray-900 mb-1">{discount.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                          discount.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}>
                          {discount.isActive ? "Đang chạy" : "Tạm dừng"}
                        </span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-lg">
                          {discount.scope === "CATEGORY" ? "Danh mục" : discount.scope === "BRAND" ? "Thương hiệu" : "Toàn hệ thống"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    className="p-3 hover:bg-red-50 rounded-2xl transition-colors text-red-500 hover:scale-110"
                    onClick={() => discount.id && handleDelete(discount.id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl">
                    <span className="text-sm font-bold text-red-600 uppercase tracking-widest">Mức giảm giá</span>
                    <span className="font-black text-3xl text-red-600">-{discount.discountPercent}%</span>
                  </div>

                  <div className="flex items-center justify-between px-2 text-sm">
                    <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Thời gian áp dụng</span>
                    <span className="font-black text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      {discount.startDate ? new Date(discount.startDate).toLocaleDateString('vi-VN') : '---'} 
                      <span className="text-gray-300">→</span>
                      {discount.endDate ? new Date(discount.endDate).toLocaleDateString('vi-VN') : '---'}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between px-2">
                    <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Đối tượng</span>
                    <span className="font-black text-indigo-600 text-sm">
                      {discount.scope === "CATEGORY" ? `Danh mục ID: ${discount.categoryId}` : 
                       discount.scope === "BRAND" ? `Thương hiệu ID: ${discount.brandId}` : "Tất cả sản phẩm"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <DiscountFormModal 
          onClose={() => setShowAddModal(false)} 
          onSuccess={() => {
            setShowAddModal(false);
            fetchDiscounts();
          }} 
        />
      )}
    </div>
  );
}

function DiscountFormModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [formData, setFormData] = useState<DiscountDTO>({
    name: "",
    discountPercent: 0,
    scope: "GLOBAL",
    categoryId: undefined,
    brandId: undefined,
    startDate: "",
    endDate: "",
    isActive: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, brs] = await Promise.all([
          categoryService.getAllCategories(),
          brandService.getAllBrands()
        ]);
        setCategories(cats);
        setBrands(brs);
      } catch (err) {}
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      await discountService.createDiscount(formData);
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Tạo khuyến mãi thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] max-w-xl w-full shadow-2xl overflow-hidden border border-white">
        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white">
            <h3 className="text-xl font-black text-gray-900">Tạo khuyến mãi mới</h3>
            <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Tên chương trình *</label>
              <input
                type="text"
                required
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-400 font-bold text-gray-900"
                placeholder="Ví dụ: Giảm giá mùa hè 2024"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Mức giảm (%) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-400 font-black text-red-600 text-center text-xl"
                  value={formData.discountPercent}
                  onChange={e => setFormData({...formData, discountPercent: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Phạm vi áp dụng *</label>
                <select
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-400 font-bold text-gray-900 appearance-none"
                  value={formData.scope}
                  onChange={e => setFormData({...formData, scope: e.target.value, categoryId: undefined, brandId: undefined})}
                >
                  <option value="GLOBAL">Toàn hệ thống</option>
                  <option value="CATEGORY">Theo danh mục</option>
                  <option value="BRAND">Theo thương hiệu</option>
                </select>
              </div>
            </div>

            {formData.scope === "CATEGORY" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Chọn Danh mục *</label>
                <select
                  required
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-400 font-bold text-gray-900 appearance-none"
                  value={formData.categoryId || ""}
                  onChange={e => setFormData({...formData, categoryId: Number(e.target.value)})}
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            )}

            {formData.scope === "BRAND" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Chọn Thương hiệu *</label>
                <select
                  required
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-400 font-bold text-gray-900 appearance-none"
                  value={formData.brandId || ""}
                  onChange={e => setFormData({...formData, brandId: Number(e.target.value)})}
                >
                  <option value="">-- Chọn thương hiệu --</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Ngày bắt đầu</label>
                <input
                  type="date"
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-400 font-bold text-gray-900"
                  value={formData.startDate}
                  onChange={e => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Ngày kết thúc</label>
                <input
                  type="date"
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-400 font-bold text-gray-900"
                  value={formData.endDate}
                  onChange={e => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="px-8 py-6 bg-gray-50 flex items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 font-bold text-gray-500 hover:text-gray-700 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 font-black uppercase tracking-widest text-xs"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Tạo khuyến mãi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
