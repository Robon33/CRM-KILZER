import type { Deal, DealPriority } from "../types/kanban";

const priorityStyles: Record<DealPriority, string> = {
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-rose-50 text-rose-700 border-rose-200",
};

const priorityLabels: Record<DealPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

interface DealCardProps {
  deal: Deal;
  onClick?: () => void;
  onDelete?: () => void;
  onOpenNotes?: () => void;
  onOpenReminder?: () => void;
  onOpenActivity?: () => void;
}

const isOverdue = (isoDate: string | null) => {
  if (!isoDate) return false;
  const today = new Date();
  const dateOnly = new Date(isoDate);

  return dateOnly < new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

const formatReminder = (value: string | null) => {
  if (!value) return "—";
  const [date, time] = value.split("T");
  if (!time) return date;
  return `${date} ${time}`;
};

const DealCard = ({
  deal,
  onClick,
  onDelete,
  onOpenNotes,
  onOpenReminder,
  onOpenActivity,
}: DealCardProps) => {
  const overdue = deal.reminderAt
    ? new Date(deal.reminderAt) < new Date()
    : isOverdue(deal.nextFollowUpDate);

  return (
    <article
      className={`group rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg motion-reduce:transition-none animate-[fade-in_180ms_ease-out] dark:border-slate-800/80 dark:bg-slate-900/80 dark:hover:border-slate-700 ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{deal.title}</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{deal.clientName}</p>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
            priorityStyles[deal.priority]
          }`}
        >
          {priorityLabels[deal.priority]}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Rappel</span>
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {formatReminder(deal.reminderAt ?? deal.nextFollowUpDate)}
          </span>
          {overdue && (
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 shadow-sm dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-300">
              <svg
                className="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a8 8 0 100 16 8 8 0 000-16zm.75 4.75a.75.75 0 00-1.5 0v4.5c0 .414.336.75.75.75h2.5a.75.75 0 000-1.5h-1.75v-4.25z"
                  clipRule="evenodd"
                />
              </svg>
              En retard
            </span>
          )}
        </div>
      </div>
      {typeof deal.amount === "number" ? (
        <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Montant :{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {deal.amount.toLocaleString("fr-FR")} {deal.currency ?? "EUR"}
          </span>
        </div>
      ) : null}

      {deal.notes ? (
        <p className="mt-3 text-sm text-slate-600 line-clamp-2 dark:text-slate-300">{deal.notes}</p>
      ) : null}
      {deal.tags && deal.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {deal.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          {onOpenNotes ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpenNotes();
              }}
              onPointerDown={(event) => event.stopPropagation()}
              className="rounded-full border border-slate-200 px-2 py-1 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600"
            >
              Notes
            </button>
          ) : null}
          {onOpenReminder ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpenReminder();
              }}
              onPointerDown={(event) => event.stopPropagation()}
              className="rounded-full border border-slate-200 px-2 py-1 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600"
            >
              Rappels
            </button>
          ) : null}
          {onOpenActivity ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpenActivity();
              }}
              onPointerDown={(event) => event.stopPropagation()}
              className="rounded-full border border-slate-200 px-2 py-1 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600"
            >
              Activite
            </button>
          ) : null}
        </div>
        {onDelete ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            onPointerDown={(event) => event.stopPropagation()}
            className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 dark:border-rose-400/50 dark:text-rose-300 dark:hover:bg-rose-500/10"
          >
            Supprimer
          </button>
        ) : null}
      </div>
    </article>
  );
};

export default DealCard;
