import { useState, useEffect } from "react";
import { TrendingUp, ShoppingCart, Package, CheckCircle, Plus, Tag, FileText, Users, DollarSign, ArrowUp, ArrowDown, Loader2, RefreshCw } from "lucide-react";
import { formatPrice } from "../../data/products";
import { Order } from "../../context/AppContext";
import statisticService, { DailyStatisticDTO } from "../../../services/statisticService";

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
  const [dailyStats, setDailyStats] = useState<DailyStatisticDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      const data = await statisticService.getDailyStats(currentMonth, currentYear);
      setDailyStats(data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await statisticService.triggerSync();
      await fetchDashboardStats();
    } catch (err) {
      alert("Đồng bộ thất bại");
    } finally {
      setIsSyncing(false);
    }
  };

  // Logic tính toán thông minh: Ưu tiên API Thống kê, dự phòng bằng dữ liệu Orders thực tế
  const monthlyRevenueFromStats = dailyStats.reduce((sum, d) => sum + d.revenue, 0);
  const monthlyOrdersFromStats = dailyStats.reduce((sum, d) => sum + d.orderCount, 0);
  
  // Nếu API Thống kê trả về 0 (chưa sync), dùng stats truyền từ Admin.tsx
  const finalRevenue = monthlyRevenueFromStats > 0 ? monthlyRevenueFromStats : stats.totalRevenue;
  const finalOrders = monthlyOrdersFromStats > 0 ? monthlyOrdersFromStats : stats.totalOrders;
  const finalNewUsers = dailyStats.reduce((sum, d) => sum + (d.newUserCount || 0), 0);

  // Sắp xếp để lấy 5 đơn hàng mới nhất và 5 sản phẩm mới nhất
  const recentOrders = [...orders]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 5);

  const topProducts = [...products]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 font-black">Tổng quan hệ thống</h2>
          <p className="text-sm text-gray-500 mt-1">Thống kê hoạt động kinh doanh thực tế tháng {currentMonth}/{currentYear}</p>
        </div>
        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? "Đang đồng bộ..." : "Cập nhật số liệu"}
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-[32px] p-7 text-white shadow-xl shadow-emerald-100 relative overflow-hidden group">
              <DollarSign className="absolute -right-4 -bottom-4 w-28 h-28 opacity-10 group-hover:scale-110 transition-transform duration-500" />
              <p className="text-emerald-100 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Doanh thu</p>
              <p className="text-3xl font-black">{formatPrice(finalRevenue)}</p>
              <div className="mt-5 flex items-center gap-2 text-[10px] font-black bg-white/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm">
                <ArrowUp className="w-3 h-3" /> ỔN ĐỊNH
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-[32px] p-7 text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
              <ShoppingCart className="absolute -right-4 -bottom-4 w-28 h-28 opacity-10 group-hover:scale-110 transition-transform duration-500" />
              <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Đơn hàng mới</p>
              <p className="text-3xl font-black">{finalOrders}</p>
              <div className="mt-5 flex items-center gap-2 text-[10px] font-black bg-white/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm">
                {stats.pendingOrders} CHỜ XỬ LÝ
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-[32px] p-7 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
              <Users className="absolute -right-4 -bottom-4 w-28 h-28 opacity-10 group-hover:scale-110 transition-transform duration-500" />
              <p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Khách hàng mới</p>
              <p className="text-3xl font-black">{finalNewUsers || 0}</p>
              <div className="mt-5 flex items-center gap-2 text-[10px] font-black bg-white/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm">
                {finalNewUsers > 0 ? "TĂNG TRƯỞNG" : "CHỜ CẬP NHẬT"}
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-[32px] p-7 text-white shadow-xl shadow-amber-100 relative overflow-hidden group">
              <Package className="absolute -right-4 -bottom-4 w-28 h-28 opacity-10 group-hover:scale-110 transition-transform duration-500" />
              <p className="text-amber-100 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Sản phẩm</p>
              <p className="text-3xl font-black">{products.length}</p>
              <div className="mt-5 flex items-center gap-2 text-[10px] font-black bg-white/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm">
                ĐANG KINH DOANH
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Recent Orders */}
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8 px-2">
                <h3 className="text-gray-900 font-black text-lg">Đơn hàng vừa nhận</h3>
                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Xem tất cả</button>
              </div>
              <div className="space-y-4">
                {recentOrders.length === 0 ? (
                  <div className="flex flex-col items-center py-10 opacity-30">
                    <ShoppingCart className="w-12 h-12 mb-2" />
                    <p className="text-sm font-bold">Chưa có đơn hàng</p>
                  </div>
                ) : recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-5 hover:bg-gray-50 rounded-3xl transition-all border border-transparent hover:border-gray-100 group">
                    <div className="flex-1">
                      <p className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors">#{order.id}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">
                        {order.receiverName || "Khách hàng"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-blue-600">{formatPrice(order.totalPrice)}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                        {new Date(order.createAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8 px-2">
                <h3 className="text-gray-900 font-black text-lg">Sản phẩm nổi bật</h3>
                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Quản lý kho</button>
              </div>
              <div className="space-y-4">
                {topProducts.slice(0, 5).map((product, idx) => (
                  <div key={product.id || idx} className="flex items-center gap-5 p-4 hover:bg-gray-50 rounded-3xl transition-all border border-transparent hover:border-gray-100 group">
                    <div className="w-10 h-10 bg-gray-50 group-hover:bg-blue-600 group-hover:text-white rounded-2xl flex items-center justify-center text-gray-400 font-black text-xs transition-all">
                      {idx + 1}
                    </div>
                    <img 
                      src={product.images?.[0]?.imageUrl || product.image || "/placeholder.png"} 
                      alt={product.name} 
                      className="w-14 h-14 rounded-2xl object-cover border border-gray-50 shadow-sm" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-gray-900 truncate group-hover:text-blue-600 transition-colors">{product.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        {product.brandName || product.brand || "Đang cập nhật"}
                      </p>
                    </div>
                    <p className="text-sm font-black text-blue-600">{formatPrice(product.price || 0)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm mt-8">
            <h3 className="text-gray-900 font-black mb-8 px-2 text-xl">Thao tác nhanh</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <button className="flex flex-col items-center gap-4 p-8 hover:bg-blue-50 rounded-[40px] transition-all border border-gray-50 group">
                <div className="w-16 h-16 bg-blue-100 group-hover:bg-blue-600 group-hover:scale-110 rounded-[20px] flex items-center justify-center transition-all shadow-lg shadow-blue-100 group-hover:shadow-blue-200">
                  <Plus className="w-8 h-8 text-blue-600 group-hover:text-white" />
                </div>
                <span className="text-[10px] text-gray-900 font-black uppercase tracking-[0.2em]">Sản phẩm</span>
              </button>
              <button className="flex flex-col items-center gap-4 p-8 hover:bg-emerald-50 rounded-[40px] transition-all border border-gray-50 group">
                <div className="w-16 h-16 bg-emerald-100 group-hover:bg-emerald-600 group-hover:scale-110 rounded-[20px] flex items-center justify-center transition-all shadow-lg shadow-emerald-100 group-hover:shadow-emerald-200">
                  <Tag className="w-8 h-8 text-emerald-600 group-hover:text-white" />
                </div>
                <span className="text-[10px] text-gray-900 font-black uppercase tracking-[0.2em]">Voucher</span>
              </button>
              <button className="flex flex-col items-center gap-4 p-8 hover:bg-indigo-50 rounded-[40px] transition-all border border-gray-50 group">
                <div className="w-16 h-16 bg-indigo-100 group-hover:bg-indigo-600 group-hover:scale-110 rounded-[20px] flex items-center justify-center transition-all shadow-lg shadow-indigo-100 group-hover:shadow-indigo-200">
                  <FileText className="w-8 h-8 text-indigo-600 group-hover:text-white" />
                </div>
                <span className="text-[10px] text-gray-900 font-black uppercase tracking-[0.2em]">Viết Blog</span>
              </button>
              <button className="flex flex-col items-center gap-4 p-8 hover:bg-amber-50 rounded-[40px] transition-all border border-gray-50 group">
                <div className="w-16 h-16 bg-amber-100 group-hover:bg-amber-600 group-hover:scale-110 rounded-[20px] flex items-center justify-center transition-all shadow-lg shadow-amber-100 group-hover:shadow-amber-200">
                  <TrendingUp className="w-8 h-8 text-amber-600 group-hover:text-white" />
                </div>
                <span className="text-[10px] text-gray-900 font-black uppercase tracking-[0.2em]">Báo cáo</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
