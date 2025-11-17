import React from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { useIdeStore, selectActiveFile } from '@/stores/ideStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { Skeleton } from '@/components/ui/skeleton';
import { useKeyPress } from '@/hooks/use-key-press';
import { saveFileContent } from '@/lib/fileSystem';
import { toast } from 'sonner';
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs',
  },
});
export function CodeEditor() {
  const { openFiles, activeFileId, setActiveFile, closeFile, updateFileContent, saveFile } = useIdeStore();
  const activeFile = useIdeStore(selectActiveFile);
  const { isDark } = useTheme();
  const handleSave = async () => {
    if (activeFile && activeFile.isDirty) {
      try {
        await saveFileContent(activeFile.handle, activeFile.content);
        saveFile(activeFile.id);
        toast.success(`Saved ${activeFile.name}`);
      } catch (error) {
        toast.error(`Failed to save ${activeFile.name}`);
        console.error('Save error:', error);
      }
    }
  };
  useKeyPress(['s'], (event) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      handleSave();
    }
  });
  const handleTabChange = (value: string) => {
    setActiveFile(value);
  };
  const handleCloseTab = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    closeFile(fileId);
  };
  const handleEditorChange = (value: string | undefined) => {
    if (activeFileId && value !== undefined) {
      updateFileContent(activeFileId, value);
    }
  };
  const getLanguage = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'html':
        return 'html';
      case 'md':
        return 'markdown';
      default:
        return 'plaintext';
    }
  };
  return (
    <div className="h-full flex flex-col bg-background">
      {openFiles.length > 0 ? (
        <Tabs value={activeFileId || ''} onValueChange={handleTabChange} className="flex flex-col h-full">
          <TabsList className="flex-shrink-0 justify-start rounded-none border-b bg-transparent p-0">
            {openFiles.map((file) => (
              <TabsTrigger
                key={file.id}
                value={file.id}
                className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                {file.name}
                {file.isDirty && <span className="w-2 h-2 ml-2 rounded-full bg-blue-500" />}
                <button
                  onClick={(e) => handleCloseTab(e, file.id)}
                  className="ml-2 p-0.5 rounded-sm hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex-grow min-h-0 h-full">
            {openFiles.map((file) => (
              <TabsContent key={file.id} value={file.id} className="h-full mt-0 flex-grow">
                <Editor
                  height="100%"
                  language={getLanguage(file.name)}
                  value={file.content}
                  onChange={handleEditorChange}
                  theme={isDark ? 'vs-dark' : 'light'}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    scrollBeyondLastLine: false,
                  }}
                  loading={<Skeleton className="h-full w-full" />}
                />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Zenith IDE</h2>
            <p>Select a file from the explorer to begin editing.</p>
          </div>
        </div>
      )}
    </div>
  );
}