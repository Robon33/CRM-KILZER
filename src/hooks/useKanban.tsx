import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Column, Deal, Note, Reminder } from "../types/kanban";
import {
  fetchColumns,
  fetchDeals,
  fetchNotes,
  fetchReminders,
  fetchActivityEvents,
  createActivityEvent,
  createColumn,
  updateColumn,
  deleteColumn,
  createDeal,
  updateDeal,
  deleteDeal,
  updateDealPositions,
  createNote,
  updateNote,
  deleteNote,
  createReminder,
  updateReminder,
  deleteReminder,
  upsertReminderForDeal,
} from "../services/kanbanService";
import type { ActivityEvent } from "../types/kanban";

interface KanbanState {
  columns: Column[];
  deals: Deal[];
  notes: Note[];
  reminders: Reminder[];
  activityEvents: ActivityEvent[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addColumn: (title: string) => Promise<void>;
  editColumn: (id: string, title: string) => Promise<void>;
  removeColumn: (id: string) => Promise<void>;
  addDeal: (columnId: string, draft?: Partial<Deal>) => Promise<void>;
  saveDeal: (deal: Deal) => Promise<void>;
  removeDeal: (id: string) => Promise<void>;
  reorderDeals: (columnId: string, orderedIds: string[]) => Promise<void>;
  addNote: (dealId: string, body: string) => Promise<void>;
  editNote: (id: string, body: string) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
  addReminder: (dealId: string, remindAt: string) => Promise<void>;
  editReminder: (id: string, remindAt: string) => Promise<void>;
  removeReminder: (id: string) => Promise<void>;
}

const KanbanContext = createContext<KanbanState | null>(null);

const cache = {
  columns: [] as Column[],
  deals: [] as Deal[],
  notes: [] as Note[],
  reminders: [] as Reminder[],
  hydrated: false,
};

const mergeNotesAndReminders = (
  deals: Deal[],
  notes: Note[],
  reminders: Reminder[]
): Deal[] => {
  const latestNoteByDeal = new Map<string, string>();
  notes.forEach((note) => {
    latestNoteByDeal.set(note.dealId, note.body);
  });
  const reminderByDeal = new Map<string, string>();
  reminders.forEach((rem) => {
    reminderByDeal.set(rem.dealId, rem.remindAt);
  });

  return deals.map((deal) => ({
    ...deal,
    notes: latestNoteByDeal.get(deal.id),
    reminderAt: reminderByDeal.get(deal.id) ?? deal.reminderAt ?? null,
  }));
};

export const KanbanProvider = ({ children }: { children: React.ReactNode }) => {
  const [columns, setColumns] = useState<Column[]>(cache.columns);
  const [deals, setDeals] = useState<Deal[]>(cache.deals);
  const [notes, setNotes] = useState<Note[]>(cache.notes);
  const [reminders, setReminders] = useState<Reminder[]>(cache.reminders);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);

  const fireEvent = (event: {
    type: string;
    dealId?: string | null;
    columnId?: string | null;
    payload?: string | null;
  }) => {
    void createActivityEvent(event).catch(() => {});
    setActivityEvents((current) => [
      {
        id: `temp-${Date.now()}`,
        type: event.type,
        dealId: event.dealId ?? null,
        columnId: event.columnId ?? null,
        payload: event.payload ?? null,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
  };
  const [loading, setLoading] = useState<boolean>(!cache.hydrated);
  const [error, setError] = useState<string | null>(null);

  const hydrate = (next: {
    columns: Column[];
    deals: Deal[];
    notes: Note[];
    reminders: Reminder[];
  }) => {
    cache.columns = next.columns;
    cache.deals = next.deals;
    cache.notes = next.notes;
    cache.reminders = next.reminders;
    cache.hydrated = true;
    setColumns(next.columns);
    setNotes(next.notes);
    setReminders(next.reminders);
    setDeals(mergeNotesAndReminders(next.deals, next.notes, next.reminders));
  };

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cols, ds, ns, rs] = await Promise.all([
        fetchColumns(),
        fetchDeals(),
        fetchNotes(),
        fetchReminders(),
      ]);
      let events: ActivityEvent[] = [];
      try {
        events = await fetchActivityEvents();
      } catch {
        events = [];
      }
      hydrate({ columns: cols, deals: ds, notes: ns, reminders: rs });
      setActivityEvents(events);
    } catch (err: any) {
      setError(err.message ?? "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!cache.hydrated) {
      void refresh();
    }
  }, []);

