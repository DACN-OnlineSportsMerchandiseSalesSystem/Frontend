import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, ShoppingCart, Package, Download, Calendar, BarChart3, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { formatPrice } from "../../data/products";
import statisticService, { DailyStatisticDTO, TopSellingProductDTO, RevenueDTO } from "../../../services/statisticService";

export function StatisticsReports() {
  const [dailyStats, setDailyStats] = useState<DailyStatisticDTO[]>([]);
  const [topProducts, setTopProducts] = useState<TopSellingProductDTO[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState("");

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const fetchData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [daily, top, revenue] = await Promise.all([
        statisticService.getDailyStats(currentMonth, currentYear),
        statisticService.getTopSelling(currentMonth, currentYear, 5),
        statisticService.getRevenue(currentYear)
      ]);
      setDailyStats(daily);
      setTopProducts(top);
      setRevenueData(revenue);
    } catch (err: any) {
      setError("Không thể tải dữ liệu thống kê");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      await statisticService.triggerSync();
      fetchData();
      alert("Đồng bộ dữ liệu thành công!");
    } catch (err) {
      alert("Đồng bộ thất bại");
    } finally {
      setIsSyncing(false);
    }
  };

  const totalRevenue = dailyStats.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = dailyStats.reduce((sum, d) => sum + d.orderCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-gray-900 font-black">Thống kê & Báo cáo</h2>
          <p className="text-sm text-gray-500 mt-1">Phân tích doanh thu và hiệu suất kinh doanh thực tế</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Đồng bộ dữ liệu
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-200 font-black uppercase tracking-widest text-xs">
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="font-bold">{error}</p>
        </div>
      )}

      {/* Revenue Chart */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-10 relative z-10">
          <div>
            <h3 className="text-gray-900 font-black text-xl">Biểu đồ doanh thu tháng {currentMonth}</h3>
            <p className="text-sm text-gray-500 mt-1">Thống kê chi tiết theo từng ngày</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Tổng doanh thu tháng</p>
            <p className="text-3xl font-black text-blue-600">
              {formatPrice(totalRevenue)}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        ) : dailyStats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <BarChart3 className="w-12 h-12 text-gray-300 mb-2" />
            <p className="text-gray-500 font-bold">Chưa có dữ liệu cho tháng này</p>
          </div>
        ) : (
          <div className="flex items-end justify-between gap-2 h-64 px-2">
            {dailyStats.slice(-15).map((day, idx) => {
              const maxValue = Math.max(...dailyStats.map(d => d.revenue)) || 1;
              const heightPercent = (day.revenue / maxValue) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-3 group">
                  <div className="w-full flex flex-col items-center justify-end flex-1 relative">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20 whitespace-nowrap">
                      {formatPrice(day.revenue)}
                    </div>
                    <div
                      className="w-full max-w-[24px] bg-gradient-to-t from-blue-600 to-blue-400 rounded-full hover:from-blue-700 hover:to-blue-500 transition-all cursor-pointer relative shadow-lg shadow-blue-100"
                      style={{ height: `${Math.max(heightPercent, 5)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase">
                    {day.statDate.split('-')[2]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-gray-900 font-black">Sản phẩm bán chạy tháng {currentMonth}</h3>
            </div>
          </div>
          <div className="space-y-5">
            {topProducts.length === 0 ? (
              <p className="text-center py-10 text-gray-400 font-medium italic">Chưa có dữ liệu bán hàng</p>
            ) : topProducts.map((product, idx) => (
              <div key={idx} className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-gray-50 group-hover:bg-blue-600 group-hover:text-white rounded-xl flex items-center justify-center text-gray-500 font-black transition-all">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{product.productName}</p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">{product.quantitySold} sản phẩm đã bán</p>
                </div>
                <p className="text-sm font-black text-blue-600">{formatPrice(product.totalRevenue)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Yearly Revenue Overview */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-gray-900 font-black">Doanh thu năm {currentYear}</h3>
            </div>
          </div>
          <div className="space-y-6">
            {revenueData.length === 0 ? (
              <p className="text-center py-10 text-gray-400 font-medium italic">Chưa có dữ liệu doanh thu năm</p>
            ) : revenueData.map((data, idx) => (
              <div key={idx} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-black text-gray-900 uppercase tracking-widest">{data.label}</span>
                  <span className="text-sm font-black text-indigo-600">{formatPrice(data.revenue)}</span>
                </div>
                <div className="h-3 bg-gray-50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full shadow-inner"
                    style={{ 
                      width: `${Math.min((data.revenue / (Math.max(...revenueData.map(r => r.revenue)) || 1)) * 100, 100)}%` 
                    }}
                  />
                </div>
                <div className="mt-1 flex justify-end">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{data.orderCount} đơn hàng</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[32px] p-8 text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-500">
            <ShoppingCart className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-5 h-5 text-blue-200" />
              <p className="text-xs font-black uppercase tracking-widest text-blue-100">Tổng đơn hàng</p>
            </div>
            <p className="text-4xl font-black">{totalOrders}</p>
            <p className="text-[10px] font-bold text-blue-200 mt-4 uppercase tracking-widest">Tháng {currentMonth}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-500">
            <DollarSign className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-indigo-200" />
              <p className="text-xs font-black uppercase tracking-widest text-indigo-100">Giá trị trung bình</p>
            </div>
            <p className="text-4xl font-black">
              {totalOrders > 0 ? formatPrice(totalRevenue / totalOrders) : formatPrice(0)}
            </p>
            <p className="text-[10px] font-bold text-indigo-200 mt-4 uppercase tracking-widest">Theo tháng hiện tại</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-[32px] p-8 text-white shadow-xl shadow-purple-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-500">
            <TrendingUp className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-200" />
              <p className="text-xs font-black uppercase tracking-widest text-purple-100">Người dùng mới</p>
            </div>
            <p className="text-4xl font-black">{dailyStats.reduce((sum, d) => sum + (d.newUserCount || 0), 0)}</p>
            <p className="text-[10px] font-bold text-purple-200 mt-4 uppercase tracking-widest">Tháng {currentMonth}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
