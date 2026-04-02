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
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-muted-foreground">加载中…</div>}>
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
    const text = await file.text();
    setChatText(text);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleSubmit = async () => {
    if (!name.trim()) { setError("给 TA 起个代号"); return; }
    if (!chatText.trim()) { setError("需要聊天记录才能蒸馏"); return; }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/distill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <main className="flex flex-col items-center min-h-screen">
      <div className="w-full max-w-xl mx-auto px-5 py-10">
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          ← 返回
        </Link>

        <h1 className="text-2xl font-black mt-5 mb-1">
          <span className="gradient-text">开始蒸馏</span>
        </h1>
        <p className="text-xs text-muted-foreground mb-8">
          上传聊天记录，AI 提取 TA 的数字分身
        </p>

        {/* Persona */}
        <fieldset className="mb-6">
          <legend className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">蒸谁</legend>
          <div className="flex flex-wrap gap-1.5">
            {PERSONAS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPersona(p.key)}
                className={`px-3 py-1.5 rounded text-xs transition-colors ${
                  persona === p.key
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.emoji} {p.label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Name */}
        <div className="mb-5">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wider">代号</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="李工、奶奶、小明……"
            className="w-full px-3.5 py-2 rounded-lg bg-card border border-border text-foreground text-sm
                       placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Description */}
        <div className="mb-5">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wider">
            描述 <span className="text-muted-foreground/50 normal-case tracking-normal">可选</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="后端工程师，做事严谨，说话喜欢用类比……"
            rows={2}
            className="w-full px-3.5 py-2 rounded-lg bg-card border border-border text-foreground text-sm
                       placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50
                       transition-colors resize-none"
          />
        </div>

        {/* Chat content */}
        <div className="mb-6">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wider">聊天记录</label>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`mb-3 p-5 rounded-lg border border-dashed text-center cursor-pointer transition-colors ${
              dragOver ? "border-primary/50 bg-primary/5" : "border-border hover:border-muted-foreground/30"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.csv,.json,.md"
              className="hidden"
              onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFile(file); }}
            />
            {fileName ? (
              <p className="text-xs text-primary">{fileName} ✓</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                拖拽 txt 文件到这里，或<span className="text-foreground"> 点击选择</span>
              </p>
            )}
          </div>

          <div className="relative">
            <div className="absolute -top-2.5 left-3 bg-background px-1.5 text-[10px] text-muted-foreground/60">
              或者直接粘贴
            </div>
            <textarea
              value={chatText}
              onChange={(e) => { setChatText(e.target.value); setFileName(""); }}
              placeholder={"张三: 今天开会讨论一下方案吧\n李四: 好的，我觉得方案A更好"}
              rows={8}
              className="w-full px-3.5 py-3 rounded-lg bg-card border border-border text-foreground
                         placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50
                         transition-colors resize-y font-mono text-xs leading-relaxed"
            />
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-1.5">
            微信聊天记录可从「聊天记录迁移」导出 txt
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-500/8 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm
                     hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "启动中…" : "开始蒸馏 →"}
        </button>

        <p className="text-center text-[10px] text-muted-foreground/60 mt-2.5">
          约 1-3 分钟 · 数据仅用于蒸馏 · 7 天后自动删除
        </p>
      </div>
    </main>
  );
}