  const addColumn = async (title: string) => {
    const prev = columns;
    const optimistic: Column = {
      id: `temp-${Date.now()}`,
      title,
      position: prev.length + 1,
    };
    setColumns([...prev, optimistic]);

    try {
      const created = await createColumn(title, prev.length + 1);
      setColumns((current) =>
        current.map((col) => (col.id === optimistic.id ? created : col))
      );
      fireEvent({
        type: "column_created",
        columnId: created.id,
        payload: created.title,
      });
    } catch (err: any) {
      setColumns(prev);
      setError(err.message ?? "Erreur lors de la creation");
    }
  };

  const editColumn = async (id: string, title: string) => {
    const prev = columns;
    setColumns((current) => current.map((c) => (c.id === id ? { ...c, title } : c)));

    try {
      await updateColumn(id, { title });
      fireEvent({
        type: "column_updated",
        columnId: id,
        payload: title,
      });
    } catch (err: any) {
      setColumns(prev);
      setError(err.message ?? "Erreur lors de la mise a jour");
    }
  };

  const removeColumn = async (id: string) => {
    const prevColumns = columns;
    const prevDeals = deals;
    setColumns((current) => current.filter((c) => c.id !== id));
    setDeals((current) => current.filter((d) => d.columnId !== id));

    try {
      await deleteColumn(id);
      fireEvent({
        type: "column_deleted",
        columnId: id,
      });
    } catch (err: any) {
      setColumns(prevColumns);
      setDeals(prevDeals);
      setError(err.message ?? "Erreur lors de la suppression");
    }
  };

  const addDeal = async (columnId: string, draft?: Partial<Deal>) => {
    const prev = deals;
    const tempId = `temp-${Date.now()}`;
    const safeTitle = (draft?.title ?? "").trim() || "Nouveau deal";
    const safeClient = (draft?.clientName ?? "").trim() || "Client";
    const optimistic: Deal = {
      id: tempId,
      columnId,
      title: safeTitle,
      clientName: safeClient,
      priority: draft?.priority ?? "medium",
      position: prev.filter((d) => d.columnId === columnId).length + 1,
      nextFollowUpDate: draft?.nextFollowUpDate ?? null,
      reminderAt: draft?.reminderAt ?? null,
      notes: draft?.notes,
      amount: draft?.amount ?? null,
      currency: draft?.currency ?? "EUR",
      tags: draft?.tags ?? [],
    };
    setDeals([...prev, optimistic]);

    try {
      const created = await createDeal({
        columnId,
        title: optimistic.title,
        clientName: optimistic.clientName,
        priority: optimistic.priority,
        position: optimistic.position ?? 1,
        nextFollowUpDate: optimistic.nextFollowUpDate,
        amount: optimistic.amount ?? null,
        currency: optimistic.currency ?? null,
        tags: optimistic.tags ?? [],
      });
      if (optimistic.notes) {
        const note = await createNote(created.id, optimistic.notes);
        setNotes((current) => [...current, note]);
      }
      if (optimistic.reminderAt) {
        const reminder = await createReminder(created.id, optimistic.reminderAt);
        setReminders((current) => [...current, reminder]);
      }
      setDeals((current) =>
        current.map((deal) => (deal.id === tempId ? created : deal))
      );
      fireEvent({
        type: "deal_created",
        dealId: created.id,
        columnId,
        payload: created.title,
      });
    } catch (err: any) {
      setDeals(prev);
      setError(err.message ?? "Erreur lors de la creation du deal");
    }
  };

  const saveDeal = async (deal: Deal) => {
    const prev = deals;
    setDeals((current) =>
      current.map((d) => (d.id === deal.id ? { ...d, ...deal } : d))
    );

    try {
      await updateDeal(deal.id, deal);
      const noteForDeal = notes.find((n) => n.dealId === deal.id);
      if (deal.notes && noteForDeal) {
        await updateNote(noteForDeal.id, deal.notes);
      } else if (deal.notes && !noteForDeal) {
        await createNote(deal.id, deal.notes);
      }
      if (deal.reminderAt) {
        await upsertReminderForDeal(deal.id, deal.reminderAt);
      }
      const [nextNotes, nextReminders] = await Promise.all([
        fetchNotes(),
        fetchReminders(),
      ]);
      setNotes(nextNotes);
      setReminders(nextReminders);
      fireEvent({
        type: "deal_updated",
        dealId: deal.id,
        columnId: deal.columnId ?? null,
        payload: deal.title,
      });
    } catch (err: any) {
      setDeals(prev);
      setError(err.message ?? "Erreur lors de la mise a jour du deal");
    }
  };

