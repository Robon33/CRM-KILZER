import type { DealPriority } from "../types/kanban";

export type DateFilter = "all" | "overdue" | "today" | "upcoming" | "none";

interface KanbanFiltersProps {
  query: string;
  priority: DealPriority | "all";
  dateFilter: DateFilter;
  compactMode: boolean;
  onQueryChange: (value: string) => void;
  onPriorityChange: (value: DealPriority | "all") => void;
  onDateFilterChange: (value: DateFilter) => void;
  onCompactModeChange: (value: boolean) => void;
  onReset: () => void;
}

const KanbanFilters = ({
  query,
  priority,
  dateFilter,
  compactMode,
  onQueryChange,
  onPriorityChange,
  onDateFilterChange,
  onCompactModeChange,
  onReset,
}: KanbanFiltersProps) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px]">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Recherche
          </label>
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Titre ou client"
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 transition focus:border-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          />
        </div>
        <div className="min-w-[160px]">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Priorite
          </label>
          <select
            value={priority}
            onChange={(event) => onPriorityChange(event.target.value as DealPriority | "all")}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          >
            <option value="all">Toutes</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="min-w-[200px]">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Relance
          </label>
          <select
            value={dateFilter}
            onChange={(event) => onDateFilterChange(event.target.value as DateFilter)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          >
            <option value="all">Toutes</option>
            <option value="overdue">En retard</option>
            <option value="today">Aujourd'hui</option>
            <option value="upcoming">A venir</option>
            <option value="none">Sans date</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => onCompactModeChange(!compactMode)}
            className={`rounded-full border px-3 py-2 text-sm font-semibold ${
              compactMode
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 text-slate-600"
            }`}
          >
            Mode compact
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-500 transition hover:border-slate-300 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          >
            Reinitialiser
          </button>
        </div>
      </div>
    </section>
  );
};

export default KanbanFilters;
