import { useKanban } from "../hooks/useKanban";
import { useTheme } from "../hooks/useTheme";

const CustomizationPage = () => {
  const { columns } = useKanban();
  const { theme, toggle } = useTheme();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Personnalisation</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Themes et options d'affichage (placeholder).
      </p>
      <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 p-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-300">
        <span>Theme actuel : {theme === "dark" ? "Sombre" : "Clair"}</span>
        <button
          type="button"
          onClick={toggle}
          className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600"
        >
          Basculer
        </button>
      </div>
      <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-300">
        State global disponible : {columns.length} colonnes chargees.
      </div>
    </div>
  );
};

export default CustomizationPage;
