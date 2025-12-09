'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, Loader, Send, Settings, Sparkles, Clipboard, Check } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { PromptBuilder } from '@/lib/core-ai/prompt-builder';
import { Message } from '@/lib/core-ai/interfaces';
import { geminiAdapter } from '@/lib/core-ai/gemini-adapter';
import SettingsDialog from './settings-dialog';
import { freeTokenizer } from '@/lib/core-ai/tokenizer';
import { cn } from '@/lib/utils';


const SYSTEM_INSTRUCTION = "You are GravityAI, an intelligent assistant. Your goal is to provide accurate, helpful, and concise responses. Format your answers clearly, using markdown where appropriate.";

export default function GravityAIClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const promptBuilderRef = useRef(new PromptBuilder());

  useEffect(() => {
    // Check if API key is configured on mount
    const encryptedKey = localStorage.getItem('gravity_api_key');
    if (!encryptedKey) {
      toast.info('Welcome to GravityAI!', {
        description: 'Please set your API key in the settings to get started.',
        duration: 5000,
      });
      setIsSettingsOpen(true);
    }

    // Set initial system prompt and welcome message
    promptBuilderRef.current.setSystem(SYSTEM_INSTRUCTION);
    setMessages([{ role: 'assistant', content: "Hello! I'm GravityAI. How can I assist you today?" }]);

    return () => freeTokenizer();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !apiKey) {
       if (!apiKey) toast.error("API Key is not set. Please configure it in the settings.");
      return;
    }

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    promptBuilderRef.current.addUserMessage(input);
    setInput('');
    setIsLoading(true);

    try {
      const builtMessages = promptBuilderRef.current.build();
      const stream = geminiAdapter.generateStream(builtMessages);
      
      let assistantResponse = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      for await (const chunk of stream) {
        assistantResponse += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = assistantResponse;
          return newMessages;
        });
      }

      promptBuilderRef.current.addAssistantMessage(assistantResponse);

    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error('Error generating response', { description: errorMessage });
      setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, I encountered an error: ${errorMessage}` }]);
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
      <Card className="w-[95vw] max-w-2xl h-[85vh] flex flex-col shadow-2xl shadow-primary/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <CardTitle className="font-headline text-2xl">GravityAI</CardTitle>
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
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden p-0 px-4">
          <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollAreaRef}>
             <div className="space-y-6 pb-4">
              {messages.map((msg, index) => (
                <div key={index} className={cn("flex items-start gap-3", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {msg.role === 'assistant' && (
                    <Avatar className="w-8 h-8 border-2 border-primary/50">
                      <AvatarFallback>
                        <Bot className="text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn("max-w-[80%] rounded-xl px-4 py-3 text-sm relative group", 
                    msg.role === 'user' 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
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
          <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2 border-t">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask GravityAI..."
              className="flex-1"
              disabled={isLoading || !apiKey}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim() || !apiKey}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
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
