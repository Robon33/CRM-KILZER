import { useKanban } from "../hooks/useKanban";

const FuturePage = () => {
  const { columns } = useKanban();

  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8">
      <h2 className="text-xl font-semibold text-slate-900">Futures fonctionnalites</h2>
      <p className="mt-2 text-sm text-slate-600">
        Espace reserve pour les prochaines features.
      </p>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
        State global accessible. Colonnes actives : {columns.length}.
      </div>
    </div>
  );
};

export default FuturePage;
