import { useState } from "react";
import { Store, CreditCard, Truck, Mail, Lock, Bell, Save } from "lucide-react";

export function SettingsManagement() {
  const [activeSection, setActiveSection] = useState<"store" | "payment" | "shipping" | "email" | "security" | "notifications">("store");

  const sections = [
    { id: "store" as const, icon: Store, label: "Thông tin cửa hàng" },
    { id: "payment" as const, icon: CreditCard, label: "Thanh toán" },
    { id: "shipping" as const, icon: Truck, label: "Vận chuyển" },
    { id: "email" as const, icon: Mail, label: "Email & Thông báo" },
    { id: "security" as const, icon: Lock, label: "Bảo mật" },
    { id: "notifications" as const, icon: Bell, label: "Cài đặt thông báo" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900">Cài đặt hệ thống</h2>
        <p className="text-sm text-gray-500 mt-1">Quản lý cấu hình và tùy chỉnh website</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Menu */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm h-fit">
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                    activeSection === section.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {activeSection === "store" && <StoreSettings />}
          {activeSection === "payment" && <PaymentSettings />}
          {activeSection === "shipping" && <ShippingSettings />}
          {activeSection === "email" && <EmailSettings />}
          {activeSection === "security" && <SecuritySettings />}
          {activeSection === "notifications" && <NotificationSettings />}
        </div>
      </div>
    </div>
  );
}

function StoreSettings() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
      <div>
        <h3 className="text-gray-800 font-bold mb-1">Thông tin cửa hàng</h3>
        <p className="text-sm text-gray-500">Cập nhật thông tin cơ bản về cửa hàng</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tên cửa hàng</label>
          <input
            type="text"
            defaultValue="SportZone"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
          <textarea
            rows={3}
            defaultValue="Chuyên cung cấp đồ thể thao chất lượng cao"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email liên hệ</label>
            <input
              type="email"
              defaultValue="contact@sportzone.com"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
            <input
              type="tel"
              defaultValue="1900 1234"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
          <input
            type="text"
            defaultValue="123 Nguyễn Huệ, Quận 1, TP.HCM"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
          <Save className="w-4 h-4" />
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}

function PaymentSettings() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
      <div>
        <h3 className="text-gray-800 font-bold mb-1">Cài đặt thanh toán</h3>
        <p className="text-sm text-gray-500">Quản lý các phương thức thanh toán</p>
      </div>

      <div className="space-y-4">
        {[
          { name: "COD", label: "Thanh toán khi nhận hàng", enabled: true },
          { name: "MoMo", label: "Ví điện tử MoMo", enabled: true },
          { name: "VNPay", label: "Cổng thanh toán VNPay", enabled: true },
          { name: "Card", label: "Thẻ tín dụng/ghi nợ", enabled: false },
        ].map((method) => (
          <div key={method.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
            <div>
              <p className="font-medium text-gray-900">{method.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">Phương thức: {method.name}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={method.enabled} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
          <Save className="w-4 h-4" />
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}

function ShippingSettings() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
      <div>
        <h3 className="text-gray-800 font-bold mb-1">Cài đặt vận chuyển</h3>
        <p className="text-sm text-gray-500">Quản lý phí vận chuyển và đơn vị giao hàng</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phí vận chuyển mặc định</label>
            <input
              type="number"
              defaultValue="30000"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Miễn phí từ</label>
            <input
              type="number"
              defaultValue="500000"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Đơn vị vận chuyển</label>
          <div className="space-y-2">
            {["Giao hàng nhanh", "Giao hàng tiết kiệm", "J&T Express", "Viettel Post"].map((carrier) => (
              <label key={carrier} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm text-gray-700">{carrier}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
          <Save className="w-4 h-4" />
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}

function EmailSettings() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
      <div>
        <h3 className="text-gray-800 font-bold mb-1">Email & Thông báo</h3>
        <p className="text-sm text-gray-500">Cấu hình email gửi tự động cho khách hàng</p>
      </div>

      <div className="space-y-4">
        {[
          { name: "order_confirm", label: "Email xác nhận đơn hàng", enabled: true },
          { name: "order_shipping", label: "Email thông báo giao hàng", enabled: true },
          { name: "order_delivered", label: "Email giao hàng thành công", enabled: true },
          { name: "newsletter", label: "Email marketing & khuyến mãi", enabled: false },
        ].map((email) => (
          <div key={email.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
            <div>
              <p className="font-medium text-gray-900">{email.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">Tự động gửi khi có sự kiện</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={email.enabled} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
          <Save className="w-4 h-4" />
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
      <div>
        <h3 className="text-gray-800 font-bold mb-1">Bảo mật tài khoản</h3>
        <p className="text-sm text-gray-500">Đổi mật khẩu và quản lý quyền truy cập</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
          <input
            type="password"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
          <input
            type="password"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
          <input
            type="password"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
          <Lock className="w-4 h-4" />
          Đổi mật khẩu
        </button>
      </div>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
      <div>
        <h3 className="text-gray-800 font-bold mb-1">Thông báo</h3>
        <p className="text-sm text-gray-500">Quản lý các loại thông báo bạn muốn nhận</p>
      </div>

      <div className="space-y-4">
        {[
          { name: "new_order", label: "Đơn hàng mới", enabled: true },
          { name: "low_stock", label: "Cảnh báo hết hàng", enabled: true },
          { name: "new_customer", label: "Khách hàng mới", enabled: false },
          { name: "daily_report", label: "Báo cáo hàng ngày", enabled: true },
        ].map((notif) => (
          <div key={notif.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
            <div>
              <p className="font-medium text-gray-900">{notif.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">Nhận thông báo qua email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={notif.enabled} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
          <Save className="w-4 h-4" />
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}
