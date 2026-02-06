import { Outlet } from "react-router-dom";
import { useState } from "react";
import SidebarMenu from "../components/SidebarMenu";

const MainLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SidebarMenu isOpen={menuOpen} onToggle={() => setMenuOpen(false)} />
      <div className="md:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                CRM personnel
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900">
                Dashboard
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 transition hover:border-slate-300 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 md:hidden"
            >
              Menu
            </button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
