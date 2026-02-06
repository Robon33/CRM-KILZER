import { useState } from "react";
import { useKanban } from "../hooks/useKanban";

const emojiOptions = ["🧑🏻‍💻", "🧑🏽‍💼", "🧑🏼‍🚀", "😎", "🦊", "🦉", "🐼", "🐯", "🌈", "⚡️"];

const SettingsPage = () => {
  const { settings, saveSettings } = useKanban();
  const [name, setName] = useState(settings?.displayName ?? "Kilian");
  const [emoji, setEmoji] = useState(settings?.avatarEmoji ?? "🧑🏻‍💻");
  const [email, setEmail] = useState(settings?.email ?? "");
  const [avatarUrl, setAvatarUrl] = useState(settings?.avatarUrl ?? "");

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Parametres du compte</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Gerer votre identite et les informations visibles dans le menu.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Nom affiché
          </label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Avatar
          </label>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-2xl dark:border-slate-700 dark:bg-slate-800">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                emoji
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {emojiOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setEmoji(option)}
                  className={`rounded-xl border px-2 py-1 text-lg ${
                    emoji === option
                      ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                      : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Email
          </label>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Avatar URL
          </label>
          <input
            value={avatarUrl}
            onChange={(event) => setAvatarUrl(event.target.value)}
            placeholder="https://..."
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <button
          type="button"
          onClick={() =>
            saveSettings({
              displayName: name.trim(),
              avatarEmoji: emoji,
              avatarUrl: avatarUrl.trim() || null,
              email: email.trim() || null,
            })
          }
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
        >
          Sauvegarder
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
