import { useState } from "react";
import type { Deal, Reminder } from "../types/kanban";

interface ReminderModalProps {
  isOpen: boolean;
  deal: Deal | null;
  reminders: Reminder[];
  onClose: () => void;
  onCreate: (remindAt: string) => void;
  onUpdate: (id: string, remindAt: string) => void;
  onDelete: (id: string) => void;
}

const ReminderModal = ({
  isOpen,
  deal,
  reminders,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: ReminderModalProps) => {
  const [draft, setDraft] = useState("");

  if (!isOpen || !deal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl animate-[pop-in_200ms_ease-out] dark:bg-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Rappels — {deal.title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-300"
          >
            Fermer
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {reminders.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Aucun rappel.</p>
          ) : (
            reminders.map((rem) => (
              <div key={rem.id} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                <input
                  type="datetime-local"
                  value={rem.remindAt}
                  onChange={(event) => onUpdate(rem.id, event.target.value)}
                  className="w-full text-sm text-slate-700 focus-visible:outline-none dark:bg-slate-900 dark:text-slate-100"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onDelete(rem.id)}
                    className="rounded-full border border-rose-200 px-2 py-1 text-xs text-rose-600 dark:border-rose-400/50 dark:text-rose-300"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            type="datetime-local"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            type="button"
            onClick={() => {
              if (!draft) return;
              onCreate(draft);
              setDraft("");
            }}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-slate-900"
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderModal;
