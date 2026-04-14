import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { ChevronRight, CreditCard, Banknote, Smartphone, Check, MapPin, Plus } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatPrice } from "@/constants/productsData";

type Step = "address" | "payment" | "confirm";

const paymentMethods = [
  {
    id: "COD",
    label: "Thanh toán khi nhận hàng (COD)",
    desc: "Trả tiền mặt khi nhận hàng",
    icon: <Banknote className="w-5 h-5 text-green-600" />,
    color: "border-green-200 bg-green-50",
  },
  {
    id: "MoMo",
    label: "Ví MoMo",
    desc: "Thanh toán qua ví điện tử MoMo",
    icon: <Smartphone className="w-5 h-5 text-pink-600" />,
    color: "border-pink-200 bg-pink-50",
  },
  {
    id: "VNPay",
    label: "VNPay",
    desc: "Thanh toán qua cổng VNPay",
    icon: <CreditCard className="w-5 h-5 text-blue-600" />,
    color: "border-blue-200 bg-blue-50",
  },
  {
    id: "Card",
    label: "Thẻ ngân hàng / Visa / Mastercard",
    desc: "Thanh toán bằng thẻ ATM/Visa/Mastercard",
    icon: <CreditCard className="w-5 h-5 text-indigo-600" />,
    color: "border-indigo-200 bg-indigo-50",
  },
];

const provinces = ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Nha Trang", "Huế", "Đà Lạt"];

