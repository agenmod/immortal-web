"use client";

import { useState, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const PERSONAS = [
  { key: "self", emoji: "🪞", label: "自己" },
  { key: "colleague", emoji: "🏢", label: "同事" },
  { key: "mentor", emoji: "🎓", label: "导师" },
  { key: "family", emoji: "👴", label: "亲人" },
  { key: "partner", emoji: "💔", label: "前任" },
  { key: "friend", emoji: "🍻", label: "朋友" },
  { key: "public-figure", emoji: "🌍", label: "名人" },
];

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-[#8c8578]">加载中…</div>}>
      <UploadPageInner />
    </Suspense>
  );
}

function UploadPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPersona = searchParams.get("persona") || "self";

  const [persona, setPersona] = useState(initialPersona);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [chatText, setChatText] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setChatText(await file.text());
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleSubmit = async () => {
    if (!name.trim()) { setError("给 TA 起个代号"); return; }
    if (!chatText.trim()) { setError("需要聊天记录才能蒸馏"); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/distill", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, persona, description, chatContent: chatText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "蒸馏启动失败");
      router.push(`/distill/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "出错了");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <div className="max-w-xl mx-auto px-6 py-10">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[#8c8578] hover:text-[#6b6560] transition-colors mb-6">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          返回
        </Link>

        <div className="bg-white rounded-2xl border border-[#e8e4df] shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl font-bold mb-1">
            <span className="gradient-text">开始蒸馏</span>
          </h1>
          <p className="text-sm text-[#8c8578] mb-8">上传聊天记录，AI 提取 TA 的数字分身</p>

          {/* Persona */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">蒸谁？</label>
            <div className="flex flex-wrap gap-2">
              {PERSONAS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPersona(p.key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    persona === p.key
                      ? "bg-[#6c5ce7]/10 text-[#6c5ce7] border-2 border-[#6c5ce7]/30 shadow-sm"
                      : "bg-[#f0eeeb] text-[#6b6560] border-2 border-transparent hover:bg-[#e8e4df]"
                  }`}
                >
                  {p.emoji} {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">TA 的代号</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="李工、奶奶、小明……"
              className="w-full px-4 py-2.5 rounded-xl bg-[#faf9f7] border border-[#e8e4df] text-[#1a1a1a] text-sm
                         placeholder:text-[#c4beb6] focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]/10 focus:border-[#6c5ce7]/40 transition-all"
            />
          </div>

          {/* Description */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">
              简单描述一下 TA <span className="text-[#c4beb6] font-normal">可选</span>
            </label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="后端工程师，做事严谨，说话喜欢用类比……"
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-[#faf9f7] border border-[#e8e4df] text-[#1a1a1a] text-sm
                         placeholder:text-[#c4beb6] focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]/10 focus:border-[#6c5ce7]/40 transition-all resize-none"
            />
          </div>

          {/* Chat content */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">聊天记录</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`mb-3 p-5 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                dragOver ? "border-[#6c5ce7]/40 bg-[#6c5ce7]/5" : "border-[#e8e4df] hover:border-[#d0cac3] bg-[#faf9f7]"
              }`}
            >
              <input ref={fileRef} type="file" accept=".txt,.csv,.json,.md" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              {fileName ? (
                <p className="text-sm text-[#6c5ce7] font-medium">{fileName} ✓</p>
              ) : (
                <>
                  <div className="text-2xl mb-1">📄</div>
                  <p className="text-sm text-[#8c8578]">拖拽文件到这里，或<span className="text-[#6c5ce7] font-medium"> 点击选择</span></p>
                  <p className="text-xs text-[#c4beb6] mt-1">支持 txt / csv / json / md</p>
                </>
              )}
            </div>

            <div className="relative">
              <div className="absolute -top-2.5 left-3 bg-white px-2 text-xs text-[#c4beb6]">或者直接粘贴</div>
              <textarea
                value={chatText}
                onChange={(e) => { setChatText(e.target.value); setFileName(""); }}
                placeholder={"张三: 今天开会讨论一下方案吧\n李四: 好的，我觉得方案A更好\n张三: 为什么？"}
                rows={8}
                className="w-full px-4 py-3 rounded-xl bg-[#faf9f7] border border-[#e8e4df] text-[#1a1a1a]
                           placeholder:text-[#c4beb6] focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]/10 focus:border-[#6c5ce7]/40
                           transition-all resize-y font-mono text-xs leading-relaxed"
              />
            </div>
            <p className="text-xs text-[#b5afa7] mt-2">
              💡 微信聊天记录可从「聊天记录迁移」导出 txt，或直接复制粘贴
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit} disabled={loading}
            className="btn-primary w-full py-3 text-sm
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? "正在启动蒸馏…" : "开始蒸馏 →"}
          </button>

          <p className="text-center text-xs text-[#b5afa7] mt-3">
            蒸馏约 1-3 分钟 · 数据仅用于蒸馏 · 7 天后自动删除
          </p>
        </div>
      </div>
    </main>
  );
}
