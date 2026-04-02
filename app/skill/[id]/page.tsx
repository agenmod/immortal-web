"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { buildPersonaFile } from "@/lib/history";

interface SessionData {
  name: string;
  persona: string;
  description: string;
  distillResult: string;
  status: string;
}

export default function SkillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<SessionData | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/distill?id=${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.status !== "done") { setError("蒸馏尚未完成或已过期"); return; }
        setData(d);
      })
      .catch(() => setError("加载失败"));
  }, [id]);

  const fullText = data
    ? buildPersonaFile(data.name, data.persona, data.description, data.distillResult)
    : "";

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, [fullText]);

  const handleDownload = useCallback(() => {
    if (!data) return;
    const blob = new Blob([fullText], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.name}的数字分身.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data, fullText]);

  if (error) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-5">
        <p className="text-red-400 text-sm mb-3">{error}</p>
        <Link href="/" className="text-xs text-primary underline">去首页蒸馏一个</Link>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-muted-foreground animate-pulse">加载中…</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center min-h-screen">
      <div className="w-full max-w-2xl mx-auto px-5 py-10">
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          ← 永生.skill
        </Link>

        <div className="mt-6 mb-6">
          <h1 className="text-2xl font-black">
            <span className="gradient-text">{data.name}</span>
            <span className="text-muted-foreground font-normal text-base ml-2">的数字分身</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1.5">
            由 永生.skill 蒸馏生成 · 可直接导入任何 AI 使用
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium
                       hover:opacity-90 transition-opacity"
          >
            {copied ? "已复制到剪贴板 ✓" : "复制全部内容"}
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-lg bg-card border border-border text-sm
                       hover:border-primary/30 transition-colors"
          >
            下载 .md 文件
          </button>
          <Link
            href={`/chat/${id}`}
            className="px-4 py-2 rounded-lg bg-card border border-border text-sm
                       hover:border-accent/30 transition-colors"
          >
            在线对话 →
          </Link>
        </div>

        {/* How to use */}
        <div className="p-4 rounded-lg bg-card border border-border mb-6">
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">怎么用</p>
          <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
            <li>点击「复制全部内容」</li>
            <li>打开你常用的 AI（豆包、Kimi、ChatGPT、Claude……）</li>
            <li>粘贴进去，然后说：<span className="text-foreground">「请按照这个人格设定跟我对话」</span></li>
            <li>AI 就会用 {data.name} 的方式跟你说话</li>
          </ol>
        </div>

        {/* Preview */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
            <span className="text-xs text-muted-foreground font-mono">{data.name}的数字分身.md</span>
            <button
              onClick={handleCopy}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? "✓" : "复制"}
            </button>
          </div>
          <pre className="p-4 text-xs text-muted-foreground leading-relaxed overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap font-mono">
            {fullText}
          </pre>
        </div>

        <p className="text-[10px] text-muted-foreground/50 mt-4">
          此链接 7 天内有效 · 建议下载 .md 文件永久保存
        </p>
      </div>
    </main>
  );
}
