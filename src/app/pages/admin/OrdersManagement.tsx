import { useState, useEffect, useCallback } from "react";
import { Search, Eye, Edit2, Printer, Download, CheckCircle, XCircle, Clock, Package, Truck, X, Loader2, AlertCircle } from "lucide-react";
import { formatPrice } from "../../data/products";
import orderService from "../../../services/orderService";
import { Order, useApp } from "../../context/AppContext";

const statusConfig = {
  pending: { label: "Chờ xử lý", color: "yellow", icon: Clock, next: "confirmed" },
  confirmed: { label: "Đã xác nhận", color: "blue", icon: CheckCircle, next: "shipping" },
  shipping: { label: "Đang giao", color: "purple", icon: Truck, next: "delivered" },
  delivered: { label: "Đã giao", color: "green", icon: CheckCircle, next: null },
  canceled: { label: "Đã hủy", color: "red", icon: XCircle, next: null },
  return_requested: { label: "Yêu cầu trả", color: "orange", icon: Package, next: "returned" },
  returned: { label: "Đã trả", color: "gray", icon: Package, next: null },
};

export function OrdersManagement() {
  const { mapApiOrderToUI } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [sortBy, setSortBy] = useState("id_desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const apiOrders = await orderService.getAllOrdersAdmin();
      console.log(">>> [ADMIN] Fetched orders:", apiOrders);
      const mappedOrders: Order[] = apiOrders.map(mapApiOrderToUI)
        .sort((a, b) => parseInt(b.id) - parseInt(a.id));
      setOrders(mappedOrders);
    } catch (err: any) {
      console.error(">>> [ADMIN] Fetch orders error:", err);
      setError(err?.response?.data?.message || "Không thể tải danh sách đơn hàng");
    } finally {
      setIsLoading(false);
    }
  }, [mapApiOrderToUI]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await orderService.updateOrderStatus(parseInt(id), newStatus.toUpperCase());
      await fetchOrders();
      if (selectedOrder && selectedOrder.id === id) {
        setShowDetailModal(false); // Close modal to refresh data on next open
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Cập nhật trạng thái thất bại");
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       order.address.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       order.address.phone.includes(searchQuery);
    const matchStatus = filterStatus === "all" || order.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case "id_desc":
        return b.id.localeCompare(a.id);
      case "id_asc":
        return a.id.localeCompare(b.id);
      case "total_asc":
        return a.total - b.total;
      case "total_desc":
        return b.total - a.total;
      default:
        return 0;
    }
  });

  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    confirmed: orders.filter(o => o.status === "confirmed").length,
    shipping: orders.filter(o => o.status === "shipping").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    canceled: orders.filter(o => o.status === "canceled").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Quản lý đơn hàng</h2>
          <p className="text-sm text-gray-500 mt-1">Theo dõi và xử lý đơn hàng của khách</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { key: "all", label: "Tất cả" },
            { key: "pending", label: "Chờ xử lý" },
            { key: "confirmed", label: "Đã xác nhận" },
            { key: "shipping", label: "Đang giao" },
            { key: "delivered", label: "Đã giao" },
            { key: "canceled", label: "Đã hủy" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setFilterStatus(tab.key);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filterStatus === tab.key
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label} ({statusCounts[tab.key as keyof typeof statusCounts] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Search & Sort */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm kiếm theo mã đơn, tên khách hàng, số điện thoại..."
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white"
          >
            <option value="id_desc">Mới nhất</option>
            <option value="id_asc">Cũ nhất</option>
            <option value="total_asc">Tổng tiền: Thấp đến Cao</option>
            <option value="total_desc">Tổng tiền: Cao đến Thấp</option>
          </select>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-sm text-gray-600">Tìm thấy {filteredOrders.length} đơn hàng</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500">Đang tải danh sách đơn hàng...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã đơn</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày đặt</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedOrders.map((order) => {
                  const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
                  const StatusIcon = config.icon;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-mono font-medium text-blue-600">#{order.id}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{order.orderDate}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-800">{order.address.fullName}</p>
                        <p className="text-xs text-gray-500">{order.address.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-600">{order.items.length} sản phẩm</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</p>
                        <p className="text-xs text-gray-500">{order.paymentMethod}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-700`}>
                          <StatusIcon className="w-3 h-3" />
                          {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDetailModal(true);
                            }}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                          </button>
                          {config.next && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, config.next!)}
                              className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                              title={`Chuyển sang ${statusConfig[config.next as keyof typeof statusConfig].label}`}
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </button>
                          )}
                          {order.status === "pending" && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, "canceled")}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hủy đơn"
                            >
                              <XCircle className="w-4 h-4 text-red-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && !error && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-6 py-4 border border-gray-100 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Hiển thị</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-500">đơn hàng trên mỗi trang</span>
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
                    {prev && page - prev > 1 && <span className="px-1 text-gray-400">...</span>}
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

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedOrder(null);
          }}
          onStatusUpdate={handleUpdateStatus}
        />
      )}
    </div>
  );
}

function OrderDetailModal({ order, onClose, onStatusUpdate }: { order: Order; onClose: () => void; onStatusUpdate: (id: string, status: string) => void }) {
  const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Chi tiết đơn hàng #{order.id}</h3>
            <p className="text-sm text-gray-500 mt-1">Ngày đặt: {order.orderDate}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status & Actions */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm text-gray-600 mb-1">Trạng thái đơn hàng</p>
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-${config.color}-100 text-${config.color}-700`}>
                <StatusIcon className="w-4 h-4" />
                {config.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {config.next && (
                <button 
                  onClick={() => onStatusUpdate(order.id, config.next!)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors text-sm"
                >
                  Chuyển sang {statusConfig[config.next as keyof typeof statusConfig].label}
                </button>
              )}
              {order.status === "pending" && (
                <button 
                  onClick={() => onStatusUpdate(order.id, "canceled")}
                  className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm"
                >
                  Hủy đơn
                </button>
              )}
              <button className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors text-sm">
                <Printer className="w-4 h-4 inline mr-2" />
                In đơn
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Thông tin khách hàng</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Họ tên:</span>
                  <span className="font-medium text-gray-900">{order.address.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số điện thoại:</span>
                  <span className="font-medium text-gray-900">{order.address.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Địa chỉ:</span>
                  <span className="font-medium text-gray-900 text-right">
                    {order.address.street}, {order.address.ward}, {order.address.district}, {order.address.province}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Thông tin đơn hàng</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phương thức thanh toán:</span>
                  <span className="font-medium text-gray-900">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ghi chú:</span>
                  <span className="font-medium text-gray-900">{order.note || "Không có"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <h4 className="text-sm font-bold text-gray-900 mb-3">Sản phẩm ({order.items.length})</h4>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-gray-200">Size: {item.size}</span>
                      <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-gray-200">Màu: {item.color}</span>
                      <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-gray-200">x{item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600">{formatPrice(item.price * item.quantity)}</p>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <p className="text-xs text-gray-400 line-through">{formatPrice(item.originalPrice * item.quantity)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          {(() => {
            const originalSubtotal = order.items.reduce((sum: number, item: any) =>
              sum + (item.originalPrice ?? item.price) * item.quantity, 0);
            const productDiscount = originalSubtotal - order.items.reduce((sum: number, item: any) =>
              sum + item.price * item.quantity, 0);
            const voucherDiscount = (order as any).voucherDiscount || 0;
            const voucherCode = (order as any).voucherCode;
            return (
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Tổng kết đơn hàng</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính (Giá gốc):</span>
                    <span>{formatPrice(originalSubtotal)}</span>
                  </div>
                  {productDiscount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Khuyến mãi giảm giá sản phẩm:</span>
                      <span>-{formatPrice(productDiscount)}</span>
                    </div>
                  )}
                  {(voucherDiscount > 0 || voucherCode) && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Mã giảm giá {voucherCode ? `(${voucherCode})` : ""}:</span>
                      <span>-{formatPrice(voucherDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển:</span>
                    <span>{formatPrice(order.shippingFee)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                    <span className="font-bold text-gray-900">Tổng cộng:</span>
                    <span className="text-lg font-black text-blue-600">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Tracking History */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <h4 className="text-sm font-bold text-gray-900 mb-4">Lịch sử vận chuyển</h4>
            <div className="space-y-4">
              {order.trackingHistory?.map((event, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      event.done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {event.done ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    {idx < (order.trackingHistory?.length || 0) - 1 && (
                      <div className={`w-0.5 h-full mt-2 ${event.done ? 'bg-green-200' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className={`text-sm font-medium ${event.done ? 'text-gray-900' : 'text-gray-400'}`}>
                      {event.status}
                    </p>
                    <p className={`text-xs ${event.done ? 'text-gray-600' : 'text-gray-400'} mt-0.5`}>
                      {event.description}
                    </p>
                    {event.time && (
                      <p className="text-xs text-gray-400 mt-1">{event.time}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
