import { useMemo, useState } from "react";
import { useWorkspaceStore } from "../../stores/workspaceStore";

const formatDate = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString();
};

const Notes = () => {
  const { notes, addNote, deleteNote } = useWorkspaceStore();
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

  const filteredNotes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return notes;
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(term) ||
        note.content.toLowerCase().includes(term) ||
        note.tags.some((tag) => tag.toLowerCase().includes(term)),
    );
  }, [notes, searchTerm]);

  const handleAddNote = () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    addNote({
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      tags: [],
    });

    setNewNoteTitle("");
    setNewNoteContent("");
    setShowForm(false);
  };

  const hasNotes = notes.length > 0;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Notebook</p>
          <h3 className="text-lg font-semibold text-slate-900">Study Notes</h3>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-[0.4em] text-slate-600 transition hover:border-slate-300"
        >
          {showForm ? "Cancel" : "New Note"}
        </button>
      </div>

      <input
        type="text"
        placeholder="Search notes"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
      />

      {showForm && (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          <input
            type="text"
            placeholder="Note title"
            value={newNoteTitle}
            onChange={(event) => setNewNoteTitle(event.target.value)}
            className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
          />
          <textarea
            placeholder="Note content"
            value={newNoteContent}
            onChange={(event) => setNewNoteContent(event.target.value)}
            rows={4}
            className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddNote}
            disabled={!newNoteTitle.trim() || !newNoteContent.trim()}
            className={`rounded border px-4 py-2 text-sm font-semibold transition ${
              newNoteTitle.trim() && newNoteContent.trim()
                ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
                : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
            }`}
          >
            Add Note
          </button>
        </div>
      )}

      <div className="max-h-64 space-y-3 overflow-y-auto">
        {!hasNotes && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
            No notes yet. Create one during your next study block to build revision material over time.
          </div>
        )}

        {filteredNotes.map((note) => (
          <article key={note.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="truncate font-semibold text-slate-900">{note.title}</h4>
                <p className="mt-2 text-sm text-slate-600">{note.content}</p>
              </div>
              <button
                type="button"
                onClick={() => deleteNote(note.id)}
                className="text-xs text-rose-600 hover:text-rose-700"
              >
                Delete
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {note.tags.map((tag) => (
                <span key={tag} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">{formatDate(note.createdAt)}</p>
          </article>
        ))}

        {filteredNotes.length === 0 && hasNotes && (
          <p className="text-center text-sm text-slate-500">No notes match your search.</p>
        )}
      </div>
    </div>
  );
};

export default Notes;
