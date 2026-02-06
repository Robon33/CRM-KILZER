import { useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
} from "@dnd-kit/core";
import type { Deal, Reminder } from "../types/kanban";

interface CalendarViewProps {
  deals: Deal[];
  reminders: Reminder[];
  onMoveReminder: (reminderId: string, nextDate: string) => void;
}

const startOfWeek = (date: Date) => {
  const day = date.getDay();
  const diff = (day + 6) % 7;
  const result = new Date(date);
  result.setDate(date.getDate() - diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

const startOfMonthGrid = (date: Date) => {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  return startOfWeek(first);
};

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

const CalendarView = ({ deals, reminders, onMoveReminder }: CalendarViewProps) => {
  const [cursorDate, setCursorDate] = useState(new Date());
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const days = useMemo(() => {
    const start = startOfMonthGrid(cursorDate);
    return Array.from({ length: 42 }, (_, idx) => addDays(start, idx));
  }, [cursorDate]);

  const reminderMap = useMemo(() => {
    const map = new Map<string, Reminder[]>();
    reminders.forEach((rem) => {
      const [dateKey] = rem.remindAt.split("T");
      if (!dateKey) return;
      const list = map.get(dateKey) ?? [];
      list.push(rem);
      map.set(dateKey, list);
    });
    return map;
  }, [reminders]);

  const dealById = useMemo(() => {
    const map = new Map<string, Deal>();
    deals.forEach((deal) => map.set(deal.id, deal));
    return map;
  }, [deals]);

  const goPrev = () => {
    setCursorDate(new Date(cursorDate.getFullYear(), cursorDate.getMonth() - 1, 1));
  };

  const goNext = () => {
    setCursorDate(new Date(cursorDate.getFullYear(), cursorDate.getMonth() + 1, 1));
  };

  const timeLabel = reminder.remindAt.split("T")[1] ?? "";

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Calendrier</h2>
          <p className="mt-1 text-sm text-slate-600">
            Vue mensuelle des rappels.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"
          >
            Precedent
          </button>
          <div className="rounded-full bg-slate-100 px-4 py-1 text-xs font-semibold text-slate-700">
            {cursorDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
          </div>
          <button
            type="button"
            onClick={goNext}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"
          >
            Suivant
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragEnd={(event: DragEndEvent) => {
          const { active, over } = event;
          if (!over) return;
          const overId = String(over.id);
          if (!overId.startsWith("date:")) return;
          const nextDate = overId.replace("date:", "");
          onMoveReminder(String(active.id), nextDate);
        }}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
          {days.map((day) => {
            const iso = toIsoDate(day);
            const list = reminderMap.get(iso) ?? [];
            const inMonth = day.getMonth() === cursorDate.getMonth();

            return (
              <CalendarDayCell
                key={iso}
                id={`date:${iso}`}
                label={day.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })}
                reminders={list}
                dealById={dealById}
                muted={!inMonth}
              />
            );
          })}
        </div>
      </DndContext>
    </section>
  );
};

interface CalendarDayCellProps {
  id: string;
  label: string;
  reminders: Reminder[];
  dealById: Map<string, Deal>;
  muted: boolean;
}

const CalendarDayCell = ({ id, label, reminders, dealById, muted }: CalendarDayCellProps) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[140px] rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-600 transition ${
        muted ? "opacity-50" : ""
      } ${isOver ? "border-slate-400 bg-slate-50" : ""}`}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 space-y-2">
        {reminders.length === 0 ? (
          <p className="text-[11px] text-slate-400">Aucun rappel</p>
        ) : (
          reminders.map((rem) => (
            <CalendarReminderChip
              key={rem.id}
              reminder={rem}
              deal={dealById.get(rem.dealId)}
            />
          ))
        )}
      </div>
    </div>
  );
};

const CalendarReminderChip = ({ reminder, deal }: { reminder: Reminder; deal?: Deal }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: reminder.id,
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] shadow-sm transition ${
        isDragging ? "opacity-60" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="font-semibold text-slate-700">{deal?.title ?? "Deal"}</div>
      <div className="text-slate-500">{timeLabel}</div>
    </div>
  );
};

export default CalendarView;
