import { useEffect, useRef, useState } from "react";
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
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [targets, setTargets] = useState<number[]>(() => {
    if (typeof window === "undefined") return new Array(12).fill(0);
    const raw = localStorage.getItem("analytics_targets");
    if (!raw) return new Array(12).fill(0);
    try {
      const parsed = JSON.parse(raw) as number[];
      return parsed.length === 12 ? parsed : new Array(12).fill(0);
    } catch {
      return new Array(12).fill(0);
    }
  });
  const svgRef = useRef<SVGSVGElement | null>(null);

  const wonColumn = columns.find((col) => col.title.toLowerCase().includes("gagne"));

  const wonDeals = deals.filter((deal) => deal.columnId === wonColumn?.id);

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
  const targetByMonth = targets.map((val) => Math.max(0, val));

  const maxValue = Math.max(...forecastByMonth, ...targetByMonth, 1);
  const forecastPoints = forecastByMonth
    .map((val, idx) => {
      const x = (idx / 11) * 100;
      const y = 100 - (val / maxValue) * 90 - 5;
      return `${x},${y}`;
    })
    .join(" ");
  const actualPoints = actualByMonth
    .map((val, idx) => {
      const x = (idx / 11) * 100;
      const y = 100 - (val / maxValue) * 90 - 5;
      return `${x},${y}`;
    })
    .join(" ");
  const targetPoints = targetByMonth
    .map((val, idx) => {
      const x = (idx / 11) * 100;
      const y = 100 - (val / maxValue) * 90 - 5;
      return `${x},${y}`;
    })
    .join(" ");

  const totalForecast = forecastByMonth.reduce((acc, val) => acc + val, 0);
  const totalActual = actualByMonth.reduce((acc, val) => acc + val, 0);
  const totalTarget = targetByMonth.reduce((acc, val) => acc + val, 0);

  const formatAmount = (value: number) =>
    value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("analytics_targets", JSON.stringify(targets));
  }, [targets]);

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const index = Math.min(11, Math.max(0, Math.round(ratio * 11)));
    setHoverIndex(index);
  };

  const handleMouseLeave = () => setHoverIndex(null);

  const quarterTotals = [0, 1, 2, 3].map((q) => {
    const start = q * 3;
    const actual = actualByMonth.slice(start, start + 3).reduce((acc, v) => acc + v, 0);
    const forecast = forecastByMonth.slice(start, start + 3).reduce((acc, v) => acc + v, 0);
    const target = targetByMonth.slice(start, start + 3).reduce((acc, v) => acc + v, 0);
    return { actual, forecast, target };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Analyse</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Vision annuelle, projections et performance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Objectif</p>
          <p className="mt-2 text-2xl font-semibold text-amber-600 dark:text-amber-300">
            {formatAmount(totalTarget)}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Win rate</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-300">
            {winRate}%
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {quarterTotals.map((q, idx) => (
          <div
            key={idx}
            className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Q{idx + 1}
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Reel: <span className="font-semibold">{formatAmount(q.actual)}</span>
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Prevision: <span className="font-semibold text-indigo-600 dark:text-indigo-300">{formatAmount(q.forecast)}</span>
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Objectif: <span className="font-semibold text-amber-600 dark:text-amber-300">{formatAmount(q.target)}</span>
            </p>
          </div>
        ))}
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
          <div className="relative">
            <svg
              ref={svgRef}
              viewBox="0 0 100 100"
              className="h-44 w-full"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-slate-300 dark:text-slate-700"
                points={actualPoints}
              />
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-indigo-500"
                points={forecastPoints}
              />
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-amber-500"
                points={targetPoints}
              />
            </svg>
            {hoverIndex !== null ? (
              <div className="absolute right-4 top-4 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                <div className="font-semibold text-slate-800 dark:text-slate-100">
                  {months[hoverIndex]}
                </div>
                <div>Reel: {formatAmount(actualByMonth[hoverIndex] ?? 0)}</div>
                <div>Prevision: {formatAmount(forecastByMonth[hoverIndex] ?? 0)}</div>
                <div>Objectif: {formatAmount(targetByMonth[hoverIndex] ?? 0)}</div>
              </div>
            ) : null}
          </div>
          <div className="mt-3 grid grid-cols-6 gap-2 text-[11px] text-slate-400">
            {months.map((month) => (
              <span key={month}>{month}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Objectifs mensuels
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Ajuste tes objectifs pour suivre l'annee.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-6">
          {months.map((month, idx) => (
            <label key={month} className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span>{month}</span>
              <input
                type="number"
                value={targets[idx] ?? 0}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setTargets((current) => {
                    const next = [...current];
                    next[idx] = Number.isNaN(value) ? 0 : value;
                    return next;
                  });
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        Astuce : ajoute des montants aux deals gagnés pour des projections plus précises.
      </div>
    </div>
  );
};

export default AnalyticsPage;
