import dayjs from 'dayjs';

export default function TodoNote({ note, onEdit, onDelete, onToggle }) {
  const isDone = Boolean(note.content?.done);

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
      <div className="mt-4 flex items-center justify-between text-sm text-slate-700 dark:text-slate-200">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isDone}
            onChange={() => onToggle?.(note, !isDone)}
            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
          />
          <span className={isDone ? 'line-through text-slate-400' : ''}>{note.content?.task}</span>
        </label>
      </div>
      {note.tags?.length > 0 && (
        <footer className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
          {note.tags.map((tag) => (
            <span key={tag.id} className="rounded-full bg-emerald-100/70 px-3 py-1 dark:bg-emerald-500/20">{tag.name}</span>
          ))}
        </footer>
      )}
    </article>
  );
}
