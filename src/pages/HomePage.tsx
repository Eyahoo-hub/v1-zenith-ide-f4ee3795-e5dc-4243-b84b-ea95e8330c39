import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileExplorer } from "@/components/ide/FileExplorer";
import { CodeEditor } from "@/components/ide/CodeEditor";
import { AIChat } from "@/components/ide/AIChat";
import { Terminal } from "@/components/ide/Terminal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Toaster } from "@/components/ui/sonner";
import { CodeXml, MessageSquare, TerminalSquare } from "lucide-react";
export function HomePage() {
  return (
    <main className="bg-background text-foreground h-screen max-h-screen overflow-hidden">
      <div className="h-full w-full p-2 flex flex-col gap-2">
        <header className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border h-14 flex-shrink-0">
            <div className="flex items-center gap-2">
                <CodeXml className="h-6 w-6 text-indigo-500" />
                <h1 className="text-xl font-bold tracking-tight">Zenith IDE</h1>
            </div>
            <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground hidden md:block">Vibe-driven development on the edge.</p>
                <ThemeToggle className="relative top-0 right-0" />
            </div>
        </header>
        <div className="flex-grow min-h-0">
            <ResizablePanelGroup direction="horizontal" className="h-full w-full rounded-lg border">
            <ResizablePanel defaultSize={20} minSize={15}>
                <FileExplorer />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={80}>
                <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={70} minSize={30}>
                    <CodeEditor />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={30} minSize={20}>
                    <Tabs defaultValue="chat" className="h-full flex flex-col">
                    <TabsList className="flex-shrink-0 justify-start rounded-none border-b bg-transparent p-0 pl-2">
                        <TabsTrigger value="chat" className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none">
                            <MessageSquare className="mr-2 h-4 w-4" /> AI Chat
                        </TabsTrigger>
                        <TabsTrigger value="terminal" className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none">
                            <TerminalSquare className="mr-2 h-4 w-4" /> Terminal
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="chat" className="flex-grow mt-0">
                        <AIChat />
                    </TabsContent>
                    <TabsContent value="terminal" className="flex-grow mt-0">
                        <Terminal />
                    </TabsContent>
                    </Tabs>
                </ResizablePanel>
                </ResizablePanelGroup>
            </ResizablePanel>
            </ResizablePanelGroup>
        </div>
      </div>
      <Toaster richColors closeButton />
    </main>
  );
}