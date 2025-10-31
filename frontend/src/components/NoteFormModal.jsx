import { createPortal } from 'react-dom';
import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';

const typeOptions = [
  { value: 'text', label: 'متنی' },
  { value: 'credential', label: 'رمز عبور' },
  { value: 'todo', label: 'کار' }
];

export default function NoteFormModal({ isOpen, onClose, onSubmit, initialNote, availableTags = [] }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('text');
  const [contentState, setContentState] = useState({});
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(initialNote?.title ?? '');
    setType(initialNote?.type ?? 'text');
    setSelectedTags(initialNote?.tags?.map((tag) => tag.name) ?? []);

    if (initialNote?.type === 'credential') {
      setContentState({
        site: initialNote.content?.site ?? '',
        username: initialNote.content?.username ?? '',
        password: '',
        note: initialNote.content?.note ?? '',
        password_available: initialNote.content?.password_available ?? false
      });
    } else if (initialNote?.type === 'todo') {
      setContentState({
        task: initialNote.content?.task ?? '',
        done: Boolean(initialNote.content?.done)
      });
    } else {
      setContentState({ text: initialNote?.content?.text ?? '' });
    }
  }, [initialNote, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setTagInput('');
      setSubmitting(false);
    }
  }, [isOpen]);

  const suggestions = useMemo(() => {
    return availableTags
      .map((tag) => tag.name)
      .filter((name) => !selectedTags.includes(name) && name.includes(tagInput.trim()) && tagInput.trim());
  }, [availableTags, selectedTags, tagInput]);

  const handleAddTag = (name) => {
    const cleaned = name.trim();
    if (!cleaned || selectedTags.includes(cleaned)) return;
    setSelectedTags((prev) => [...prev, cleaned]);
    setTagInput('');
  };

  const handleRemoveTag = (name) => {
    setSelectedTags((prev) => prev.filter((tag) => tag !== name));
  };

  const renderFields = () => {
    switch (type) {
      case 'credential':
        return (
          <div className="space-y-3 text-sm">
            <div>
              <label className="block text-xs text-slate-500">آدرس سایت</label>
              <input
                value={contentState.site ?? ''}
                onChange={(event) => setContentState((prev) => ({ ...prev, site: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500">نام کاربری</label>
              <input
                value={contentState.username ?? ''}
                onChange={(event) => setContentState((prev) => ({ ...prev, username: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500">رمز عبور</label>
              <input
                type="password"
                value={contentState.password ?? ''}
                placeholder={contentState.password_available ? 'خالی بگذارید تا بدون تغییر بماند' : ''}
                onChange={(event) => setContentState((prev) => ({ ...prev, password: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500">یادداشت</label>
              <textarea
                value={contentState.note ?? ''}
                onChange={(event) => setContentState((prev) => ({ ...prev, note: event.target.value }))}
                rows="3"
                className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
              />
            </div>
          </div>
        );
      case 'todo':
        return (
          <div className="space-y-3 text-sm">
            <div>
              <label className="block text-xs text-slate-500">عنوان کار</label>
              <input
                value={contentState.task ?? ''}
                onChange={(event) => setContentState((prev) => ({ ...prev, task: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-500">
              <input
                type="checkbox"
                checked={Boolean(contentState.done)}
                onChange={(event) => setContentState((prev) => ({ ...prev, done: event.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              انجام شده؟
            </label>
          </div>
        );
      default:
        return (
          <div className="space-y-3 text-sm">
            <div>
              <label className="block text-xs text-slate-500">متن یادداشت</label>
              <textarea
                value={contentState.text ?? ''}
                onChange={(event) => setContentState((prev) => ({ ...prev, text: event.target.value }))}
                rows="6"
                className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
              />
            </div>
          </div>
        );
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    let contentPayload = {};
    if (type === 'credential') {
      contentPayload = {
        site: contentState.site ?? '',
        username: contentState.username ?? '',
        note: contentState.note ?? ''
      };
      if (contentState.password) {
        contentPayload.password = contentState.password;
      }
      if (initialNote?.type === 'credential' && initialNote.content?.password_available && !contentState.password) {
        contentPayload.password = null;
      }
    } else if (type === 'todo') {
      contentPayload = {
        task: contentState.task ?? '',
        done: Boolean(contentState.done)
      };
    } else {
      contentPayload = {
        text: contentState.text ?? ''
      };
    }

    const payload = {
      title,
      type,
      content: contentPayload,
      tags: selectedTags
    };

    try {
      await onSubmit?.(payload, initialNote?.id ?? null);
      onClose?.();
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <form onSubmit={handleSubmit} className="w-full max-w-xl rounded-3xl bg-white p-6 text-right shadow-xl dark:bg-slate-900/95">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {initialNote ? 'ویرایش یادداشت' : 'یادداشت جدید'}
          </h2>
          <button type="button" className="text-sm text-slate-500 hover:text-slate-700" onClick={onClose}>
            بستن
          </button>
        </div>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs text-slate-500">عنوان</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500">نوع یادداشت</label>
            <select
              value={type}
              onChange={(event) => {
                const nextType = event.target.value;
                setType(nextType);
                if (nextType === 'text') {
                  setContentState({ text: '' });
                } else if (nextType === 'credential') {
                  setContentState({ site: '', username: '', password: '', note: '' });
                } else {
                  setContentState({ task: '', done: false });
                }
              }}
              className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {renderFields()}
          <div>
            <label className="block text-xs text-slate-500">تگ‌ها</label>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary-700 dark:text-primary-100"
                >
                  {tag}
                  <button type="button" className="text-rose-500" onClick={() => handleRemoveTag(tag)}>
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                placeholder="نام تگ"
                className="flex-1 rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => handleAddTag(tagInput)}
                className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white"
              >
                افزودن
              </button>
            </div>
            {suggestions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleAddTag(suggestion)}
                    className="rounded-full border border-slate-200/70 px-3 py-1 hover:bg-slate-100/80"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300/80 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100/70"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={clsx(
              'rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow hover:bg-primary/90',
              submitting && 'opacity-70'
            )}
          >
            ذخیره
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
