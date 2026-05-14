import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  LayoutDashboard, Package, ShoppingCart, Users, TrendingUp,
  Tag, FileText, Settings, LogOut, Menu, Bell, PercentIcon
} from "lucide-react";
import { useApp } from "../context/AppContext";
import productService from "../../services/productService";
import orderService from "../../services/orderService";
import { AdminDashboard } from "./admin/AdminDashboard";
import { ProductsManagement } from "./admin/ProductsManagement";
import { OrdersManagement } from "./admin/OrdersManagement";
import { CustomersManagement } from "./admin/CustomersManagement";
import { StatisticsReports } from "./admin/StatisticsReports";
import { CouponsManagement } from "./admin/CouponsManagement";
import { DiscountsManagement } from "./admin/DiscountsManagement";
import { BlogManagement } from "./admin/BlogManagement";
import { SettingsManagement } from "./admin/SettingsManagement";
import { BrandsManagement } from "./admin/BrandsManagement";
import { CategoriesManagement } from "./admin/CategoriesManagement";

type AdminTab = "dashboard" | "products" | "orders" | "customers" | "stats" | "vouchers" | "discounts" | "blog" | "settings" | "brands" | "categories";

export function Admin() {
  const { isLoggedIn, isAdmin, logout, user } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [realProducts, setRealProducts] = useState<any[]>([]);
  const [realOrders, setRealOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) {
      navigate("/login");
    }
  }, [isLoggedIn, isAdmin, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, ordersData] = await Promise.all([
          productService.getAllProducts(),
          orderService.getAllOrdersAdmin()
        ]);
        setRealProducts(productsData);
        setRealOrders(ordersData);
      } catch (err) {}
    };
    if (isLoggedIn && isAdmin) {
      fetchData();
    }
  }, [isLoggedIn, isAdmin]);

  if (!isLoggedIn || !isAdmin) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems: { id: AdminTab; icon: any; label: string }[] = [
    { id: "dashboard", icon: LayoutDashboard, label: "Tổng quan" },
    { id: "products", icon: Package, label: "Sản phẩm" },
    { id: "categories", icon: LayoutDashboard, label: "Danh mục" },
    { id: "brands", icon: Tag, label: "Thương hiệu" },
    { id: "orders", icon: ShoppingCart, label: "Đơn hàng" },
    { id: "customers", icon: Users, label: "Khách hàng" },
    { id: "stats", icon: TrendingUp, label: "Thống kê" },
    { id: "vouchers", icon: Tag, label: "Voucher" },
    { id: "discounts", icon: PercentIcon, label: "Khuyến mãi" },
    { id: "blog", icon: FileText, label: "Blog" },
    { id: "settings", icon: Settings, label: "Cài đặt" },
  ];

  // Stats from real data
  const totalRevenue = realOrders.reduce((sum, o) => sum + (o.status !== "CANCELLED" ? o.totalPrice : 0), 0);
  const totalOrdersCount = realOrders.length;
  const pendingOrders = realOrders.filter(o => o.status === "PENDING").length;
  const completedOrders = realOrders.filter(o => o.status === "DELIVERED").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-gray-900 text-lg font-black">SportZone <span className="text-blue-600">Admin</span></h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user.avatar}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm text-gray-800 font-medium">{user.fullName}</p>
                <p className="text-xs text-gray-500">Quản trị viên</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
          style={{ top: "57px" }}
        >
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === item.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-6">
          {activeTab === "dashboard" && (
            <AdminDashboard
              stats={{ totalRevenue, totalOrders: totalOrdersCount, pendingOrders, completedOrders }}
              orders={realOrders}
              products={realProducts}
            />
          )}
          {activeTab === "products" && <ProductsManagement />}
          {activeTab === "orders" && <OrdersManagement />}
          {activeTab === "customers" && <CustomersManagement />}
          {activeTab === "stats" && <StatisticsReports />}
          {activeTab === "vouchers" && <CouponsManagement />}
          {activeTab === "discounts" && <DiscountsManagement />}
          {activeTab === "blog" && <BlogManagement />}
          {activeTab === "brands" && <BrandsManagement />}
          {activeTab === "categories" && <CategoriesManagement />}
          {activeTab === "settings" && <SettingsManagement />}
        </main>
      </div>
    </div>
  );
}