export function Checkout() {
  const { cart, cartTotal, appliedCoupon, shippingFee, discountAmount, finalTotal, user, placeOrder, clearCart, setAppliedCoupon } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("address");
  const [payment, setPayment] = useState("COD");
  const [note, setNote] = useState("");
  const [useExistingAddr, setUseExistingAddr] = useState(true);
  const [address, setAddress] = useState({
    fullName: user.fullName,
    phone: user.phone,
    province: user.addresses[0]?.province || "",
    district: user.addresses[0]?.district || "",
    ward: user.addresses[0]?.ward || "",
    street: user.addresses[0]?.street || "",
    isDefault: false,
  });

  const steps: { key: Step; label: string }[] = [
    { key: "address", label: "Địa chỉ giao hàng" },
    { key: "payment", label: "Phương thức thanh toán" },
    { key: "confirm", label: "Xác nhận đơn hàng" },
  ];

  const stepIndex = steps.findIndex((s) => s.key === step);

  const handleConfirmOrder = () => {
    const orderId = placeOrder({
      status: "pending",
      items: cart,
      subtotal: cartTotal,
      shippingFee,
      total: finalTotal,
      address,
      paymentMethod: payment,
      note,
    });
    setAppliedCoupon(null);
    clearCart();
    navigate(`/order-success/${orderId}`);
  };

  if (cart.length === 0 && step !== "confirm") {
    return (
      <div className="text-center py-20">
        <h2 className="text-gray-600 mb-4">Giỏ hàng trống</h2>
        <Link to="/products" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
          Mua sắm ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
        <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/cart" className="hover:text-blue-600">Giỏ hàng</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-800">Thanh toán</span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8 max-w-lg mx-auto">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2 flex-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                i < stepIndex ? "bg-green-500 text-white" :
                i === stepIndex ? "bg-blue-600 text-white" :
                "bg-gray-200 text-gray-400"
              }`}>
                {i < stepIndex ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs text-center leading-tight ${i === stepIndex ? "text-blue-700 font-medium" : "text-gray-400"}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mb-5 ${i < stepIndex ? "bg-green-400" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2">
          {/* Step 1: Address */}
          {step === "address" && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-gray-900 mb-5 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Địa chỉ giao hàng
              </h2>

              {user.addresses.length > 0 && (
                <div className="mb-5">
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={() => setUseExistingAddr(true)}
                      className={`px-4 py-2 rounded-xl text-sm border-2 transition-colors ${useExistingAddr ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600"}`}
                    >
                      Địa chỉ đã lưu
                    </button>
                    <button
                      onClick={() => setUseExistingAddr(false)}
                      className={`px-4 py-2 rounded-xl text-sm border-2 transition-colors ${!useExistingAddr ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600"}`}
                    >
                      <Plus className="w-4 h-4 inline mr-1" />
                      Địa chỉ mới
                    </button>
                  </div>
                  {useExistingAddr && (
                    <div className="space-y-3">
                      {user.addresses.map((addr, i) => (
                        <label key={i} className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors border-blue-200 bg-blue-50">
                          <input type="radio" name="addr" defaultChecked={addr.isDefault} className="mt-1" />
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{addr.fullName} · {addr.phone}</p>
                            <p className="text-sm text-gray-600">{addr.street}, {addr.ward}, {addr.district}, {addr.province}</p>
                            {addr.isDefault && <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full mt-1 inline-block">Mặc định</span>}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {(!useExistingAddr || user.addresses.length === 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Họ và tên", key: "fullName", placeholder: "Nguyễn Văn A" },
                    { label: "Số điện thoại", key: "phone", placeholder: "0912345678" },
                    { label: "Địa chỉ cụ thể", key: "street", placeholder: "Số nhà, tên đường" },
                  ].map((field) => (
                    <div key={field.key} className={field.key === "street" ? "md:col-span-2" : ""}>
                      <label className="text-sm text-gray-600 mb-1.5 block">{field.label} <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        value={(address as any)[field.key]}
                        onChange={(e) => setAddress((a) => ({ ...a, [field.key]: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 text-sm"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-sm text-gray-600 mb-1.5 block">Tỉnh / Thành phố <span className="text-red-500">*</span></label>
                    <select
                      value={address.province}
                      onChange={(e) => setAddress((a) => ({ ...a, province: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 text-sm bg-white"
                    >
                      <option value="">Chọn tỉnh/thành</option>
                      {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1.5 block">Quận / Huyện <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Quận 1"
                      value={address.district}
                      onChange={(e) => setAddress((a) => ({ ...a, district: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1.5 block">Phường / Xã <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Phường Bến Nghé"
                      value={address.ward}
                      onChange={(e) => setAddress((a) => ({ ...a, ward: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="mt-4">
                <label className="text-sm text-gray-600 mb-1.5 block">Ghi chú đơn hàng</label>
                <textarea
                  placeholder="Ghi chú giao hàng, yêu cầu đặc biệt..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 text-sm resize-none"
                />
              </div>

              <button
                onClick={() => setStep("payment")}
                className="mt-5 w-full py-3.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
              >
                Tiếp tục <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === "payment" && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-gray-900 mb-5">Phương thức thanh toán</h2>
              <div className="space-y-3 mb-6">
                {paymentMethods.map((pm) => (
                  <label key={pm.id} className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors ${payment === pm.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <input
                      type="radio"
                      name="payment"
                      value={pm.id}
                      checked={payment === pm.id}
                      onChange={() => setPayment(pm.id)}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${pm.color}`}>
                      {pm.icon}
                    </div>
                    <div>
                      <p className="text-sm text-gray-800 font-medium">{pm.label}</p>
                      <p className="text-xs text-gray-500">{pm.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              {payment === "Card" && (
                <div className="p-4 bg-indigo-50 rounded-xl mb-5 border border-indigo-100">
                  <p className="text-sm text-indigo-700 mb-3">Thông tin thẻ</p>
                  <div className="space-y-3">
                    <input placeholder="Số thẻ" className="w-full px-4 py-2.5 border border-indigo-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 bg-white" />
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="MM/YY" className="px-4 py-2.5 border border-indigo-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 bg-white" />
                      <input placeholder="CVV" className="px-4 py-2.5 border border-indigo-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 bg-white" />
                    </div>
                    <input placeholder="Tên chủ thẻ" className="w-full px-4 py-2.5 border border-indigo-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 bg-white" />
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setStep("address")} className="px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
                  Quay lại
                </button>
                <button onClick={() => setStep("confirm")} className="flex-1 py-3.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
                  Xem lại đơn hàng <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === "confirm" && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-gray-900 mb-5">Xác nhận đơn hàng</h2>
              {/* Address summary */}
              <div className="p-4 bg-gray-50 rounded-xl mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Địa chỉ giao hàng</p>
                <p className="text-sm font-medium text-gray-800">{address.fullName} · {address.phone}</p>
                <p className="text-sm text-gray-600">{address.street}, {address.ward}, {address.district}, {address.province}</p>
              </div>
              {/* Payment summary */}
              <div className="p-4 bg-gray-50 rounded-xl mb-5">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Phương thức thanh toán</p>
                <p className="text-sm font-medium text-gray-800">{paymentMethods.find((m) => m.id === payment)?.label}</p>
              </div>
              {/* Items */}
              <div className="space-y-3 mb-5">
                {cart.map((item) => (
                  <div key={`${item.productId}-${item.size}-${item.color}`} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-xl" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">Size: {item.size} · {item.color} · x{item.quantity}</p>
                    </div>
                    <p className="text-sm text-blue-700 font-medium flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              {note && (
                <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-xl mb-4">
                  📝 Ghi chú: {note}
                </p>
              )}
              <div className="flex gap-3">
                <button onClick={() => setStep("payment")} className="px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
                  Quay lại
                </button>
                <button
                  onClick={handleConfirmOrder}
                  className="flex-1 py-3.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-200"
                >
                  <Check className="w-5 h-5" /> Đặt hàng ngay
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 h-fit sticky top-24">
          <h3 className="text-gray-800 mb-4">Đơn hàng của bạn</h3>
          <div className="space-y-3 mb-4">
            {cart.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3">
                <div className="relative">
                  <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.size}</p>
                </div>
                <p className="text-sm font-medium text-gray-800">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Tạm tính</span><span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Phí ship</span>
              <span className={shippingFee === 0 ? "text-green-600" : ""}>{shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}</span>
            </div>
            {appliedCoupon && appliedCoupon.type !== "shipping" && discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Khuyến mãi ({appliedCoupon.code})</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            {appliedCoupon && appliedCoupon.type === "shipping" && shippingFee > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Khuyến mãi ({appliedCoupon.code})</span>
                <span>-{formatPrice(shippingFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-800 font-bold pt-2 border-t border-gray-100">
              <span>Tổng cộng</span>
              <span className="text-blue-700 text-lg">{formatPrice(finalTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
