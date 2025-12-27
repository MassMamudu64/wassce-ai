import { useCallback, useMemo, useState } from "react";
import { useWorkspaceStore } from "../../stores/workspaceStore";

const formatDate = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString();
};

const Whiteboard = () => {
  const { diagrams, addDiagram, updateDiagram, deleteDiagram } = useWorkspaceStore();
  const [newDiagramTitle, setNewDiagramTitle] = useState("");
  const [newDiagramContent, setNewDiagramContent] = useState("");
  const [newDiagramType, setNewDiagramType] = useState<"mindmap" | "flowchart" | "concept">("mindmap");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setNewDiagramTitle("");
    setNewDiagramContent("");
    setNewDiagramType("mindmap");
    setShowForm(false);
    setEditingId(null);
  }, []);

  const editingDiagram = useMemo(() => diagrams.find((diagram) => diagram.id === editingId) ?? null, [diagrams, editingId]);

  const handleCreate = useCallback(() => {
    if (!newDiagramTitle.trim() || !newDiagramContent.trim()) return;
    addDiagram({ title: newDiagramTitle.trim(), content: newDiagramContent.trim(), type: newDiagramType });
    resetForm();
  }, [addDiagram, newDiagramContent, newDiagramTitle, newDiagramType, resetForm]);

  const handleUpdate = useCallback(() => {
    if (!editingId || !newDiagramTitle.trim() || !newDiagramContent.trim()) return;
    updateDiagram(editingId, { title: newDiagramTitle.trim(), content: newDiagramContent.trim(), type: newDiagramType });
    resetForm();
  }, [editingId, newDiagramContent, newDiagramTitle, newDiagramType, resetForm, updateDiagram]);

  const beginEdit = (id: string) => {
    const diagram = diagrams.find((entry) => entry.id === id);
    if (!diagram) return;
    setNewDiagramTitle(diagram.title);
    setNewDiagramContent(diagram.content);
    setNewDiagramType(diagram.type);
    setEditingId(id);
    setShowForm(true);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-500/10 to-fuchsia-500/30 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Concept mapping</p>
          <h3 className="text-lg font-semibold text-white">Whiteboard</h3>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="rounded-full border border-fuchsia-400 px-3 py-1 text-xs uppercase tracking-[0.4em] text-fuchsia-200 transition hover:bg-fuchsia-400/20"
        >
          {showForm ? "Close" : "New Diagram"}
        </button>
      </div>

      {showForm && (
        <div className="space-y-3 rounded-lg border border-fuchsia-400/30 bg-fuchsia-400/10 p-4">
          <input
            type="text"
            placeholder="Diagram title"
            value={newDiagramTitle}
            onChange={(event) => setNewDiagramTitle(event.target.value)}
            className="w-full rounded border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-fuchsia-400 focus:outline-none"
          />
          <select
            value={newDiagramType}
            onChange={(event) => setNewDiagramType(event.target.value as typeof newDiagramType)}
            className="w-full rounded border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-fuchsia-400 focus:outline-none"
          >
            <option value="mindmap">Mind Map</option>
            <option value="flowchart">Flowchart</option>
            <option value="concept">Concept Map</option>
          </select>
          <textarea
            placeholder="Use text to outline a solution or map a topic…"
            value={newDiagramContent}
            onChange={(event) => setNewDiagramContent(event.target.value)}
            rows={6}
            className="w-full rounded border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-fuchsia-400 focus:outline-none font-mono"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={editingId ? handleUpdate : handleCreate}
              disabled={!newDiagramTitle.trim() || !newDiagramContent.trim()}
              className={`rounded border px-4 py-2 text-sm font-semibold transition ${
                newDiagramTitle.trim() && newDiagramContent.trim()
                  ? "border-fuchsia-400 bg-fuchsia-400/20 text-fuchsia-200 hover:bg-fuchsia-400/30"
                  : "cursor-not-allowed border-slate-600 bg-slate-700/50 text-slate-400"
              }`}
            >
              {editingId ? "Update" : "Create"} Diagram
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-slate-500"
              >
                Cancel
              </button>
            )}
          </div>
          {editingDiagram && (
            <p className="text-xs text-slate-300">
              Editing: <span className="font-semibold text-white">{editingDiagram.title}</span>
            </p>
          )}
        </div>
      )}

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {diagrams.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-slate-800/50 p-4 text-sm text-slate-300">
            No diagrams yet. Create one to map a topic or outline an answer before writing.
          </div>
        ) : (
          diagrams.map((diagram) => (
            <article key={diagram.id} className="rounded-lg border border-white/10 bg-slate-800/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="truncate font-semibold text-white">{diagram.title}</h4>
                  <span className="text-xs uppercase tracking-[0.3em] text-fuchsia-300">{diagram.type}</span>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => beginEdit(diagram.id)} className="text-xs text-blue-400 hover:text-blue-300">
                    Edit
                  </button>
                  <button type="button" onClick={() => deleteDiagram(diagram.id)} className="text-xs text-red-400 hover:text-red-300">
                    Delete
                  </button>
                </div>
              </div>
              <pre className="mt-3 whitespace-pre-wrap text-sm text-slate-300 font-mono">{diagram.content}</pre>
              <p className="mt-2 text-xs text-slate-500">{formatDate(diagram.createdAt)}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default Whiteboard;

