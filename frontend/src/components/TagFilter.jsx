import clsx from 'clsx';

export default function TagFilter({ tags, selected = [], onToggle, onReset }) {
  if (!tags?.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-slate-500">تگ‌ها:</span>
      {tags.map((tag) => {
        const isActive = selected.includes(tag.name);
        return (
          <button
            type="button"
            key={tag.id ?? tag.name}
            onClick={() => onToggle?.(tag.name)}
            className={clsx(
              'rounded-full border px-3 py-1 text-xs font-medium transition-all',
              isActive
                ? 'border-primary/70 bg-primary/10 text-primary-700 dark:text-primary-100'
                : 'border-slate-200/70 text-slate-600 hover:bg-slate-100/70 dark:text-slate-300 dark:border-slate-600/60'
            )}
          >
            {tag.name}
          </button>
        );
      })}
      {selected.length > 0 && (
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-rose-500 hover:text-rose-600"
        >
          ریست فیلتر
        </button>
      )}
    </div>
  );
}
