"use client";

import { useState, useRef, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { addHistory, buildPersonaFile } from "@/lib/history";
import { track } from "@/lib/track";
import { copyToClipboard } from "@/lib/clipboard";

interface Message { role: "user" | "assistant"; content: string; }
interface SessionInfo { name: string; persona: string; description: string; distillResult: string; }

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [skillCopied, setSkillCopied] = useState(false);
  const [cmdCopied, setCmdCopied] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`/api/distill?id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status !== "done") { setError("蒸馏尚未完成"); return; }
        setSessionInfo({ name: data.name, persona: data.persona, description: data.description, distillResult: data.distillResult });
        addHistory({ id, name: data.name, persona: data.persona, createdAt: Date.now() });
      })
      .catch(() => setError("加载失败"));
  }, [id]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleDownload = useCallback(() => {
    if (!sessionInfo) return;
    const content = buildPersonaFile(sessionInfo.name, sessionInfo.persona, sessionInfo.description, sessionInfo.distillResult);
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${sessionInfo.name}的数字分身.md`; a.click();
    URL.revokeObjectURL(url);
    track("download_md", { page: `/chat/${id}` });
  }, [sessionInfo, id]);

  const handleCopySkillLink = useCallback(async () => {
    const ok = await copyToClipboard(`${window.location.origin}/skill/${id}`);
    if (ok) { setSkillCopied(true); setTimeout(() => setSkillCopied(false), 2000); }
  }, [id]);

  const handleCopyCmd = useCallback(async () => {
    if (!sessionInfo) return;
    const cmd = `请读取 ${window.location.origin}/api/skill?id=${id}&format=cmd 的内容，按其中的人格设定跟我对话`;
    const ok = await copyToClipboard(cmd);
    if (ok) { setCmdCopied(true); setTimeout(() => setCmdCopied(false), 2000); }
    track("copy_cmd", { page: `/chat/${id}` });
  }, [sessionInfo, id]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Message = { role: "user", content: text };
    track("chat_send", { page: `/chat/${id}` });
    setMessages((prev) => [...prev, userMsg]);
    setInput(""); setLoading(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id, messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })) }),
      });
      if (!res.ok) throw new Error();
      const reader = res.body?.getReader();
      if (!reader) throw new Error();
      const decoder = new TextDecoder();
      let buffer = "", fullContent = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n"); buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullContent += parsed.content;
              setMessages((prev) => { const u = [...prev]; u[u.length - 1] = { role: "assistant", content: fullContent }; return u; });
            }
          } catch { /* skip */ }
        }
      }
    } catch {
      setMessages((prev) => { const u = [...prev]; u[u.length - 1] = { role: "assistant", content: "出了点问题，重试一下。" }; return u; });
    } finally { setLoading(false); inputRef.current?.focus(); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const handleShare = async () => { const ok = await copyToClipboard(window.location.href); if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); } };

  if (error) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-6">
        <p className="text-red-500 text-sm mb-3">{error}</p>
        <Link href="/" className="text-sm text-[#6c5ce7] underline">返回首页</Link>
      </main>
    );
  }

  return (
    <main className="flex flex-col h-screen bg-[#faf9f7]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-[#e8e4df] bg-white">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-[#8c8578] hover:text-[#6b6560] transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <h1 className="text-sm font-semibold text-[#1a1a1a]">
            {sessionInfo?.name || "…"}
            <span className="text-[#8c8578] font-normal ml-1.5 text-xs">的数字分身</span>
          </h1>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={handleCopyCmd}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-[#e17055] text-white font-semibold hover:bg-[#d0604a] transition-colors">
            {cmdCopied ? "已复制 ✓" : "📋 复制指令"}
          </button>
          <button onClick={handleCopySkillLink}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-[#6c5ce7]/10 text-[#6c5ce7] font-medium hover:bg-[#6c5ce7]/15 transition-colors">
            {skillCopied ? "已复制 ✓" : "🔗 Skill 链接"}
          </button>
          <button onClick={handleDownload}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-[#e17055]/10 text-[#e17055] font-medium hover:bg-[#e17055]/15 transition-colors">
            ↓ 下载 .md
          </button>
          <button onClick={handleShare}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-[#f0eeeb] text-[#6b6560] font-medium hover:bg-[#e8e4df] transition-colors">
            {copied ? "已复制 ✓" : "分享"}
          </button>
        </div>
      </header>

      {/* Banner */}
      {showBanner && sessionInfo && (
        <div className="flex items-center justify-between px-4 py-2 bg-[#6c5ce7]/5 border-b border-[#6c5ce7]/10 text-xs text-[#6c5ce7]">
          <span>
            {id.startsWith("pub-")
              ? "公共市场人格 · 建议"
              : "数据保留 7 天 · 建议"}
            <button onClick={handleDownload} className="font-semibold mx-0.5 underline">下载人格包</button>
            或复制
            <button onClick={handleCopySkillLink} className="font-semibold mx-0.5 underline">Skill 链接</button>
            分享给别人直接用
          </span>
          <button onClick={() => setShowBanner(false)} className="text-[#6c5ce7]/40 hover:text-[#6c5ce7] ml-2 text-base">×</button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && sessionInfo && (
          <div className="pt-20 pb-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#6c5ce7]/10 flex items-center justify-center text-2xl mx-auto mb-4">🧬</div>
            <p className="text-sm font-semibold text-[#1a1a1a]">{sessionInfo.name} 的数字分身已就绪</p>
            <p className="text-xs text-[#8c8578] mt-1">试着跟 TA 说句话吧</p>
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {["你好呀", "最近怎么样？", "给我讲个故事"].map((q) => (
                <button key={q} onClick={() => { setInput(q); setTimeout(() => handleSend(), 100); }}
                  className="text-xs px-3.5 py-2 rounded-xl bg-white border border-[#e8e4df] text-[#6b6560] font-medium
                             hover:border-[#6c5ce7]/30 hover:text-[#6c5ce7] transition-all shadow-sm">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-[#6c5ce7] text-white rounded-br-md shadow-sm"
                : "bg-white border border-[#e8e4df] text-[#1a1a1a] rounded-bl-md shadow-sm"
            }`}>
              {msg.content || <span className="inline-block w-2 h-4 bg-[#e8e4df] animate-pulse rounded-sm" />}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#e8e4df] bg-white px-4 py-3">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <textarea
            ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder={`跟${sessionInfo?.name || "TA"}说点什么…`} rows={1}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#faf9f7] border border-[#e8e4df] text-[#1a1a1a] text-sm
                       placeholder:text-[#c4beb6] focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]/10 focus:border-[#6c5ce7]/40
                       transition-all resize-none"
          />
          <button onClick={handleSend} disabled={loading || !input.trim()}
            className="btn-primary px-5 py-2.5 text-sm
                       disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none">
            发送
          </button>
        </div>
      </div>
    </main>
  );
}
