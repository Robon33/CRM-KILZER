import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import type { Deal } from "../types/kanban";
import DealCard from "./DealCard";

interface SortableDealCardProps {
  deal: Deal;
  columnId: string;
  onEdit?: (deal: Deal) => void;
  onDelete?: (deal: Deal) => void;
  onOpenNotes?: (deal: Deal) => void;
  onOpenReminder?: (deal: Deal) => void;
  onOpenActivity?: (deal: Deal) => void;
}

const SortableDealCard = ({
  deal,
  columnId,
  onEdit,
  onDelete,
  onOpenNotes,
  onOpenReminder,
  onOpenActivity,
}: SortableDealCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: deal.id,
      data: { type: "deal", columnId },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`transition-[transform,opacity] duration-200 ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
      {...attributes}
      {...listeners}
    >
      <DealCard
        deal={deal}
        onClick={onEdit ? () => onEdit(deal) : undefined}
        onDelete={onDelete ? () => onDelete(deal) : undefined}
        onOpenNotes={onOpenNotes ? () => onOpenNotes(deal) : undefined}
        onOpenReminder={onOpenReminder ? () => onOpenReminder(deal) : undefined}
        onOpenActivity={onOpenActivity ? () => onOpenActivity(deal) : undefined}
      />
    </div>
  );
};

export default SortableDealCard;
