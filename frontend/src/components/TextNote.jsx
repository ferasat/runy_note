import dayjs from 'dayjs';

export default function TextNote({ note, onEdit, onDelete }) {
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
      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200">{note.content?.text}</p>
      {note.tags?.length > 0 && (
        <footer className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
          {note.tags.map((tag) => (
            <span key={tag.id} className="rounded-full bg-slate-100/80 px-3 py-1 dark:bg-slate-800/70">{tag.name}</span>
          ))}
        </footer>
      )}
    </article>
  );
}
