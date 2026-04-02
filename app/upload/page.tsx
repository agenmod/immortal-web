"use client";

import { useState, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const PERSONAS = [
  { key: "self", emoji: "🪞", label: "自己" },
  { key: "colleague", emoji: "🏢", label: "同事" },
  { key: "mentor", emoji: "🎓", label: "导师" },
  { key: "family", emoji: "👴", label: "亲人" },
  { key: "partner", emoji: "💔", label: "伴侣/前任" },
  { key: "friend", emoji: "🍻", label: "朋友" },
  { key: "public-figure", emoji: "🌍", label: "公众人物" },
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
    if (!name.trim()) {
      setError("给 TA 起个代号吧");
      return;
    }
    if (!chatText.trim()) {
      setError("需要聊天记录才能蒸馏");
      return;
    }
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
      <div className="w-full max-w-2xl mx-auto px-4 py-8">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← 返回
        </Link>

        <h1 className="text-3xl font-black mt-4 mb-2">
          <span className="gradient-text">开始蒸馏</span>
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          上传聊天记录，AI 帮你蒸馏出 TA 的数字分身
        </p>

        {/* Persona */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">蒸谁？</label>
          <div className="flex flex-wrap gap-2">
            {PERSONAS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPersona(p.key)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                  persona === p.key
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card/50 text-muted-foreground hover:border-primary/30"
                }`}
              >
                {p.emoji} {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">TA 的代号</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="比如：李工、奶奶、小明……"
            className="w-full px-4 py-2.5 rounded-lg bg-card/50 border border-border text-foreground
                       placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            简单描述一下 TA <span className="text-muted-foreground font-normal">(可选)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="比如：后端工程师，做事严谨，说话喜欢用类比……"
            rows={2}
            className="w-full px-4 py-2.5 rounded-lg bg-card/50 border border-border text-foreground
                       placeholder:text-muted-foreground focus:outline-none focus:border-primary
                       transition-colors resize-none"
          />
        </div>

        {/* Chat content */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">聊天记录</label>

          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`mb-3 p-6 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/30"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.csv,.json,.md"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <div className="text-2xl mb-2">📄</div>
            {fileName ? (
              <p className="text-sm text-primary">{fileName} ✓</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  拖拽文件到这里，或点击选择
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  支持 txt / csv / json / md
                </p>
              </>
            )}
          </div>

          {/* Or paste */}
          <div className="relative">
            <div className="absolute -top-3 left-4 bg-background px-2 text-xs text-muted-foreground">
              或者直接粘贴
            </div>
            <textarea
              value={chatText}
              onChange={(e) => {
                setChatText(e.target.value);
                setFileName("");
              }}
              placeholder={"张三: 今天开会讨论一下方案吧\n李四: 好的，我觉得方案A更好\n张三: 为什么？\n李四: 因为……"}
              rows={10}
              className="w-full px-4 py-3 rounded-lg bg-card/50 border border-border text-foreground
                         placeholder:text-muted-foreground focus:outline-none focus:border-primary
                         transition-colors resize-y font-mono text-sm"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            💡 微信聊天记录可以从「聊天记录迁移」导出 txt，或直接复制粘贴对话内容
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-lg
                     hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "正在启动蒸馏…" : "🧬 开始蒸馏"}
        </button>

        <p className="text-center text-xs text-muted-foreground mt-3">
          蒸馏过程约 1-3 分钟 · 数据仅用于蒸馏 · 7 天后自动删除
        </p>
      </div>
    </main>
  );
}
