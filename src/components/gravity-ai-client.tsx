'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, Loader, Send, Settings, Sparkles, Clipboard, Check, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { Message } from '@/lib/core-ai/interfaces';
import { freeTokenizer } from '@/lib/core-ai/tokenizer';
import { cn } from '@/lib/utils';
import SettingsDialog from './settings-dialog';
import { generateReplyToMessage } from '@/ai/flows/generate-reply-to-message';

const isExtensionContext = () => typeof chrome !== 'undefined' && chrome.runtime?.id;


const SYSTEM_INSTRUCTION = "You are GravityAI, an intelligent assistant integrated into a browser extension. Your goal is to provide accurate, helpful, and concise responses. When provided with context from a webpage, use it to answer the user's questions. Format your answers clearly, using markdown where appropriate.";

export default function GravityAIClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [pageContext, setPageContext] = useState<string | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messageHistory = useRef<Message[]>([]);

  // Effect to handle API key and initial message
  useEffect(() => {
    async function checkApiKey() {
      if (isExtensionContext()) {
        try {
          const response = await chrome.runtime.sendMessage({ action: 'readFromStorage', key: 'gravity_api_key' });
          if (response?.data) {
            // Key exists, prompt for password
            setIsSettingsOpen(true);
          } else {
             toast.info('Welcome to GravityAI!', {
                description: 'Please set your API key to get started.',
                duration: 5000,
             });
             setIsSettingsOpen(true);
          }
        } catch (e) {
          console.error("Error checking API key:", e);
          setIsSettingsOpen(true); // Open settings if there's an error
        }
      } else {
        // Not in extension, maybe local dev. Check local storage for dev purposes.
        const localKey = localStorage.getItem('gravity_api_key');
        if(!localKey) setIsSettingsOpen(true);
        else setApiKey(localKey);
      }
    }
    if (!apiKey) {
      checkApiKey();
    }

    setMessages([{ role: 'assistant', content: "Hello! I'm GravityAI. How can I assist you today?" }]);
    messageHistory.current.push({ role: 'system', content: SYSTEM_INSTRUCTION });
    messageHistory.current.push({ role: 'assistant', content: "Hello! I'm GravityAI. How can I assist you today?" });

    return () => {
      freeTokenizer();
    };
  }, [apiKey]);

  // Effect to scroll to the bottom of the messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // Handle analyzing the current page
  const handleAnalyzePage = async () => {
    if (!isExtensionContext()) {
      toast.error("This feature is only available in the browser extension.");
      return;
    }
    setIsLoading(true);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'getPageContent' });
        if (response?.data) {
          setPageContext(response.data);
          toast.success("Page content analyzed.", {
            description: "You can now ask questions about this page.",
          });
        } else {
          toast.error("Could not analyze page.", { description: "No content was returned or the tab was not ready." });
        }
      } else {
        toast.error("Could not find an active tab.");
      }
    } catch (error) {
      console.error("Error analyzing page:", error);
      toast.error("Could not analyze page.", {
        description: "Please ensure the page is fully loaded and try again."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format messages for the Genkit flow
  const formatMessagesForFlow = (history: Message[], newUserMessage: string, context?: string | null) => {
    let combinedMessage = newUserMessage;
    if (context) {
        combinedMessage = `Using the following page content as context:\n\n---\n${context}\n---\n\n${newUserMessage}`;
    }
    
    // Combine history and the new message with its context
    const fullHistory = [...history, { role: 'user', content: combinedMessage }];

    // Create a string representation of the message history for the prompt
    const historyString = fullHistory
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');
    
    return historyString;
  }


  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    if (!apiKey) {
      toast.error("API Key is not set. Please go to settings to add it.");
      setIsSettingsOpen(true);
      return;
    }

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    
    const fullPrompt = formatMessagesForFlow(messageHistory.current, input, pageContext);
    messageHistory.current.push(userMessage);

    setInput('');
    setIsLoading(true);
    setPageContext(null); // Context is single-use

    try {
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      
      const result = await generateReplyToMessage({ message: fullPrompt });
      const assistantResponse = result.reply;

      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = assistantResponse;
        return newMessages;
      });
      messageHistory.current.push({ role: 'assistant', content: assistantResponse });

    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error('Error generating response', { description: errorMessage });
      setMessages(prev => prev.slice(0, -1)); // Remove the empty assistant message
    } finally {
      setIsLoading(false);
    }
  };

  const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
        </Button>
    );
};


  return (
    <TooltipProvider>
      <div className="w-full h-screen flex flex-col bg-background text-foreground">
        <header className="flex flex-row items-center justify-between p-2 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="font-headline text-xl">GravityAI</h1>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
                <Settings className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </header>
        <main className="flex-1 flex flex-col gap-4 overflow-hidden p-0 px-4">
          <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollAreaRef}>
             <div className="space-y-6 pb-4 pt-4">
              {messages.map((msg, index) => (
                <div key={index} className={cn("flex items-start gap-3", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {msg.role === 'assistant' && (
                    <Avatar className="w-8 h-8 border-2 border-primary/50">
                      <AvatarFallback>
                        <Bot className="text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn("max-w-[85%] rounded-xl px-4 py-3 text-sm relative group", 
                    msg.role === 'user' 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}>
                     {pageContext && msg.role === 'user' && (
                        <div className="mb-2 p-2 border-l-2 border-accent text-xs italic opacity-70">
                            Context from page included.
                        </div>
                     )}
                    <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />') }} />
                     {msg.role === 'assistant' && msg.content && (
                         <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <CopyButton text={msg.content} />
                         </div>
                     )}
                  </div>
                  {msg.role === 'user' && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-start gap-3 justify-start">
                    <Avatar className="w-8 h-8 border-2 border-primary/50">
                      <AvatarFallback>
                        <Bot className="text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-xl px-4 py-3 text-sm flex items-center">
                        <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                 </div>
              )}
            </div>
          </ScrollArea>
          <footer className="p-2 border-t">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
               <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleAnalyzePage} disabled={isLoading || !apiKey || !isExtensionContext()}>
                        <FileText className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Analyze Page Content</p>
                  </TooltipContent>
              </Tooltip>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1"
                disabled={isLoading || !apiKey}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim() || !apiKey}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </footer>
        </main>
      </div>
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(key) => {
          setApiKey(key);
          setIsSettingsOpen(false);
        }}
      />
    </TooltipProvider>
  );
}

    