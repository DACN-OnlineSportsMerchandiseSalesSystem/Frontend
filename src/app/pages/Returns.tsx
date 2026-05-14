import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ChevronRight, RotateCcw, Upload, Package, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { formatPrice } from "../data/products";
import { returnService } from "../../services/policyService";

const returnReasons = [
  "Sản phẩm bị lỗi / hỏng hóc",
  "Sản phẩm không đúng mô tả",
  "Nhận sai sản phẩm / sai màu / sai size",
  "Kích cỡ không phù hợp",
  "Sản phẩm không như mong đợi",
  "Lý do khác",
];

export function Returns() {
  const { orders, refreshOrders, isLoggedIn } = useApp();
  const [step, setStep] = useState<"form" | "success">("form");
  const [orderId, setOrderId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [returnType, setReturnType] = useState<"exchange" | "refund">("exchange");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isLoggedIn) refreshOrders();
  }, [isLoggedIn]);

  const deliveredOrders = orders.filter((o) => o.status === "delivered");

  const handleFindOrder = () => {
    const order = deliveredOrders.find((o) => o.id === orderId.trim());
    if (order) {
        setSelectedOrder(order);
    } else {
        setSelectedOrder(null);
    }
  };

  const toggleItem = (item: any) => {
    const isSelected = selectedItems.find(i => i.productVariantId === item.productVariantId);
    if (isSelected) {
        setSelectedItems(prev => prev.filter(i => i.productVariantId !== item.productVariantId));
    } else {
        setSelectedItems(prev => [...prev, { ...item, quantity: item.quantity }]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedOrder || !reason || selectedItems.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        orderId: parseInt(selectedOrder.id),
        reason: reason,
        note: description,
        returnType: returnType,
        items: selectedItems.map(item => ({
          productVariantId: item.productVariantId || 0, // Fallback if missing
          quantity: item.quantity
        }))
      };
      
      await returnService.createReturn(payload);
      setStep("success");
    } catch (err) {
      console.error("Failed to submit return request", err);
      alert("Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
        <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-800">Đổi trả hàng</span>
      </div>

      <h1 className="text-gray-900 mb-2">Yêu cầu đổi trả hàng</h1>
      <p className="text-gray-500 text-sm mb-6">SportZone hỗ trợ đổi trả miễn phí trong vòng 30 ngày kể từ ngày nhận hàng</p>

      {step === "success" ? (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-green-700 mb-2">Yêu cầu đổi trả đã được ghi nhận!</h2>
          <p className="text-gray-600 text-sm mb-2">Mã đơn: <strong className="text-blue-700">#{selectedOrder?.id}</strong></p>
          <p className="text-gray-500 text-sm mb-6">Nhân viên SportZone sẽ liên hệ với bạn trong vòng 24 giờ để hướng dẫn quy trình tiếp theo</p>
          <div className="bg-blue-50 rounded-xl p-4 text-left mb-6">
            <p className="text-sm text-blue-700 mb-2 font-bold">📋 Quy trình xử lý:</p>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Nhân viên gọi điện xác nhận trong 24h</li>
              <li>Bạn đóng gói sản phẩm và gửi về kho</li>
              <li>Chúng tôi kiểm tra tình trạng hàng (1-2 ngày)</li>
              <li>Gửi hàng đổi hoặc hoàn tiền (3-5 ngày)</li>
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
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex gap-3">
            <RotateCcw className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1 text-blue-800">Chính sách đổi trả của SportZone</p>
              <ul className="space-y-0.5 text-blue-600">
                <li>✓ Đổi trả trong 30 ngày kể từ ngày nhận hàng</li>
                <li>✓ Miễn phí vận chuyển đổi trả toàn quốc</li>
                <li>✓ Hoàn tiền nhanh chóng trong 3-5 ngày làm việc</li>
                <li>✓ Sản phẩm cần còn nguyên tem, chưa qua sử dụng</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 className="text-gray-800 mb-4 font-bold">Tìm đơn hàng cần đổi trả</h3>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFindOrder()}
                placeholder="Nhập mã đơn hàng đã giao (vd: 8)"
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 text-sm"
              />
              <button onClick={handleFindOrder} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors font-medium">
                Tìm kiếm
              </button>
            </div>

            {deliveredOrders.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Đơn hàng đã giao gần đây:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {deliveredOrders.slice(0, 4).map((order) => (
                    <button
                      key={order.id}
                      onClick={() => { setOrderId(order.id); setSelectedOrder(order); }}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                        selectedOrder?.id === order.id ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-gray-100 hover:border-blue-200 hover:bg-blue-50/30"
                      }`}
                    >
                      <Package className={`w-6 h-6 flex-shrink-0 ${selectedOrder?.id === order.id ? "text-blue-600" : "text-gray-300"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800">#{order.id}</p>
                        <p className="text-[10px] text-gray-500 truncate">{order.orderDate} · {formatPrice(order.total)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {orderId && !selectedOrder && (
              <div className="flex items-center gap-2 text-yellow-600 text-sm mt-3 bg-yellow-50 p-3 rounded-xl border border-yellow-100 animate-in slide-in-from-top-1">
                <AlertTriangle className="w-4 h-4" />
                Không tìm thấy đơn hàng hoặc đơn hàng chưa ở trạng thái "Đã giao"
              </div>
            )}
          </div>

          {selectedOrder && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-gray-800 mb-4 font-bold">Chọn sản phẩm cần đổi trả</h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item: any) => (
                  <label key={item.productVariantId} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedItems.some(si => si.productVariantId === item.productVariantId) ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:bg-gray-50"
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedItems.some(si => si.productVariantId === item.productVariantId)}
                      onChange={() => toggleItem(item)}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-xl" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">Size: {item.size} · Màu: {item.color} · SL: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-blue-700 flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                  </label>
                ))}
              </div>
            </div>
          )}

          {selectedItems.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-gray-800 mb-4 font-bold">Loại yêu cầu & Lý do</h3>

              <div className="flex gap-3 mb-6">
                {[
                  { key: "exchange", label: "🔄 Đổi sản phẩm", desc: "Nhận sản phẩm khác thay thế" },
                  { key: "refund", label: "💰 Hoàn tiền", desc: "Nhận lại tiền qua ngân hàng/ví" },
                ].map((type) => (
                  <label
                    key={type.key}
                    className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      returnType === type.key ? "border-blue-500 bg-blue-50 shadow-sm" : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <input type="radio" name="returnType" value={type.key} checked={returnType === type.key} onChange={() => setReturnType(type.key as any)} className="hidden" />
                    <p className="text-sm font-bold text-gray-800">{type.label}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{type.desc}</p>
                  </label>
                ))}
              </div>

              <div className="mb-5">
                <p className="text-sm font-bold text-gray-700 mb-3">Lý do đổi trả <span className="text-red-500">*</span></p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {returnReasons.map((r) => (
                    <label key={r} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      reason === r ? "border-blue-400 bg-blue-50" : "border-gray-100 hover:bg-gray-50"
                    }`}>
                      <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="w-4 h-4 accent-blue-600" />
                      <span className="text-xs text-gray-700">{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <p className="text-sm font-bold text-gray-700 mb-2">Mô tả chi tiết (tùy chọn)</p>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Vui lòng mô tả rõ hơn về lỗi sản phẩm hoặc yêu cầu đổi size..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 text-sm resize-none transition-all"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!reason || isSubmitting}
                className="w-full py-4 bg-blue-700 hover:bg-blue-800 disabled:bg-gray-200 text-white rounded-xl text-sm transition-all font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <RotateCcw className="w-5 h-5" />}
                {isSubmitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu đổi trả ngay"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
