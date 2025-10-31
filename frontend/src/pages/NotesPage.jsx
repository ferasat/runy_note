import { useEffect, useMemo, useState } from 'react';
import { createNote, deleteNote, fetchNoteDetail, fetchNotes, fetchTags, updateNote } from '../utils/api.js';
import { useToast } from '../context/ToastContext.jsx';
import TextNote from '../components/TextNote.jsx';
import CredentialNote from '../components/CredentialNote.jsx';
import TodoNote from '../components/TodoNote.jsx';
import NoteFormModal from '../components/NoteFormModal.jsx';
import TagFilter from '../components/TagFilter.jsx';

const typeFilters = [
  { value: '', label: 'همه' },
  { value: 'text', label: 'متنی' },
  { value: 'credential', label: 'رمز عبور' },
  { value: 'todo', label: 'کار' }
];

export default function NotesPage() {
  const { show } = useToast();
  const [notes, setNotes] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', tags: [] });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [revealedCredentials, setRevealedCredentials] = useState({});

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    loadTags();
  }, []);

  useEffect(() => {
    loadNotes();
  }, [filters, debouncedSearch]);

  const loadTags = async () => {
    try {
      const response = await fetchTags();
      setTags(response.data?.data ?? response.data ?? []);
    } catch (error) {
      console.error('Failed to load tags', error);
    }
  };

  const loadNotes = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.tags.length) params.tags = filters.tags.join(',');
      if (debouncedSearch) params.search = debouncedSearch;
      const response = await fetchNotes(params);
      setNotes(response.data?.data ?? response.data ?? []);
    } catch (error) {
      console.error('Failed to load notes', error);
      show('خطا در بارگذاری یادداشت‌ها', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (payload, noteId) => {
    try {
      let response;
      if (noteId) {
        response = await updateNote(noteId, payload);
        const updated = response.data?.data ?? response.data;
        setNotes((prev) => prev.map((note) => (note.id === updated.id ? updated : note)));
        setRevealedCredentials((prev) => {
          if (!prev[noteId]) {
            return prev;
          }
          const next = { ...prev };
          delete next[noteId];
          return next;
        });
        show('یادداشت به‌روزرسانی شد', 'success');
      } else {
        response = await createNote(payload);
        const created = response.data?.data ?? response.data;
        setNotes((prev) => [created, ...prev]);
        show('یادداشت ایجاد شد', 'success');
      }
      await loadTags();
    } catch (error) {
      console.error('Save note failed', error);
      show(error.response?.data?.message ?? 'ذخیره یادداشت ناموفق بود', 'error');
    }
  };

  const handleDelete = async (note) => {
    if (!window.confirm('آیا از حذف این یادداشت مطمئن هستید؟')) {
      return;
    }
    try {
      await deleteNote(note.id);
      setNotes((prev) => prev.filter((item) => item.id !== note.id));
      setRevealedCredentials((prev) => {
        const next = { ...prev };
        delete next[note.id];
        return next;
      });
      show('یادداشت حذف شد', 'success');
    } catch (error) {
      console.error('Delete note failed', error);
      show('حذف یادداشت ناموفق بود', 'error');
    }
  };

  const handleToggleTodo = async (note, done) => {
    try {
      const payload = {
        title: note.title,
        type: 'todo',
        content: {
          task: note.content?.task ?? '',
          done
        },
        tags: note.tags?.map((tag) => tag.name) ?? []
      };
      const response = await updateNote(note.id, payload);
      const updated = response.data?.data ?? response.data;
      setNotes((prev) => prev.map((item) => (item.id === note.id ? updated : item)));
    } catch (error) {
      console.error('Toggle todo failed', error);
      show('به‌روزرسانی وضعیت کار ناموفق بود', 'error');
    }
  };

  const handleRevealCredential = async (note) => {
    try {
      const response = await fetchNoteDetail(note.id, { reveal: true });
      const data = response.data?.data ?? response.data;
      const password = data.content?.password;
      if (password) {
        setRevealedCredentials((prev) => ({ ...prev, [note.id]: password }));
        setNotes((prev) => prev.map((item) => (item.id === note.id ? data : item)));
        return password;
      }
      return null;
    } catch (error) {
      console.error('Reveal credential failed', error);
      show('عدم دسترسی به رمز عبور', 'error');
      return null;
    }
  };

  const filteredTags = useMemo(() => tags.map((tag) => ({ id: tag.id, name: tag.name })), [tags]);

  const openCreateModal = () => {
    setEditingNote(null);
    setModalOpen(true);
  };

  const openEditModal = (note) => {
    setEditingNote(note);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingNote(null);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-6">
      <section className="rounded-3xl bg-white/90 p-6 shadow-lg backdrop-blur dark:bg-slate-900/90">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <select
              value={filters.type}
              onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
              className="rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-sm focus:border-primary focus:ring-primary"
            >
              {typeFilters.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="relative">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="جست‌وجو"
                className="rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-sm focus:border-primary focus:ring-primary"
              />
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow hover:bg-primary/90"
          >
            یادداشت جدید
          </button>
        </div>
        <div className="mt-4">
          <TagFilter
            tags={filteredTags}
            selected={filters.tags}
            onToggle={(name) =>
              setFilters((prev) => ({
                ...prev,
                tags: prev.tags.includes(name)
                  ? prev.tags.filter((tag) => tag !== name)
                  : [...prev.tags, name]
              }))
            }
            onReset={() => setFilters((prev) => ({ ...prev, tags: [] }))}
          />
        </div>
      </section>

      <section className="space-y-4 pb-12">
        {loading ? (
          <div className="rounded-3xl bg-white/80 p-12 text-center text-sm text-slate-500 shadow-md dark:bg-slate-900/80">
            در حال بارگذاری...
          </div>
        ) : notes.length === 0 ? (
          <div className="rounded-3xl bg-white/80 p-12 text-center text-sm text-slate-500 shadow-md dark:bg-slate-900/80">
            هنوز یادداشتی ثبت نشده است.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {notes.map((note) => {
              switch (note.type) {
                case 'credential':
                  return (
                    <CredentialNote
                      key={note.id}
                      note={note}
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                      onReveal={handleRevealCredential}
                      revealedPassword={revealedCredentials[note.id]}
                    />
                  );
                case 'todo':
                  return (
                    <TodoNote
                      key={note.id}
                      note={note}
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                      onToggle={handleToggleTodo}
                    />
                  );
                default:
                  return (
                    <TextNote
                      key={note.id}
                      note={note}
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                    />
                  );
              }
            })}
          </div>
        )}
      </section>

      <NoteFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleCreateOrUpdate}
        initialNote={editingNote}
        availableTags={tags}
      />
    </div>
  );
}
