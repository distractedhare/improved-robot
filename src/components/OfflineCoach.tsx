import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Wifi, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { localAiService } from '../services/localAiService';
import { InitProgressReport } from '@mlc-ai/web-llm';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function OfflineCoach() {
  const [isReady, setIsReady] = useState(localAiService.isReady());
  const [progress, setProgress] = useState<InitProgressReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "I'm your offline Gemma coach. I run entirely on your device, so I work instantly even in dead zones. What objection are you stuck on?",
    }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribeProgress = localAiService.onProgress((p) => setProgress(p));
    const unsubscribeReady = localAiService.onReady((ready) => setIsReady(ready));

    return () => {
      unsubscribeProgress();
      unsubscribeReady();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !isReady || isGenerating) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsGenerating(true);

    try {
      const systemPrompt = `You are a T-Mobile retail sales coach. Provide short, punchy, 1-2 sentence pivots or reframes for customer objections. Be confident, empathetic, and focus on value.`;
      const response = await localAiService.generateResponse(userMsg.content, systemPrompt);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response
      }]);
    } catch (err) {
      console.error("Generation error:", err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error generating a response."
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (error) {
    return (
      <div className="rounded-2xl border border-error-border bg-error-surface p-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-error-accent mb-3" />
        <h3 className="text-sm font-bold text-error-foreground mb-2">Offline Coach Unavailable</h3>
        <p className="text-xs text-error-foreground/80">{error}</p>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="rounded-3xl border border-t-light-gray bg-surface p-8 text-center shadow-lg glass-card">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-t-magenta/10">
          <Wifi className="h-8 w-8 text-t-magenta" />
        </div>
        <h2 className="mb-2 text-lg font-extrabold tracking-tight">Offline AI Not Ready</h2>
        <p className="mb-6 text-sm text-t-dark-gray">
          The Gemma AI model needs to be downloaded before you can use the Dead-Zone Coach.
        </p>
        
        <div className="p-4 rounded-2xl border border-t-light-gray bg-t-light-gray/5 mb-6">
          <p className="text-xs font-medium text-t-dark-gray">
            Go to <strong>Settings → Offline AI</strong> to download the model (~1.5GB).
          </p>
        </div>

        {progress && (
          <div className="mx-auto max-w-sm text-left mb-4">
            <div className="mb-2 flex justify-between text-xs font-bold text-t-dark-gray">
              <span>{progress.text}</span>
              <span>{Math.round((progress.progress || 0) * 100)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-t-light-gray">
              <div 
                className="h-full bg-t-magenta transition-all duration-300" 
                style={{ width: `${Math.max(5, (progress.progress || 0) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-[600px] flex-col rounded-3xl border border-t-light-gray bg-surface shadow-lg glass-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-t-light-gray bg-surface-elevated px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-t-magenta/10">
            <Wifi className="h-5 w-5 text-t-magenta" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold tracking-tight">Dead-Zone Coach</h2>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-success-accent">
              <ShieldCheck className="h-3 w-3" />
              <span>100% Private & Offline</span>
            </div>
          </div>
        </div>
        <div className="rounded-full bg-t-light-gray/50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-t-dark-gray">
          Powered by Gemma
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user' 
                  ? 'bg-t-magenta text-white rounded-tr-sm' 
                  : 'bg-t-light-gray/30 text-foreground rounded-tl-sm border border-t-light-gray'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="mb-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-t-magenta">
                  <Bot className="h-3 w-3" />
                  <span>Gemma Coach</span>
                </div>
              )}
              <p className="leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-t-light-gray bg-t-light-gray/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-t-magenta" />
                <span className="text-xs font-medium text-t-dark-gray">Gemma is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-t-light-gray bg-surface-elevated p-4">
        <div className="relative flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type an objection (e.g., 'Verizon is cheaper')..."
            className="focus-ring min-h-[52px] w-full resize-none rounded-xl border border-t-light-gray bg-surface px-4 py-3 text-sm placeholder:text-t-muted focus:border-t-magenta"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isGenerating}
            className="focus-ring flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-t-magenta text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
