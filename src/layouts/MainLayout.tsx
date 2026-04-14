import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Standard UI</h1>
          </div>
          <nav>
            <ul className="flex space-x-4 text-sm font-medium text-slate-600">
              <li className="hover:text-blue-600 cursor-pointer transition">Home</li>
              <li className="hover:text-blue-600 cursor-pointer transition">About</li>
              <li className="hover:text-blue-600 cursor-pointer transition">Dashboard</li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} Standard UI Frontend. Built with React & Vite.</p>
      </footer>
    </div>
  );
};

export default MainLayout;
