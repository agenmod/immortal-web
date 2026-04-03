"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { buildPersonaFile } from "@/lib/history";
import { track } from "@/lib/track";
import { copyToClipboard } from "@/lib/clipboard";

interface SessionData { name: string; persona: string; description: string; distillResult: string; status: string; }

export default function SkillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<SessionData | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [cmdCopied, setCmdCopied] = useState(false);

  useEffect(() => {
    track("page_view", { page: `/skill/${id}` });
    fetch(`/api/distill?id=${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.status !== "done") { setError("蒸馏尚未完成或已过期"); return; } setData(d); })
      .catch(() => setError("加载失败"));
  }, [id]);

  const fullText = data ? buildPersonaFile(data.name, data.persona, data.description, data.distillResult) : "";

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(fullText);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2500); }
    track("copy_cmd", { page: `/skill/${id}` });
  }, [fullText, id]);

  const handleDownload = useCallback(() => {
    if (!data) return;
    const blob = new Blob([fullText], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${data.name}的数字分身.md`; a.click();
    URL.revokeObjectURL(url);
  }, [data, fullText]);

  if (error) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-6">
        <p className="text-red-500 text-sm mb-3">{error}</p>
        <Link href="/" className="text-sm text-[#6c5ce7] underline">去首页蒸馏一个</Link>
      </main>
    );
  }

  if (!data) {
    return <main className="flex items-center justify-center min-h-screen"><p className="text-sm text-[#8c8578] animate-pulse">加载中…</p></main>;
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[#8c8578] hover:text-[#6b6560] transition-colors mb-6">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          永生.skill
        </Link>

        <div className="bg-white rounded-2xl border border-[#e8e4df] shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-[#e8e4df]">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  <span className="gradient-text">{data.name}</span>
                  <span className="text-[#8c8578] font-normal text-base ml-2">的数字分身</span>
                </h1>
                <p className="text-xs text-[#b5afa7] mt-1">由 永生.skill 蒸馏生成 · 可导入任何 AI 使用</p>
              </div>
              <Link href={`/chat/${id}`}
                className="btn-primary shrink-0 px-4 py-2 text-sm">
                在线对话 →
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <button onClick={handleCopy}
                className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-sm">
                {copied ? "已复制到剪贴板 ✓" : "📋 复制全部内容"}
              </button>
              <button onClick={handleDownload}
                className="px-4 py-2 rounded-xl bg-[#f0eeeb] border border-[#e8e4df] text-sm font-medium text-[#6b6560] hover:bg-[#e8e4df] transition-colors">
                ↓ 下载 .md 文件
              </button>
            </div>
          </div>

          {/* One-line command */}
          <div className="px-6 py-4 bg-[#e17055]/5 border-b border-[#e17055]/10">
            <p className="text-xs font-semibold text-[#e17055] mb-2">🔥 一行指令，复制给 AI 直接用</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2.5 rounded-lg bg-[#1a1a1a] text-[#e17055] text-xs font-mono leading-relaxed select-all truncate">
                请读取 {typeof window !== "undefined" ? window.location.origin : "https://symbiotime.com"}/api/skill?id={id}&format=cmd 的内容，按其中的人格设定跟我对话
              </code>
              <button
                onClick={async () => {
                  const cmd = `请读取 ${window.location.origin}/api/skill?id=${id}&format=cmd 的内容，按其中的人格设定跟我对话`;
                  const ok = await copyToClipboard(cmd);
                  if (ok) { setCmdCopied(true); setTimeout(() => setCmdCopied(false), 2000); }
                  track("copy_cmd", { page: `/skill/${id}` });
                }}
                className="shrink-0 px-3 py-2.5 rounded-lg bg-[#e17055] text-white text-xs font-semibold hover:bg-[#d0604a] transition-colors"
              >
                {cmdCopied ? "已复制 ✓" : "复制"}
              </button>
            </div>
            <p className="text-[10px] text-[#b5afa7] mt-2">复制这一行发给豆包 / Kimi / ChatGPT，AI 会自动读取并变成 {data.name}</p>
          </div>

          {/* How to use */}
          <div className="px-6 py-4 bg-[#6c5ce7]/5 border-b border-[#6c5ce7]/10">
            <p className="text-xs font-semibold text-[#6c5ce7] mb-2">使用方式</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-[#6c5ce7]/80">
              <span>① 复制上方指令</span>
              <span>② 粘贴给豆包 / Kimi / ChatGPT / Claude</span>
              <span>③ 直接对话</span>
            </div>
          </div>

          {/* Preview */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#b5afa7] font-mono">{data.name}的数字分身.md</span>
              <button onClick={handleCopy} className="text-xs text-[#6c5ce7] hover:text-[#5a4dd1] font-medium transition-colors">
                {copied ? "✓ 已复制" : "复制"}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-[#faf9f7] border border-[#e8e4df] text-xs text-[#6b6560] leading-relaxed overflow-x-auto max-h-80 overflow-y-auto whitespace-pre-wrap font-mono">
              {fullText}
            </pre>
          </div>
        </div>

        <p className="text-xs text-[#b5afa7] mt-4 text-center">
          此链接 7 天内有效 · 建议下载 .md 文件永久保存
        </p>
      </div>
    </main>
  );
}
