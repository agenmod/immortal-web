"use client";

import { useState, useRef, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { addHistory, buildPersonaFile } from "@/lib/history";

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
  const [skillCopied, setSkillCopied] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`/api/distill?id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status !== "done") { setError("蒸馏尚未完成"); return; }
        setSessionInfo({
          name: data.name, persona: data.persona,
          description: data.description, distillResult: data.distillResult,
        });
        addHistory({ id, name: data.name, persona: data.persona, createdAt: Date.now() });
      })
      .catch(() => setError("加载失败"));
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleDownload = useCallback(() => {
    if (!sessionInfo) return;
    const content = buildPersonaFile(sessionInfo.name, sessionInfo.persona, sessionInfo.description, sessionInfo.distillResult);
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sessionInfo.name}的数字分身.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sessionInfo]);

  const handleCopySkillLink = useCallback(() => {
    const url = `${window.location.origin}/skill/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setSkillCopied(true);
      setTimeout(() => setSkillCopied(false), 2000);
    });
  }, [id]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: id,
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
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
                updated[updated.length - 1] = { role: "assistant", content: fullContent };
                return updated;
              });
            }
          } catch { /* skip */ }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "出了点问题，重试一下。" };
        return updated;
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (error) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-5">
        <p className="text-red-400 text-sm mb-3">{error}</p>
        <Link href="/" className="text-xs text-primary underline">返回首页</Link>
      </main>
    );
  }

  return (
    <main className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <Link href="/" className="text-muted-foreground hover:text-foreground text-xs">←</Link>
          <h1 className="text-sm font-medium">
            {sessionInfo?.name || "…"}
            <span className="text-muted-foreground font-normal text-xs ml-1.5">的数字分身</span>
          </h1>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={handleCopySkillLink}
            className="text-[11px] px-2.5 py-1 rounded bg-accent/15 text-accent border border-accent/20
                       hover:bg-accent/25 transition-colors">
            {skillCopied ? "已复制 ✓" : "Skill 链接"}
          </button>
          <button onClick={handleDownload}
            className="text-[11px] px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/20
                       hover:bg-primary/20 transition-colors">
            下载 .md
          </button>
          <button onClick={handleShare}
            className="text-[11px] px-2.5 py-1 rounded border border-border text-muted-foreground
                       hover:text-foreground transition-colors">
            {copied ? "已复制 ✓" : "分享"}
          </button>
        </div>
      </header>

      {/* Banner */}
      {showBanner && sessionInfo && (
        <div className="flex items-center justify-between px-4 py-1.5 bg-accent/5 border-b border-accent/10 text-[11px] text-muted-foreground">
          <span>
            数据保留 7 天 · 建议
            <button onClick={handleDownload} className="text-primary mx-0.5 underline">下载人格包</button>
            或复制
            <button onClick={handleCopySkillLink} className="text-accent mx-0.5 underline">Skill 链接</button>
            分享给别人
          </span>
          <button onClick={() => setShowBanner(false)} className="text-muted-foreground/50 hover:text-foreground ml-2">✕</button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && sessionInfo && (
          <div className="pt-16 pb-8 text-center">
            <p className="text-sm text-muted-foreground">
              {sessionInfo.name} 的数字分身已就绪
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">试着跟 TA 说句话</p>
            <div className="flex flex-wrap justify-center gap-1.5 mt-5">
              {["你好呀", "最近怎么样？", "给我讲个故事"].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); setTimeout(() => handleSend(), 100); }}
                  className="text-xs px-3 py-1.5 rounded border border-border
                             text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-3.5 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-primary/15 text-foreground rounded-br-sm"
                : "bg-card border border-border rounded-bl-sm"
            }`}>
              {msg.content || (
                <span className="inline-block w-1.5 h-4 bg-muted-foreground/40 animate-pulse rounded-sm" />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border px-4 py-2.5">
        <div className="flex gap-2 max-w-2xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`跟${sessionInfo?.name || "TA"}说点什么…`}
            rows={1}
            className="flex-1 px-3.5 py-2 rounded-lg bg-card border border-border text-foreground text-sm
                       placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40
                       transition-colors resize-none"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium
                       hover:opacity-90 transition-opacity disabled:opacity-25 disabled:cursor-not-allowed"
          >
            发送
          </button>
        </div>
      </div>
    </main>
  );
}
