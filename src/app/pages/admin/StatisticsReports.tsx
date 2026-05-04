import { TrendingUp, DollarSign, ShoppingCart, Package, Download, Calendar, BarChart3 } from "lucide-react";
import { formatPrice } from "../../data/products";

export function StatisticsReports() {
  const mockStats = {
    dailyRevenue: [
      { date: "T2", value: 4500000 },
      { date: "T3", value: 5200000 },
      { date: "T4", value: 3800000 },
      { date: "T5", value: 6100000 },
      { date: "T6", value: 7300000 },
      { date: "T7", value: 8900000 },
      { date: "CN", value: 9500000 },
    ],
    topProducts: [
      { name: "Giày Chạy Bộ ProRun X5", sold: 125, revenue: 231250000 },
      { name: "Áo Đấu DryFit Pro", sold: 98, revenue: 27440000 },
      { name: "Quần Short Thể Thao", sold: 87, revenue: 17400000 },
    ],
    topCategories: [
      { name: "Chạy bộ", percentage: 35 },
      { name: "Bóng đá", percentage: 25 },
      { name: "Gym", percentage: 20 },
      { name: "Yoga", percentage: 12 },
      { name: "Khác", percentage: 8 },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-gray-900">Thống kê & Báo cáo</h2>
          <p className="text-sm text-gray-500 mt-1">Phân tích doanh thu và hiệu suất kinh doanh</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400">
            <option>7 ngày qua</option>
            <option>30 ngày qua</option>
            <option>Tháng này</option>
            <option>Tháng trước</option>
            <option>Năm nay</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-gray-800 font-bold">Biểu đồ doanh thu 7 ngày</h3>
            <p className="text-sm text-gray-500 mt-1">Thống kê theo ngày</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Tổng doanh thu</p>
            <p className="text-2xl font-black text-green-600">
              {formatPrice(mockStats.dailyRevenue.reduce((sum, d) => sum + d.value, 0))}
            </p>
          </div>
        </div>

        {/* Simple Bar Chart */}
        <div className="flex items-end justify-between gap-3 h-64">
          {mockStats.dailyRevenue.map((day, idx) => {
            const maxValue = Math.max(...mockStats.dailyRevenue.map(d => d.value));
            const heightPercent = (day.value / maxValue) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center justify-end flex-1">
                  <span className="text-xs text-gray-600 mb-2">{formatPrice(day.value)}</span>
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-xl hover:from-blue-700 hover:to-blue-500 transition-all cursor-pointer relative group"
                    style={{ height: `${heightPercent}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {formatPrice(day.value)}
                    </div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700">{day.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-blue-600" />
            <h3 className="text-gray-800 font-bold">Sản phẩm bán chạy</h3>
          </div>
          <div className="space-y-4">
            {mockStats.topProducts.map((product, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.sold} sản phẩm đã bán</p>
                </div>
                <p className="text-sm font-bold text-green-600">{formatPrice(product.revenue)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <h3 className="text-gray-800 font-bold">Danh mục phổ biến</h3>
          </div>
          <div className="space-y-4">
            {mockStats.topCategories.map((category, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                  <span className="text-sm font-bold text-blue-600">{category.percentage}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5" />
            <p className="text-sm text-white/80">Đơn hàng trung bình/ngày</p>
          </div>
          <p className="text-3xl font-black">24.5</p>
          <p className="text-xs text-white/70 mt-2">↑ 8% so với tuần trước</p>
        </div>

        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5" />
            <p className="text-sm text-white/80">Giá trị đơn trung bình</p>
          </div>
          <p className="text-3xl font-black">{formatPrice(650000)}</p>
          <p className="text-xs text-white/70 mt-2">↑ 12% so với tuần trước</p>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingCart className="w-5 h-5" />
            <p className="text-sm text-white/80">Tỉ lệ chuyển đổi</p>
          </div>
          <p className="text-3xl font-black">18.7%</p>
          <p className="text-xs text-white/70 mt-2">↓ 2% so với tuần trước</p>
        </div>
      </div>
    </div>
  );
}
