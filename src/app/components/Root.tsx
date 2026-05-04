import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { HamburgerMenu } from "./HamburgerMenu";
import { Chatbot } from "./Chatbot";
import { AppProvider } from "../context/AppContext";

export function Root() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <AppProvider>
      {isAdminPage ? (
        <Outlet />
      ) : (
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Header onMenuOpen={() => setMenuOpen(true)} />
          <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
          <Chatbot />
        </div>
      )}
    </AppProvider>
  );
}
