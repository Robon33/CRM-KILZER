import { useMemo, useState } from "react";
import KanbanFilters, { type DateFilter } from "../components/KanbanFilters";
import KanbanBoard from "../components/KanbanBoard";
import DealFormModal from "../components/DealFormModal";
import ColumnFormModal from "../components/ColumnFormModal";
import NotesModal from "../components/NotesModal";
import ReminderModal from "../components/ReminderModal";
import ActivityModal from "../components/ActivityModal";
import KpiDashboard from "../components/KpiDashboard";
import type { Deal, DealPriority, KanbanColumnData } from "../types/kanban";
import { useKanban } from "../hooks/useKanban";

interface DealModalState {
  isOpen: boolean;
  mode: "create" | "edit";
  columnId: string | null;
  deal: Deal | null;
}

interface ColumnModalState {
  isOpen: boolean;
  mode: "create" | "edit";
  columnId: string | null;
}

const KanbanPage = () => {
  const {
    columns,
    deals,
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
  } = useKanban();

  const [query, setQuery] = useState("");
  const [tagsQuery, setTagsQuery] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [priority, setPriority] = useState<DealPriority | "all">("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [compactMode, setCompactMode] = useState(false);
  const [modalState, setModalState] = useState<DealModalState>({
    isOpen: false,
    mode: "create",
    columnId: null,
    deal: null,
  });
  const [columnModal, setColumnModal] = useState<ColumnModalState>({
    isOpen: false,
    mode: "create",
    columnId: null,
  });
  const [activeDealId, setActiveDealId] = useState<string | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);

  const activeDeal = useMemo(
    () => deals.find((deal) => deal.id === activeDealId) ?? null,
    [deals, activeDealId]
  );

  const columnsForBoard: KanbanColumnData[] = useMemo(() => {
    return columns
      .sort((a, b) => a.position - b.position)
      .map((column) => ({
        id: column.id,
        title: column.title,
        deals: deals
          .filter((deal) => deal.columnId === column.id)
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
      }));
  }, [columns, deals]);

  const matchesDateFilter = (deal: Deal) => {
    if (dateFilter === "all") return true;
    const dateValue = deal.reminderAt?.split("T")[0] ?? deal.nextFollowUpDate;
    if (!dateValue) return dateFilter === "none";

    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dealDate = new Date(dateValue);
    const dealDateOnly = new Date(
      dealDate.getFullYear(),
      dealDate.getMonth(),
      dealDate.getDate()
    );

    if (dateFilter === "today") return dealDateOnly.getTime() === todayDate.getTime();
    if (dateFilter === "overdue") return dealDateOnly < todayDate;
    if (dateFilter === "upcoming") return dealDateOnly > todayDate;
    return false;
  };

  const matchesDeal = (deal: Deal) => {
    const queryLower = query.trim().toLowerCase();
    const matchesQuery =
      queryLower.length === 0 ||
      deal.title.toLowerCase().includes(queryLower) ||
      deal.clientName.toLowerCase().includes(queryLower);
    const matchesPriority = priority === "all" || deal.priority === priority;
    const tagsFilter = tagsQuery
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);
    const dealTags = (deal.tags ?? []).map((tag) => tag.toLowerCase());
    const matchesTags =
      tagsFilter.length === 0 ||
      tagsFilter.some((tag) => dealTags.includes(tag));
    const minValue = amountMin.trim() ? Number(amountMin) : null;
    const maxValue = amountMax.trim() ? Number(amountMax) : null;
    const amount = typeof deal.amount === "number" ? deal.amount : null;
    const matchesAmount =
      (minValue === null || (amount !== null && amount >= minValue)) &&
      (maxValue === null || (amount !== null && amount <= maxValue));

    return matchesQuery && matchesPriority && matchesDateFilter(deal) && matchesTags && matchesAmount;
  };

  const resetFilters = () => {
    setQuery("");
    setTagsQuery("");
    setAmountMin("");
    setAmountMax("");
    setPriority("all");
    setDateFilter("all");
    setCompactMode(false);
  };
  const handleExportCsv = () => {
    const columnTitleById = new Map(columns.map((col) => [col.id, col.title]));
    const rows = deals.filter(matchesDeal).map((deal) => ({
      title: deal.title,
      clientName: deal.clientName,
      priority: deal.priority,
      amount: deal.amount ?? "",
      currency: deal.currency ?? "",
      reminderAt: deal.reminderAt ?? "",
      notes: deal.notes ?? "",
      tags: (deal.tags ?? []).join("|"),
      column: deal.columnId ? columnTitleById.get(deal.columnId) ?? "" : "",
    }));

    const header = [
      "title",
      "clientName",
      "priority",
      "amount",
      "currency",
      "reminderAt",
      "notes",
      "tags",
      "column",
    ];

    const escapeCell = (value: string | number) => {
      const str = String(value ?? "");
      if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
        return `"${str.replace(/\"/g, "\"\"")}"`;
      }
      return str;
    };

    const csv = [
      header.join(","),
      ...rows.map((row) =>
        header.map((key) => escapeCell((row as Record<string, string | number>)[key] ?? "")).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "kanban-deals.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const openCreateModal = (columnId: string) => {
    setModalState({
      isOpen: true,
      mode: "create",
      columnId,
      deal: null,
    });
  };

  const openEditModal = (deal: Deal) => {
    setModalState({
      isOpen: true,
      mode: "edit",
      columnId: deal.columnId ?? null,
      deal,
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: "create",
      columnId: null,
      deal: null,
    });
  };

  const openCreateColumn = () => {
    setColumnModal({ isOpen: true, mode: "create", columnId: null });
  };

  const openEditColumn = (columnId: string) => {
    setColumnModal({ isOpen: true, mode: "edit", columnId });
  };

  const closeColumnModal = () => {
    setColumnModal({ isOpen: false, mode: "create", columnId: null });
  };

  const handleSaveDeal = async (deal: Deal) => {
    if (modalState.mode === "create") {
      if (!modalState.columnId) return;
      await addDeal(modalState.columnId, deal);
      closeModal();
      return;
    }
    await saveDeal(deal);
    closeModal();
  };

  const handleDeleteDeal = async (deal: Deal) => {
    const confirmed = window.confirm("Supprimer ce deal ?");
    if (!confirmed) return;
    await removeDeal(deal.id);
  };

  const handleSaveColumn = async (title: string) => {
    if (!title.trim()) return;
    if (columnModal.mode === "create") {
      await addColumn(title.trim());
      closeColumnModal();
      return;
    }
    if (columnModal.columnId) {
      await editColumn(columnModal.columnId, title.trim());
      closeColumnModal();
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    const confirmed = window.confirm("Supprimer cette colonne ?");
    if (!confirmed) return;
    await removeColumn(columnId);
  };

  if (loading) {
    return <div className="text-sm text-slate-500">Chargement...</div>;
  }

  if (error) {
    return (
      <div className="text-sm text-rose-600">
        {error}
        <button
          className="ml-3 rounded-full border px-3 py-1 text-xs"
          onClick={refresh}
        >
          Reessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Tableau Kanban</h2>
          <p className="mt-1 text-sm text-slate-600">
            Pipeline commercial synchronise avec Supabase.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="rounded-full border border-slate-200 px-3 py-2 text-xs text-slate-600 transition hover:border-slate-300"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={openCreateColumn}
            className="rounded-full border border-slate-200 px-3 py-2 text-xs text-slate-600 transition hover:border-slate-300"
          >
            + Ajouter une colonne
          </button>
        </div>
      </div>

      <KanbanFilters
        query={query}
        tagsQuery={tagsQuery}
        amountMin={amountMin}
        amountMax={amountMax}
        priority={priority}
        dateFilter={dateFilter}
        compactMode={compactMode}
        onQueryChange={setQuery}
        onTagsQueryChange={setTagsQuery}
        onAmountMinChange={setAmountMin}
        onAmountMaxChange={setAmountMax}
        onPriorityChange={setPriority}
        onDateFilterChange={setDateFilter}
        onCompactModeChange={setCompactMode}
        onReset={resetFilters}
      />

      <KpiDashboard columns={columns} deals={deals} />

      <KanbanBoard
        columns={columnsForBoard}
        onReorderDeals={(columnId, orderedIds) => {
          void reorderDeals(columnId, orderedIds);
        }}
        dealFilter={matchesDeal}
        compactMode={compactMode}
        onAddDeal={openCreateModal}
        onEditDeal={openEditModal}
        onDeleteDeal={handleDeleteDeal}
        onEditColumn={openEditColumn}
        onDeleteColumn={handleDeleteColumn}
        onOpenNotes={(deal) => {
          setActiveDealId(deal.id);
          setNotesOpen(true);
        }}
        onOpenReminder={(deal) => {
          setActiveDealId(deal.id);
          setReminderOpen(true);
        }}
        onOpenActivity={(deal) => {
          setActiveDealId(deal.id);
          setActivityOpen(true);
        }}
      />

      <DealFormModal
        isOpen={modalState.isOpen}
        title={modalState.mode === "create" ? "Nouveau deal" : "Modifier le deal"}
        initialDeal={modalState.deal ?? undefined}
        onClose={closeModal}
        onSave={handleSaveDeal}
      />

      <ColumnFormModal
        isOpen={columnModal.isOpen}
        title={columnModal.mode === "create" ? "Nouvelle colonne" : "Modifier la colonne"}
        initialColumn={
          columnModal.columnId
            ? columns.find((col) => col.id === columnModal.columnId) ?? null
            : null
        }
        onClose={closeColumnModal}
        onSave={handleSaveColumn}
      />

      <NotesModal
        isOpen={notesOpen}
        deal={activeDeal}
        notes={notes.filter((note) => note.dealId === activeDeal?.id)}
        onClose={() => {
          setNotesOpen(false);
          setActiveDealId(null);
        }}
        onCreate={(body) => {
          if (!activeDeal) return;
          void addNote(activeDeal.id, body);
        }}
        onUpdate={(id, body) => void editNote(id, body)}
        onDelete={(id) => void removeNote(id)}
      />

      <ReminderModal
        isOpen={reminderOpen}
        deal={activeDeal}
        reminders={reminders.filter((rem) => rem.dealId === activeDeal?.id)}
        onClose={() => {
          setReminderOpen(false);
          setActiveDealId(null);
        }}
        onCreate={(remindAt) => {
          if (!activeDeal) return;
          void addReminder(activeDeal.id, remindAt);
        }}
        onUpdate={(id, remindAt) => void editReminder(id, remindAt)}
        onDelete={(id) => void removeReminder(id)}
      />

      <ActivityModal
        isOpen={activityOpen}
        deal={activeDeal}
        events={activityEvents}
        onClose={() => {
          setActivityOpen(false);
          setActiveDealId(null);
        }}
      />
    </div>
  );
};

export default KanbanPage;
