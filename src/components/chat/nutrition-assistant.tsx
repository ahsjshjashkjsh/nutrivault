"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, MessageCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateNutritionResponse } from "@/lib/nutrition-agent";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

function formatMessage(content: string): React.ReactNode {
  const lines = content.split("\n");
  return lines.map((line, i) => {
    const key = `line-${i}`;
    if (line.startsWith("**") && line.endsWith("**")) {
      return (
        <p key={key} className="font-semibold text-foreground mt-2 mb-0.5">
          {line.slice(2, -2)}
        </p>
      );
    }
    if (line.startsWith("• ")) {
      return (
        <p key={key} className="text-sm flex gap-1.5 leading-relaxed">
          <span className="text-brand-500 flex-shrink-0">•</span>
          <span dangerouslySetInnerHTML={{
            __html: line.slice(2).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
          }} />
        </p>
      );
    }
    if (/^[🥣⚡⏱️🍗🥗🏋️✅💡⚠️]/.test(line)) {
      return (
        <p key={key} className="text-sm leading-relaxed mt-1.5" dangerouslySetInnerHTML={{
          __html: line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        }} />
      );
    }
    if (line === "") return <div key={key} className="h-1" />;
    return (
      <p key={key} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{
        __html: line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/_(.+?)_/g, "<em>$1</em>")
      }} />
    );
  });
}

interface NutritionAssistantProps {
  defaultOpen?: boolean;
}

export function NutritionAssistant({ defaultOpen = false }: NutritionAssistantProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "greeting",
      role: "assistant",
      content: t("chat.greeting"),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 100);
    }
  }, [open, messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || thinking) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    // Pass conversation history for context-aware responses
    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    setTimeout(() => {
      const responseContent = generateNutritionResponse(text, history);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setThinking(false);
    }, 350 + Math.random() * 250);
  };

  const examplePrompts = [
    "Analyze: 2 eggs, toast with butter, coffee",
    "How to increase protein intake?",
    "What to eat after training?",
    "Calories in a banana",
  ];

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 w-12 h-12 rounded-full bg-brand-500 hover:bg-brand-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center glow-green"
          aria-label={t("chat.button")}
          title={t("chat.button")}
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm h-[520px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-500/15 flex items-center justify-center">
                <Bot className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">{t("chat.title")}</p>
                <p className="text-xs text-muted-foreground">{t("chat.subtitle")}</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg p-1.5 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2.5",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-brand-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm",
                    msg.role === "user"
                      ? "bg-brand-500 text-white rounded-tr-sm"
                      : "bg-secondary text-foreground rounded-tl-sm"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="space-y-0.5">{formatMessage(msg.content)}</div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {thinking && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-brand-500/15 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                </div>
                <div className="bg-secondary rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                  <div className="flex gap-1 items-center h-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            {/* Example prompts (shown when only greeting exists) */}
            {messages.length === 1 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-xs text-muted-foreground px-1">Try asking:</p>
                {examplePrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(prompt)}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg border border-border hover:bg-secondary hover:border-brand-500/30 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border bg-card">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={t("chat.placeholder")}
                className="flex-1 h-9 px-3 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || thinking}
                className="w-9 h-9 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
