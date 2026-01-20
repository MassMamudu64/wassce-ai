import { create } from "zustand";
import { upsertWorkspaceState } from "../utils/supabaseData";

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
  userRef: string | null;
  notes: WorkspaceNote[];
  diagrams: WhiteboardDiagram[];

  setUserRef: (userRef: string | null) => void;
  hydrate: (data: WorkspaceStateData | null) => void;
  addNote: (note: Omit<WorkspaceNote, "id" | "createdAt">) => void;
  deleteNote: (id: string) => void;

  addDiagram: (diagram: Omit<WhiteboardDiagram, "id" | "createdAt">) => void;
  updateDiagram: (id: string, updates: Partial<Omit<WhiteboardDiagram, "id" | "createdAt">>) => void;
  deleteDiagram: (id: string) => void;

  resetWorkspace: () => void;
}

export type WorkspaceStateData = {
  notes: WorkspaceNote[];
  diagrams: WhiteboardDiagram[];
};

const serialize = (data: WorkspaceStateData) => JSON.parse(JSON.stringify(data)) as WorkspaceStateData;

const selectState = (state: WorkspaceState): WorkspaceStateData => ({
  notes: state.notes,
  diagrams: state.diagrams,
});

const persistState = (userRef: string | null, data: WorkspaceStateData) => {
  if (!userRef) return;
  void upsertWorkspaceState(userRef, serialize(data)).catch(() => {});
};

const initialState: WorkspaceStateData = { notes: [], diagrams: [] };

export const useWorkspaceStore = create<WorkspaceState>()((set, get) => ({
  userRef: null,
  ...initialState,

  setUserRef: (userRef) => set({ userRef }),
  hydrate: (data) => set({ ...(data ?? initialState) }),

  addNote: (note) => {
    set((state) => ({
      notes: [
        {
          id: `note-${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...note,
        },
        ...state.notes,
      ],
    }));
    persistState(get().userRef, selectState(get()));
  },

  deleteNote: (id) => {
    set((state) => ({ notes: state.notes.filter((note) => note.id !== id) }));
    persistState(get().userRef, selectState(get()));
  },

  addDiagram: (diagram) => {
    set((state) => ({
      diagrams: [
        {
          id: `diagram-${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...diagram,
        },
        ...state.diagrams,
      ],
    }));
    persistState(get().userRef, selectState(get()));
  },

  updateDiagram: (id, updates) => {
    const diagrams = get().diagrams;
    const index = diagrams.findIndex((diagram) => diagram.id === id);
    if (index < 0) return;

    const next = diagrams.slice();
    next[index] = { ...next[index], ...updates };
    set({ diagrams: next });
    persistState(get().userRef, selectState(get()));
  },

  deleteDiagram: (id) => {
    set((state) => ({ diagrams: state.diagrams.filter((diagram) => diagram.id !== id) }));
    persistState(get().userRef, selectState(get()));
  },

  resetWorkspace: () => {
    set({ ...initialState });
    persistState(get().userRef, selectState(get()));
  },
}));
