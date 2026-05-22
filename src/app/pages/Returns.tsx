import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  ChevronRight, RotateCcw, Package, CheckCircle, AlertTriangle,
  Loader2, Clock, XCircle, History, PlusCircle, RefreshCw
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { formatPrice } from "../data/products";
import returnService, { ReturnRequestDTO } from "../../services/returnService";

const returnReasons = [
  "Sản phẩm bị lỗi / hỏng hóc",
  "Sản phẩm không đúng mô tả",
  "Nhận sai sản phẩm / sai màu / sai size",
  "Kích cỡ không phù hợp",
  "Sản phẩm không như mong đợi",
  "Lý do khác",
];

const returnStatusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING:  { label: "Chờ xử lý", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", icon: <Clock className="w-3.5 h-3.5" /> },
  APPROVED: { label: "Đã duyệt",  color: "text-green-700",  bg: "bg-green-50 border-green-200",   icon: <CheckCircle className="w-3.5 h-3.5" /> },
  REJECTED: { label: "Từ chối",   color: "text-red-700",    bg: "bg-red-50 border-red-200",       icon: <XCircle className="w-3.5 h-3.5" /> },
};

export function Returns() {
  const { orders, refreshOrders, isLoggedIn } = useApp();
  const [activeTab, setActiveTab] = useState<"form" | "history">("form");
  const [step, setStep] = useState<"form" | "success">("form");

  // Form state
  const [orderId, setOrderId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [returnType, setReturnType] = useState<"exchange" | "refund">("exchange");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // History state
  const [myReturns, setMyReturns] = useState<ReturnRequestDTO[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState("");

  useEffect(() => {
    if (isLoggedIn) refreshOrders();
  }, [isLoggedIn]);

  const fetchMyReturns = async () => {
    setIsLoadingHistory(true);
    setHistoryError("");
    try {
      const data = await returnService.getMyReturns();
      setMyReturns(data.sort((a, b) => (b.id || 0) - (a.id || 0)));
    } catch (err: any) {
      setHistoryError("Không thể tải lịch sử yêu cầu. Vui lòng thử lại.");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && activeTab === "history") fetchMyReturns();
  }, [isLoggedIn, activeTab]);

  const deliveredOrders = orders.filter((o) => o.status === "delivered");

  const handleFindOrder = () => {
    const order = deliveredOrders.find((o) => o.id === orderId.trim());
    setSelectedOrder(order || null);
    setSelectedItems([]);
  };

  const toggleItem = (item: any, idx: number) => {
    const key = item.orderItemId ?? idx;
    const isSelected = selectedItems.find(i => (i.orderItemId ?? i._idx) === key);
    if (isSelected) {
      setSelectedItems(prev => prev.filter(i => (i.orderItemId ?? i._idx) !== key));
    } else {
      setSelectedItems(prev => [...prev, { ...item, _idx: idx }]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedOrder || !reason || selectedItems.length === 0) return;
    setIsSubmitting(true);
    try {
      const fullReason = `[${returnType === "refund" ? "Hoàn tiền" : "Đổi sản phẩm"}] ${reason}${description ? ": " + description : ""}`;
      await returnService.createReturn({
        orderId: parseInt(selectedOrder.id),
        reason: fullReason,
        items: selectedItems.map(item => ({
          orderItemId: item.orderItemId || 0,
          quantity: item.quantity || 1,
          imageProof: "",
        })),
      });
      setStep("success");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewRequest = () => {
    setStep("form");
    setOrderId("");
    setSelectedOrder(null);
    setSelectedItems([]);
    setReason("");
    setDescription("");
    setReturnType("exchange");
    setActiveTab("form");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
        <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-800">Đổi trả hàng</span>
      </div>

      <h1 className="text-gray-900 mb-2">Đổi trả hàng</h1>
      <p className="text-gray-500 text-sm mb-5">SportZone hỗ trợ đổi trả miễn phí trong vòng 30 ngày kể từ ngày nhận hàng</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-2xl">
        <button
          onClick={() => { setActiveTab("form"); setStep("form"); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "form"
              ? "bg-white text-blue-700 shadow-md"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          Tạo yêu cầu mới
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "history"
              ? "bg-white text-blue-700 shadow-md"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <History className="w-4 h-4" />
          Lịch sử đổi trả
          {myReturns.length > 0 && (
            <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{myReturns.length}</span>
          )}
        </button>
      </div>

      {/* ===== TAB: FORM ===== */}
      {activeTab === "form" && (
        <>
          {step === "success" ? (
            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-green-700 mb-2">Yêu cầu đã được ghi nhận!</h2>
              <p className="text-gray-600 text-sm mb-2">Mã đơn: <strong className="text-blue-700">#{selectedOrder?.id}</strong></p>
              <p className="text-gray-500 text-sm mb-6">Nhân viên SportZone sẽ liên hệ với bạn trong vòng 24 giờ</p>
              <div className="bg-blue-50 rounded-xl p-4 text-left mb-6">
                <p className="text-sm text-blue-700 mb-2 font-bold">📋 Quy trình xử lý:</p>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Nhân viên gọi điện xác nhận trong 24h</li>
                  <li>Bạn đóng gói sản phẩm và gửi về kho</li>
                  <li>Chúng tôi kiểm tra tình trạng hàng (1-2 ngày)</li>
                  <li>Gửi hàng đổi hoặc hoàn tiền (3-5 ngày)</li>
                </ol>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setActiveTab("history"); fetchMyReturns(); }}
                  className="flex-1 py-3 border border-blue-200 text-blue-600 rounded-xl text-sm hover:bg-blue-50 transition-colors"
                >
                  Xem lịch sử đổi trả
                </button>
                <button
                  onClick={handleNewRequest}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors"
                >
                  Tạo yêu cầu khác
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Policy banner */}
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex gap-3">
                <RotateCcw className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1 text-blue-800">Chính sách đổi trả của SportZone</p>
                  <ul className="space-y-0.5 text-blue-600">
                    <li>✓ Đổi trả trong 30 ngày kể từ ngày nhận hàng</li>
                    <li>✓ Miễn phí vận chuyển đổi trả toàn quốc</li>
                    <li>✓ Hoàn tiền nhanh chóng trong 3-5 ngày làm việc</li>
                    <li>✓ Sản phẩm cần còn nguyên tem, chưa qua sử dụng</li>
                  </ul>
                </div>
              </div>

              {/* Find order */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <h3 className="text-gray-800 mb-4 font-bold">Tìm đơn hàng cần đổi trả</h3>
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleFindOrder()}
                    placeholder="Nhập mã đơn hàng đã giao (vd: 8)"
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 text-sm"
                  />
                  <button onClick={handleFindOrder} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors font-medium">
                    Tìm kiếm
                  </button>
                </div>

                {deliveredOrders.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Đơn hàng đã giao gần đây:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {deliveredOrders.slice(0, 4).map((order) => (
                        <button
                          key={order.id}
                          onClick={() => { setOrderId(order.id); setSelectedOrder(order); setSelectedItems([]); }}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                            selectedOrder?.id === order.id ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-gray-100 hover:border-blue-200"
                          }`}
                        >
                          <Package className={`w-6 h-6 flex-shrink-0 ${selectedOrder?.id === order.id ? "text-blue-600" : "text-gray-300"}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-800">#{order.id}</p>
                            <p className="text-[10px] text-gray-500 truncate">{order.orderDate} · {formatPrice(order.total)}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {orderId && !selectedOrder && (
                  <div className="flex items-center gap-2 text-yellow-600 text-sm mt-3 bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                    <AlertTriangle className="w-4 h-4" />
                    Không tìm thấy đơn hàng hoặc đơn hàng chưa ở trạng thái "Đã giao"
                  </div>
                )}
              </div>

              {/* Select items */}
              {selectedOrder && (
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <h3 className="text-gray-800 mb-4 font-bold">Chọn sản phẩm cần đổi trả</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item: any, idx: number) => {
                      const key = item.orderItemId ?? idx;
                      const isSelected = selectedItems.some(si => (si.orderItemId ?? si._idx) === key);
                      return (
                        <label key={key} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:bg-gray-50"
                        }`}>
                          <input type="checkbox" checked={isSelected} onChange={() => toggleItem(item, idx)} className="w-4 h-4 accent-blue-600" />
                          <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-xl" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">Size: {item.size} · Màu: {item.color} · SL: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-bold text-blue-700 flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reason & submit */}
              {selectedItems.length > 0 && (
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <h3 className="text-gray-800 mb-4 font-bold">Loại yêu cầu & Lý do</h3>

                  <div className="flex gap-3 mb-6">
                    {[
                      { key: "exchange", label: "🔄 Đổi sản phẩm", desc: "Nhận sản phẩm khác thay thế" },
                      { key: "refund",   label: "💰 Hoàn tiền",    desc: "Nhận lại tiền qua ngân hàng/ví" },
                    ].map((type) => (
                      <label key={type.key} className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        returnType === type.key ? "border-blue-500 bg-blue-50 shadow-sm" : "border-gray-100 hover:border-gray-200"
                      }`}>
                        <input type="radio" name="returnType" value={type.key} checked={returnType === type.key} onChange={() => setReturnType(type.key as any)} className="hidden" />
                        <p className="text-sm font-bold text-gray-800">{type.label}</p>
                        <p className="text-[10px] text-gray-500 mt-1">{type.desc}</p>
                      </label>
                    ))}
                  </div>

                  <div className="mb-5">
                    <p className="text-sm font-bold text-gray-700 mb-3">Lý do đổi trả <span className="text-red-500">*</span></p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {returnReasons.map((r) => (
                        <label key={r} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          reason === r ? "border-blue-400 bg-blue-50" : "border-gray-100 hover:bg-gray-50"
                        }`}>
                          <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="w-4 h-4 accent-blue-600" />
                          <span className="text-xs text-gray-700">{r}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mb-5">
                    <p className="text-sm font-bold text-gray-700 mb-2">Mô tả chi tiết (tùy chọn)</p>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Vui lòng mô tả rõ hơn về lỗi sản phẩm hoặc yêu cầu..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 text-sm resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={!reason || isSubmitting}
                    className="w-full py-4 bg-blue-700 hover:bg-blue-800 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <RotateCcw className="w-5 h-5" />}
                    {isSubmitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu đổi trả ngay"}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ===== TAB: HISTORY ===== */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Danh sách yêu cầu đổi trả của bạn</p>
            <button
              onClick={fetchMyReturns}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Làm mới
            </button>
          </div>

          {isLoadingHistory ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
              <p className="text-gray-500 text-sm">Đang tải lịch sử...</p>
            </div>
          ) : historyError ? (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {historyError}
            </div>
          ) : myReturns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
              <RotateCcw className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-gray-500 text-sm mb-4">Bạn chưa có yêu cầu đổi trả nào</p>
              <button
                onClick={() => setActiveTab("form")}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors font-medium"
              >
                Tạo yêu cầu ngay
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myReturns.map((ret) => {
                const st = returnStatusConfig[ret.status || "PENDING"] || returnStatusConfig.PENDING;
                return (
                  <div key={ret.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {/* Card header */}
                    <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-blue-600">YC #{ret.id}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">Đơn #{ret.orderId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${st.bg} ${st.color}`}>
                          {st.icon}
                          {st.label}
                        </span>
                        <span className="text-xs text-gray-400">
                          {ret.createdAt ? new Date(ret.createdAt).toLocaleDateString("vi-VN") : ""}
                        </span>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="px-5 py-4 space-y-3">
                      {/* Reason */}
                      <div className="flex gap-2">
                        <span className="text-xs text-gray-400 shrink-0 mt-0.5">Lý do:</span>
                        <span className="text-xs text-gray-700">{ret.reason}</span>
                      </div>

                      {/* Items */}
                      {ret.returnItems && ret.returnItems.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-2">Sản phẩm yêu cầu hoàn ({ret.returnItems.length}):</p>
                          <div className="space-y-2">
                            {ret.returnItems.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                                {item.imageProof ? (
                                  <img src={item.imageProof} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                                    <Package className="w-4 h-4 text-gray-400" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-gray-800 truncate">{item.productName || `Sản phẩm #${item.orderItemId}`}</p>
                                  <p className="text-[10px] text-gray-500">Số lượng: {item.quantity}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Refund amount (if approved) */}
                      {ret.status === "APPROVED" && ret.refundAmount != null && ret.refundAmount > 0 && (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-xl">
                          <span className="text-xs font-semibold text-green-700">💰 Số tiền hoàn trả</span>
                          <span className="text-sm font-black text-green-700">{formatPrice(ret.refundAmount)}</span>
                        </div>
                      )}

                      {/* Rejected notice */}
                      {ret.status === "REJECTED" && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                          <XCircle className="w-4 h-4 flex-shrink-0" />
                          Yêu cầu đã bị từ chối. Vui lòng liên hệ hỗ trợ để biết thêm chi tiết.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
