import { Link, useParams } from "react-router";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

export function OrderSuccess() {
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-500" />
      </div>
      <h1 className="text-green-700 mb-2">Đặt hàng thành công!</h1>
      <p className="text-gray-600 mb-2">Cảm ơn bạn đã mua hàng tại SportZone</p>
      <p className="text-gray-500 text-sm mb-6">
        Mã đơn hàng: <strong className="text-blue-700">{orderId}</strong>
      </p>
      <div className="bg-blue-50 rounded-2xl p-5 mb-8 text-left">
        <p className="text-sm text-gray-600 mb-2">📱 Theo dõi đơn hàng qua:</p>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Trang <strong>Theo dõi đơn hàng</strong> trên website</li>
          <li>• Email xác nhận đã gửi đến địa chỉ của bạn</li>
          <li>• SMS thông báo khi đơn hàng được giao</li>
        </ul>
      </div>
      <div className="flex flex-col gap-3">
        <Link
          to={`/track-order?id=${orderId}`}
          className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3.5 rounded-xl transition-colors font-medium"
        >
          <Package className="w-5 h-5" />
          Theo dõi đơn hàng
        </Link>
        <Link
          to="/products"
          className="flex items-center justify-center gap-2 border-2 border-blue-200 text-blue-700 px-6 py-3.5 rounded-xl hover:bg-blue-50 transition-colors"
        >
          Tiếp tục mua sắm <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
