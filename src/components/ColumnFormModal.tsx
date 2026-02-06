import { useEffect, useMemo, useState } from "react";
import type { Column } from "../types/kanban";

interface ColumnFormModalProps {
  isOpen: boolean;
  title: string;
  initialColumn?: Column | null;
  onClose: () => void;
  onSave: (title: string) => void;
}

const ColumnFormModal = ({
  isOpen,
  title,
  initialColumn,
  onClose,
  onSave,
}: ColumnFormModalProps) => {
  const emptyTitle = useMemo(() => "", []);
  const [value, setValue] = useState<string>(initialColumn?.title ?? emptyTitle);

  useEffect(() => {
    setValue(initialColumn?.title ?? emptyTitle);
  }, [initialColumn, emptyTitle]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl animate-[pop-in_200ms_ease-out] dark:bg-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-300"
          >
            Fermer
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Titre de la colonne
            </label>
            <input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-500 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => onSave(value)}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnFormModal;
