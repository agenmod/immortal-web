"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addHistory } from "@/lib/history";
import { track } from "@/lib/track";

interface SessionData {
  id: string;
  name: string;
  persona: string;
  status: "pending" | "distilling" | "done" | "error";
  error?: string;
}

const STAGES = [
  { key: "parsing", label: "解析聊天记录", icon: "📄" },
  { key: "voice", label: "提取说话方式", icon: "🗣️" },
  { key: "anchor", label: "锚定性格特征", icon: "🎯" },
  { key: "anti", label: "标定反面校准", icon: "🚫" },
  { key: "memory", label: "提取关键记忆", icon: "💭" },
  { key: "assembling", label: "组装数字分身", icon: "🧬" },
];

export default function DistillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let stageTimer: ReturnType<typeof setInterval>;

    const poll = async () => {
      try {
        const res = await fetch(`/api/distill?id=${id}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) { setError(data.error || "获取状态失败"); return; }
        setSession(data);
        if (data.status === "done") {
          setCurrentStage(STAGES.length);
          clearInterval(stageTimer);
          addHistory({ id, name: data.name, persona: data.persona, createdAt: Date.now() });
          track("distill_done", { persona: data.persona, meta: { name: data.name } });
          setTimeout(() => { if (!cancelled) router.push(`/chat/${id}`); }, 1200);
        } else if (data.status === "error") {
          setError(data.error || "蒸馏失败");
          clearInterval(stageTimer);
        }
      } catch { if (!cancelled) setError("网络错误"); }
    };

    poll();
    const pollTimer = setInterval(poll, 2000);
    stageTimer = setInterval(() => {
      setCurrentStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 8000);

    return () => { cancelled = true; clearInterval(pollTimer); clearInterval(stageTimer); };
  }, [id, router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[#8c8578] hover:text-[#6b6560] transition-colors">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          首页
        </Link>

        <div className="bg-white rounded-2xl border border-[#e8e4df] shadow-sm p-6 mt-4">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3 animate-pulse">🧬</div>
            <h1 className="text-xl font-bold text-[#1a1a1a]">
              正在蒸馏{session?.name && <span className="gradient-text"> {session.name}</span>}
            </h1>
            <p className="text-xs text-[#8c8578] mt-1">AI 正在从聊天记录中提取数字分身</p>
          </div>

          <div className="space-y-2">
            {STAGES.map((stage, i) => {
              const isDone = i < currentStage;
              const isCurrent = i === currentStage;
              return (
                <div
                  key={stage.key}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-500 ${
                    isDone
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : isCurrent
                      ? "bg-[#6c5ce7]/5 text-[#6c5ce7] border border-[#6c5ce7]/20"
                      : "text-[#c4beb6] border border-transparent"
                  }`}
                >
                  <span className="text-base">{isDone ? "✅" : stage.icon}</span>
                  <span className="font-medium">{stage.label}</span>
                  {isCurrent && (
                    <span className="ml-auto">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#6c5ce7] animate-pulse" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {session?.status === "done" && (
            <div className="mt-6 text-center">
              <p className="text-green-600 font-semibold">蒸馏完成！</p>
              <p className="text-xs text-[#8c8578] mt-1">正在跳转到对话页面…</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              <p className="font-semibold mb-1">蒸馏失败</p>
              <p>{error}</p>
              <Link href="/upload" className="inline-block mt-2 text-[#6c5ce7] underline text-xs">重新上传</Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