  const removeDeal = async (id: string) => {
    const prev = deals;
    setDeals((current) => current.filter((d) => d.id !== id));

    try {
      await deleteDeal(id);
      fireEvent({ type: "deal_deleted", dealId: id });
    } catch (err: any) {
      setDeals(prev);
      setError(err.message ?? "Erreur lors de la suppression du deal");
    }
  };

  const reorderDeals = async (columnId: string, orderedIds: string[]) => {
    const prev = deals;
    const next = deals.map((deal) =>
      orderedIds.includes(deal.id)
        ? { ...deal, columnId, position: orderedIds.indexOf(deal.id) + 1 }
        : deal
    );
    setDeals(next);

    try {
      await updateDealPositions(
        orderedIds.map((id, index) => ({
          id,
          columnId,
          position: index + 1,
        }))
      );
      fireEvent({
        type: "deal_moved",
        columnId,
        payload: orderedIds.join(","),
      });
    } catch (err: any) {
      setDeals(prev);
      setError(err.message ?? "Erreur lors du reorder");
    }
  };

  const addNote = async (dealId: string, body: string) => {
    const prev = notes;
    const temp: Note = { id: `temp-${Date.now()}`, dealId, body };
    setNotes([...prev, temp]);

    try {
      const created = await createNote(dealId, body);
      setNotes((current) =>
        current.map((n) => (n.id === temp.id ? created : n))
      );
      fireEvent({
        type: "note_created",
        dealId,
        payload: body,
      });
    } catch (err: any) {
      setNotes(prev);
      setError(err.message ?? "Erreur note");
    }
  };

  const editNote = async (id: string, body: string) => {
    const prev = notes;
    setNotes((current) => current.map((n) => (n.id === id ? { ...n, body } : n)));

    try {
      await updateNote(id, body);
      fireEvent({ type: "note_updated", payload: body });
    } catch (err: any) {
      setNotes(prev);
      setError(err.message ?? "Erreur note");
    }
  };

  const removeNote = async (id: string) => {
    const prev = notes;
    setNotes((current) => current.filter((n) => n.id !== id));

    try {
      await deleteNote(id);
      fireEvent({ type: "note_deleted" });
    } catch (err: any) {
      setNotes(prev);
      setError(err.message ?? "Erreur note");
    }
  };

  const addReminder = async (dealId: string, remindAt: string) => {
    const prev = reminders;
    const temp: Reminder = { id: `temp-${Date.now()}`, dealId, remindAt };
    setReminders([...prev, temp]);

    try {
      const created = await createReminder(dealId, remindAt);
      setReminders((current) =>
        current.map((r) => (r.id === temp.id ? created : r))
      );
      fireEvent({
        type: "reminder_created",
        dealId,
        payload: remindAt,
      });
    } catch (err: any) {
      setReminders(prev);
      setError(err.message ?? "Erreur rappel");
    }
  };

  const editReminder = async (id: string, remindAt: string) => {
    const prev = reminders;
    setReminders((current) =>
      current.map((r) => (r.id === id ? { ...r, remindAt } : r))
    );

    try {
      await updateReminder(id, remindAt);
      fireEvent({ type: "reminder_updated", payload: remindAt });
    } catch (err: any) {
      setReminders(prev);
      setError(err.message ?? "Erreur rappel");
    }
  };

  const removeReminder = async (id: string) => {
    const prev = reminders;
    setReminders((current) => current.filter((r) => r.id !== id));

    try {
      await deleteReminder(id);
      fireEvent({ type: "reminder_deleted" });
    } catch (err: any) {
      setReminders(prev);
      setError(err.message ?? "Erreur rappel");
    }
  };

  const value = useMemo(
    () => ({
      columns,
      deals: mergeNotesAndReminders(deals, notes, reminders),
      notes,
      reminders,
      activityEvents,
      loading,
      error,
      refresh,
      addColumn,
      editColumn,
      removeColumn,
      addDeal,
      saveDeal,
      removeDeal,
      reorderDeals,
      addNote,
      editNote,
      removeNote,
      addReminder,
      editReminder,
      removeReminder,
    }),
    [
      columns,
      deals,
      notes,
      reminders,
      activityEvents,
      loading,
      error,
    ]
  );

  return <KanbanContext.Provider value={value}>{children}</KanbanContext.Provider>;
};

export const useKanban = () => {
  const ctx = useContext(KanbanContext);
  if (!ctx) throw new Error("useKanban must be used within KanbanProvider");
  return ctx;
};
