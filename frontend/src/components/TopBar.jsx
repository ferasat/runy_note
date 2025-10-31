import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function TopBar() {
  const { user, logout } = useAuth();
  const sdk = useMemo(() => window.Eitaa?.WebApp ?? null, []);

  const handleClose = () => {
    if (sdk?.close) {
      sdk.close();
    } else {
      window.close();
    }
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-surface/80 dark:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-700/60">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-300">خوش آمدید</p>
          <p className="text-base font-semibold">{user?.name || user?.username || 'کاربر'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full border border-slate-300/70 dark:border-slate-600/70 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/70"
          >
            بستن برنامه
          </button>
          <button
            type="button"
            onClick={logout}
            className="rounded-full bg-primary/90 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary"
          >
            خروج
          </button>
        </div>
      </div>
    </header>
  );
}
