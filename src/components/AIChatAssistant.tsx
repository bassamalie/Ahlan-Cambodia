import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, MessageCircle, RefreshCw, User, ShieldCheck } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Ahlan wa Sahlan! I am your personal Ahlan Guide. How may I assist you in crafting your premium, Muslim-friendly journey to the historical Kingdom of Cambodia?"
    }
  ]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await response.json();
      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `An error occurred: ${data.error}` }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.content }
        ]);
      }
    } catch (e: any) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I apologize, but I am facing temporary trouble connecting to the Ahlan Grand server. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "Where is the oldest Mosque in Cambodia?",
    "Show me Halal food spots in Siem Reap",
    "What services does Ahlan DMC provide?",
    "Tell me about the Silk Island weaving"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          id="chat-toggle-btn"
          onClick={() => setIsOpen(true)}
          className="bg-brand-green hover:bg-brand-green/90 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 border border-brand-blue-accent/40 flex items-center gap-2 group"
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6 text-brand-blue-accent group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue-accent"></span>
            </span>
          </div>
          <span className="max-w-0 overflow-hidden group-hover:max-w-[120px] transition-all duration-500 ease-out text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
            Ask Ahlan Guide
          </span>
        </button>
      )}

      {/* Expandable Chat Panel */}
      {isOpen && (
        <div 
          id="chat-panel"
          className="bg-white rounded-2xl border border-brand-blue-accent/30 shadow-2xl w-[350px] sm:w-[400px] h-[520px] flex flex-col overflow-hidden animate-fade-in"
        >
          {/* Header */}
          <div className="bg-brand-green p-4 text-white flex items-center justify-between border-b border-brand-blue-accent/20">
            <div className="flex items-center gap-3">
              <div className="bg-brand-blue-accent/10 p-2 rounded-xl border border-brand-blue-accent/30">
                <Sparkles className="w-5 h-5 text-brand-blue-accent" />
              </div>
              <div>
                <h4 className="font-serif text-brand-blue-accent text-base font-semibold">Ahlan Grand Guide</h4>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-white/60 font-mono tracking-widest uppercase">Luxury Travel Expert</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-warmwhite">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex items-start gap-2 max-w-[85%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`p-1.5 rounded-lg border ${m.role === "user" ? "bg-brand-blue-accent/10 border-brand-blue-accent/20 text-brand-blue-accent" : "bg-brand-green/10 border-brand-green/20 text-brand-green"}`}>
                    {m.role === "user" ? <User className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  </div>
                  
                  <div className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    m.role === "user" 
                      ? "bg-brand-blue-accent text-brand-charcoal font-medium rounded-tr-none" 
                      : "bg-white border border-brand-blue-accent/10 text-brand-charcoal shadow-sm rounded-tl-none whitespace-pre-wrap"
                  }`}>
                    {m.content}
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2 max-w-[85%]">
                  <div className="p-1.5 rounded-lg border bg-brand-green/10 border-brand-green/20 text-brand-green">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-green" />
                  </div>
                  <div className="bg-white border border-brand-blue-accent/10 text-brand-charcoal/60 rounded-2xl px-4 py-2.5 text-xs shadow-sm rounded-tl-none font-mono">
                    Ahlan Guide is drafting...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Recommendations Prompts (when only greeting exists) */}
          {messages.length === 1 && (
            <div className="p-3 bg-brand-blue-accent/5 border-t border-brand-blue-accent/10">
              <p className="text-[10px] font-mono uppercase text-brand-charcoal/50 mb-2 px-1">Curated Inquiries</p>
              <div className="grid grid-cols-2 gap-1.5">
                {samplePrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(p)}
                    className="text-left bg-white hover:bg-brand-blue hover:text-white border border-brand-blue-accent/20 hover:border-brand-blue/20 rounded-xl p-2 text-[11px] leading-tight text-brand-charcoal/80 font-medium transition-all shadow-xs cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form Footer */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-brand-blue-accent/10 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about Halal travel in Cambodia..."
              className="flex-1 bg-brand-warmwhite border border-brand-blue-accent/20 rounded-xl px-4 py-2 text-xs outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green text-brand-charcoal"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-brand-green hover:bg-brand-green/95 text-white disabled:bg-brand-charcoal/20 p-2.5 rounded-xl transition-all shadow border border-brand-blue-accent/30 shrink-0"
            >
              <Send className="w-4 h-4 text-brand-blue-accent" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
