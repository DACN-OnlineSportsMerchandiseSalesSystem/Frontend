import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Package,
  ArrowRight,
  RefreshCw,
  Home,
  CreditCard,
  Building2,
  Calendar,
  Hash,
  ShoppingCart
} from "lucide-react";
import paymentService, { VNPayReturnResponse } from "../../services/paymentService";
import { useApp } from "../context/AppContext";

// Bảng giải mã mã phản hồi VNPay
const VNPAY_ERROR_MESSAGES: Record<string, string> = {
  "00": "Giao dịch thành công",
  "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
  "09": "Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
  "10": "Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.",
  "11": "Đã hết hạn chờ thanh toán. Xin vui lòng thực hiện lại giao dịch.",
  "12": "Thẻ/Tài khoản của khách hàng bị khóa.",
  "13": "Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin vui lòng thực hiện lại giao dịch.",
  "24": "Khách hàng đã hủy giao dịch thanh toán.",
  "51": "Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
  "65": "Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
  "75": "Ngân hàng thanh toán đang bảo trì.",
  "79": "Khách hàng nhập sai mật khẩu thanh toán quá số lần quy định.",
  "99": "Lỗi không xác định từ cổng thanh toán VNPay."
};

export function VNPayReturn() {
  const [searchParams] = useSearchParams();
  const { refreshOrders, refreshCart } = useApp();

  const [isLoading, setIsLoading] = useState(true);
  const [returnResult, setReturnResult] = useState<VNPayReturnResponse | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const hasProcessedRef = useRef(false);

  // Lấy các tham số cơ bản từ query string
  const vnp_ResponseCode = searchParams.get("vnp_ResponseCode") || "";
  const vnp_TxnRef = searchParams.get("vnp_TxnRef") || "";
  const rawOrderId = vnp_TxnRef ? vnp_TxnRef.split("_")[0] : "";
  const isSuccess = vnp_ResponseCode === "00";
  const isUserCancel = vnp_ResponseCode === "24";

  // Mã đơn hàng hiển thị an toàn (dự phòng trường hợp query string thiếu)
  const displayOrderId = rawOrderId || (returnResult?.orderId ? returnResult.orderId.split("_")[0] : "") || "---";

  useEffect(() => {
    if (hasProcessedRef.current) return;
    hasProcessedRef.current = true;

    const processReturn = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, string> = {};
        searchParams.forEach((val, key) => {
          params[key] = val;
        });

        // Gọi API backend để xử lý và ghi nhận kết quả trả về từ VNPay
        const data = await paymentService.handleVNPayReturn(params);
        setReturnResult(data);

        // Đồng bộ lại giỏ hàng và danh sách đơn hàng
        await refreshOrders();
        await refreshCart();
      } catch (err) {
        console.error("Lỗi khi xử lý phản hồi từ VNPay:", err);
      } finally {
        setIsLoading(false);
      }
    };

    processReturn();
  }, []);

  // Format tiền tệ VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  // Format ngày giờ VNPay (định dạng yyyyMMddHHmmss)
  const formatPayDate = (dateStr?: string) => {
    if (!dateStr || dateStr.length < 14) return dateStr || "N/A";
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(8, 10);
    const minute = dateStr.substring(10, 12);
    const second = dateStr.substring(12, 14);
    return `${hour}:${minute}:${second} - ${day}/${month}/${year}`;
  };

  // Thử thanh toán lại qua VNPay
  const handleRetryPayment = async () => {
    if (!displayOrderId || displayOrderId === "---" || isRetrying) return;
    setIsRetrying(true);
    try {
      const payUrl = await paymentService.createVNPayPayment(displayOrderId);
      if (payUrl) {
        window.location.href = payUrl;
      }
    } catch (err) {
      console.error("Không thể tạo lại liên kết VNPay:", err);
      alert("Không thể khởi tạo lại thanh toán VNPay. Vui lòng thử lại sau hoặc liên hệ hỗ trợ!");
    } finally {
      setIsRetrying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center max-w-md w-full">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-1">Đang xác thực thanh toán</h2>
          <p className="text-sm text-gray-500 text-center">
            Hệ thống đang kết nối với cổng VNPAY để kiểm tra trạng thái giao dịch của bạn...
          </p>
        </div>
      </div>
    );
  }

  const displayAmount = returnResult?.amount || (searchParams.get("vnp_Amount") ? Number(searchParams.get("vnp_Amount")) / 100 : 0);
  const displayBank = returnResult?.bankCode || searchParams.get("vnp_BankCode") || "VNPAY";
  const displayTransactionNo = returnResult?.transactionNo || searchParams.get("vnp_TransactionNo") || "N/A";
  const displayPayDate = returnResult?.payDate || searchParams.get("vnp_PayDate");
  const errorMessage = VNPAY_ERROR_MESSAGES[vnp_ResponseCode] || returnResult?.message || "Giao dịch không thành công";

  return (
    <div className="min-h-[75vh] py-12 px-4 bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">

        {/* Header trạng thái */}
        <div className={`p-8 text-center ${isSuccess
          ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white"
          : isUserCancel
            ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white"
            : "bg-gradient-to-br from-red-500 to-rose-600 text-white"
          }`}>
          <div className="w-20 h-20 mx-auto rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 shadow-inner">
            {isSuccess ? (
              <CheckCircle2 className="w-12 h-12 text-white" />
            ) : isUserCancel ? (
              <AlertTriangle className="w-12 h-12 text-white" />
            ) : (
              <XCircle className="w-12 h-12 text-white" />
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-black mb-2">
            {isSuccess
              ? "Thanh toán thành công!"
              : isUserCancel
                ? "Giao dịch đã bị hủy"
                : "Thanh toán thất bại"}
          </h1>

          <p className="text-white/90 text-sm md:text-base max-w-md mx-auto">
            {isSuccess
              ? "Giao dịch qua cổng VNPAY đã được ghi nhận. Đơn hàng của bạn đang được tiến hành xử lý."
              : errorMessage}
          </p>
        </div>

        {/* Thân thẻ thông tin chi tiết */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Chi tiết giao dịch VNPAY
            </h3>

            {/* Mã đơn hàng */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-gray-400" />
                Mã đơn hàng:
              </span>
              <strong className="text-gray-900 font-mono text-base">
                {displayOrderId !== "---" ? `#${displayOrderId}` : "N/A"}
              </strong>
            </div>

            {/* Số tiền thanh toán */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-gray-400" />
                Số tiền:
              </span>
              <span className="font-extrabold text-blue-600 text-lg">
                {formatCurrency(displayAmount)}
              </span>
            </div>

            {/* Ngân hàng */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-gray-400" />
                Ngân hàng thanh toán:
              </span>
              <span className="font-semibold text-gray-800 bg-white px-2.5 py-0.5 rounded-lg border border-gray-200">
                {displayBank}
              </span>
            </div>

            {/* Mã giao dịch VNPay */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-gray-400" />
                Mã giao dịch VNPAY:
              </span>
              <span className="text-gray-700 font-mono text-xs md:text-sm">
                {displayTransactionNo}
              </span>
            </div>

            {/* Thời gian */}
            {displayPayDate && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  Thời gian:
                </span>
                <span className="text-gray-700 text-xs md:text-sm">
                  {formatPayDate(displayPayDate)}
                </span>
              </div>
            )}
          </div>

          {/* Lưu ý khi thất bại */}
          {!isSuccess && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs md:text-sm leading-relaxed">
              <strong>Lưu ý:</strong> {isUserCancel
                ? "Bạn đã hủy giao dịch thanh toán. Sản phẩm vẫn được lưu giữ an toàn trong giỏ hàng để bạn tiếp tục mua sắm."
                : "Thanh toán chưa hoàn tất. Các sản phẩm vẫn được bảo lưu trong giỏ hàng và đơn hàng ở trạng thái Chờ thanh toán."}
            </div>
          )}

          {/* Các nút hành động */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {isSuccess ? (
              <>
                {displayOrderId !== "---" && (
                  <Link
                    to={`/track-order?id=${displayOrderId}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-5 rounded-2xl transition-all shadow-md shadow-blue-200"
                  >
                    <Package className="w-5 h-5" />
                    Theo dõi đơn hàng
                  </Link>
                )}
                <Link
                  to="/products"
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 px-5 rounded-2xl transition-all"
                >
                  Tiếp tục mua sắm
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            ) : isUserCancel ? (
              <>
                <Link
                  to="/cart"
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-md shadow-emerald-200"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Về giỏ hàng
                </Link>
                <Link
                  to="/account?tab=orders"
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 px-4 rounded-2xl transition-all"
                >
                  <Package className="w-5 h-5" />
                  Đơn hàng của tôi
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={handleRetryPayment}
                  disabled={isRetrying}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-md shadow-blue-200 disabled:opacity-50"
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      Thanh toán lại
                    </>
                  )}
                </button>
                <Link
                  to="/cart"
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-md shadow-emerald-200"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Về giỏ hàng
                </Link>
              </>
            )}
          </div>

          <div className="text-center pt-2">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors">
              <Home className="w-3.5 h-3.5" />
              Quay về trang chủ
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
