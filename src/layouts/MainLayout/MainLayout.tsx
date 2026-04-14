import { useState } from "react";
import { Outlet } from "react-router";
import { Header } from "@/layouts/MainLayout/components/Header";
import { Footer } from "@/layouts/MainLayout/components/Footer";
import { HamburgerMenu } from "@/layouts/MainLayout/components/HamburgerMenu";
import { Chatbot } from "@/layouts/MainLayout/components/Chatbot";
import { AppProvider } from "@/context/AppContext";

export function Root() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header onMenuOpen={() => setMenuOpen(true)} />
        <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <Chatbot />
      </div>
    </AppProvider>
  );
}