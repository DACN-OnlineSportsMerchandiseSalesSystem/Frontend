import { useState } from "react";
import { Link } from "react-router";
import { ChevronRight, RotateCcw, Upload, Package, CheckCircle, AlertTriangle } from "lucide-react";
import { useApp } from "../context/AppContext";
import { formatPrice } from "../data/products";

const returnReasons = [
  "Sản phẩm bị lỗi / hỏng hóc",
  "Sản phẩm không đúng mô tả",
  "Nhận sai sản phẩm / sai màu / sai size",
  "Kích cỡ không phù hợp",
  "Sản phẩm không như mong đợi",
  "Lý do khác",
];

export function Returns() {
  const { orders, requestReturn } = useApp();
  const [step, setStep] = useState<"form" | "success">("form");
  const [orderId, setOrderId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [returnType, setReturnType] = useState<"exchange" | "refund">("exchange");

  const deliveredOrders = orders.filter((o) => o.status === "delivered");

  const handleFindOrder = () => {
    const order = deliveredOrders.find((o) => o.id === orderId.trim());
    setSelectedOrder(order || null);
  };

  const toggleItem = (productId: string) => {
    setSelectedItems((prev) => prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]);
  };

  const handleSubmit = () => {
    if (selectedOrder && reason) {
      requestReturn(selectedOrder.id, reason);
      setStep("success");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
        <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-800">Đổi trả hàng</span>
      </div>

      <h1 className="text-gray-900 mb-2">Yêu cầu đổi trả hàng</h1>
      <p className="text-gray-500 text-sm mb-6">SportZone hỗ trợ đổi trả miễn phí trong vòng 30 ngày kể từ ngày nhận hàng</p>

      {step === "success" ? (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-green-700 mb-2">Yêu cầu đổi trả đã được ghi nhận!</h2>
          <p className="text-gray-600 text-sm mb-2">Mã đơn: <strong className="text-blue-700">{selectedOrder?.id}</strong></p>
          <p className="text-gray-500 text-sm mb-6">Nhân viên SportZone sẽ liên hệ với bạn trong vòng 24 giờ để hướng dẫn quy trình đổi trả</p>
          <div className="bg-blue-50 rounded-xl p-4 text-left mb-6">
            <p className="text-sm text-blue-700 mb-2">📋 Bước tiếp theo:</p>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Nhân viên xác nhận yêu cầu và hướng dẫn đóng gói</li>
              <li>Gửi hàng về kho SportZone (phí ship do chúng tôi chi trả)</li>
              <li>Kiểm tra hàng trong 1-2 ngày làm việc</li>
              <li>Gửi hàng mới hoặc hoàn tiền trong 3-5 ngày làm việc</li>
            </ol>
          </div>
          <div className="flex gap-3">
            <Link to="/track-order" className="flex-1 py-3 border border-blue-200 text-blue-600 rounded-xl text-sm hover:bg-blue-50 transition-colors text-center">
              Theo dõi đơn hàng
            </Link>
            <Link to="/products" className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors text-center">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Policy notice */}
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex gap-3">
            <RotateCcw className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Chính sách đổi trả của SportZone</p>
              <ul className="space-y-0.5 text-blue-600">
                <li>✓ Đổi trả trong 30 ngày kể từ ngày nhận hàng</li>
                <li>✓ Miễn phí vận chuyển đổi trả</li>
                <li>✓ Hoàn tiền trong 3-5 ngày làm việc</li>
                <li>✓ Sản phẩm cần còn nguyên tem, chưa qua sử dụng</li>
              </ul>
            </div>
          </div>

          {/* Find order */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 className="text-gray-800 mb-4">Tìm đơn hàng cần đổi trả</h3>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFindOrder()}
                placeholder="Nhập mã đơn hàng đã giao"
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 text-sm"
              />
              <button onClick={handleFindOrder} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors">
                Tìm kiếm
              </button>
            </div>

            {/* Quick select from delivered orders */}
            {deliveredOrders.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Hoặc chọn từ đơn hàng đã giao:</p>
                <div className="space-y-2">
                  {deliveredOrders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => { setOrderId(order.id); setSelectedOrder(order); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                        selectedOrder?.id === order.id ? "border-blue-400 bg-blue-50" : "border-gray-100 hover:bg-gray-50"
                      }`}
                    >
                      <Package className="w-8 h-8 text-blue-300 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800">#{order.id}</p>
                        <p className="text-xs text-gray-500">{order.orderDate} · {formatPrice(order.total)}</p>
                      </div>
                      {selectedOrder?.id === order.id && <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {orderId && !selectedOrder && (
              <div className="flex items-center gap-2 text-yellow-600 text-sm mt-3 bg-yellow-50 p-3 rounded-xl">
                <AlertTriangle className="w-4 h-4" />
                Không tìm thấy đơn hàng hoặc đơn hàng chưa được giao
              </div>
            )}
          </div>

          {/* Select items */}
          {selectedOrder && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="text-gray-800 mb-4">Chọn sản phẩm cần đổi trả</h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item: any) => (
                  <label key={item.productId} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedItems.includes(item.productId) ? "border-blue-400 bg-blue-50" : "border-gray-100 hover:bg-gray-50"
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.productId)}
                      onChange={() => toggleItem(item.productId)}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-xl" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">Size: {item.size} · {item.color} · x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-blue-700 flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Return type & reason */}
          {selectedItems.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="text-gray-800 mb-4">Loại yêu cầu & Lý do</h3>

              <div className="flex gap-3 mb-5">
                {[
                  { key: "exchange", label: "🔄 Đổi sản phẩm", desc: "Nhận sản phẩm khác thay thế" },
                  { key: "refund", label: "💰 Hoàn tiền", desc: "Nhận lại tiền đã thanh toán" },
                ].map((type) => (
                  <label
                    key={type.key}
                    className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      returnType === type.key ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input type="radio" name="returnType" value={type.key} checked={returnType === type.key} onChange={() => setReturnType(type.key as any)} className="hidden" />
                    <p className="text-sm font-medium text-gray-800">{type.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{type.desc}</p>
                  </label>
                ))}
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Lý do đổi trả <span className="text-red-500">*</span></p>
                <div className="space-y-2">
                  {returnReasons.map((r) => (
                    <label key={r} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      reason === r ? "border-blue-400 bg-blue-50" : "border-gray-100 hover:bg-gray-50"
                    }`}>
                      <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="accent-blue-600" />
                      <span className="text-sm text-gray-700">{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Mô tả chi tiết (tùy chọn)</p>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả chi tiết vấn đề của sản phẩm..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 text-sm resize-none"
                />
              </div>

              {/* Image upload placeholder */}
              <div className="mb-5">
                <p className="text-sm text-gray-600 mb-2">Hình ảnh sản phẩm (tùy chọn)</p>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors cursor-pointer">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Tải lên hình ảnh sản phẩm lỗi</p>
                  <p className="text-xs text-gray-400">PNG, JPG tối đa 5MB mỗi ảnh</p>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!reason}
                className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 disabled:bg-gray-300 text-white rounded-xl text-sm transition-colors font-medium flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Gửi yêu cầu đổi trả
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
