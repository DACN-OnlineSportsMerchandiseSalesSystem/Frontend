import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { User, Package, Heart, MapPin, Lock, ChevronRight, Edit3, Plus, Trash2, Eye, Gift, Star, Zap, Coffee, ShoppingBag, Shirt, Trophy, Loader2, CheckCircle, AlertCircle, Star as StarDefault } from "lucide-react";
import { useApp } from "../context/AppContext";
import { products, formatPrice } from "../data/products";

const tabs = [
  { key: "profile", label: "Thông tin cá nhân", icon: <User className="w-4 h-4" /> },
  { key: "orders", label: "Đơn hàng của tôi", icon: <Package className="w-4 h-4" /> },
  { key: "loyalty", label: "Tích điểm đổi quà", icon: <Gift className="w-4 h-4" /> },
  { key: "wishlist", label: "Yêu thích", icon: <Heart className="w-4 h-4" /> },
  { key: "addresses", label: "Địa chỉ", icon: <MapPin className="w-4 h-4" /> },
  { key: "password", label: "Đổi mật khẩu", icon: <Lock className="w-4 h-4" /> },
];

const statusLabel: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ xác nhận", color: "text-yellow-600 bg-yellow-50" },
  confirmed: { label: "Đã xác nhận", color: "text-blue-600 bg-blue-50" },
  shipping: { label: "Đang giao", color: "text-indigo-600 bg-indigo-50" },
  delivered: { label: "Đã giao", color: "text-green-600 bg-green-50" },
  cancelled: { label: "Đã hủy", color: "text-red-600 bg-red-50" },
  return_requested: { label: "Đổi trả", color: "text-orange-600 bg-orange-50" },
  returned: { label: "Đã hoàn", color: "text-gray-600 bg-gray-50" },
};

