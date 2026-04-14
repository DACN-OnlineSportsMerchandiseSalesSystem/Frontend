import { useAppStore } from '../store/useAppStore';

const Home = () => {
  const { theme, toggleTheme } = useAppStore();

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 flex flex-col items-start gap-4">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Welcome to the Standard Frontend
        </h2>
        <p className="text-slate-600 max-w-2xl text-lg">
          This project is pre-configured with React, Vite, TypeScript, Tailwind CSS, React Router, Zustand, and Axios.
        </p>
        <button 
          onClick={toggleTheme}
          className="mt-4 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-medium active:scale-95 shadow-md flex items-center gap-2"
        >
          <span>{theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}</span>
        </button>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Project Structure', desc: 'Standardized folder layout for scalability.' },
          { title: 'Modern UI/UX', desc: 'Tailwind v4 ready with utility classes.' },
          { title: 'State Management', desc: 'Lightweight global state via Zustand.' }
        ].map((feature, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-100 transition-all cursor-default">
            <h3 className="font-semibold text-lg text-slate-800">{feature.title}</h3>
            <p className="text-slate-500 mt-2 text-sm">{feature.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Home;
