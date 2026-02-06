import type { ActivityEvent, Deal } from "../types/kanban";

interface DealActivityTimelineProps {
  deal: Deal;
  events: ActivityEvent[];
}

const DealActivityTimeline = ({ deal, events }: DealActivityTimelineProps) => {
  const sorted = [...events]
    .filter((event) => event.dealId === deal.id)
    .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""))
    .reverse();

  if (sorted.length === 0) {
    return <p className="text-sm text-slate-500">Aucune activite pour ce deal.</p>;
  }

  return (
    <div className="space-y-3">
      {sorted.map((event) => (
        <div key={event.id} className="rounded-2xl border border-slate-200 bg-white p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {event.type}
          </div>
          <div className="mt-1 text-sm text-slate-700">
            {event.payload ?? ""}
          </div>
          {event.createdAt ? (
            <div className="mt-2 text-xs text-slate-400">
              {new Date(event.createdAt).toLocaleString("fr-FR")}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default DealActivityTimeline;
