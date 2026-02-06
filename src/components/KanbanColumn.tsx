import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import type { KanbanColumnData } from "../types/kanban";
import SortableDealCard from "./SortableDealCard";

interface KanbanColumnProps {
  column: KanbanColumnData;
  visibleDeals: KanbanColumnData["deals"];
  onAddDeal: (columnId: string) => void;
  onEditDeal: (deal: KanbanColumnData["deals"][number]) => void;
  onDeleteDeal: (deal: KanbanColumnData["deals"][number]) => void;
  onEditColumn: (columnId: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onOpenNotes: (deal: KanbanColumnData["deals"][number]) => void;
  onOpenReminder: (deal: KanbanColumnData["deals"][number]) => void;
  onOpenActivity: (deal: KanbanColumnData["deals"][number]) => void;
}

const KanbanColumn = ({
  column,
  visibleDeals,
  onAddDeal,
  onEditDeal,
  onDeleteDeal,
  onEditColumn,
  onDeleteColumn,
  onOpenNotes,
  onOpenReminder,
  onOpenActivity,
}: KanbanColumnProps) => {
  const { setNodeRef } = useDroppable({
    id: `column:${column.id}`,
    data: { type: "column", columnId: column.id },
  });

  return (
    <div
      ref={setNodeRef}
      className="flex h-full min-w-[280px] flex-col rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur transition-colors hover:border-slate-300 snap-start dark:border-slate-800/80 dark:bg-slate-900/70 dark:hover:border-slate-700"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
          {column.title}
        </h2>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {visibleDeals.length}
          </span>
          <button
            type="button"
            onClick={() => onAddDeal(column.id)}
            className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-500 transition hover:border-slate-300 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
          >
            + Ajouter
          </button>
          <button
            type="button"
            onClick={() => onEditColumn(column.id)}
            className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-500 transition hover:border-slate-300 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
          >
            Editer
          </button>
          <button
            type="button"
            onClick={() => onDeleteColumn(column.id)}
            className="rounded-full border border-rose-200 bg-white px-2 py-0.5 text-xs text-rose-600 transition hover:border-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 dark:border-rose-400/50 dark:bg-slate-900 dark:text-rose-300"
          >
            Supprimer
          </button>
        </div>
      </div>
      <SortableContext
        items={visibleDeals.map((deal) => deal.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="mt-4 space-y-3">
          {visibleDeals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-400">
              Aucune opportunite
            </div>
          ) : (
            visibleDeals.map((deal) => (
              <SortableDealCard
                key={deal.id}
                deal={deal}
                columnId={column.id}
                onEdit={onEditDeal}
                onDelete={onDeleteDeal}
                onOpenNotes={onOpenNotes}
                onOpenReminder={onOpenReminder}
                onOpenActivity={onOpenActivity}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
};

export default KanbanColumn;
