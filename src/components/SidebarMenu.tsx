import { NavLink } from "react-router-dom";
import { useKanban } from "../hooks/useKanban";

interface SidebarMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

const linkBase =
  "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";

const linkActive = "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900";
const linkIdle =
  "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white";

const SidebarMenu = ({ isOpen, onToggle }: SidebarMenuProps) => {
  const { settings } = useKanban();
  const displayName = settings?.displayName ?? "Kilian";
  const avatarEmoji = settings?.avatarEmoji ?? "🧑🏻‍💻";
  const avatarUrl = settings?.avatarUrl ?? "";

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-full w-64 border-r border-slate-200 bg-white/90 backdrop-blur transition-transform duration-200 md:translate-x-0 dark:border-slate-800 dark:bg-slate-900/90 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-full flex-col p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              CRM personnel
            </p>
            <h1 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">Pipeline</h1>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 md:hidden dark:border-slate-800 dark:text-slate-300"
          >
            Fermer
          </button>
        </div>

        <nav className="mt-8 space-y-2">
          <NavLink
            to="/kanban"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkIdle}`
            }
          >
            Pipeline / Kanban
          </NavLink>
          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkIdle}`
            }
          >
            Calendrier
          </NavLink>
          <NavLink
            to="/future"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkIdle}`
            }
          >
            Analyse
          </NavLink>
          <NavLink
            to="/customization"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkIdle}`
            }
          >
            Personnalisation / theme
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkIdle}`
            }
          >
            Parametres du compte
          </NavLink>
        </nav>

        <div className="mt-auto space-y-3">
          <div className="rounded-2xl border border-dashed border-slate-200 p-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            Slots prets pour nouvelles features
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/70 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-xl dark:border-slate-700 dark:bg-slate-800">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                avatarEmoji
              )}
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                Compte
              </div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {displayName}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SidebarMenu;
