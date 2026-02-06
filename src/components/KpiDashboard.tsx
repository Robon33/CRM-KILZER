import type { Column, Deal } from "../types/kanban";

interface KpiDashboardProps {
  columns: Column[];
  deals: Deal[];
}

const KpiDashboard = ({ columns, deals }: KpiDashboardProps) => {
  const total = deals.length;
  const wonColumn = columns.find((col) => col.title.toLowerCase().includes("gagne"));
  const lostColumn = columns.find((col) => col.title.toLowerCase().includes("perdu"));
  const wonCount = wonColumn ? deals.filter((d) => d.columnId === wonColumn.id).length : 0;
  const lostCount = lostColumn ? deals.filter((d) => d.columnId === lostColumn.id).length : 0;
  const winRate = total > 0 ? Math.round((wonCount / total) * 100) : 0;

  return (
    <section className="grid gap-4 md:grid-cols-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Deals</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{total}</p>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Gagnés</p>
        <p className="mt-2 text-2xl font-semibold text-emerald-700 dark:text-emerald-300">{wonCount}</p>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Perdus</p>
        <p className="mt-2 text-2xl font-semibold text-rose-600 dark:text-rose-300">{lostCount}</p>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Win rate</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{winRate}%</p>
      </div>
    </section>
  );
};

export default KpiDashboard;
