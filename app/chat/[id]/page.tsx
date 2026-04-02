"use client";

import { useState, useRef, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { addHistory } from "@/lib/history";
import { buildPersonaFile } from "@/lib/history";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SessionInfo {
  name: string;
  persona: string;
  description: string;
  distillResult: string;
}

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`/api/distill?id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status !== "done") {
          setError("蒸馏尚未完成");
          return;
        }
        setSessionInfo({
          name: data.name,
          persona: data.persona,
          description: data.description,
          distillResult: data.distillResult,
        });
        addHistory({
          id,
          name: data.name,
          persona: data.persona,
          createdAt: Date.now(),
        });
      })
      .catch(() => setError("加载失败"));
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleDownload = useCallback(() => {
    if (!sessionInfo) return;
    const content = buildPersonaFile(
      sessionInfo.name,
      sessionInfo.persona,
      sessionInfo.description,
      sessionInfo.distillResult
    );
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sessionInfo.name}的数字分身.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sessionInfo]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: id,
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error("对话请求失败");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("无法读取响应");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullContent += parsed.content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: fullContent,
                };
                return updated;
              });
            }
          } catch {
            // skip
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "抱歉，出了点问题。请重试。",
        };
        return updated;
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (error) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-red-400 mb-4">{error}</p>
        <Link href="/" className="text-primary underline">返回首页</Link>
      </main>
    );
  }

  return (
    <main className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-muted-foreground hover:text-foreground text-sm">
            ←
          </Link>
          <div>
            <h1 className="font-bold text-sm">
              {sessionInfo?.name || "加载中…"}
              <span className="text-muted-foreground font-normal ml-2 text-xs">
                的数字分身
              </span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="text-xs px-3 py-1 rounded-lg border border-primary/30 bg-primary/10
                       text-primary hover:bg-primary/20 transition-all"
          >
            下载人格包
          </button>
          <button
            onClick={handleShare}
            className="text-xs px-3 py-1 rounded-lg border border-border hover:border-primary/30
                       text-muted-foreground hover:text-foreground transition-all"
          >
            {copied ? "已复制 ✓" : "分享链接"}
          </button>
        </div>
      </header>

      {/* Save banner */}
      {showBanner && sessionInfo && (
        <div className="flex items-center justify-between px-4 py-2 bg-accent/10 border-b border-accent/20 text-xs">
          <span className="text-accent-foreground">
            数据保留 7 天 · 建议<button onClick={handleDownload} className="underline text-primary mx-1">下载人格包</button>保存，可丢给豆包/Kimi/ChatGPT 继续使用
          </span>
          <button
            onClick={() => setShowBanner(false)}
            className="text-muted-foreground hover:text-foreground ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && sessionInfo && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🧬</div>
            <p className="text-muted-foreground text-sm">
              {sessionInfo.name} 的数字分身已就绪
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              试着跟 TA 说句话吧
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {["你好呀", "最近怎么样？", "给我讲个故事吧"].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    setTimeout(() => handleSend(), 100);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full border border-border
                             hover:border-primary/30 text-muted-foreground hover:text-foreground transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-card border border-border rounded-bl-md"
              }`}
            >
              {msg.content || (
                <span className="inline-block w-2 h-4 bg-muted-foreground/50 animate-pulse rounded-sm" />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card/50 px-4 py-3">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`跟${sessionInfo?.name || "TA"}说点什么…`}
            rows={1}
            className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border text-foreground
                       placeholder:text-muted-foreground focus:outline-none focus:border-primary
                       transition-colors resize-none text-sm"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm
                       hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
          >
            发送
          </button>
        </div>
      </div>
    </main>
  );
}
