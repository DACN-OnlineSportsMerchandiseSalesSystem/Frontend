import { Link } from "react-router";
import { Home, ArrowLeft } from "lucide-react";

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="text-8xl mb-4">🏃</div>
      <h1 className="text-blue-700 mb-2">404</h1>
      <h2 className="text-gray-700 mb-3">Trang không tìm thấy</h2>
      <p className="text-gray-500 mb-8 max-w-sm">Trang bạn tìm kiếm đã được chạy mất rồi! Hãy quay lại trang chủ nhé.</p>
      <div className="flex gap-3">
        <Link to="/" className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl transition-colors">
          <Home className="w-4 h-4" /> Về trang chủ
        </Link>
        <button onClick={() => history.back()} className="flex items-center gap-2 border-2 border-gray-200 text-gray-600 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
      </div>
    </div>
  );
}
