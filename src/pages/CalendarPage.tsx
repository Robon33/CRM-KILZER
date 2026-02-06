import CalendarView from "../components/CalendarView";
import { useKanban } from "../hooks/useKanban";

const CalendarPage = () => {
  const { deals, reminders, editReminder, loading, error, refresh } = useKanban();

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
    <CalendarView
      deals={deals}
      reminders={reminders}
      onMoveReminder={(reminderId, nextDate) => {
        const reminder = reminders.find((r) => r.id === reminderId);
        if (!reminder) return;
        const time = reminder.remindAt.split("T")[1] ?? "09:00";
        void editReminder(reminderId, `${nextDate}T${time}`);
      }}
    />
  );
};

export default CalendarPage;
