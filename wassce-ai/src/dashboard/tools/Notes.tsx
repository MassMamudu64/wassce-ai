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
    <div className="space-y-4 rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-cyan-500/30 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Notebook</p>
          <h3 className="text-lg font-semibold text-white">Study Notes</h3>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="rounded-full border border-cyan-400 px-3 py-1 text-xs uppercase tracking-[0.4em] text-cyan-200 transition hover:bg-cyan-400/20"
        >
          {showForm ? "Cancel" : "New Note"}
        </button>
      </div>

      <input
        type="text"
        placeholder="Search notes…"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
      />

      {showForm && (
        <div className="space-y-3 rounded-lg border border-cyan-400/30 bg-cyan-400/10 p-4">
          <input
            type="text"
            placeholder="Note title"
            value={newNoteTitle}
            onChange={(event) => setNewNoteTitle(event.target.value)}
            className="w-full rounded border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
          />
          <textarea
            placeholder="Note content"
            value={newNoteContent}
            onChange={(event) => setNewNoteContent(event.target.value)}
            rows={4}
            className="w-full rounded border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddNote}
            disabled={!newNoteTitle.trim() || !newNoteContent.trim()}
            className={`rounded border px-4 py-2 text-sm font-semibold transition ${
              newNoteTitle.trim() && newNoteContent.trim()
                ? "border-cyan-400 bg-cyan-400/20 text-cyan-200 hover:bg-cyan-400/30"
                : "cursor-not-allowed border-slate-600 bg-slate-700/50 text-slate-400"
            }`}
          >
            Add Note
          </button>
        </div>
      )}

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {!hasNotes && (
          <div className="rounded-lg border border-white/10 bg-slate-800/50 p-4 text-sm text-slate-300">
            No notes yet. Create one during your next study block to build revision material over time.
          </div>
        )}

        {filteredNotes.map((note) => (
          <article key={note.id} className="rounded-lg border border-white/10 bg-slate-800/50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="truncate font-semibold text-white">{note.title}</h4>
                <p className="mt-2 text-sm text-slate-300">{note.content}</p>
              </div>
              <button type="button" onClick={() => deleteNote(note.id)} className="text-xs text-red-400 hover:text-red-300">
                Delete
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {note.tags.map((tag) => (
                <span key={tag} className="rounded bg-cyan-500/20 px-2 py-1 text-xs text-cyan-200">
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">{formatDate(note.createdAt)}</p>
          </article>
        ))}

        {filteredNotes.length === 0 && hasNotes && (
          <p className="text-center text-sm text-slate-400">No notes match your search.</p>
        )}
      </div>
    </div>
  );
};

export default Notes;
