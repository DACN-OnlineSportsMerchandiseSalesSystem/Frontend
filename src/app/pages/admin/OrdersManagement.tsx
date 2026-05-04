import { useState } from "react";
import { Search, Eye, Edit2, Printer, Download, CheckCircle, XCircle, Clock, Package, Truck, X } from "lucide-react";
import { formatPrice } from "../../data/products";
import { Order } from "../../context/AppContext";

const statusConfig = {
  pending: { label: "Chờ xử lý", color: "yellow", icon: Clock },
  confirmed: { label: "Đã xác nhận", color: "blue", icon: CheckCircle },
  shipping: { label: "Đang giao", color: "purple", icon: Truck },
  delivered: { label: "Đã giao", color: "green", icon: CheckCircle },
  cancelled: { label: "Đã hủy", color: "red", icon: XCircle },
  return_requested: { label: "Yêu cầu trả", color: "orange", icon: Package },
  returned: { label: "Đã trả", color: "gray", icon: Package },
};

export function OrdersManagement({ orders }: { orders: Order[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredOrders = orders.filter(order => {
    const matchSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       order.address.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       order.address.phone.includes(searchQuery);
    const matchStatus = filterStatus === "all" || order.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    confirmed: orders.filter(o => o.status === "confirmed").length,
    shipping: orders.filter(o => o.status === "shipping").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-gray-900">Quản lý đơn hàng</h2>
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
            { key: "cancelled", label: "Đã hủy" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filterStatus === tab.key
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label} ({statusCounts[tab.key as keyof typeof statusCounts]})
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo mã đơn, tên khách hàng, số điện thoại..."
            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
          />
        </div>
        <p className="text-sm text-gray-600 mt-3">Tìm thấy {filteredOrders.length} đơn hàng</p>
      </div>

      {/* Orders Table */}
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
              {filteredOrders.map((order) => {
                const config = statusConfig[order.status as keyof typeof statusConfig];
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
                        <button
                          className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                          title="In đơn hàng"
                        >
                          <Printer className="w-4 h-4 text-purple-600" />
                        </button>
                        {order.status === "pending" && (
                          <button
                            className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                            title="Xác nhận đơn"
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
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

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}

function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const config = statusConfig[order.status as keyof typeof statusConfig];
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
              {order.status === "pending" && (
                <>
                  <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors text-sm">
                    Xác nhận đơn
                  </button>
                  <button className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm">
                    Hủy đơn
                  </button>
                </>
              )}
              {order.status === "confirmed" && (
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors text-sm">
                  Chuyển sang giao hàng
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
                    <p className="text-xs text-gray-500">{item.brand}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-gray-200">
                        Size: {item.size}
                      </span>
                      <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-gray-200">
                        Màu: {item.color}
                      </span>
                      <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-gray-200">
                        x{item.quantity}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600">{formatPrice(item.price * item.quantity)}</p>
                    <p className="text-xs text-gray-500">{formatPrice(item.price)} × {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-bold text-gray-900 mb-3">Tổng kết đơn hàng</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính:</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
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

          {/* Tracking History */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <h4 className="text-sm font-bold text-gray-900 mb-4">Lịch sử vận chuyển</h4>
            <div className="space-y-4">
              {order.trackingHistory.map((event, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      event.done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {event.done ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    {idx < order.trackingHistory.length - 1 && (
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
