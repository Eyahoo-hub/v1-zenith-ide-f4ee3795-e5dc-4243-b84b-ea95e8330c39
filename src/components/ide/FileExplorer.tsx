import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIdeStore, type FileNode } from '@/stores/ideStore';
import { openDirectory, readFileContent, createNewFile, createNewFolder, deleteEntry } from '@/lib/fileSystem';
import { Folder, File, FolderOpen, ChevronRight, ChevronDown, FilePlus, FolderPlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
const findParentNode = (root: FileNode, nodeId: string): FileNode | null => {
  if (root.children?.some(child => child.id === nodeId)) {
    return root;
  }
  if (root.children) {
    for (const child of root.children) {
      if (child.children) {
        const found = findParentNode(child, nodeId);
        if (found) return found;
      }
    }
  }
  return null;
};
const FileTree: React.FC<{ node: FileNode; level?: number; isRoot?: boolean }> = ({ node, level = 0, isRoot = false }) => {
  const [isOpen, setIsOpen] = React.useState(level < 2);
  const { openFile, addNodeToFileTree, removeNodeFromFileTree, closeFile } = useIdeStore();
  const handleFileClick = async (fileNode: FileNode) => {
    if (fileNode.handle.kind !== 'file') return;
    try {
      const content = await readFileContent(fileNode.handle);
      openFile({
        id: fileNode.id,
        name: fileNode.name,
        path: fileNode.path,
        content: content,
        handle: fileNode.handle,
      });
    } catch (error) {
      toast.error(`Failed to open file: ${fileNode.name}`);
    }
  };
  const handleCreateFile = async () => {
    const fileName = prompt("Enter file name:");
    if (!fileName || node.handle.kind !== 'directory') return;
    try {
      const newFileHandle = await createNewFile(node.handle, fileName);
      const newNode: FileNode = {
        id: `${node.path}/${fileName}`,
        name: fileName,
        path: `${node.path}/${fileName}`,
        handle: newFileHandle,
      };
      addNodeToFileTree(node.id, newNode);
      toast.success(`File "${fileName}" created.`);
    } catch (e) {
      toast.error("Failed to create file.");
    }
  };
  const handleCreateFolder = async () => {
    const folderName = prompt("Enter folder name:");
    if (!folderName || node.handle.kind !== 'directory') return;
    try {
      const newFolderHandle = await createNewFolder(node.handle, folderName);
      const newNode: FileNode = {
        id: `${node.path}/${folderName}`,
        name: folderName,
        path: `${node.path}/${folderName}`,
        handle: newFolderHandle,
        children: [],
      };
      addNodeToFileTree(node.id, newNode);
      toast.success(`Folder "${folderName}" created.`);
    } catch (e) {
      toast.error("Failed to create folder.");
    }
  };
  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${node.name}"? This action cannot be undone.`)) return;
    const rootNode = useIdeStore.getState().fileTree;
    if (!rootNode) return;
    const parentNode = findParentNode(rootNode, node.id);
    if (!parentNode || !(parentNode.handle instanceof FileSystemDirectoryHandle)) {
        toast.error("Could not find parent directory to delete from.");
        return;
    }
    try {
      await deleteEntry(parentNode.handle, node.name);
      removeNodeFromFileTree(node.id);
      if (node.handle.kind === 'file') {
        closeFile(node.id);
      }
      toast.success(`Deleted "${node.name}".`);
    } catch (e) {
      toast.error(`Failed to delete "${node.name}".`);
      console.error(e);
    }
  };
  const isDirectory = !!node.children;
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className="flex items-center cursor-pointer p-1 rounded-md hover:bg-muted transition-colors duration-150"
          style={{ paddingLeft: `${level * 16 + 4}px` }}
          onClick={isDirectory ? () => setIsOpen(!isOpen) : () => handleFileClick(node)}
        >
          {isDirectory ? (
            isOpen ? <ChevronDown className="h-4 w-4 mr-1 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 mr-1 flex-shrink-0" />
          ) : <div className="w-5 mr-1 flex-shrink-0" />}
          {isDirectory ? (
            isOpen ? <FolderOpen className="h-4 w-4 mr-2 text-indigo-400 flex-shrink-0" /> : <Folder className="h-4 w-4 mr-2 text-indigo-400 flex-shrink-0" />
          ) : <File className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />}
          <span className="truncate text-sm">{node.name}</span>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {isDirectory && (
          <>
            <ContextMenuItem onClick={handleCreateFile} className="cursor-pointer"><FilePlus className="mr-2 h-4 w-4" />New File</ContextMenuItem>
            <ContextMenuItem onClick={handleCreateFolder} className="cursor-pointer"><FolderPlus className="mr-2 h-4 w-4" />New Folder</ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        {!isRoot && <ContextMenuItem onClick={handleDelete} className="text-red-500 cursor-pointer focus:text-red-500 focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" />Delete</ContextMenuItem>}
      </ContextMenuContent>
      {isDirectory && isOpen && node.children?.map((child) => (
        <FileTree key={child.id} node={child} level={level + 1} />
      ))}
    </ContextMenu>
  );
};
export function FileExplorer() {
  const { fileTree, setFileTree } = useIdeStore();
  const handleOpenFolder = async () => {
    const tree = await openDirectory();
    if (tree) {
      setFileTree(tree);
      toast.success(`Workspace opened: ${tree.name}`);
    }
  };
  return (
    <div className="h-full flex flex-col bg-background text-foreground">
      <div className="p-2 border-b">
        <h2 className="text-lg font-semibold tracking-tight">Workspace</h2>
      </div>
      <div className="p-2">
        <Button onClick={handleOpenFolder} className="w-full" variant="outline">
          <FolderOpen className="mr-2 h-4 w-4" /> Open Folder
        </Button>
      </div>
      <ScrollArea className="flex-1 p-2">
        {fileTree ? (
          <FileTree node={fileTree} isRoot={true} />
        ) : (
          <div className="text-center text-muted-foreground p-4 text-sm">
            <p>No folder opened.</p>
            <p>Click "Open Folder" to start.</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}