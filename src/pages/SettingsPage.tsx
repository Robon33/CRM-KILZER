import { useKanban } from "../hooks/useKanban";

const SettingsPage = () => {
  const { columns } = useKanban();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8">
      <h2 className="text-xl font-semibold text-slate-900">Parametres du compte</h2>
      <p className="mt-2 text-sm text-slate-600">A la trullo.</p>
      <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-4 text-xs text-slate-500">
        State global disponible. Colonnes : {columns.length}.
      </div>
    </div>
  );
};

export default SettingsPage;
