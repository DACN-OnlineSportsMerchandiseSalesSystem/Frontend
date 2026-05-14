import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Tag, Calendar, DollarSign, X, Copy, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { formatPrice } from "../../data/products";
import voucherService, { Voucher } from "../../../services/voucherService";
import categoryService, { Category } from "../../../services/categoryService";
import brandService, { Brand } from "../../../services/brandService";

export function CouponsManagement() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [copiedCode, setCopiedCode] = useState("");

  const fetchVouchers = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await voucherService.getAllVouchersAdmin();
      setVouchers(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể tải danh sách mã giảm giá");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) return;
    try {
      await voucherService.deleteVoucherAdmin(id);
      setVouchers(prev => prev.filter(v => v.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Xóa thất bại");
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-gray-900">Quản lý Voucher</h2>
          <p className="text-sm text-gray-500 mt-1">Tạo và quản lý các mã giảm giá cho đơn hàng</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-200"
        >
          <Plus className="w-4 h-4" />
          Tạo mã mới
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500">Đang tải danh sách voucher...</p>
        </div>
      ) : vouchers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Tag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Chưa có voucher nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {vouchers.map((coupon) => (
            <div key={coupon.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-black text-gray-900 font-mono tracking-wider">{coupon.code}</h4>
                        <button
                          onClick={() => handleCopyCode(coupon.code)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          {copiedCode === coupon.code ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>#{coupon.id}</span>
                        {coupon.categoryName && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bold uppercase">{coupon.categoryName}</span>}
                        {coupon.brandName && <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-bold uppercase">{coupon.brandName}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors" onClick={() => setEditingVoucher(coupon)}>
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </button>
                    <button className="p-2 hover:bg-red-50 rounded-lg transition-colors" onClick={() => handleDelete(coupon.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Giảm giá:</span>
                    <span className="font-bold text-red-600">{formatPrice(coupon.discountAmount)}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Đơn tối thiểu:</span>
                    <span className="font-medium text-gray-900">{formatPrice(coupon.minOrderValue)}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Hạn sử dụng:</span>
                    <span className="font-medium text-gray-900 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(coupon.expiryDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Lượt sử dụng:</span>
                      <span className="font-bold text-gray-900">
                        {coupon.usedCount || 0}/{coupon.usageLimit > 0 ? coupon.usageLimit : '∞'}
                      </span>
                    </div>
                    {coupon.usageLimit > 0 && (
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: `${Math.min(((coupon.usedCount || 0) / coupon.usageLimit) * 100, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Voucher Modal */}
      {(showAddModal || editingVoucher) && (
        <VoucherFormModal
          voucher={editingVoucher}
          onClose={() => {
            setShowAddModal(false);
            setEditingVoucher(null);
          }}
          onSuccess={() => {
            setShowAddModal(false);
            setEditingVoucher(null);
            fetchVouchers();
          }}
        />
      )}
    </div>
  );
}

function VoucherFormModal({ voucher, onClose, onSuccess }: { voucher?: Voucher | null, onClose: () => void, onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  const [formData, setFormData] = useState<Partial<Voucher>>(voucher || {
    code: "",
    discountAmount: 0,
    minOrderValue: 0,
    usageLimit: 0,
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    categoryId: undefined,
    brandId: undefined
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
      if (voucher) {
        await voucherService.updateVoucherAdmin(voucher.id, formData);
      } else {
        await voucherService.createVoucherAdmin(formData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Thao tác thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <form onSubmit={handleSubmit}>
          <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between">
            <h3 className="text-xl font-black text-gray-900">{voucher ? "Cập nhật Voucher" : "Tạo Voucher mới"}</h3>
            <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Mã Voucher *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 font-mono font-bold text-gray-900 uppercase"
                  placeholder="VOUCHER2024"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Mức giảm (VNĐ) *</label>
                <input
                  type="number"
                  required
                  value={formData.discountAmount}
                  onChange={e => setFormData({...formData, discountAmount: Number(e.target.value)})}
                  className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 font-bold text-red-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Đơn tối thiểu *</label>
                <input
                  type="number"
                  required
                  value={formData.minOrderValue}
                  onChange={e => setFormData({...formData, minOrderValue: Number(e.target.value)})}
                  className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 font-bold text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Giới hạn sử dụng *</label>
                <input
                  type="number"
                  required
                  value={formData.usageLimit}
                  onChange={e => setFormData({...formData, usageLimit: Number(e.target.value)})}
                  className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 font-bold text-gray-900"
                  placeholder="0 = không giới hạn"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Ngày hết hạn *</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  required
                  value={formData.expiryDate?.split('T')[0]}
                  onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                  className="w-full pl-12 pr-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 font-bold text-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Áp dụng Danh mục</label>
                <select
                  value={formData.categoryId || ""}
                  onChange={e => setFormData({...formData, categoryId: e.target.value ? Number(e.target.value) : undefined})}
                  className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 font-bold text-gray-900 appearance-none"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Áp dụng Thương hiệu</label>
                <select
                  value={formData.brandId || ""}
                  onChange={e => setFormData({...formData, brandId: e.target.value ? Number(e.target.value) : undefined})}
                  className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 font-bold text-gray-900 appearance-none"
                >
                  <option value="">Tất cả thương hiệu</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-gray-50 px-8 py-6 flex items-center justify-end gap-3 border-t border-gray-100">
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
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-lg shadow-blue-200 disabled:opacity-50 font-black uppercase tracking-widest text-sm"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {voucher ? "Cập nhật" : "Tạo Voucher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
