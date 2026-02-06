import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  type DragCancelEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { Deal, KanbanColumnData } from "../types/kanban";
import KanbanColumn from "./KanbanColumn";
import DealCard from "./DealCard";
import { useMemo, useState } from "react";

interface KanbanBoardProps {
  columns: KanbanColumnData[];
  onReorderDeals: (columnId: string, orderedIds: string[]) => void;
  dealFilter?: (deal: Deal) => boolean;
  compactMode?: boolean;
  onAddDeal?: (columnId: string) => void;
  onEditDeal?: (deal: Deal) => void;
  onDeleteDeal?: (deal: Deal) => void;
  onEditColumn?: (columnId: string) => void;
  onDeleteColumn?: (columnId: string) => void;
  onOpenNotes?: (deal: Deal) => void;
  onOpenReminder?: (deal: Deal) => void;
  onOpenActivity?: (deal: Deal) => void;
}

const findColumnByDealId = (columns: KanbanColumnData[], dealId: string) => {
  return columns.find((column) => column.deals.some((deal) => deal.id === dealId));
};

const KanbanBoard = ({
  columns,
  onReorderDeals,
  dealFilter,
  compactMode,
  onAddDeal,
  onEditDeal,
  onDeleteDeal,
  onEditColumn,
  onDeleteColumn,
  onOpenNotes,
  onOpenReminder,
  onOpenActivity,
}: KanbanBoardProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );
  const [activeDealId, setActiveDealId] = useState<string | null>(null);

  const dealById = useMemo(() => {
    const map = new Map<string, Deal>();
    columns.forEach((column) => {
      column.deals.forEach((deal) => map.set(deal.id, deal));
    });
    return map;
  }, [columns]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDealId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const sourceColumn = findColumnByDealId(columns, activeId);
    if (!sourceColumn) return;

    const isOverColumn = overId.startsWith("column:");
    const targetColumnId = isOverColumn
      ? overId.replace("column:", "")
      : (over?.data?.current?.columnId as string | undefined);

    if (!targetColumnId) return;

    const targetColumn = columns.find((column) => column.id === targetColumnId);
    if (!targetColumn) return;

    if (sourceColumn.id === targetColumn.id) {
      const fromIndex = sourceColumn.deals.findIndex((deal) => deal.id === activeId);
      const toIndex = sourceColumn.deals.findIndex((deal) => deal.id === overId);
      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;

      const nextDeals = arrayMove(sourceColumn.deals, fromIndex, toIndex);
      onReorderDeals(
        sourceColumn.id,
        nextDeals.map((deal) => deal.id)
      );
      return;
    }

    const activeDealIndex = sourceColumn.deals.findIndex((deal) => deal.id === activeId);
    if (activeDealIndex === -1) return;

    const activeDeal = sourceColumn.deals[activeDealIndex];
    if (!activeDeal) return;
    const sourceDeals = sourceColumn.deals.filter((deal) => deal.id !== activeId);

    const targetIndex = isOverColumn
      ? targetColumn.deals.length
      : targetColumn.deals.findIndex((deal) => deal.id === overId);

    const insertIndex = targetIndex < 0 ? targetColumn.deals.length : targetIndex;

    const targetDeals = [...targetColumn.deals];
    targetDeals.splice(insertIndex, 0, activeDeal);

    onReorderDeals(
      sourceColumn.id,
      sourceDeals.map((deal) => deal.id)
    );
    onReorderDeals(
      targetColumn.id,
      targetDeals.map((deal) => deal.id)
    );
  };

  const handleDragCancel = (_event: DragCancelEvent) => {
    setActiveDealId(null);
  };

  const activeDeal: Deal | null = activeDealId
    ? dealById.get(activeDealId) ?? null
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={(event) => {
        handleDragEnd(event);
        setActiveDealId(null);
      }}
      onDragCancel={handleDragCancel}
    >
      <section className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50/80 via-white/80 to-slate-50/60 p-6 shadow-sm">
        <div className="flex items-start gap-4 overflow-x-auto pb-3 snap-x snap-mandatory">
          {columns
            .map((column) => {
              const visibleDeals = dealFilter
                ? column.deals.filter(dealFilter)
                : column.deals;
              return { column, visibleDeals };
            })
            .filter(({ visibleDeals }) => (compactMode ? visibleDeals.length > 0 : true))
            .map(({ column, visibleDeals }) => (
              <KanbanColumn
                key={column.id}
                column={column}
                visibleDeals={visibleDeals}
                onAddDeal={(columnId) => onAddDeal?.(columnId)}
                onEditDeal={(deal) => onEditDeal?.(deal)}
                onDeleteDeal={(deal) => onDeleteDeal?.(deal)}
                onEditColumn={(columnId) => onEditColumn?.(columnId)}
                onDeleteColumn={(columnId) => onDeleteColumn?.(columnId)}
                onOpenNotes={(deal) => onOpenNotes?.(deal)}
                onOpenReminder={(deal) => onOpenReminder?.(deal)}
                onOpenActivity={(deal) => onOpenActivity?.(deal)}
              />
            ))}
        </div>
      </section>
      <DragOverlay>
        {activeDeal ? (
          <div className="scale-[1.02] opacity-90 shadow-2xl ring-1 ring-slate-200">
            <DealCard deal={activeDeal} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
