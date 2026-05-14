import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import { Search, Package, CheckCircle, Truck, XCircle, Clock, ChevronRight, AlertTriangle, RotateCcw } from "lucide-react";
import { useApp } from "../context/AppContext";
import { formatPrice } from "../data/products";

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending: { label: "Chờ xác nhận", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", icon: <Clock className="w-4 h-4 text-yellow-600" /> },
  confirmed: { label: "Đã xác nhận", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: <CheckCircle className="w-4 h-4 text-blue-600" /> },
  shipping: { label: "Đang giao hàng", color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200", icon: <Truck className="w-4 h-4 text-indigo-600" /> },
  delivered: { label: "Đã giao hàng", color: "text-green-700", bg: "bg-green-50 border-green-200", icon: <CheckCircle className="w-4 h-4 text-green-600" /> },
  canceled: { label: "Đã hủy", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: <XCircle className="w-4 h-4 text-red-600" /> },
  return_requested: { label: "Yêu cầu đổi trả", color: "text-orange-700", bg: "bg-orange-50 border-orange-200", icon: <RotateCcw className="w-4 h-4 text-orange-600" /> },
  returned: { label: "Đã hoàn hàng", color: "text-gray-700", bg: "bg-gray-50 border-gray-200", icon: <RotateCcw className="w-4 h-4 text-gray-500" /> },
};

export function OrderTracking() {
  const [searchParams] = useSearchParams();
  const { orders, isLoggedIn, refreshOrders, cancelOrder, requestReturn, mapApiOrderToUI } = useApp();
  
  useEffect(() => {
    if (isLoggedIn) {
      refreshOrders();
    }
  }, [isLoggedIn, refreshOrders]);

  const [searchId, setSearchId] = useState(searchParams.get("id") || "");
  const [foundOrder, setFoundOrder] = useState<any>(() => {
    const id = searchParams.get("id");
    return id ? orders.find((o) => o.id === id) : null;
  });
  const [cancelModal, setCancelModal] = useState(false);
  const [returnModal, setReturnModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setIsSearching(true);

    // 1. Thử tìm trong danh sách cục bộ trước
    const localOrder = orders.find((o) => o.id === searchId.trim() || o.orderCode === searchId.trim());
    if (localOrder) {
      setFoundOrder(localOrder);
      setIsSearching(false);
      return;
    }

    // 2. Nếu không thấy, gọi API tra cứu trực tiếp
    try {
      const apiOrder = await orderService.getOrderById(parseInt(searchId.trim()));
      if (apiOrder) {
        setFoundOrder(mapApiOrderToUI(apiOrder));
      } else {
        setFoundOrder(null);
      }
    } catch (err) {
      console.error("Lỗi tra cứu đơn hàng:", err);
      setFoundOrder(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCancel = async () => {
    if (foundOrder && cancelReason) {
      await cancelOrder(foundOrder.id, cancelReason);
      setCancelModal(false);
      setCancelReason("");
      // Refresh local view
      const updated = orders.find((o) => o.id === foundOrder.id);
      if (updated) setFoundOrder(updated);
      else handleSearch(); // Re-search if not in local list
    }
  };

  const handleReturn = async () => {
    if (foundOrder && returnReason) {
      await requestReturn(foundOrder.id, returnReason);
      setReturnModal(false);
      setReturnReason("");
      // Refresh local view
      const updated = orders.find((o) => o.id === foundOrder.id);
      if (updated) setFoundOrder(updated);
      else handleSearch();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
        <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-800">Theo dõi đơn hàng</span>
      </div>

      <h1 className="text-gray-900 mb-2">Theo dõi đơn hàng</h1>
      <p className="text-gray-500 text-sm mb-6">Nhập mã đơn hàng để kiểm tra trạng thái giao hàng</p>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Nhập mã đơn hàng (vd: SZ20260315001)"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 text-sm"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl flex items-center gap-2 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Tra cứu</span>
          </button>
        </div>
      </div>

      {foundOrder === null && searchId && (
        <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
          <AlertTriangle className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
          <p className="text-gray-600">Không tìm thấy đơn hàng với mã <strong>{searchId}</strong></p>
          <p className="text-gray-400 text-sm mt-1">Kiểm tra lại mã đơn hàng và thử lại</p>
        </div>
      )}

      {foundOrder && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-start justify-between gap-4 mb-4">
              <button 
                onClick={() => setFoundOrder(null)}
                className="text-blue-600 text-sm hover:underline flex items-center gap-1"
              >
                ← Quay lại danh sách
              </button>
              <span className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border ${statusConfig[foundOrder.status]?.bg} ${statusConfig[foundOrder.status]?.color}`}>
                {statusConfig[foundOrder.status]?.icon}
                {statusConfig[foundOrder.status]?.label}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Mã đơn hàng</p>
                <p className="font-bold text-gray-800">#{foundOrder.id}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-gray-500 text-xs mb-1">Ngày đặt</p>
                <p className="text-gray-800">{foundOrder.orderDate}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-gray-500 text-xs mb-1">Tổng tiền</p>
                <p className="text-blue-700 font-bold">{formatPrice(foundOrder.total)}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-gray-500 text-xs mb-1">Thanh toán</p>
                <p className="text-gray-800">{foundOrder.paymentMethod}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 className="text-gray-800 mb-5">Lịch trình đơn hàng</h3>
            <div className="space-y-0">
              {foundOrder.trackingHistory?.map((event: any, i: number) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${event.done ? "bg-blue-600" : "bg-gray-200"}`}>
                      {event.done ? <CheckCircle className="w-4 h-4 text-white" /> : <div className="w-2 h-2 rounded-full bg-gray-400" />}
                    </div>
                    {i < foundOrder.trackingHistory.length - 1 && (
                      <div className={`w-0.5 h-8 mt-1 ${event.done ? "bg-blue-200" : "bg-gray-200"}`} />
                    )}
                  </div>
                  <div className="pb-6 flex-1">
                    <p className={`text-sm font-medium ${event.done ? "text-gray-800" : "text-gray-400"}`}>{event.status}</p>
                    <p className={`text-xs mt-0.5 ${event.done ? "text-gray-500" : "text-gray-300"}`}>{event.description}</p>
                    {event.time && <p className="text-xs text-gray-400 mt-1">{event.time}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 className="text-gray-800 mb-4">Sản phẩm đã đặt</h3>
            <div className="space-y-3">
              {foundOrder.items?.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-xl" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">Size: {item.size} · Màu: {item.color} · x{item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-blue-700 flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span>{formatPrice(foundOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span>{foundOrder.shippingFee === 0 ? "Miễn phí" : formatPrice(foundOrder.shippingFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-50 mt-2">
                <span>Tổng cộng</span>
                <span className="text-blue-700 text-lg">{formatPrice(foundOrder.total)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 className="text-gray-800 mb-3">Địa chỉ nhận hàng</h3>
            <p className="text-sm font-medium text-gray-800">{foundOrder.address?.fullName} · {foundOrder.address?.phone}</p>
            <p className="text-sm text-gray-600">
              {foundOrder.address?.street}
              {foundOrder.address?.ward ? `, ${foundOrder.address.ward}` : ""}
              {foundOrder.address?.district ? `, ${foundOrder.address.district}` : ""}
              {foundOrder.address?.province ? `, ${foundOrder.address.province}` : ""}
            </p>
          </div>
          {(foundOrder.status === "pending" || foundOrder.status === "confirmed") && (
            <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-100">
              <p className="text-sm text-yellow-700 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Bạn muốn hủy đơn hàng này?
              </p>
              <button
                onClick={() => setCancelModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Hủy đơn hàng
              </button>
            </div>
          )}

          {foundOrder.status === "delivered" && (
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
              <p className="text-sm text-blue-700 mb-3 flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Bạn muốn đổi trả sản phẩm?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setReturnModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Yêu cầu đổi trả
                </button>
                <Link to="/returns" className="flex items-center gap-2 px-5 py-2.5 border border-blue-200 text-blue-600 rounded-xl text-sm hover:bg-blue-50 transition-colors">
                  Xem chính sách đổi trả
                </Link>
              </div>
            </div>
          )}

          {foundOrder.status === "canceled" && (
            <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
              <p className="text-sm text-red-700">❌ Đơn hàng đã bị hủy</p>
              {(foundOrder as any).cancelReason && <p className="text-xs text-red-500 mt-1">Lý do: {(foundOrder as any).cancelReason}</p>}
            </div>
          )}

          {foundOrder.status === "return_requested" && (
            <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
              <p className="text-sm text-orange-700">🔄 Yêu cầu đổi trả đang được xử lý</p>
              {(foundOrder as any).returnReason && <p className="text-xs text-orange-500 mt-1">Lý do: {(foundOrder as any).returnReason}</p>}
            </div>
          )}
        </div>
      )}

      {/* Paginated Orders List */}
      {!foundOrder && orders.length > 0 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 className="text-gray-800 mb-4">Danh sách đơn hàng của bạn</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {paginatedOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => { setSearchId(order.id); setFoundOrder(order); window.scrollTo(0, 0); }}
                  className="flex flex-col gap-3 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      <span className="font-bold text-gray-800 text-sm">#{order.id}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusConfig[order.status]?.bg} ${statusConfig[order.status]?.color}`}>
                      {statusConfig[order.status]?.label}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">{order.orderDate}</p>
                    <p className="text-sm font-bold text-blue-700">{formatPrice(order.total)}</p>
                  </div>
                  <div className="flex items-center text-xs text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                    Chi tiết đơn hàng <ChevronRight className="w-3 h-3 ml-1" />
                  </div>
                </button>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-50">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4 rotate-180 text-gray-600" />
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === i + 1 
                        ? "bg-blue-600 text-white" 
                        : "text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-transparent"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {!foundOrder && orders.length === 0 && isLoggedIn && (
        <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-600">Bạn chưa có đơn hàng nào</p>
          <Link to="/products" className="text-blue-600 text-sm hover:underline mt-2 inline-block">Mua sắm ngay</Link>
        </div>
      )}

      {/* Cancel modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-gray-900 mb-2">Xác nhận hủy đơn hàng</h3>
            <p className="text-sm text-gray-500 mb-4">Vui lòng cho chúng tôi biết lý do hủy để cải thiện dịch vụ</p>
            <div className="space-y-2 mb-4">
              {["Tôi đặt nhầm sản phẩm", "Tôi muốn thay đổi địa chỉ giao hàng", "Tôi tìm được giá tốt hơn", "Lý do khác"].map((r) => (
                <label key={r} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="cancelReason" value={r} onChange={() => setCancelReason(r)} className="accent-blue-600" />
                  <span className="text-sm text-gray-700">{r}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCancelModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm">
                Hủy bỏ
              </button>
              <button onClick={handleCancel} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm transition-colors">
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return modal */}
      {returnModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-gray-900 mb-2">Yêu cầu đổi trả hàng</h3>
            <p className="text-sm text-gray-500 mb-4">Chọn lý do đổi trả. Chúng tôi sẽ liên hệ trong 24h</p>
            <div className="space-y-2 mb-4">
              {["Sản phẩm bị lỗi/hỏng", "Sản phẩm không đúng mô tả", "Kích cỡ không phù hợp", "Sản phẩm không như mong đợi", "Lý do khác"].map((r) => (
                <label key={r} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="returnReason" value={r} onChange={() => setReturnReason(r)} className="accent-blue-600" />
                  <span className="text-sm text-gray-700">{r}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setReturnModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm">
                Hủy bỏ
              </button>
              <button onClick={handleReturn} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm transition-colors">
                Gửi yêu cầu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
