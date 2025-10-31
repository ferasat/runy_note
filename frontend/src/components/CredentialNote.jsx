import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import clsx from 'clsx';

export default function CredentialNote({ note, onEdit, onDelete, onReveal, revealedPassword }) {
  const [isMasked, setMasked] = useState(true);

  useEffect(() => {
    if (revealedPassword) {
      setMasked(false);
    }
  }, [revealedPassword]);

  const passwordValue = isMasked ? note.content?.password ?? '••••••••' : revealedPassword;

  const toggleVisibility = async () => {
    if (isMasked) {
      const password = revealedPassword ?? (await onReveal?.(note));
      if (!password) {
        return;
      }
      setMasked(false);
    } else {
      setMasked(true);
    }
  };

  const handleCopy = async () => {
    if (!revealedPassword) return;
    try {
      await navigator.clipboard.writeText(revealedPassword);
    } catch (error) {
      console.error('Failed to copy password', error);
    }
  };

  return (
    <article className="rounded-2xl border border-slate-200/70 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/70 p-4 shadow-sm">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{note.title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{dayjs(note.created_at).format('YYYY/MM/DD HH:mm')}</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button className="text-blue-500 hover:text-blue-600" onClick={() => onEdit(note)}>ویرایش</button>
          <button className="text-rose-500 hover:text-rose-600" onClick={() => onDelete(note)}>حذف</button>
        </div>
      </header>
      <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
        <div className="flex items-center justify-between">
          <span className="font-medium">وب‌سایت:</span>
          <span>{note.content?.site}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">نام کاربری:</span>
          <span>{note.content?.username}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium">رمز عبور:</span>
          <div className="flex items-center gap-2">
            <span className={clsx('select-all font-mono text-sm', { 'tracking-widest': isMasked })}>{passwordValue || '—'}</span>
            {note.content?.password_available && (
              <button onClick={toggleVisibility} className="text-xs text-blue-500 hover:text-blue-600">
                {isMasked ? 'نمایش' : 'مخفی'}
              </button>
            )}
            {!isMasked && revealedPassword && (
              <button onClick={handleCopy} className="text-xs text-emerald-500 hover:text-emerald-600">
                کپی
              </button>
            )}
          </div>
        </div>
        {note.content?.note && (
          <p className="whitespace-pre-wrap text-xs text-slate-500 dark:text-slate-300">{note.content.note}</p>
        )}
      </div>
      {note.tags?.length > 0 && (
        <footer className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
          {note.tags.map((tag) => (
            <span key={tag.id} className="rounded-full bg-amber-100/70 px-3 py-1 dark:bg-amber-500/20">{tag.name}</span>
          ))}
        </footer>
      )}
    </article>
  );
}
