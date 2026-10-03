import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, ShoppingCart, Package, Download, Calendar, BarChart3, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { formatPrice } from "../../data/products";
import statisticService, { DailyStatisticDTO, TopSellingProductDTO, RevenueDTO } from "../../../services/statisticService";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell
} from "recharts";

export function StatisticsReports() {
  const [dailyStats, setDailyStats] = useState<DailyStatisticDTO[]>([]);
  const [topProducts, setTopProducts] = useState<TopSellingProductDTO[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState("");

  // Trạng thái bộ lọc tháng/năm
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());

  const fetchData = async (month: number, year: number) => {
    setIsLoading(true);
    setError("");
    try {
      const [daily, top, revenue] = await Promise.all([
        statisticService.getDailyStats(month, year),
        statisticService.getTopSelling(month, year, 5),
        statisticService.getRevenue(year)
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
    fetchData(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      await statisticService.triggerSync();
      await fetchData(selectedMonth, selectedYear);
      alert("Đồng bộ dữ liệu thành công!");
    } catch (err) {
      alert("Đồng bộ thất bại");
    } finally {
      setIsSyncing(false);
    }
  };

  // Lấy số ngày trong tháng được chọn
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  // Tạo dữ liệu đầy đủ cho tất cả các ngày trong tháng (từ ngày 1 đến hết tháng)
  const chartData = (() => {
    const daysCount = getDaysInMonth(selectedMonth, selectedYear);
    const data = [];
    for (let day = 1; day <= daysCount; day++) {
      const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const stat = dailyStats.find(
        (s) => s.statDate && s.statDate.startsWith(dateStr)
      );
      data.push({
        day: `Ngày ${day}`,
        dateStr,
        dayNum: day,
        revenue: stat ? stat.revenue : 0,
        orderCount: stat ? stat.orderCount : 0,
        newUserCount: stat ? stat.newUserCount : 0,
      });
    }
    return data;
  })();

  // Tính toán KPI nhanh dựa trên dữ liệu tháng đã chọn
  const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = chartData.reduce((sum, d) => sum + d.orderCount, 0);
  const totalNewUsers = chartData.reduce((sum, d) => sum + d.newUserCount, 0);

  return (
    <div className="space-y-6">
      
      {/* Header & Bộ lọc */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Thống kê & Báo cáo</h2>
          <p className="text-sm text-gray-500 mt-1">Phân tích doanh thu và hiệu suất kinh doanh thực tế</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Bộ lọc tháng */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
            <span className="text-xs text-gray-500 font-semibold uppercase">Tháng:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent border-none text-sm font-bold text-gray-800 focus:outline-none cursor-pointer pr-4"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
          </div>

          {/* Bộ lọc năm */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
            <span className="text-xs text-gray-500 font-semibold uppercase">Năm:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent border-none text-sm font-bold text-gray-800 focus:outline-none cursor-pointer pr-4"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>Năm {y}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleTriggerSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Đồng bộ dữ liệu
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-200 font-black uppercase tracking-widest text-xs">
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
            {/* Thẻ chỉ số bổ sung */}
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
            <p className="text-[10px] font-bold text-blue-200 mt-4 uppercase tracking-widest">Tháng {selectedMonth}/{selectedYear}</p>
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
            <p className="text-[10px] font-bold text-indigo-200 mt-4 uppercase tracking-widest">Theo tháng đã chọn</p>
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
            <p className="text-4xl font-black">{totalNewUsers}</p>
            <p className="text-[10px] font-bold text-purple-200 mt-4 uppercase tracking-widest">Tháng {selectedMonth}/{selectedYear}</p>
          </div>
        </div>
      </div>

      {/* Biểu đồ doanh thu hàng ngày */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 relative z-10">
          <div>
            <h3 className="text-gray-900 font-black text-xl">Biểu đồ doanh thu tháng {selectedMonth}/{selectedYear}</h3>
            <p className="text-sm text-gray-500 mt-1">Thống kê chi tiết doanh thu theo từng ngày</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Doanh thu trong tháng</p>
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
            <p className="text-gray-500 font-bold">Chưa có dữ liệu thống kê cho tháng này</p>
          </div>
        ) : (
          <div className="h-[280px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="dayNum" 
                  tickLine={false} 
                  axisLine={false}
                  stroke="#9ca3af"
                  style={{ fontSize: '10px', fontWeight: 'bold' }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  stroke="#9ca3af"
                  style={{ fontSize: '10px', fontWeight: 'bold' }}
                  tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val.toLocaleString('vi-VN')}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderRadius: '16px', border: 'none', color: '#fff', padding: '12px' }}
                  labelStyle={{ fontWeight: 'black', color: '#60a5fa', marginBottom: '4px' }}
                  formatter={(value: any, name: string) => {
                    if (name === "revenue") return [formatPrice(Number(value)), "Doanh thu"];
                    if (name === "orderCount") return [value, "Đơn hàng"];
                    if (name === "newUserCount") return [value, "Người dùng mới"];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Ngày ${label} tháng ${selectedMonth}/${selectedYear}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  name="revenue"
                  stroke="#2563eb" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top bán chạy */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-gray-900 font-black">Sản phẩm bán chạy tháng {selectedMonth}/{selectedYear}</h3>
            </div>
          </div>
          <div className="space-y-5">
            {topProducts.length === 0 ? (
              <p className="text-center py-10 text-gray-500 font-medium italic">Chưa có dữ liệu bán hàng trong tháng này</p>
            ) : topProducts.map((product, idx) => (
              <div key={idx} className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-gray-50 group-hover:bg-blue-600 group-hover:text-white rounded-xl flex items-center justify-center text-gray-500 font-black transition-all">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{product.productName}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5">{product.quantitySold} sản phẩm đã bán</p>
                </div>
                <p className="text-sm font-black text-blue-600">{formatPrice(product.totalRevenue)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tổng quan doanh thu theo năm */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-gray-900 font-black">Doanh thu năm {selectedYear}</h3>
            </div>
          </div>
          {revenueData.length === 0 ? (
            <p className="text-center py-10 text-gray-500 font-medium italic">Chưa có dữ liệu doanh thu năm</p>
          ) : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="label" 
                    tickLine={false} 
                    axisLine={false}
                    stroke="#9ca3af"
                    style={{ fontSize: '9px', fontWeight: 'bold' }}
                    tickFormatter={(val) => val.replace("Tháng ", "T")}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false}
                    stroke="#9ca3af"
                    style={{ fontSize: '9px', fontWeight: 'bold' }}
                    tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val.toLocaleString('vi-VN')}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderRadius: '16px', border: 'none', color: '#fff', padding: '12px' }}
                    labelStyle={{ fontWeight: 'black', color: '#818cf8', marginBottom: '4px' }}
                    formatter={(value: any, name: string) => {
                      if (name === "revenue") return [formatPrice(Number(value)), "Doanh thu"];
                      if (name === "orderCount") return [value, "Đơn hàng"];
                      return [value, name];
                    }}
                  />
                  <Bar 
                    dataKey="revenue" 
                    name="revenue" 
                    fill="#818cf8" 
                    radius={[6, 6, 0, 0]}
                    maxBarSize={28}
                  >
                    {revenueData.map((entry, index) => {
                      const isCurrentMonth = entry.label === `Tháng ${selectedMonth}`;
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={isCurrentMonth ? '#2563eb' : '#818cf8'} 
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}
