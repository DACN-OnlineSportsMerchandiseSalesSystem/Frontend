import { useState } from "react";
import { Plus, Edit2, Trash2, Tag, Calendar, PercentIcon, DollarSign, X, Copy, CheckCircle } from "lucide-react";
import { formatPrice } from "../../data/products";

interface Coupon {
  id: string;
  code: string;
  type: "percent" | "fixed" | "shipping";
  value: number;
  minOrder: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usageCount: number;
  status: "active" | "inactive" | "expired";
}

const mockCoupons: Coupon[] = [
  {
    id: "CP001",
    code: "SPORT10",
    type: "percent",
    value: 10,
    minOrder: 300000,
    maxDiscount: 80000,
    startDate: "01/04/2026",
    endDate: "30/04/2026",
    usageLimit: 1000,
    usageCount: 245,
    status: "active",
  },
  {
    id: "CP002",
    code: "SALE20",
    type: "percent",
    value: 20,
    minOrder: 1000000,
    maxDiscount: 200000,
    startDate: "01/04/2026",
    endDate: "30/04/2026",
    usageLimit: 500,
    usageCount: 89,
    status: "active",
  },
  {
    id: "CP003",
    code: "FREESHIP",
    type: "shipping",
    value: 0,
    minOrder: 0,
    startDate: "01/04/2026",
    endDate: "31/12/2026",
    usageLimit: 0,
    usageCount: 1234,
    status: "active",
  },
];

export function CouponsManagement() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-gray-900">Quản lý mã giảm giá</h2>
          <p className="text-sm text-gray-500 mt-1">Tạo và quản lý các chương trình khuyến mãi</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-200"
        >
          <Plus className="w-4 h-4" />
          Tạo mã mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Tổng mã giảm giá</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{mockCoupons.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Đang hoạt động</p>
          <p className="text-2xl font-black text-green-600 mt-1">
            {mockCoupons.filter(c => c.status === "active").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Tổng lượt sử dụng</p>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {mockCoupons.reduce((sum, c) => sum + c.usageCount, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-600">Sắp hết hạn</p>
          <p className="text-2xl font-black text-orange-600 mt-1">1</p>
        </div>
      </div>

      {/* Coupons List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {mockCoupons.map((coupon) => (
          <div key={coupon.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    coupon.type === "percent" ? "bg-blue-100" :
                    coupon.type === "fixed" ? "bg-green-100" :
                    "bg-purple-100"
                  }`}>
                    {coupon.type === "percent" ? (
                      <PercentIcon className={`w-6 h-6 ${
                        coupon.type === "percent" ? "text-blue-600" :
                        coupon.type === "fixed" ? "text-green-600" :
                        "text-purple-600"
                      }`} />
                    ) : coupon.type === "fixed" ? (
                      <DollarSign className="w-6 h-6 text-green-600" />
                    ) : (
                      <Tag className="w-6 h-6 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-black text-gray-900 font-mono tracking-wider">{coupon.code}</h4>
                      <button
                        onClick={() => handleCopyCode(coupon.code)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Sao chép mã"
                      >
                        {copiedCode === coupon.code ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        coupon.status === "active" ? "bg-green-100 text-green-700" :
                        coupon.status === "expired" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {coupon.status === "active" ? "Hoạt động" :
                         coupon.status === "expired" ? "Hết hạn" : "Tạm dừng"}
                      </span>
                      <span className="text-xs text-gray-500">#{coupon.id}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="p-2 hover:bg-yellow-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4 text-yellow-600" />
                  </button>
                  <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Giá trị:</span>
                  <span className="font-bold text-blue-600">
                    {coupon.type === "percent" ? `${coupon.value}%` :
                     coupon.type === "fixed" ? formatPrice(coupon.value) :
                     "Miễn phí ship"}
                    {coupon.maxDiscount && (
                      <span className="text-xs text-gray-500 ml-1">(max {formatPrice(coupon.maxDiscount)})</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Đơn tối thiểu:</span>
                  <span className="font-medium text-gray-900">{formatPrice(coupon.minOrder)}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Thời hạn:</span>
                  <span className="font-medium text-gray-900">{coupon.startDate} - {coupon.endDate}</span>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Lượt sử dụng:</span>
                    <span className="font-bold text-gray-900">
                      {coupon.usageCount}{coupon.usageLimit > 0 && `/${coupon.usageLimit}`}
                    </span>
                  </div>
                  {coupon.usageLimit > 0 && (
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${Math.min((coupon.usageCount / coupon.usageLimit) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Coupon Modal */}
      {showAddModal && <CouponFormModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

function CouponFormModal({ onClose }: { onClose: () => void }) {
  const [couponType, setCouponType] = useState<"percent" | "fixed" | "shipping">("percent");

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Tạo mã giảm giá mới</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Coupon Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã giảm giá <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: SPORT10, SALE20"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 uppercase font-mono"
              style={{ textTransform: "uppercase" }}
            />
          </div>

          {/* Coupon Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại giảm giá <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setCouponType("percent")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  couponType === "percent"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <PercentIcon className={`w-6 h-6 mx-auto mb-2 ${
                  couponType === "percent" ? "text-blue-600" : "text-gray-400"
                }`} />
                <p className={`text-sm font-medium ${
                  couponType === "percent" ? "text-blue-600" : "text-gray-600"
                }`}>
                  Phần trăm
                </p>
              </button>
              <button
                onClick={() => setCouponType("fixed")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  couponType === "fixed"
                    ? "border-green-600 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <DollarSign className={`w-6 h-6 mx-auto mb-2 ${
                  couponType === "fixed" ? "text-green-600" : "text-gray-400"
                }`} />
                <p className={`text-sm font-medium ${
                  couponType === "fixed" ? "text-green-600" : "text-gray-600"
                }`}>
                  Số tiền cố định
                </p>
              </button>
              <button
                onClick={() => setCouponType("shipping")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  couponType === "shipping"
                    ? "border-purple-600 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Tag className={`w-6 h-6 mx-auto mb-2 ${
                  couponType === "shipping" ? "text-purple-600" : "text-gray-400"
                }`} />
                <p className={`text-sm font-medium ${
                  couponType === "shipping" ? "text-purple-600" : "text-gray-600"
                }`}>
                  Miễn phí ship
                </p>
              </button>
            </div>
          </div>

          {/* Value & Min Order */}
          <div className="grid grid-cols-2 gap-4">
            {couponType !== "shipping" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {couponType === "percent" ? "Giá trị (%)" : "Số tiền giảm"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder={couponType === "percent" ? "10" : "50000"}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đơn hàng tối thiểu</label>
              <input
                type="number"
                placeholder="0"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Usage Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giới hạn sử dụng</label>
            <input
              type="number"
              placeholder="0 = không giới hạn"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Hủy
          </button>
          <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
            Tạo mã giảm giá
          </button>
        </div>
      </div>
    </div>
  );
}
