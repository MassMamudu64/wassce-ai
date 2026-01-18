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
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Concept mapping</p>
          <h3 className="text-lg font-semibold text-slate-900">Whiteboard</h3>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-[0.4em] text-slate-600 transition hover:border-slate-300"
        >
          {showForm ? "Close" : "New diagram"}
        </button>
      </div>

      {showForm && (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          <input
            type="text"
            placeholder="Diagram title"
            value={newDiagramTitle}
            onChange={(event) => setNewDiagramTitle(event.target.value)}
            className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
          />
          <select
            value={newDiagramType}
            onChange={(event) => setNewDiagramType(event.target.value as typeof newDiagramType)}
            className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none"
          >
            <option value="mindmap">Mind map</option>
            <option value="flowchart">Flowchart</option>
            <option value="concept">Concept map</option>
          </select>
          <textarea
            placeholder="Use text to outline a solution or map a topic"
            value={newDiagramContent}
            onChange={(event) => setNewDiagramContent(event.target.value)}
            rows={6}
            className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none font-mono"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={editingId ? handleUpdate : handleCreate}
              disabled={!newDiagramTitle.trim() || !newDiagramContent.trim()}
              className={`rounded border px-4 py-2 text-sm font-semibold transition ${
                newDiagramTitle.trim() && newDiagramContent.trim()
                  ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
                  : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
              }`}
            >
              {editingId ? "Update" : "Create"} diagram
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:border-slate-300"
              >
                Cancel
              </button>
            )}
          </div>
          {editingDiagram && (
            <p className="text-xs text-slate-500">
              Editing: <span className="font-semibold text-slate-900">{editingDiagram.title}</span>
            </p>
          )}
        </div>
      )}

      <div className="max-h-64 space-y-3 overflow-y-auto">
        {diagrams.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
            No diagrams yet. Create one to map a topic or outline an answer before writing.
          </div>
        ) : (
          diagrams.map((diagram) => (
            <article key={diagram.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="truncate font-semibold text-slate-900">{diagram.title}</h4>
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-500">{diagram.type}</span>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => beginEdit(diagram.id)} className="text-xs text-slate-600 hover:text-slate-900">
                    Edit
                  </button>
                  <button type="button" onClick={() => deleteDiagram(diagram.id)} className="text-xs text-rose-600 hover:text-rose-700">
                    Delete
                  </button>
                </div>
              </div>
              <pre className="mt-3 whitespace-pre-wrap text-sm text-slate-600 font-mono">{diagram.content}</pre>
              <p className="mt-2 text-xs text-slate-500">{formatDate(diagram.createdAt)}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default Whiteboard;
