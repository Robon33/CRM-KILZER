import { useMemo, useState } from "react";
import { useKanban } from "../hooks/useKanban";

const months = [
  "Jan",
  "Fev",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Aout",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const AnalyticsPage = () => {
  const { deals, columns } = useKanban();
  const [forecastFactor, setForecastFactor] = useState(110);

  const wonColumn = columns.find((col) => col.title.toLowerCase().includes("gagne"));
  const lostColumn = columns.find((col) => col.title.toLowerCase().includes("perdu"));

  const wonDeals = deals.filter((deal) => deal.columnId === wonColumn?.id);
  const lostDeals = deals.filter((deal) => deal.columnId === lostColumn?.id);

  const total = deals.length;
  const winRate = total > 0 ? Math.round((wonDeals.length / total) * 100) : 0;

  const currentYear = new Date().getFullYear();
  const actualByMonth = new Array(12).fill(0);

  wonDeals.forEach((deal) => {
    const dateStr = deal.reminderAt?.split("T")[0] ?? deal.nextFollowUpDate;
    if (!dateStr) return;
    const date = new Date(dateStr);
    if (date.getFullYear() !== currentYear) return;
    const idx = date.getMonth();
    actualByMonth[idx] += deal.amount ?? 0;
  });

  const forecastByMonth = actualByMonth.map((val) =>
    Math.round(val * (forecastFactor / 100))
  );

  const maxValue = Math.max(...forecastByMonth, 1);
  const points = forecastByMonth
    .map((val, idx) => {
      const x = (idx / 11) * 100;
      const y = 100 - (val / maxValue) * 90 - 5;
      return `${x},${y}`;
    })
    .join(" ");

  const totalForecast = forecastByMonth.reduce((acc, val) => acc + val, 0);
  const totalActual = actualByMonth.reduce((acc, val) => acc + val, 0);

  const formatAmount = (value: number) =>
    value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Analyse</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Vision annuelle, projections et performance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Reel</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {formatAmount(totalActual)}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Prevision</p>
          <p className="mt-2 text-2xl font-semibold text-indigo-600 dark:text-indigo-300">
            {formatAmount(totalForecast)}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Win rate</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-300">
            {winRate}%
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Prevision annuelle
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Ajuste le facteur pour simuler tes objectifs.
            </p>
          </div>
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {forecastFactor}%
          </div>
        </div>
        <input
          type="range"
          min={80}
          max={140}
          value={forecastFactor}
          onChange={(event) => setForecastFactor(Number(event.target.value))}
          className="mt-4 w-full"
        />

        <div className="mt-6">
          <svg viewBox="0 0 100 100" className="h-40 w-full">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-indigo-500"
              points={points}
            />
          </svg>
          <div className="mt-3 grid grid-cols-6 gap-2 text-[11px] text-slate-400">
            {months.map((month) => (
              <span key={month}>{month}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        Astuce : ajoute des montants aux deals gagnés pour des projections plus précises.
      </div>
    </div>
  );
};

export default AnalyticsPage;
