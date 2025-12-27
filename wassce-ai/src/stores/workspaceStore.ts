import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WorkspaceNote = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
};

export type WhiteboardDiagram = {
  id: string;
  title: string;
  content: string;
  type: "mindmap" | "flowchart" | "concept";
  createdAt: string;
};

interface WorkspaceState {
  notes: WorkspaceNote[];
  diagrams: WhiteboardDiagram[];

  addNote: (note: Omit<WorkspaceNote, "id" | "createdAt">) => void;
  deleteNote: (id: string) => void;

  addDiagram: (diagram: Omit<WhiteboardDiagram, "id" | "createdAt">) => void;
  updateDiagram: (id: string, updates: Partial<Omit<WhiteboardDiagram, "id" | "createdAt">>) => void;
  deleteDiagram: (id: string) => void;

  resetWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      notes: [],
      diagrams: [],

      addNote: (note) =>
        set((state) => ({
          notes: [
            {
              id: `note-${Date.now()}`,
              createdAt: new Date().toISOString(),
              ...note,
            },
            ...state.notes,
          ],
        })),

      deleteNote: (id) => set((state) => ({ notes: state.notes.filter((note) => note.id !== id) })),

      addDiagram: (diagram) =>
        set((state) => ({
          diagrams: [
            {
              id: `diagram-${Date.now()}`,
              createdAt: new Date().toISOString(),
              ...diagram,
            },
            ...state.diagrams,
          ],
        })),

      updateDiagram: (id, updates) => {
        const diagrams = get().diagrams;
        const index = diagrams.findIndex((diagram) => diagram.id === id);
        if (index < 0) return;

        const next = diagrams.slice();
        next[index] = { ...next[index], ...updates };
        set({ diagrams: next });
      },

      deleteDiagram: (id) => set((state) => ({ diagrams: state.diagrams.filter((diagram) => diagram.id !== id) })),

      resetWorkspace: () => set({ notes: [], diagrams: [] }),
    }),
    { name: "workspace-storage" },
  ),
);
