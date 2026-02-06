import { useEffect, useMemo, useState } from "react";
import type { Deal, DealPriority } from "../types/kanban";

interface DealFormModalProps {
  isOpen: boolean;
  title: string;
  initialDeal?: Deal | null;
  onClose: () => void;
  onSave: (deal: Deal) => void;
}

const priorityOptions: DealPriority[] = ["low", "medium", "high"];

const DealFormModal = ({
  isOpen,
  title,
  initialDeal,
  onClose,
  onSave,
}: DealFormModalProps) => {
  const emptyDeal = useMemo<Deal>(
    () => ({
      id: "",
      title: "",
      clientName: "",
      priority: "medium",
      nextFollowUpDate: null,
      reminderAt: null,
      notes: "",
    }),
    []
  );

  const [form, setForm] = useState<Deal>(initialDeal ?? emptyDeal);

  useEffect(() => {
    setForm(initialDeal ?? emptyDeal);
  }, [initialDeal, emptyDeal]);

  if (!isOpen) return null;

  const handleChange = (field: keyof Deal, value: string) => {
    if (field === "nextFollowUpDate") {
      setForm((prev) => ({
        ...prev,
        nextFollowUpDate: value.length > 0 ? value : null,
      }));
      return;
    }
    if (field === "reminderAt") {
      const datePart = value.split("T")[0] ?? "";
      setForm((prev) => ({
        ...prev,
        reminderAt: value.length > 0 ? value : null,
        nextFollowUpDate: value.length > 0 && datePart ? datePart : null,
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave({ ...form });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl animate-[pop-in_200ms_ease-out]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500"
          >
            Fermer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Titre
            </label>
            <input
              value={form.title}
              onChange={(event) => handleChange("title", event.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Client
            </label>
            <input
              value={form.clientName}
              onChange={(event) => handleChange("clientName", event.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Priorite
              </label>
              <select
                value={form.priority}
                onChange={(event) => handleChange("priority", event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
              >
                {priorityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Rappel (date / heure)
              </label>
              <input
                type="datetime-local"
                value={form.reminderAt ?? ""}
                onChange={(event) => handleChange("reminderAt", event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Notes
            </label>
            <textarea
              value={form.notes ?? ""}
              onChange={(event) => handleChange("notes", event.target.value)}
              rows={3}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-500 transition hover:border-slate-300 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DealFormModal;
