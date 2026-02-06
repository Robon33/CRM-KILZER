import type { ActivityEvent, Deal } from "../types/kanban";
import DealActivityTimeline from "./DealActivityTimeline";

interface ActivityModalProps {
  isOpen: boolean;
  deal: Deal | null;
  events: ActivityEvent[];
  onClose: () => void;
}

const ActivityModal = ({ isOpen, deal, events, onClose }: ActivityModalProps) => {
  if (!isOpen || !deal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl animate-[pop-in_200ms_ease-out]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            Activite — {deal.title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500"
          >
            Fermer
          </button>
        </div>

        <div className="mt-4">
          <DealActivityTimeline deal={deal} events={events} />
        </div>
      </div>
    </div>
  );
};

export default ActivityModal;
