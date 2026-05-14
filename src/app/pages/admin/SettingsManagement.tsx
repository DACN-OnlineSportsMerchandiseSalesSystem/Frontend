import { useState, useEffect } from "react";
import { Store, CreditCard, Truck, Mail, Lock, Bell, Save, ShieldCheck, Plus, Edit2, Trash2, X, Loader2, AlertCircle } from "lucide-react";
import storePolicyService, { StorePolicyDTO } from "../../../services/storePolicyService";

export function SettingsManagement() {
  const [activeSection, setActiveSection] = useState<"store" | "payment" | "shipping" | "email" | "security" | "notifications" | "policies">("store");

  const sections = [
    { id: "store" as const, icon: Store, label: "Thông tin cửa hàng" },
    { id: "policies" as const, icon: ShieldCheck, label: "Chính sách cửa hàng" },
    { id: "payment" as const, icon: CreditCard, label: "Thanh toán" },
    { id: "shipping" as const, icon: Truck, label: "Vận chuyển" },
    { id: "email" as const, icon: Mail, label: "Email & Thông báo" },
    { id: "security" as const, icon: Lock, label: "Bảo mật" },
    { id: "notifications" as const, icon: Bell, label: "Cài đặt thông báo" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 font-black">Cài đặt hệ thống</h2>
        <p className="text-sm text-gray-500 mt-1">Quản lý cấu hình và tùy chỉnh website</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Menu */}
        <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm h-fit">
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-left ${
                    activeSection === section.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "text-gray-600 hover:bg-gray-50 font-bold"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {activeSection === "store" && <StoreSettings />}
          {activeSection === "policies" && <PoliciesSettings />}
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

function PoliciesSettings() {
  const [policies, setPolicies] = useState<StorePolicyDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<StorePolicyDTO | null>(null);

  const fetchPolicies = async () => {
    setIsLoading(true);
    try {
      const data = await storePolicyService.getAllPolicies();
      setPolicies(data);
    } catch (err) {}
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchPolicies(); }, []);

  const handleDelete = async (key: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chính sách này?")) return;
    try {
      await storePolicyService.deletePolicy(key);
      setPolicies(policies.filter(p => p.policyKey !== key));
    } catch (err) { alert("Xóa thất bại"); }
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 font-black text-xl mb-1">Chính sách cửa hàng</h3>
          <p className="text-sm text-gray-500">Quản lý các trang chính sách hiển thị trên website</p>
        </div>
        <button
          onClick={() => { setEditingPolicy(null); setShowModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-lg shadow-blue-200 font-black uppercase tracking-widest text-xs"
        >
          <Plus className="w-4 h-4" />
          Thêm chính sách
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {policies.map((policy) => (
            <div key={policy.id} className="p-5 border border-gray-100 rounded-3xl hover:bg-gray-50 transition-all flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-black text-gray-900">{policy.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white px-2 py-0.5 rounded-lg border border-gray-100">{policy.policyKey}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${policy.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {policy.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setEditingPolicy(policy); setShowModal(true); }}
                  className="p-2.5 hover:bg-white hover:shadow-md rounded-xl transition-all text-blue-600"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(policy.policyKey)}
                  className="p-2.5 hover:bg-red-50 rounded-xl transition-all text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <PolicyFormModal
          policy={editingPolicy}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchPolicies(); }}
        />
      )}
    </div>
  );
}

function PolicyFormModal({ policy, onClose, onSuccess }: { policy: StorePolicyDTO | null, onClose: () => void, onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<StorePolicyDTO>(policy || {
    policyKey: "",
    title: "",
    content: "",
    category: "GENERAL",
    isActive: true,
    displayOrder: 1
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (policy) {
        await storePolicyService.updatePolicy(policy.policyKey, formData);
      } else {
        await storePolicyService.createPolicy(formData);
      }
      onSuccess();
    } catch (err) { alert("Thao tác thất bại"); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[40px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xl font-black text-gray-900">{policy ? "Cập nhật chính sách" : "Thêm chính sách mới"}</h3>
            <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Mã định danh (Key) *</label>
                <input
                  type="text"
                  required
                  disabled={!!policy}
                  value={formData.policyKey}
                  onChange={e => setFormData({ ...formData, policyKey: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 font-bold text-gray-900 disabled:opacity-50"
                  placeholder="Ví dụ: shipping-policy"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Tiêu đề chính sách *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 font-bold text-gray-900"
                  placeholder="Chính sách vận chuyển"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Nội dung chi tiết *</label>
              <textarea
                required
                rows={10}
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 font-medium text-gray-700"
                placeholder="Nhập nội dung chính sách tại đây..."
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Phân loại</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 font-bold text-gray-900 appearance-none"
                >
                  <option value="GENERAL">Chung</option>
                  <option value="SHIPPING">Vận chuyển</option>
                  <option value="RETURN">Đổi trả</option>
                  <option value="PRIVACY">Bảo mật</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Thứ tự hiển thị</label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={e => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 font-bold text-gray-900"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 px-1">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 rounded-lg text-blue-600 border-gray-200 focus:ring-blue-400"
              />
              <label htmlFor="isActive" className="text-sm font-bold text-gray-700">Cho phép hoạt động và hiển thị trên website</label>
            </div>
          </div>

          <div className="px-8 py-6 bg-gray-50 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-3 font-bold text-gray-500 hover:text-gray-700">Hủy</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-lg shadow-blue-200 disabled:opacity-50 font-black uppercase tracking-widest text-xs"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {policy ? "Cập nhật" : "Tạo chính sách"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StoreSettings() {
  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
      <div>
        <h3 className="text-gray-900 font-black text-xl mb-1">Thông tin cửa hàng</h3>
        <p className="text-sm text-gray-500">Cập nhật thông tin cơ bản về cửa hàng hiển thị trên Website</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Tên cửa hàng</label>
          <input
            type="text"
            defaultValue="SportZone"
            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 font-bold text-gray-900"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Mô tả cửa hàng</label>
          <textarea
            rows={3}
            defaultValue="Chuyên cung cấp đồ thể thao chất lượng cao, phục vụ mọi nhu cầu tập luyện của bạn."
            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 font-medium text-gray-700"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Email liên hệ</label>
            <input
              type="email"
              defaultValue="contact@sportzone.com"
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 font-bold text-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Số điện thoại</label>
            <input
              type="tel"
              defaultValue="1900 1234"
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 font-bold text-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Địa chỉ trụ sở</label>
          <input
            type="text"
            defaultValue="123 Nguyễn Huệ, Quận 1, TP.HCM"
            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 font-bold text-gray-900"
          />
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-100">
        <button className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-lg shadow-blue-200 font-black uppercase tracking-widest text-xs">
          <Save className="w-4 h-4" />
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}

function PaymentSettings() {
  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
      <div>
        <h3 className="text-gray-900 font-black text-xl mb-1">Cài đặt thanh toán</h3>
        <p className="text-sm text-gray-500">Quản lý các cổng thanh toán tích hợp</p>
      </div>

      <div className="space-y-4">
        {[
          { name: "COD", label: "Thanh toán khi nhận hàng", enabled: true },
          { name: "MoMo", label: "Ví điện tử MoMo", enabled: true },
          { name: "VNPay", label: "Cổng thanh toán VNPay", enabled: true },
          { name: "Card", label: "Thẻ tín dụng/ghi nợ", enabled: false },
        ].map((method) => (
          <div key={method.name} className="flex items-center justify-between p-6 border border-gray-100 rounded-3xl hover:bg-gray-50 transition-all">
            <div>
              <p className="font-black text-gray-900">{method.label}</p>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Phương thức: {method.name}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={method.enabled} className="sr-only peer" />
              <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShippingSettings() {
  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
      <div>
        <h3 className="text-gray-900 font-black text-xl mb-1">Cài đặt vận chuyển</h3>
        <p className="text-sm text-gray-500">Cấu hình phí ship và đối tác vận chuyển</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Phí vận chuyển mặc định</label>
            <input
              type="number"
              defaultValue="30000"
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 font-bold text-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Miễn phí từ đơn hàng</label>
            <input
              type="number"
              defaultValue="500000"
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 font-bold text-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4 px-1">Đối tác vận chuyển được phép</label>
          <div className="grid grid-cols-2 gap-4">
            {["Giao hàng nhanh", "Giao hàng tiết kiệm", "J&T Express", "Viettel Post"].map((carrier) => (
              <label key={carrier} className="flex items-center gap-4 p-5 border border-gray-100 rounded-3xl cursor-pointer hover:bg-gray-50 transition-all">
                <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded-lg border-gray-200 focus:ring-blue-400" />
                <span className="text-sm font-bold text-gray-700">{carrier}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmailSettings() {
  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
      <div>
        <h3 className="text-gray-900 font-black text-xl mb-1">Email & Thông báo</h3>
        <p className="text-sm text-gray-500">Cấu hình hệ thống gửi tin nhắn tự động</p>
      </div>

      <div className="space-y-4">
        {[
          { name: "order_confirm", label: "Email xác nhận đơn hàng", enabled: true },
          { name: "order_shipping", label: "Email thông báo giao hàng", enabled: true },
          { name: "order_delivered", label: "Email giao hàng thành công", enabled: true },
          { name: "newsletter", label: "Email marketing & khuyến mãi", enabled: false },
        ].map((email) => (
          <div key={email.name} className="flex items-center justify-between p-6 border border-gray-100 rounded-3xl hover:bg-gray-50 transition-all">
            <div>
              <p className="font-black text-gray-900">{email.label}</p>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Gửi tự động theo sự kiện</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={email.enabled} className="sr-only peer" />
              <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
      <div>
        <h3 className="text-gray-900 font-black text-xl mb-1">Bảo mật tài khoản</h3>
        <p className="text-sm text-gray-500">Đổi mật khẩu định kỳ để bảo vệ website</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Mật khẩu hiện tại</label>
          <input
            type="password"
            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 font-bold text-gray-900"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Mật khẩu mới</label>
          <input
            type="password"
            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 font-bold text-gray-900"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Xác nhận mật khẩu</label>
          <input
            type="password"
            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 font-bold text-gray-900"
          />
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-100">
        <button className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-lg shadow-blue-200 font-black uppercase tracking-widest text-xs">
          <Lock className="w-4 h-4" />
          Đổi mật khẩu
        </button>
      </div>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
      <div>
        <h3 className="text-gray-900 font-black text-xl mb-1">Thông báo hệ thống</h3>
        <p className="text-sm text-gray-500">Tùy chỉnh nhận thông báo quan trọng</p>
      </div>

      <div className="space-y-4">
        {[
          { name: "new_order", label: "Đơn hàng mới", enabled: true },
          { name: "low_stock", label: "Cảnh báo hết hàng", enabled: true },
          { name: "new_customer", label: "Khách hàng mới", enabled: false },
          { name: "daily_report", label: "Báo cáo hàng ngày", enabled: true },
        ].map((notif) => (
          <div key={notif.name} className="flex items-center justify-between p-6 border border-gray-100 rounded-3xl hover:bg-gray-50 transition-all">
            <div>
              <p className="font-black text-gray-900">{notif.label}</p>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Thông báo qua Email & Admin</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={notif.enabled} className="sr-only peer" />
              <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
