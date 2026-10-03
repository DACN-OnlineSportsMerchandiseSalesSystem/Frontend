import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate, useLocation } from "react-router";
import { User, Package, Heart, MapPin, Lock, ChevronRight, Edit3, Plus, Trash2, Eye, Gift, Star, Zap, Coffee, ShoppingBag, Shirt, Trophy, Loader2, CheckCircle, AlertCircle, Star as StarDefault, ShoppingCart } from "lucide-react";
import { useApp, Address } from "../context/AppContext";
import { getMyInterestsAPI, updateInterestsAPI } from "../../services/userService";
import { products, formatPrice } from "../data/products";
import wishlistService from "../../services/wishlistService";
import { optimizeImage } from "@/utils/imageOptimizer";

const tabs = [
  { key: "profile", label: "Thông tin cá nhân", icon: <User className="w-4 h-4" /> },
  { key: "orders", label: "Đơn hàng của tôi", icon: <Package className="w-4 h-4" /> },
  { key: "loyalty", label: "Tích điểm đổi quà", icon: <Gift className="w-4 h-4" /> },
  { key: "wishlist", label: "Yêu thích", icon: <Heart className="w-4 h-4" /> },
  { key: "interests", label: "Sở thích", icon: <Zap className="w-4 h-4" /> },
  { key: "addresses", label: "Địa chỉ", icon: <MapPin className="w-4 h-4" /> },
  { key: "password", label: "Đổi mật khẩu", icon: <Lock className="w-4 h-4" /> },
];

const POPULAR_CITIES = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "Bình Dương",
  "Đồng Nai",
  "Quảng Ninh",
  "Khánh Hòa",
  "Thừa Thiên Huế",
];

const statusLabel: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ xác nhận", color: "text-yellow-600 bg-yellow-50" },
  confirmed: { label: "Đã xác nhận", color: "text-blue-600 bg-blue-50" },
  shipping: { label: "Đang giao", color: "text-indigo-600 bg-indigo-50" },
  delivered: { label: "Đã giao", color: "text-green-600 bg-green-50" },
  cancelled: { label: "Đã hủy", color: "text-red-600 bg-red-50" },
  canceled: { label: "Đã hủy", color: "text-red-600 bg-red-50" },
  return_requested: { label: "Đổi trả", color: "text-orange-600 bg-orange-50" },
  refunded: { label: "Đã hoàn tiền", color: "text-purple-600 bg-purple-50" },
  returned: { label: "Đã hoàn trả", color: "text-gray-600 bg-gray-50" },
};

export function Account() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = searchParams.get("tab") || "profile";
  const { user, updateUser, addAddress, updateAddress, setDefaultAddress, deleteAddress, changePassword, orders, wishlist, toggleWishlist, isLoading, apiError, categories, isLoggedIn, isAdmin, addToCart, allCarts } = useApp();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: location }, replace: true });
    }
  }, [isLoggedIn, navigate, location]);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ ...user });
  const [addAddrMode, setAddAddrMode] = useState(false);
  const [editingAddr, setEditingAddr] = useState<Address | null>(null);
  const [newAddr, setNewAddr] = useState<Address>({ receiverName: "", phone: "", city: "", state: "", street: "", isDefault: false });
  const [pwForm, setPwForm] = useState({ old: "", new1: "", new2: "" });
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [pwMsg, setPwMsg] = useState({ text: "", type: "" as "success" | "error" | "" });
  const [addrMsg, setAddrMsg] = useState("");

  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [selectedCartIds, setSelectedCartIds] = useState<Record<string, number | "">>({});
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const [selectedProducts, setSelectedProducts] = useState<Record<string, boolean>>({});
  const [bulkCartId, setBulkCartId] = useState<number | "">("");
  const [isBulkAdding, setIsBulkAdding] = useState(false);

