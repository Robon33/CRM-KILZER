import { useState } from "react";
import type { Deal, Note } from "../types/kanban";

interface NotesModalProps {
  isOpen: boolean;
  deal: Deal | null;
  notes: Note[];
  onClose: () => void;
  onCreate: (body: string) => void;
  onUpdate: (id: string, body: string) => void;
  onDelete: (id: string) => void;
}

const NotesModal = ({
  isOpen,
  deal,
  notes,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: NotesModalProps) => {
  const [draft, setDraft] = useState("");

  if (!isOpen || !deal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl animate-[pop-in_200ms_ease-out] dark:bg-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Notes — {deal.title}
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
          {notes.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Aucune note.</p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                <textarea
                  value={note.body}
                  onChange={(event) => onUpdate(note.id, event.target.value)}
                  className="w-full text-sm text-slate-700 focus-visible:outline-none dark:bg-slate-900 dark:text-slate-100"
                  rows={2}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onDelete(note.id)}
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
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Nouvelle note..."
          />
          <button
            type="button"
            onClick={() => {
              if (!draft.trim()) return;
              onCreate(draft.trim());
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

export default NotesModal;
