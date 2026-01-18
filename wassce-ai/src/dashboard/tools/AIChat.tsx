import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getOpenAiApiKey } from "../../utils/settings";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const AIChat = () => {
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI study assistant. How can I help you with your WASSCE preparation today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const apiKey = getOpenAiApiKey();
  const hasApiKey = Boolean(apiKey);

  useEffect(() => {
    const state = location.state as { prefill?: string } | null;
    const prefill = state?.prefill?.trim();
    if (!prefill) return;
    setInput((current) => (current.trim() ? current : prefill));
    window.history.replaceState({}, "");
  }, [location.state]);

  const handleSend = async () => {
    if (!input.trim() || !apiKey) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    const thread = [...messages, userMessage];
    setMessages(thread);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful WASSCE study assistant. Provide clear, accurate answers to questions about WASSCE subjects including Mathematics, English, Biology, Chemistry, Physics, and other relevant topics. Keep responses educational and encouraging.",
            },
            ...thread.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const aiContent = data.choices[0]?.message?.content;

      if (!aiContent) {
        throw new Error("No response from AI");
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("AI Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please check your API key configuration and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">AI Study Assistant</p>
          <h3 className="text-lg font-semibold text-slate-900">Chat with AI Tutor</h3>
        </div>
        <div className={`text-xs uppercase tracking-[0.4em] ${hasApiKey ? "text-emerald-700" : "text-amber-700"}`}>
          {hasApiKey ? "API connected" : "API key required"}
        </div>
      </div>

      {!hasApiKey && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm text-amber-700">Add your OpenAI API key in Settings to enable chat.</p>
          <Link
            to="/dashboard/settings"
            className="mt-2 inline-flex text-xs font-semibold uppercase tracking-[0.3em] text-amber-700 hover:text-amber-900"
          >
            Open settings
          </Link>
        </div>
      )}

      <div className="h-64 space-y-3 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                message.role === "user"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">Thinking...</div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!hasApiKey || loading}
          placeholder={hasApiKey ? "Ask me anything about your studies..." : "API key required"}
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
          rows={2}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || !hasApiKey || loading}
          className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
            hasApiKey && input.trim() && !loading
              ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
              : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
          }`}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AIChat;