useEffect(() => {
  if (activeTab === "wishlist") {
    if (isLoggedIn) {
      wishlistService.getWishlist()
        .then((data) => {
          setWishlistProducts(data);
        })
        .catch((err) => {
          console.error("Failed to fetch wishlist products", err);
        });
    } else {
      const guestWishlist = products.filter((p) => wishlist.includes(p.id.toString()));
      setWishlistProducts(guestWishlist);
    }
  }
}, [activeTab, isLoggedIn]);

useEffect(() => {
  setWishlistProducts((prev) => prev.filter((p) => wishlist.includes(p.id.toString())));
}, [wishlist]);

  const handleBulkAddToCart = async () => {
    if (isAdmin) {
      alert("Tài khoản Quản trị viên (Admin) không thể mua hàng!");
      return;
    }
    const selectedIds = Object.keys(selectedProducts).filter(id => selectedProducts[id]);
    if (selectedIds.length === 0) return;

    setIsBulkAdding(true);
    try {
      const itemsToAdd = wishlistProducts.filter(p => selectedIds.includes(p.id.toString()));
      for (const p of itemsToAdd) {
        const firstVariantId = p.variants?.[0]?.id?.toString() || p.id.toString();
        const size = p.variants?.[0]?.size || p.sizes?.[0] || "";
        const color = p.variants?.[0]?.color || p.colors?.[0]?.name || "";
        const image = p.image || p.images?.[0]?.imageUrl || "https://placehold.co/400x400?text=No+Image";

        await addToCart({
          productId: firstVariantId,
          name: p.name,
          price: p.price,
          image: image,
          quantity: 1,
          size: size,
          color: color,
          brand: p.brand || p.brandName || "",
        }, bulkCartId === "" ? undefined : bulkCartId);
      }
      setSelectedProducts({});
      alert("Đã thêm các sản phẩm chọn lọc vào giỏ hàng thành công!");
    } catch (err) {
      console.error("Bulk add failed", err);
      alert("Thêm sản phẩm hàng loạt thất bại!");
    } finally {
      setIsBulkAdding(false);
    }
  };

  const handleBulkRemove = async () => {
    const selectedIds = Object.keys(selectedProducts).filter(id => selectedProducts[id]);
    if (selectedIds.length === 0) return;

    if (window.confirm(`Bạn có chắc chắn muốn bỏ yêu thích ${selectedIds.length} sản phẩm đã chọn?`)) {
      try {
        for (const id of selectedIds) {
          await toggleWishlist(id);
        }
        setSelectedProducts({});
      } catch (err) {
        console.error("Bulk remove failed", err);
      }
    }
  };

  const setTab = (tab: string) => {
    const p = new URLSearchParams(searchParams);
    p.set("tab", tab);
    setSearchParams(p);
  };

  // State for Interests
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [isFetchingInterests, setIsFetchingInterests] = useState(false);
  const [interestMsg, setInterestMsg] = useState({ text: "", type: "" });

  useEffect(() => {
    if (activeTab === "interests") {
      setIsFetchingInterests(true);
      getMyInterestsAPI()
        .then((data) => setSelectedInterests(data.map(d => d.id)))
        .catch(() => {})
        .finally(() => setIsFetchingInterests(false));
    }
  }, [activeTab]);

  const handleSaveInterests = async () => {
    setInterestMsg({ text: "", type: "" });
    try {
      await updateInterestsAPI(selectedInterests);
      setInterestMsg({ text: "Lưu sở thích thành công!", type: "success" });
      setTimeout(() => setInterestMsg({ text: "", type: "" }), 2500);
    } catch {
      setInterestMsg({ text: "Lưu sở thích thất bại", type: "error" });
    }
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

  const handleUpdateAddress = async () => {
    if (!editingAddr || !editingAddr.id) return;
    if (!editingAddr.receiverName.trim() || !editingAddr.phone.trim() || !editingAddr.street.trim() || !editingAddr.city.trim()) {
      setAddrMsg("Vui lòng điền đầy đủ các thông tin địa chỉ!");
      return;
    }
    setAddrMsg("");
    try {
      await updateAddress(editingAddr.id, editingAddr);
      setEditingAddr(null);
      setAddrMsg("Cập nhật địa chỉ thành công!");
      setTimeout(() => setAddrMsg(""), 2500);
    } catch {
      setAddrMsg(apiError || "Cập nhật địa chỉ thất bại");
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

  if (!isLoggedIn) {
    return null;
  }

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
                <span className={activeTab === tab.key ? "text-blue-600" : "text-gray-500"}>{tab.icon}</span>
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
                        {field.key === "roleName" && (user.roleName === 'ADMIN' || user.roleName === 'ROLE_ADMIN' || user.roleName === 'IT_ADMIN' || user.roleName === 'ROLE_IT_ADMIN') && (
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm text-gray-500 block">Địa chỉ mặc định</label>
                    <button
                      type="button"
                      onClick={() => {
                        const def = user.addresses.find(a => a.isDefault) || user.addresses[0];
                        if (def) {
                          setEditingAddr({ ...def });
                          setAddAddrMode(false);
                        } else {
                          setAddAddrMode(true);
                          setEditingAddr(null);
                        }
                        setSearchParams({ tab: "addresses" });
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      {user.addresses.length > 0 ? "Chỉnh sửa / Quản lý địa chỉ" : "Thêm địa chỉ"}
                    </button>
                  </div>
                  <div className="text-gray-800 bg-blue-50/50 border border-blue-100 px-4 py-3 rounded-xl text-sm">
                    {user.addresses.find(a => a.isDefault) ? (
                      <div className="flex items-start justify-between gap-3">
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
                        <button
                          type="button"
                          onClick={() => {
                            const def = user.addresses.find(a => a.isDefault) || user.addresses[0];
                            if (def) {
                              setEditingAddr({ ...def });
                              setAddAddrMode(false);
                              setSearchParams({ tab: "addresses" });
                            }
                          }}
                          className="px-2.5 py-1 text-xs bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors flex items-center gap-1 flex-shrink-0 shadow-sm cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" /> Sửa
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="flex items-center gap-2 text-gray-500 italic">
                          <MapPin className="w-4 h-4" /> Chưa thiết lập địa chỉ mặc định
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setAddAddrMode(true);
                            setEditingAddr(null);
                            setSearchParams({ tab: "addresses" });
                          }}
                          className="px-2.5 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center gap-1 flex-shrink-0 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Thêm địa chỉ
                        </button>
                      </div>
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
                  {orders.map((order) => {
                    const st = (order.status || "").toLowerCase();
                    const isRefunded = st === "refunded" || st === "returned";
                    const isCanceled = st === "cancelled" || st === "canceled";
                    const isExcluded = isRefunded || isCanceled;
                    const badgeInfo = statusLabel[st] || { label: order.status, color: "text-gray-600 bg-gray-50" };

                    return (
                      <div 
                        key={order.id} 
                        className={`rounded-xl p-4 transition-all border ${
                          isRefunded 
                            ? "bg-purple-50/30 border-purple-200" 
                            : isCanceled 
                            ? "bg-gray-50/80 border-gray-200 opacity-75" 
                            : "border-gray-100 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-800">#{order.id}</p>
                            <span className="text-xs text-gray-500">· {order.orderDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isRefunded && (
                              <span className="text-[10px] text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md font-semibold">
                                Không tính chi tiêu
                              </span>
                            )}
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badgeInfo.color}`}>
                              {badgeInfo.label}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 mb-3">
                          {order.items.slice(0, 3).map((item, i) => (
                            <img loading="lazy" decoding="async" key={i} src={optimizeImage(item.image)} alt={item.name} className={`w-14 h-14 object-cover rounded-xl ${isExcluded ? "opacity-75 grayscale-[0.3]" : ""}`} />
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 text-sm">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            {isExcluded ? (
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-gray-400 line-through">{formatPrice(order.total)}</p>
                                <span className="text-xs text-purple-600 font-semibold">{isRefunded ? "(Đã hoàn tiền)" : "(Đã hủy)"}</span>
                              </div>
                            ) : (
                              <p className="text-sm font-bold text-blue-700">{formatPrice(order.total)}</p>
                            )}
                          </div>
                          <Link
                            to={`/track-order?id=${order.id}`}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> Xem chi tiết
                          </Link>
                        </div>
                      </div>
                    );
                  })}
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
                              : "bg-gray-100 text-gray-500 cursor-not-allowed"
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
                        <p className="text-xs text-gray-500">{item.date}</p>
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
                <>
                  {/* Select All and Bulk Actions Bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 mb-5 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="selectAllWishlist"
                        checked={wishlistProducts.length > 0 && wishlistProducts.every((p) => selectedProducts[p.id])}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const updated: Record<string, boolean> = {};
                          wishlistProducts.forEach((p) => {
                            updated[p.id] = checked;
                          });
                          setSelectedProducts(updated);
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                      />
                      <label htmlFor="selectAllWishlist" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">
                        Chọn tất cả ({wishlistProducts.length})
                      </label>
                    </div>

                    {Object.values(selectedProducts).filter(Boolean).length > 0 && (
                      <div className="flex flex-wrap items-center gap-2.5 bg-blue-50/50 border border-blue-100 rounded-xl p-2 md:p-1.5 md:pl-3">
                        <span className="text-xs text-blue-800 font-semibold">
                          Đã chọn {Object.values(selectedProducts).filter(Boolean).length} sản phẩm:
                        </span>
                        {isLoggedIn && allCarts && allCarts.length > 1 && (
                          <select
                            value={bulkCartId}
                            onChange={(e) => setBulkCartId(e.target.value === "" ? "" : Number(e.target.value))}
                            className="text-[11px] border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 cursor-pointer font-medium focus:outline-none focus:border-blue-400"
                          >
                            <option value="">Giỏ chính (Mặc định)</option>
                            {allCarts.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name || `Giỏ hàng #${c.id}`}
                              </option>
                            ))}
                          </select>
                        )}
                        {!isAdmin && (
                          <button
                            onClick={handleBulkAddToCart}
                            disabled={isBulkAdding}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors shadow-sm disabled:bg-blue-400"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            {isBulkAdding ? "Đang thêm..." : "Thêm vào giỏ"}
                          </button>
                        )}
                        <button
                          onClick={handleBulkRemove}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors border border-red-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Xóa đã chọn
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {wishlistProducts.map((p) => (
                      <div key={p.id} className="border border-gray-100 rounded-2xl overflow-hidden group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={!!selectedProducts[p.id]}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => {
                              setSelectedProducts((prev) => ({ ...prev, [p.id]: !prev[p.id] }));
                            }}
                            className="absolute top-2.5 left-2.5 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600 shadow-sm z-10"
                          />
                          <img
                            loading="lazy"
                            decoding="async"
                            src={optimizeImage(p.image || p.images?.[0]?.imageUrl || "https://placehold.co/400x400?text=No+Image")}
                            alt={p.name}
                            className="w-full aspect-square object-cover"
                          />
                          <button
                            onClick={() => toggleWishlist(p.id)}
                            className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      <div className="p-3">
                        <Link to={`/product/${p.id}`} className="text-xs text-gray-800 hover:text-blue-700 line-clamp-2 min-h-[32px]">{p.name}</Link>
                        <p className="text-sm font-bold text-blue-700 mt-1">{formatPrice(p.price)}</p>

                        {/* Cart selection and Add to Cart button - Only for customer / guest */}
                        {!isAdmin && (
                          <div className="mt-2.5 flex flex-col gap-1.5">
                            {isLoggedIn && allCarts && allCarts.length > 1 && (
                              <select
                                value={selectedCartIds[p.id] || ""}
                                onChange={(e) => {
                                  const val = e.target.value === "" ? "" : Number(e.target.value);
                                  setSelectedCartIds((prev) => ({ ...prev, [p.id]: val }));
                                }}
                                className="w-full text-[11px] border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-400 bg-white text-gray-700 cursor-pointer font-medium"
                              >
                                <option value="">Giỏ chính (Mặc định)</option>
                                {allCarts.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name || `Giỏ hàng #${c.id}`}
                                  </option>
                                ))}
                              </select>
                            )}
                            <button
                              onClick={() => {
                                const firstVariantId = p.variants?.[0]?.id?.toString() || p.id.toString();
                                const size = p.variants?.[0]?.size || p.sizes?.[0] || "";
                                const color = p.variants?.[0]?.color || p.colors?.[0]?.name || "";
                                const image = p.image || p.images?.[0]?.imageUrl || "https://placehold.co/400x400?text=No+Image";

                                addToCart({
                                  productId: firstVariantId,
                                  name: p.name,
                                  price: p.price,
                                  image: image,
                                  quantity: 1,
                                  size: size,
                                  color: color,
                                  brand: p.brand || p.brandName || "",
                                }, selectedCartIds[p.id] || undefined);

                                setAddedItems((prev) => ({ ...prev, [p.id]: true }));
                                setTimeout(() => {
                                  setAddedItems((prev) => ({ ...prev, [p.id]: false }));
                                }, 2000);
                              }}
                              className={`w-full py-1.5 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors ${
                                addedItems[p.id] ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
                              }`}
                            >
                              {addedItems[p.id] ? (
                                <>
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  Đã thêm!
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="w-3.5 h-3.5" />
                                  Thêm vào giỏ
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

          {/* Interests */}
          {activeTab === "interests" && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3">
                <div>
                  <h2 className="text-gray-900">Sở thích & Đam mê</h2>
                  <p className="text-sm text-gray-500 mt-1">Chọn các danh mục thể thao bạn quan tâm để SportZone đưa ra gợi ý sản phẩm phù hợp nhất!</p>
                </div>
                <button
                  onClick={handleSaveInterests}
                  className="flex-shrink-0 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1 shadow-md shadow-blue-200"
                >
                  Lưu thay đổi
                </button>
              </div>

              {interestMsg.text && (
                <div className={`mb-5 flex items-center gap-2 px-4 py-3 rounded-xl text-sm border ${
                  interestMsg.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
                }`}>
                  {interestMsg.type === "success" ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                  {interestMsg.text}
                </div>
              )}

              {isFetchingInterests ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                  <p className="text-gray-500">Đang tải dữ liệu...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categories.filter(c => !c.parentId).map((cat) => {
                    const isSelected = selectedInterests.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedInterests(prev => 
                            prev.includes(cat.id) ? prev.filter(id => id !== cat.id) : [...prev, cat.id]
                          );
                        }}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 text-center relative overflow-hidden group ${
                          isSelected 
                            ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100/50" 
                            : "border-gray-100 hover:border-blue-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                          isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                        }`}>
                          <StarDefault className="w-5 h-5" />
                        </div>
                        <span className={`text-sm font-bold ${isSelected ? "text-blue-800" : "text-gray-700"}`}>
                          {cat.name}
                        </span>
                        
                        {/* Checkmark in corner */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white p-0.5 rounded-full">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
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
                  onClick={() => { 
                    setAddAddrMode(!addAddrMode); 
                    setEditingAddr(null);
                    setAddrMsg(""); 
                  }}
                  className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Thêm địa chỉ
                </button>
              </div>
              {addrMsg && (
                <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${
                  addrMsg.includes("thành công") ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
                }`}>{addrMsg}</div>
              )}

              {/* Form chỉnh sửa địa chỉ */}
              {editingAddr && (
                <div className="bg-amber-50/70 rounded-xl p-4 mb-5 border border-amber-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-amber-900 flex items-center gap-1.5">
                      <Edit3 className="w-4 h-4 text-amber-600" /> Chỉnh sửa địa chỉ
                    </h4>
                    <button
                      type="button"
                      onClick={() => setEditingAddr(null)}
                      className="text-gray-400 hover:text-gray-600 text-xs p-1 rounded-lg cursor-pointer"
                    >
                      ✕ Đóng
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 mb-1 block">Họ tên người nhận <span className="text-red-500">*</span></label>
                      <input
                        placeholder="Nguyễn Văn A"
                        value={editingAddr.receiverName}
                        onChange={(e) => setEditingAddr((a) => a ? ({ ...a, receiverName: e.target.value }) : null)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Điện thoại <span className="text-red-500">*</span></label>
                      <input
                        placeholder="0912345678"
                        value={editingAddr.phone}
                        onChange={(e) => setEditingAddr((a) => a ? ({ ...a, phone: e.target.value }) : null)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Tỉnh/Thành phố <span className="text-red-500">*</span></label>
                      <select
                        value={editingAddr.city}
                        onChange={(e) => setEditingAddr((a) => a ? ({ ...a, city: e.target.value, state: "" }) : null)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white"
                      >
                        <option value="">Chọn Tỉnh/TP</option>
                        {POPULAR_CITIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                        {editingAddr.city && !POPULAR_CITIES.includes(editingAddr.city) && (
                          <option value={editingAddr.city}>{editingAddr.city}</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Phường/Xã / Quận <span className="text-red-500">*</span></label>
                      {["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng"].includes(editingAddr.city) ? (
                        <select
                          disabled={!editingAddr.city}
                          value={editingAddr.state}
                          onChange={(e) => setEditingAddr((a) => a ? ({ ...a, state: e.target.value }) : null)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white disabled:bg-gray-50"
                        >
                          <option value="">Chọn Phường/Xã</option>
                          {editingAddr.city === "Hà Nội" && (
                            <>
                              <option value="Phường Dịch Vọng">Phường Dịch Vọng</option>
                              <option value="Phường Mỹ Đình">Phường Mỹ Đình</option>
                              <option value="Phường Hàng Đào">Phường Hàng Đào</option>
                              <option value="Phường Tràng Tiền">Phường Tràng Tiền</option>
                            </>
                          )}
                          {editingAddr.city === "TP. Hồ Chí Minh" && (
                            <>
                              <option value="Phường Bến Nghé">Phường Bến Nghé</option>
                              <option value="Phường Tân Định">Phường Tân Định</option>
                              <option value="Phường Đa Kao">Phường Đa Kao</option>
                              <option value="Phường Thảo Điền">Phường Thảo Điền</option>
                            </>
                          )}
                          {editingAddr.city === "Đà Nẵng" && (
                            <>
                              <option value="Phường Thạch Thang">Phường Thạch Thang</option>
                              <option value="Phường Hải Châu I">Phường Hải Châu I</option>
                              <option value="Phường Hòa Cường">Phường Hòa Cường</option>
                              <option value="Phường Phước Mỹ">Phường Phước Mỹ</option>
                            </>
                          )}
                          {editingAddr.state && ![
                            "Phường Dịch Vọng", "Phường Mỹ Đình", "Phường Hàng Đào", "Phường Tràng Tiền",
                            "Phường Bến Nghé", "Phường Tân Định", "Phường Đa Kao", "Phường Thảo Điền",
                            "Phường Thạch Thang", "Phường Hải Châu I", "Phường Hòa Cường", "Phường Phước Mỹ"
                          ].includes(editingAddr.state) && (
                            <option value={editingAddr.state}>{editingAddr.state}</option>
                          )}
                        </select>
                      ) : (
                        <input
                          placeholder="Phường / Xã / Thị trấn"
                          value={editingAddr.state}
                          onChange={(e) => setEditingAddr((a) => a ? ({ ...a, state: e.target.value }) : null)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white"
                        />
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 mb-1 block">Địa chỉ cụ thể (Số nhà, tên đường...) <span className="text-red-500">*</span></label>
                      <input
                        placeholder="Số nhà, tên đường"
                        value={editingAddr.street}
                        onChange={(e) => setEditingAddr((a) => a ? ({ ...a, street: e.target.value }) : null)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 mt-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingAddr.isDefault}
                      onChange={(e) => setEditingAddr((a) => a ? ({ ...a, isDefault: e.target.checked }) : null)}
                      className="accent-blue-600"
                    />
                    <span className="text-sm text-gray-600">Đặt làm địa chỉ mặc định</span>
                  </label>
                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => setEditingAddr(null)}
                      className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdateAddress}
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-1 disabled:bg-blue-400 cursor-pointer"
                    >
                      {isLoading ? <><Loader2 className="w-3 h-3 animate-spin" /> Đang lưu...</> : "Lưu thay đổi"}
                    </button>
                  </div>
                </div>
              )}

              {/* Form thêm địa chỉ mới */}
              {addAddrMode && (
                <div className="bg-blue-50 rounded-xl p-4 mb-5 border border-blue-100">
                  <h4 className="text-sm text-gray-800 mb-3">Địa chỉ mới</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 mb-1 block">Họ tên người nhận <span className="text-red-500">*</span></label>
                      <input
                        placeholder="Nguyễn Văn A"
                        value={newAddr.receiverName}
                        onChange={(e) => setNewAddr((a) => ({ ...a, receiverName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Điện thoại <span className="text-red-500">*</span></label>
                      <input
                        placeholder="0912345678"
                        value={newAddr.phone}
                        onChange={(e) => setNewAddr((a) => ({ ...a, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Tỉnh/Thành phố <span className="text-red-500">*</span></label>
                      <select
                        value={newAddr.city}
                        onChange={(e) => setNewAddr((a) => ({ ...a, city: e.target.value, state: "" }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white"
                      >
                        <option value="">Chọn Tỉnh/TP</option>
                        {POPULAR_CITIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Phường/Xã / Quận <span className="text-red-500">*</span></label>
                      {["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng"].includes(newAddr.city) ? (
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
                      ) : (
                        <input
                          disabled={!newAddr.city}
                          placeholder="Phường / Xã / Thị trấn"
                          value={newAddr.state}
                          onChange={(e) => setNewAddr((a) => ({ ...a, state: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white disabled:bg-gray-50"
                        />
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 mb-1 block">Địa chỉ cụ thể (Số nhà, tên đường...) <span className="text-red-500">*</span></label>
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
                    <button onClick={() => setAddAddrMode(false)} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm cursor-pointer">Hủy</button>
                    <button onClick={handleAddAddress} disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-1 disabled:bg-blue-400 cursor-pointer">
                      {isLoading ? <><Loader2 className="w-3 h-3 animate-spin" /> Đang lưu...</> : "Lưu địa chỉ"}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {user.addresses.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
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
                      <div className="flex items-center gap-1.5 ml-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAddr({ ...addr });
                            setAddAddrMode(false);
                            setAddrMsg("");
                          }}
                          title="Chỉnh sửa địa chỉ"
                          className="text-xs px-2.5 py-1.5 border border-blue-200 hover:border-blue-400 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 font-medium cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Sửa
                        </button>
                        {!addr.isDefault && addr.id && (
                          <button
                            type="button"
                            onClick={() => handleSetDefault(addr.id)}
                            title="Đặt làm mặc định"
                            className="text-xs px-2.5 py-1.5 border border-gray-200 hover:border-blue-300 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >Mặc định</button>
                        )}
                        {addr.id && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            title="Xóa địa chỉ"
                            className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
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
