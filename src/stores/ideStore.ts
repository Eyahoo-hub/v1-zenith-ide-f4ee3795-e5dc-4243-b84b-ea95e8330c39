import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
export interface FileNode {
  id: string;
  name: string;
  path: string;
  content?: string;
  children?: FileNode[];
  handle: FileSystemFileHandle | FileSystemDirectoryHandle;
}
export interface OpenFile {
  id: string;
  name: string;
  path: string;
  content: string;
  handle: FileSystemFileHandle;
  isDirty?: boolean; // Track unsaved changes
}
interface IdeState {
  fileTree: FileNode | null;
  openFiles: OpenFile[];
  activeFileId: string | null;
  setFileTree: (fileTree: FileNode | null) => void;
  openFile: (file: Omit<OpenFile, 'isDirty'>) => void;
  closeFile: (fileId: string) => void;
  setActiveFile: (fileId: string | null) => void;
  updateFileContent: (fileId: string, content: string) => void;
  saveFile: (fileId: string) => void;
  addNodeToFileTree: (parentNodeId: string, newNode: FileNode) => void;
  removeNodeFromFileTree: (nodeId: string) => void;
}
const findAndMutateNode = (
  nodes: FileNode[],
  nodeId: string,
  mutate: (nodes: FileNode[], index: number) => void
) => {
  const index = nodes.findIndex((n) => n.id === nodeId);
  if (index !== -1) {
    mutate(nodes, index);
    return true;
  }
  for (const node of nodes) {
    if (node.children && findAndMutateNode(node.children, nodeId, mutate)) {
      return true;
    }
  }
  return false;
};
export const useIdeStore = create<IdeState>()(
  immer((set, get) => ({
    fileTree: null,
    openFiles: [],
    activeFileId: null,
    setFileTree: (fileTree) => {
      set((state) => {
        state.fileTree = fileTree;
      });
    },
    openFile: (file) => {
      const { openFiles } = get();
      if (!openFiles.some((f) => f.id === file.id)) {
        set((state) => {
          state.openFiles.push({ ...file, isDirty: false });
          state.activeFileId = file.id;
        });
      } else {
        set((state) => {
          state.activeFileId = file.id;
        });
      }
    },
    closeFile: (fileId) => {
      set((state) => {
        const fileIndex = state.openFiles.findIndex((f) => f.id === fileId);
        if (fileIndex === -1) return;
        const fileToClose = state.openFiles[fileIndex];
        if (fileToClose.isDirty && !window.confirm('You have unsaved changes. Are you sure you want to close?')) {
          return;
        }
        state.openFiles.splice(fileIndex, 1);
        if (state.activeFileId === fileId) {
          if (state.openFiles.length > 0) {
            const newActiveIndex = Math.max(0, fileIndex - 1);
            state.activeFileId = state.openFiles[newActiveIndex].id;
          } else {
            state.activeFileId = null;
          }
        }
      });
    },
    setActiveFile: (fileId) => {
      set((state) => {
        state.activeFileId = fileId;
      });
    },
    updateFileContent: (fileId, content) => {
      set((state) => {
        const file = state.openFiles.find((f) => f.id === fileId);
        if (file && file.content !== content) {
          file.content = content;
          file.isDirty = true;
        }
      });
    },
    saveFile: (fileId) => {
      set((state) => {
        const file = state.openFiles.find((f) => f.id === fileId);
        if (file) {
          file.isDirty = false;
        }
      });
    },
    addNodeToFileTree: (parentNodeId, newNode) => {
      set((state) => {
        if (!state.fileTree) return;
        const addRec = (node: FileNode): boolean => {
          if (node.id === parentNodeId) {
            node.children = [...(node.children || []), newNode].sort((a, b) => {
              if (a.children && !b.children) return -1;
              if (!a.children && b.children) return 1;
              return a.name.localeCompare(b.name);
            });
            return true;
          }
          if (node.children) {
            for (const child of node.children) {
              if (addRec(child)) return true;
            }
          }
          return false;
        };
        addRec(state.fileTree);
      });
    },
    removeNodeFromFileTree: (nodeId) => {
      set((state) => {
        if (!state.fileTree) return;
        if (state.fileTree.id === nodeId) {
          state.fileTree = null;
          return;
        }
        findAndMutateNode(state.fileTree.children || [], nodeId, (nodes, index) => {
          nodes.splice(index, 1);
        });
      });
    },
  }))
);
export const selectActiveFile = (state: IdeState) => state.openFiles.find(f => f.id === state.activeFileId);