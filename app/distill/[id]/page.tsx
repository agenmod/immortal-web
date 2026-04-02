"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SessionData {
  id: string;
  name: string;
  persona: string;
  status: "pending" | "distilling" | "done" | "error";
  distillResult?: string;
  error?: string;
}

const STAGES = [
  { key: "parsing", label: "解析聊天记录", icon: "📄" },
  { key: "interaction", label: "提取互动风格", icon: "💬" },
  { key: "personality", label: "提取性格价值观", icon: "🧠" },
  { key: "memory", label: "提取记忆经历", icon: "📖" },
  { key: "procedure", label: "提取做事方式", icon: "🔧" },
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

        if (!res.ok) {
          setError(data.error || "获取状态失败");
          return;
        }

        setSession(data);

        if (data.status === "done") {
          setCurrentStage(STAGES.length);
          clearInterval(stageTimer);
          setTimeout(() => {
            if (!cancelled) router.push(`/chat/${id}`);
          }, 1500);
        } else if (data.status === "error") {
          setError(data.error || "蒸馏失败");
          clearInterval(stageTimer);
        }
      } catch {
        if (!cancelled) setError("网络错误");
      }
    };

    poll();
    const pollTimer = setInterval(poll, 2000);

    stageTimer = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < STAGES.length - 1) return prev + 1;
        return prev;
      });
    }, 8000);

    return () => {
      cancelled = true;
      clearInterval(pollTimer);
      clearInterval(stageTimer);
    };
  }, [id, router]);

  return (
    <main className="flex flex-col items-center min-h-screen">
      <div className="w-full max-w-lg mx-auto px-4 py-16 text-center">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← 首页
        </Link>

        <div className="mt-8 mb-8">
          <div className="text-5xl mb-4 animate-pulse">🧬</div>
          <h1 className="text-2xl font-black">
            正在蒸馏
            {session?.name && (
              <span className="gradient-text"> {session.name}</span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            AI 正在从聊天记录中提取 TA 的数字分身
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-3 text-left mb-8">
          {STAGES.map((stage, i) => {
            const isDone = i < currentStage;
            const isCurrent = i === currentStage;
            return (
              <div
                key={stage.key}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-500 ${
                  isDone
                    ? "bg-primary/10 border border-primary/20"
                    : isCurrent
                    ? "bg-card border border-border animate-pulse"
                    : "bg-card/30 border border-transparent opacity-40"
                }`}
              >
                <span className="text-xl">{isDone ? "✅" : stage.icon}</span>
                <span className={`text-sm ${isDone ? "text-primary" : "text-foreground"}`}>
                  {stage.label}
                </span>
                {isCurrent && (
                  <span className="ml-auto text-xs text-muted-foreground">进行中…</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Done */}
        {session?.status === "done" && (
          <div className="animate-fade-in">
            <p className="text-primary font-bold text-lg mb-3">蒸馏完成！</p>
            <p className="text-sm text-muted-foreground">正在跳转到对话页面…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <p className="font-bold mb-1">蒸馏失败</p>
            <p>{error}</p>
            <Link
              href="/upload"
              className="inline-block mt-3 text-primary underline"
            >
              重新上传
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
