import type { FileNode } from '@/stores/ideStore';
async function processDirectory(
  directoryHandle: FileSystemDirectoryHandle,
  path: string
): Promise<FileNode> {
  const children: FileNode[] = [];
  for await (const entry of directoryHandle.values()) {
    const newPath = `${path}/${entry.name}`;
    if (entry.kind === 'directory') {
      children.push(await processDirectory(entry, newPath));
    } else if (entry.kind === 'file') {
      children.push({
        id: newPath,
        name: entry.name,
        path: newPath,
        handle: entry,
      });
    }
  }
  // Sort children: folders first, then files, alphabetically
  children.sort((a, b) => {
    if (a.children && !b.children) return -1;
    if (!a.children && b.children) return 1;
    return a.name.localeCompare(b.name);
  });
  return {
    id: path,
    name: directoryHandle.name,
    path: path,
    children: children,
    handle: directoryHandle,
  };
}
export async function openDirectory(): Promise<FileNode | null> {
  try {
    if (!window.showDirectoryPicker) {
      alert('Your browser does not support the File System Access API. Please use a modern browser like Chrome or Edge.');
      return null;
    }
    const directoryHandle = await window.showDirectoryPicker();
    return await processDirectory(directoryHandle, directoryHandle.name);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.log('User cancelled the directory picker.');
    } else {
      console.error('Error opening directory:', error);
    }
    return null;
  }
}
export async function readFileContent(handle: FileSystemFileHandle): Promise<string> {
  try {
    const file = await handle.getFile();
    return await file.text();
  } catch (error) {
    console.error('Error reading file content:', error);
    return '';
  }
}
export async function saveFileContent(handle: FileSystemFileHandle, content: string): Promise<void> {
  try {
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
  } catch (error) {
    console.error('Error saving file content:', error);
    throw error;
  }
}
export async function createNewFile(directoryHandle: FileSystemDirectoryHandle, fileName: string): Promise<FileSystemFileHandle> {
  return await directoryHandle.getFileHandle(fileName, { create: true });
}
export async function createNewFolder(directoryHandle: FileSystemDirectoryHandle, folderName: string): Promise<FileSystemDirectoryHandle> {
  return await directoryHandle.getDirectoryHandle(folderName, { create: true });
}
export async function deleteEntry(directoryHandle: FileSystemDirectoryHandle, entryName: string): Promise<void> {
  await directoryHandle.removeEntry(entryName, { recursive: true });
}