import { TrendingUp, ShoppingCart, Package, CheckCircle, Plus, Tag, FileText, Users, DollarSign, ArrowUp, ArrowDown } from "lucide-react";
import { formatPrice } from "../../data/products";
import { Order } from "../../context/AppContext";

interface DashboardProps {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
  };
  orders: Order[];
  products: any[];
}

export function AdminDashboard({ stats, orders, products }: DashboardProps) {
  // Calculate additional stats
  const revenueChange = 12; // Mock data
  const ordersChange = -3;
  const customersCount = 156; // Mock
  const customersChange = 8;

  const recentOrders = orders.slice(0, 5);
  const topProducts = products.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Tổng quan hệ thống</h2>
          <p className="text-sm text-gray-500 mt-1">Thống kê tổng quan về hoạt động kinh doanh</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400">
            <option>7 ngày qua</option>
            <option>30 ngày qua</option>
            <option>Tháng này</option>
            <option>Năm nay</option>
          </select>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg shadow-green-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              revenueChange >= 0 ? 'bg-white/20' : 'bg-red-500/30'
            }`}>
              {revenueChange >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {Math.abs(revenueChange)}%
            </div>
          </div>
          <p className="text-white/80 text-sm mb-1">Doanh thu</p>
          <p className="text-2xl font-black">{formatPrice(stats.totalRevenue)}</p>
          <p className="text-xs text-white/70 mt-2">+{formatPrice(stats.totalRevenue * 0.12)} so với tháng trước</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              ordersChange >= 0 ? 'bg-white/20' : 'bg-red-500/30'
            }`}>
              {ordersChange >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {Math.abs(ordersChange)}%
            </div>
          </div>
          <p className="text-white/80 text-sm mb-1">Đơn hàng</p>
          <p className="text-2xl font-black">{stats.totalOrders}</p>
          <p className="text-xs text-white/70 mt-2">{stats.pendingOrders} đang chờ xử lý</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-purple-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
              <Users className="w-6 h-6" />
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              customersChange >= 0 ? 'bg-white/20' : 'bg-red-500/30'
            }`}>
              {customersChange >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {Math.abs(customersChange)}%
            </div>
          </div>
          <p className="text-white/80 text-sm mb-1">Khách hàng</p>
          <p className="text-2xl font-black">{customersCount}</p>
          <p className="text-xs text-white/70 mt-2">+12 khách hàng mới</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-5 text-white shadow-lg shadow-yellow-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
              <Package className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-white/20">
              <CheckCircle className="w-3 h-3" />
              Hoạt động
            </div>
          </div>
          <p className="text-white/80 text-sm mb-1">Sản phẩm</p>
          <p className="text-2xl font-black">{products.length}</p>
          <p className="text-xs text-white/70 mt-2">Đang kinh doanh</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800">Đơn hàng gần đây</h3>
            <button className="text-sm text-blue-600 hover:text-blue-800">Xem tất cả</button>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">#{order.id}</p>
                  <p className="text-xs text-gray-500">{order.address.fullName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</p>
                  <p className="text-xs text-gray-500">{order.orderDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800">Sản phẩm bán chạy</h3>
            <button className="text-sm text-blue-600 hover:text-blue-800">Xem tất cả</button>
          </div>
          <div className="space-y-3">
            {topProducts.map((product, idx) => (
              <div key={product.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                  {idx + 1}
                </div>
                <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.brand}</p>
                </div>
                <p className="text-sm font-bold text-blue-600 flex-shrink-0">{formatPrice(product.price)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-gray-800 mb-4">Thao tác nhanh</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="flex flex-col items-center gap-2 p-4 hover:bg-blue-50 rounded-xl transition-colors border border-gray-100 group">
            <div className="w-12 h-12 bg-blue-100 group-hover:bg-blue-200 rounded-xl flex items-center justify-center transition-colors">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-700 font-medium">Thêm sản phẩm</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 hover:bg-green-50 rounded-xl transition-colors border border-gray-100 group">
            <div className="w-12 h-12 bg-green-100 group-hover:bg-green-200 rounded-xl flex items-center justify-center transition-colors">
              <Tag className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-700 font-medium">Tạo mã giảm giá</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 hover:bg-purple-50 rounded-xl transition-colors border border-gray-100 group">
            <div className="w-12 h-12 bg-purple-100 group-hover:bg-purple-200 rounded-xl flex items-center justify-center transition-colors">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-700 font-medium">Viết blog mới</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 hover:bg-yellow-50 rounded-xl transition-colors border border-gray-100 group">
            <div className="w-12 h-12 bg-yellow-100 group-hover:bg-yellow-200 rounded-xl flex items-center justify-center transition-colors">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-700 font-medium">Xem báo cáo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
