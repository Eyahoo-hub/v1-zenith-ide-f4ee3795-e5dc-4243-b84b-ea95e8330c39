import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Wrench, Trash2, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatService, formatTime, renderToolCall } from '@/lib/chat';
import type { ChatState } from '../../../worker/types';
import { useIdeStore, selectActiveFile } from '@/stores/ideStore';
export function AIChat() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    sessionId: chatService.getSessionId(),
    isProcessing: false,
    model: 'google-ai-studio/gemini-2.5-flash',
    streamingMessage: ''
  });
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeFile = useIdeStore(selectActiveFile);
  const loadCurrentSession = useCallback(async () => {
    const response = await chatService.getMessages();
    if (response.success && response.data) {
      setChatState(prev => ({ ...prev, ...response.data }));
    }
  }, []);
  useEffect(() => {
    loadCurrentSession();
  }, [loadCurrentSession]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages, chatState.streamingMessage]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatState.isProcessing) return;
    const userPrompt = input.trim();
    setInput('');
    let fullMessage = userPrompt;
    if (activeFile) {
      // Simple truncation to avoid overly large contexts.
      const truncatedContent = activeFile.content.length > 8000
        ? activeFile.content.substring(0, 8000) + "\n... (file truncated)"
        : activeFile.content;
      fullMessage = `
I am working on the file named \`${activeFile.path}\`.
Here is the content of the file:
\`\`\`
${truncatedContent}
\`\`\`
My question is: ${userPrompt}
      `;
    }
    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: userPrompt, // Display only the user's direct question in the UI
      timestamp: Date.now()
    };
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      streamingMessage: '',
      isProcessing: true,
    }));
    await chatService.sendMessage(fullMessage, chatState.model, (chunk) => {
      setChatState(prev => ({
        ...prev,
        streamingMessage: (prev.streamingMessage || '') + chunk
      }));
    });
    await loadCurrentSession();
    setChatState(prev => ({ ...prev, isProcessing: false }));
  };
  const handleClear = async () => {
    await chatService.clearMessages();
    await loadCurrentSession();
  };
  return (
    <div className="h-full flex flex-col bg-background text-foreground">
      <div className="p-2 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">AI Assistant</h2>
        <Button variant="ghost" size="icon" onClick={handleClear} title="Clear conversation">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {chatState.messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
            >
              {msg.role === 'assistant' && <Bot className="w-5 h-5 flex-shrink-0 mt-1 text-indigo-500" />}
              <div className={`max-w-[85%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                {msg.toolCalls && (
                  <div className="mt-2 pt-2 border-t border-current/20 space-y-1">
                    {msg.toolCalls.map((tool, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        <Wrench className="w-3 h-3 mr-1" /> {renderToolCall(tool)}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="text-xs opacity-60 mt-1 text-right">{formatTime(msg.timestamp)}</div>
              </div>
              {msg.role === 'user' && <User className="w-5 h-5 flex-shrink-0 mt-1" />}
            </motion.div>
          ))}
          {chatState.streamingMessage && (
             <div className="flex items-start gap-3">
              <Bot className="w-5 h-5 flex-shrink-0 mt-1 text-indigo-500" />
              <div className="max-w-[85%] p-3 rounded-lg bg-muted">
                <p className="whitespace-pre-wrap text-sm">{chatState.streamingMessage}<span className="animate-pulse">|</span></p>
              </div>
            </div>
          )}
          {chatState.isProcessing && !chatState.streamingMessage && (
            <div className="flex items-start gap-3">
              <Bot className="w-5 h-5 flex-shrink-0 mt-1 text-indigo-500" />
              <div className="p-3 rounded-lg bg-muted flex items-center space-x-1">
                <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{animationDelay: '0ms'}}/>
                <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{animationDelay: '200ms'}}/>
                <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{animationDelay: '400ms'}}/>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>
      <div className="p-2 border-t">
        {activeFile && (
          <Badge variant="outline" className="mb-2 text-xs">
            Context: {activeFile.name}
          </Badge>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2 items-start">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI about your code..."
            className="flex-1 min-h-[40px] max-h-28 resize-none"
            rows={1}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
            disabled={chatState.isProcessing}
          />
          <Button type="submit" disabled={!input.trim() || chatState.isProcessing} className="w-[40px] h-[40px] flex-shrink-0">
            {chatState.isProcessing ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}