export function Account() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";
  const { user, updateUser, addAddress, setDefaultAddress, deleteAddress, changePassword, orders, wishlist, toggleWishlist, isLoading, apiError } = useApp();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ ...user });
  const [addAddrMode, setAddAddrMode] = useState(false);
  const [newAddr, setNewAddr] = useState<Address>({ receiverName: "", phone: "", city: "", state: "", street: "", isDefault: false });
  const [pwForm, setPwForm] = useState({ old: "", new1: "", new2: "" });
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [pwMsg, setPwMsg] = useState({ text: "", type: "" as "success" | "error" | "" });
  const [addrMsg, setAddrMsg] = useState("");

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  const setTab = (tab: string) => {
    const p = new URLSearchParams(searchParams);
    p.set("tab", tab);
    setSearchParams(p);
  };

  const handleSave = async () => {
    setSaveError("");
    try {
      await updateUser(formData);
      setEditMode(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaveError(apiError || "Lưu thông tin thất bại");
    }
  };

  const handleAddAddress = async () => {
    setAddrMsg("");
    try {
      await addAddress(newAddr);
      setAddAddrMode(false);
      setNewAddr({ receiverName: "", phone: "", city: "", state: "", street: "", isDefault: false });
      setAddrMsg("Thêm địa chỉ thành công!");
      setTimeout(() => setAddrMsg(""), 2500);
    } catch {
      setAddrMsg(apiError || "Thêm địa chỉ thất bại");
    }
  };

  const handleSetDefault = async (id: number | undefined) => {
    if (!id) return;
    try {
      await setDefaultAddress(id);
    } catch {}
  };

  const handleDeleteAddress = async (id: number | undefined) => {
    if (!id) return;
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
    try {
      await deleteAddress(id);
    } catch {}
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg({ text: "", type: "" });
    if (!pwForm.old || !pwForm.new1 || !pwForm.new2) {
      setPwMsg({ text: "Vui lòng điền đầy đủ thông tin", type: "error" });
      return;
    }
    if (pwForm.new1.length < 6) {
      setPwMsg({ text: "Mật khẩu mới phải có ít nhất 6 ký tự", type: "error" });
      return;
    }
    if (pwForm.new1 !== pwForm.new2) {
      setPwMsg({ text: "Mật khẩu xác nhận không khớp", type: "error" });
      return;
    }
    try {
      await changePassword(pwForm.old, pwForm.new1);
      setPwMsg({ text: "Đổi mật khẩu thành công!", type: "success" });
      setPwForm({ old: "", new1: "", new2: "" });
    } catch {
      setPwMsg({ text: apiError || "Mật khẩu hiện tại không đúng", type: "error" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
        <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-800">Tài khoản</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside>
          {/* Profile card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-4 text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-black mx-auto mb-3">
              {user.avatar}
            </div>
            <p className="text-gray-800 font-medium">{user.fullName}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTab(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left ${
                  activeTab === tab.key ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className={activeTab === tab.key ? "text-blue-600" : "text-gray-400"}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile */}
          {activeTab === "profile" && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-900">Thông tin cá nhân</h2>
                {!editMode ? (
                  <button onClick={() => { setEditMode(true); setSaveError(""); setFormData({ ...user }); }} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm">
                    <Edit3 className="w-4 h-4" /> Chỉnh sửa
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => { setEditMode(false); setSaveError(""); }} className="px-4 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Hủy</button>
                    <button onClick={handleSave} disabled={isLoading} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-1 disabled:bg-blue-400">
                      {isLoading ? <><Loader2 className="w-3 h-3 animate-spin" /> Đang lưu...</> : saved ? "✓ Đã lưu" : "Lưu"}
                    </button>
                  </div>
                )}
              </div>
              {saveError && (
                <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {saveError}
                </div>
              )}
              {saved && (
                <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" /> Thông tin đã được cập nhật!
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { label: "Họ và tên", key: "fullName" },
                  { label: "Email", key: "email" },
                  { label: "Số điện thoại", key: "phone" },
                  { label: "Ngày sinh", key: "birthDate" },
                  { label: "Giới tính", key: "gender" },
                  { label: "Vai trò", key: "roleName", readOnly: true },
                  { label: "Hạng thành viên", key: "rank", readOnly: true },
                  { label: "Điểm tích lũy", key: "level", readOnly: true },
                  { label: "Trạng thái", key: "status", readOnly: true },
                ].map((field) => (
                  <div key={field.key} className={field.key === "fullName" || field.key === "email" ? "" : ""}>
                    <label className="text-sm text-gray-500 mb-1.5 block">{field.label}</label>
                    {editMode && !field.readOnly ? (
                      field.key === "gender" ? (
                        <select
                          value={formData.gender}
                          onChange={(e) => setFormData((f) => ({ ...f, gender: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 text-sm bg-white text-gray-800"
                        >
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                          <option value="Khác">Khác</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={(formData as any)[field.key] || ""}
                          onChange={(e) => setFormData((f) => ({ ...f, [field.key]: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 text-sm text-gray-800"
                        />
                      )
                    ) : (
                      <div className="flex items-center gap-2 text-gray-800 bg-gray-50 px-4 py-2.5 rounded-xl text-sm min-h-[42px]">
                        {(user as any)[field.key] || "---"}
                        {field.key === "roleName" && (user.roleName === 'ADMIN' || user.roleName === 'ROLE_ADMIN') && (
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">ADMIN</span>
                        )}
                        {field.key === "rank" && (
                          <Trophy className="w-3.5 h-3.5 text-yellow-600" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-500 mb-1.5 block">Địa chỉ mặc định</label>
                  <div className="text-gray-800 bg-blue-50/50 border border-blue-100 px-4 py-3 rounded-xl text-sm">
                    {user.addresses.find(a => a.isDefault) ? (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-gray-900">
                            {user.addresses.find(a => a.isDefault)?.receiverName} · {user.addresses.find(a => a.isDefault)?.phone}
                          </p>
                          <p className="text-gray-600 mt-1">
                            {user.addresses.find(a => a.isDefault)?.street}, {user.addresses.find(a => a.isDefault)?.state}, {user.addresses.find(a => a.isDefault)?.city}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="flex items-center gap-2 text-gray-500 italic">
                        <MapPin className="w-4 h-4" /> Chưa thiết lập địa chỉ mặc định
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orders */}
          {activeTab === "orders" && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-gray-900 mb-5">Đơn hàng của tôi</h2>
              {orders.length === 0 ? (
                <div className="text-center py-10">
                  <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">Bạn chưa có đơn hàng nào</p>
                  <Link to="/products" className="mt-3 inline-block text-blue-600 hover:text-blue-800 text-sm">Mua sắm ngay →</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-800">#{order.id}</p>
                          <p className="text-xs text-gray-500">{order.orderDate}</p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusLabel[order.status]?.color}`}>
                          {statusLabel[order.status]?.label}
                        </span>
                      </div>
                      <div className="flex gap-2 mb-3">
                        {order.items.slice(0, 3).map((item, i) => (
                          <img key={i} src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-xl" />
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 text-sm">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-blue-700">{formatPrice(order.total)}</p>
                        <Link
                          to={`/track-order?id=${order.id}`}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Loyalty */}
          {activeTab === "loyalty" && (
            <div className="space-y-5">
              {/* Points overview */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-blue-200 text-sm mb-1">Điểm tích lũy hiện có</p>
                    <div className="flex items-end gap-2">
                      <span className="text-5xl font-black text-yellow-400">{(user as any).level || 0}</span>
                      <span className="text-blue-200 mb-1">điểm</span>
                    </div>
                  </div>
                  <div className="bg-yellow-400 text-blue-900 rounded-2xl px-4 py-2 text-center">
                    <Star className="w-5 h-5 mx-auto mb-0.5 fill-blue-900" />
                    <p className="text-xs font-black">
                      {user.rank === 'GOLD' ? 'VIP VÀNG' : user.rank === 'SILVER' ? 'VIP BẠC' : user.rank === 'DIAMOND' ? 'VIP KIM CƯƠNG' : 'THÀNH VIÊN'}
                    </p>
                  </div>
                </div>

                {/* Rank progress */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-blue-200">Tiến độ lên hạng tiếp theo</span>
                    <span className="text-yellow-300 font-bold">{(user as any).level || 0} / 10000</span>
                  </div>
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full transition-all" style={{ width: `${Math.min(100, (((user as any).level || 0) / 10000) * 100)}%` }} />
                  </div>
                  <p className="text-blue-300 text-xs mt-1.5">
                    {((user as any).level || 0) < 10000 
                      ? <>Còn <strong className="text-yellow-300">{10000 - ((user as any).level || 0)} điểm</strong> nữa để lên hạng Vàng ⭐</>
                      : "Bạn đã đạt hạng Vàng! Tiếp tục tích lũy để lên Kim Cương 💎"}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mt-5">
                  {[
                    { label: "Tổng điểm đã tích", value: "5.200" },
                    { label: "Điểm đã dùng", value: "2.750" },
                    { label: "Điểm sắp hết hạn", value: "300" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
                      <p className="text-white font-bold">{s.value}</p>
                      <p className="text-blue-300 text-[10px] mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rank cards */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-gray-800 mb-4 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  Hệ thống hạng thành viên
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { rank: "Đồng", icon: "🥉", range: "0 - 1.000đ", color: "bg-amber-50 border-amber-200", textColor: "text-amber-700", active: user.rank === 'BRONZE' || !user.rank },
                    { rank: "Bạc", icon: "🥈", range: "1.000 - 5.000đ", color: "bg-gray-50 border-gray-300", textColor: "text-gray-600", active: user.rank === 'SILVER' },
                    { rank: "Vàng ★", icon: "🥇", range: "5.000 - 10.000đ", color: "bg-yellow-50 border-yellow-400", textColor: "text-yellow-700", active: user.rank === 'GOLD' },
                    { rank: "Kim cương", icon: "💎", range: "10.000đ+", color: "bg-blue-50 border-blue-200", textColor: "text-blue-700", active: user.rank === 'DIAMOND' },
                  ].map((r) => (
                    <div key={r.rank} className={`border-2 rounded-xl p-3 text-center ${r.color} ${r.active ? "ring-2 ring-yellow-400 ring-offset-1" : ""}`}>
                      <div className="text-2xl mb-1">{r.icon}</div>
                      <p className={`text-sm font-bold ${r.textColor}`}>{r.rank}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{r.range}</p>
                      {r.active && <span className="text-[10px] bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full mt-1 inline-block font-bold">Hạng của bạn</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rewards catalogue */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-800 flex items-center gap-2">
                    <Gift className="w-4 h-4 text-blue-600" />
                    Đổi điểm lấy quà
                  </h3>
                  <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Bạn có {(user as any).level || 0} điểm</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: <ShoppingBag className="w-6 h-6" />, name: "Voucher giảm 50.000đ", points: 500, color: "bg-green-50", iconColor: "text-green-600", available: true },
                    { icon: <Zap className="w-6 h-6" />, name: "Voucher giảm 100.000đ", points: 1000, color: "bg-blue-50", iconColor: "text-blue-600", available: true },
                    { icon: <Shirt className="w-6 h-6" />, name: "Áo thể thao SportZone", points: 2000, color: "bg-purple-50", iconColor: "text-purple-600", available: true },
                    { icon: <Coffee className="w-6 h-6" />, name: "Voucher miễn phí vận chuyển", points: 300, color: "bg-orange-50", iconColor: "text-orange-600", available: true },
                    { icon: <Trophy className="w-6 h-6" />, name: "Giày thể thao cao cấp", points: 5000, color: "bg-yellow-50", iconColor: "text-yellow-600", available: false },
                    { icon: <Gift className="w-6 h-6" />, name: "Voucher giảm 200.000đ", points: 2000, color: "bg-pink-50", iconColor: "text-pink-600", available: true },
                  ].map((reward, i) => {
                    const canRedeem = 2450 >= reward.points;
                    return (
                      <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${reward.available ? "border-gray-100" : "border-gray-100 opacity-60"} hover:border-blue-200 transition-all`}>
                        <div className={`w-12 h-12 ${reward.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <span className={reward.iconColor}>{reward.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 font-medium truncate">{reward.name}</p>
                          <p className="text-xs text-yellow-600 font-bold mt-0.5">🌟 {reward.points.toLocaleString()} điểm</p>
                        </div>
                        <button
                          disabled={!canRedeem || !reward.available}
                          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                            canRedeem && reward.available
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {canRedeem && reward.available ? "Đổi ngay" : "Chưa đủ"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* How to earn */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-gray-800 mb-4">Cách tích điểm</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { icon: "🛍️", title: "Mua hàng", desc: "1.000đ = 1 điểm. Áp dụng cho tất cả đơn hàng thành công" },
                    { icon: "⭐", title: "Đánh giá sản phẩm", desc: "Viết đánh giá có ảnh/video = +50 điểm/đánh giá" },
                    { icon: "👥", title: "Giới thiệu bạn bè", desc: "Bạn bè đặt hàng đầu tiên = +200 điểm/người" },
                  ].map((item) => (
                    <div key={item.title} className="bg-blue-50 rounded-xl p-4">
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <p className="text-sm text-gray-800 font-medium mb-1">{item.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transaction history */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-gray-800 mb-4">Lịch sử điểm thưởng</h3>
                <div className="space-y-3">
                  {[
                    { date: "14/04/2026", desc: "Mua hàng đơn #SZ20260414001", points: "+185", positive: true },
                    { date: "10/04/2026", desc: "Đổi voucher giảm 100.000đ", points: "-1.000", positive: false },
                    { date: "05/04/2026", desc: "Mua hàng đơn #SZ20260405003", points: "+590", positive: true },
                    { date: "28/03/2026", desc: "Đánh giá sản phẩm có ảnh", points: "+50", positive: true },
                    { date: "20/03/2026", desc: "Mua hàng đơn #SZ20260320002", points: "+280", positive: true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.positive ? "bg-green-100" : "bg-red-100"}`}>
                        <Star className={`w-4 h-4 ${item.positive ? "text-green-600" : "text-red-500"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate">{item.desc}</p>
                        <p className="text-xs text-gray-400">{item.date}</p>
                      </div>
                      <span className={`text-sm font-bold flex-shrink-0 ${item.positive ? "text-green-600" : "text-red-500"}`}>
                        {item.points} điểm
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Wishlist */}
          {activeTab === "wishlist" && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-gray-900 mb-5">Sản phẩm yêu thích ({wishlistProducts.length})</h2>
              {wishlistProducts.length === 0 ? (
                <div className="text-center py-10">
                  <Heart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">Chưa có sản phẩm yêu thích</p>
                  <Link to="/products" className="mt-3 inline-block text-blue-600 text-sm hover:text-blue-800">Khám phá sản phẩm →</Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {wishlistProducts.map((p) => (
                    <div key={p.id} className="border border-gray-100 rounded-2xl overflow-hidden group">
                      <div className="relative">
                        <img src={p.image} alt={p.name} className="w-full aspect-square object-cover" />
                        <button
                          onClick={() => toggleWishlist(p.id)}
                          className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="p-3">
                        <Link to={`/product/${p.id}`} className="text-xs text-gray-800 hover:text-blue-700 line-clamp-2">{p.name}</Link>
                        <p className="text-sm font-bold text-blue-700 mt-1">{formatPrice(p.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Addresses */}
          {activeTab === "addresses" && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-gray-900">Sổ địa chỉ</h2>
                <button
                  onClick={() => { setAddAddrMode(!addAddrMode); setAddrMsg(""); }}
                  className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Thêm địa chỉ
                </button>
              </div>
              {addrMsg && (
                <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${
                  addrMsg.includes("thành công") ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
                }`}>{addrMsg}</div>
              )}

              {addAddrMode && (
                <div className="bg-blue-50 rounded-xl p-4 mb-5 border border-blue-100">
                  <h4 className="text-sm text-gray-800 mb-3">Địa chỉ mới</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 mb-1 block">Họ tên người nhận</label>
                      <input
                        placeholder="Nguyễn Văn A"
                        value={newAddr.receiverName}
                        onChange={(e) => setNewAddr((a) => ({ ...a, receiverName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Điện thoại</label>
                      <input
                        placeholder="0912345678"
                        value={newAddr.phone}
                        onChange={(e) => setNewAddr((a) => ({ ...a, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Tỉnh/Thành phố</label>
                      <select
                        value={newAddr.city}
                        onChange={(e) => setNewAddr((a) => ({ ...a, city: e.target.value, state: "" }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white"
                      >
                        <option value="">Chọn Tỉnh/TP</option>
                        <option value="Hà Nội">Hà Nội</option>
                        <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                        <option value="Đà Nẵng">Đà Nẵng</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Phường/Xã</label>
                      <select
                        disabled={!newAddr.city}
                        value={newAddr.state}
                        onChange={(e) => setNewAddr((a) => ({ ...a, state: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white disabled:bg-gray-50"
                      >
                        <option value="">Chọn Phường/Xã</option>
                        {newAddr.city === "Hà Nội" && (
                          <>
                            <option value="Phường Dịch Vọng">Phường Dịch Vọng</option>
                            <option value="Phường Mỹ Đình">Phường Mỹ Đình</option>
                            <option value="Phường Hàng Đào">Phường Hàng Đào</option>
                            <option value="Phường Tràng Tiền">Phường Tràng Tiền</option>
                          </>
                        )}
                        {newAddr.city === "TP. Hồ Chí Minh" && (
                          <>
                            <option value="Phường Bến Nghé">Phường Bến Nghé</option>
                            <option value="Phường Tân Định">Phường Tân Định</option>
                            <option value="Phường Đa Kao">Phường Đa Kao</option>
                            <option value="Phường Thảo Điền">Phường Thảo Điền</option>
                          </>
                        )}
                        {newAddr.city === "Đà Nẵng" && (
                          <>
                            <option value="Phường Thạch Thang">Phường Thạch Thang</option>
                            <option value="Phường Hải Châu I">Phường Hải Châu I</option>
                            <option value="Phường Hòa Cường">Phường Hòa Cường</option>
                            <option value="Phường Phước Mỹ">Phường Phước Mỹ</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 mb-1 block">Địa chỉ cụ thể (Số nhà, tên đường...)</label>
                      <input
                        placeholder="Số nhà, tên đường"
                        value={newAddr.street}
                        onChange={(e) => setNewAddr((a) => ({ ...a, street: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 mt-3 cursor-pointer">
                    <input type="checkbox" checked={newAddr.isDefault} onChange={(e) => setNewAddr((a) => ({ ...a, isDefault: e.target.checked }))} className="accent-blue-600" />
                    <span className="text-sm text-gray-600">Đặt làm địa chỉ mặc định</span>
                  </label>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setAddAddrMode(false)} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm">Hủy</button>
                    <button onClick={handleAddAddress} disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-1 disabled:bg-blue-400">
                      {isLoading ? <><Loader2 className="w-3 h-3 animate-spin" /> Đang lưu...</> : "Lưu địa chỉ"}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {user.addresses.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <MapPin className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Chưa có địa chỉ nào</p>
                  </div>
                )}
                {user.addresses.map((addr, i) => (
                  <div key={addr.id ?? i} className={`border rounded-xl p-4 transition-colors ${
                    addr.isDefault ? "border-blue-200 bg-blue-50/30" : "border-gray-100"
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 text-sm">{addr.receiverName} · {addr.phone}</p>
                        <p className="text-sm text-gray-600 mt-1">{addr.street}, {addr.state}, {addr.city}</p>
                        {addr.isDefault && <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full mt-2 inline-block font-medium">✓ Mặc định</span>}
                      </div>
                      <div className="flex items-center gap-1 ml-3">
                        {!addr.isDefault && addr.id && (
                          <button
                            onClick={() => handleSetDefault(addr.id)}
                            title="Đặt làm mặc định"
                            className="text-xs px-2 py-1 border border-blue-300 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >Mặc định</button>
                        )}
                        {addr.id && (
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            title="Xóa địa chỉ"
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Password */}
          {activeTab === "password" && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-gray-900 mb-5">Đổi mật khẩu</h2>
              <form onSubmit={handleChangePassword} className="max-w-sm space-y-4">
                {[
                  { label: "Mật khẩu hiện tại", key: "old" },
                  { label: "Mật khẩu mới", key: "new1" },
                  { label: "Xác nhận mật khẩu mới", key: "new2" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-sm text-gray-600 mb-1.5 block">{f.label}</label>
                    <input
                      type="password"
                      value={(pwForm as any)[f.key]}
                      onChange={(e) => setPwForm((p) => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 text-sm"
                    />
                  </div>
                ))}
                {pwMsg.text && (
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm border ${
                    pwMsg.type === "success"
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}>
                    {pwMsg.type === "success" ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                    {pwMsg.text}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang cập nhật...</> : "Cập nhật mật khẩu"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
