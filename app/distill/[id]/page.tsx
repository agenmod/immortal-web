"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addHistory } from "@/lib/history";

interface SessionData {
  id: string;
  name: string;
  persona: string;
  status: "pending" | "distilling" | "done" | "error";
  error?: string;
}

const STAGES = [
  { key: "parsing", label: "解析聊天记录" },
  { key: "voice", label: "提取说话方式" },
  { key: "anchor", label: "锚定性格特征" },
  { key: "anti", label: "标定反面校准" },
  { key: "memory", label: "提取关键记忆" },
  { key: "assembling", label: "组装数字分身" },
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
    <main className="flex flex-col items-center min-h-screen">
      <div className="w-full max-w-md mx-auto px-5 py-16">
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          ← 首页
        </Link>

        <div className="mt-8 mb-8">
          <h1 className="text-xl font-black">
            正在蒸馏
            {session?.name && <span className="gradient-text"> {session.name}</span>}
          </h1>
          <p className="text-xs text-muted-foreground mt-1.5">
            AI 正在从聊天记录中提取数字分身
          </p>
        </div>

        <div className="space-y-2 mb-8">
          {STAGES.map((stage, i) => {
            const isDone = i < currentStage;
            const isCurrent = i === currentStage;
            return (
              <div
                key={stage.key}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all duration-500 ${
                  isDone
                    ? "text-primary bg-primary/5 border border-primary/10"
                    : isCurrent
                    ? "text-foreground bg-card border border-border animate-pulse"
                    : "text-muted-foreground/40 border border-transparent"
                }`}
              >
                <span className="w-4 text-center font-mono text-[10px]">
                  {isDone ? "✓" : isCurrent ? "›" : "·"}
                </span>
                <span>{stage.label}</span>
                {isCurrent && <span className="ml-auto text-[10px] text-muted-foreground">进行中</span>}
              </div>
            );
          })}
        </div>

        {session?.status === "done" && (
          <div className="animate-fade-in">
            <p className="text-primary text-sm font-medium mb-1">蒸馏完成</p>
            <p className="text-xs text-muted-foreground">正在跳转…</p>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-500/8 border border-red-500/20 text-red-400 text-xs">
            <p className="font-medium mb-1">蒸馏失败</p>
            <p>{error}</p>
            <Link href="/upload" className="inline-block mt-2 text-primary underline">重新上传</Link>
          </div>
        )}
      </div>
    </main>
  );
}
