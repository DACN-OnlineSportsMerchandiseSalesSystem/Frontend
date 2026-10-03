import { useState, Suspense, lazy } from "react";
import { Outlet, useLocation, ScrollRestoration, Link } from "react-router";
import { Shield, ArrowRight } from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { HamburgerMenu } from "./HamburgerMenu";
import { AppProvider, useApp } from "../context/AppContext";

// Defer heavy Chatbot with audio/speech initialization to keep initial main thread free
const Chatbot = lazy(() => import("./Chatbot").then(m => ({ default: m.Chatbot })));

function RootContent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { isAdmin } = useApp();
  const isAdminPage = location.pathname.startsWith("/admin");

  if (isAdminPage) {
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <Outlet />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {isAdmin && (
        <aside aria-label="Thông báo quản trị viên" className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-4 py-2 text-xs md:text-sm shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-yellow-300 flex-shrink-0" />
              <span>
                Bạn đang xem cửa hàng với tư cách <strong>Quản trị viên</strong> (Chế độ xem trước - Tính năng mua sắm bị vô hiệu hóa).
              </span>
            </div>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 bg-white text-orange-700 hover:bg-orange-50 px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap shadow-sm"
            >
              Về Trang Quản trị <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>
      )}
      <Header onMenuOpen={() => setMenuOpen(true)} />
      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="flex-1">
        <Suspense fallback={
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <Suspense fallback={null}>
        <Chatbot />
      </Suspense>
    </div>
  );
}

export function Root() {
  return (
    <AppProvider>
      <ScrollRestoration />
      <RootContent />
    </AppProvider>
  );
}
