"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getHistory, HistoryEntry } from "@/lib/history";

const PERSONA_EMOJI: Record<string, string> = {
  self: "🪞",
  colleague: "🏢",
  mentor: "🎓",
  family: "👴",
  partner: "💔",
  friend: "🍻",
  "public-figure": "🌍",
};

const PERSONAS = [
  { key: "self", emoji: "🪞", label: "蒸自己", desc: "全维度数字分身" },
  { key: "colleague", emoji: "🏢", label: "蒸同事", desc: "跑路了也留下经验" },
  { key: "mentor", emoji: "🎓", label: "蒸导师", desc: "让教诲继续响着" },
  { key: "family", emoji: "👴", label: "蒸亲人", desc: "让唠叨不会消失" },
  { key: "partner", emoji: "💔", label: "蒸前任", desc: "你自己决定" },
  { key: "friend", emoji: "🍻", label: "蒸朋友", desc: "最好笑的对话别丢了" },
  { key: "public-figure", emoji: "🌍", label: "蒸名人", desc: "仅限公开资料" },
];

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  return `${days} 天前`;
}

export default function Home() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  return (
    <main className="flex flex-col items-center">
      {/* Hero */}
      <section className="w-full max-w-3xl mx-auto px-4 pt-16 pb-12 text-center">
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight animate-fade-in">
          <span className="gradient-text">永生</span>
          <span className="text-muted-foreground">.skill</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed animate-fade-in animate-fade-in-delay-1">
          与其等着被别人蒸，不如先蒸自己。
        </p>
        <p className="text-base text-muted-foreground animate-fade-in animate-fade-in-delay-2">
          不蒸馒头争口气！顺便还能蒸馏下身边的人。
        </p>

        <div className="mt-8 p-4 rounded-xl bg-card/50 border border-border text-sm text-muted-foreground animate-fade-in animate-fade-in-delay-3">
          <p className="font-medium text-foreground">
            2026 年了，所有人都在被蒸馏。
          </p>
          <p className="mt-1">但凭什么别人来决定你被蒸成什么样？</p>
        </div>
      </section>

      {/* History */}
      {history.length > 0 && (
        <section className="w-full max-w-3xl mx-auto px-4 pb-8 animate-fade-in">
          <h2 className="text-sm font-bold text-muted-foreground mb-3">你蒸馏过的人</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {history.map((entry) => (
              <Link
                key={entry.id}
                href={`/chat/${entry.id}`}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl
                           bg-card/50 border border-border hover:border-primary/30
                           transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="text-lg">{PERSONA_EMOJI[entry.persona] || "🧬"}</span>
                <div className="text-left">
                  <div className="text-sm font-medium">{entry.name}</div>
                  <div className="text-xs text-muted-foreground">{timeAgo(entry.createdAt)}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="w-full max-w-3xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in animate-fade-in-delay-4">
          <div className="rounded-xl bg-card/50 border border-border p-5 text-center">
            <div className="text-3xl mb-2">📱</div>
            <h3 className="font-bold text-sm">上传聊天记录</h3>
            <p className="text-xs text-muted-foreground mt-1">
              微信、飞书、iMessage……粘贴或上传 txt
            </p>
          </div>
          <div className="rounded-xl bg-card/50 border border-border p-5 text-center">
            <div className="text-3xl mb-2">🧬</div>
            <h3 className="font-bold text-sm">AI 四维蒸馏</h3>
            <p className="text-xs text-muted-foreground mt-1">
              互动风格 · 性格价值观 · 记忆经历 · 做事方式
            </p>
          </div>
          <div className="rounded-xl bg-card/50 border border-border p-5 text-center">
            <div className="text-3xl mb-2">💬</div>
            <h3 className="font-bold text-sm">在线对话</h3>
            <p className="text-xs text-muted-foreground mt-1">
              用 TA 的语气说话，记得 TA 的故事
            </p>
          </div>
        </div>
      </section>

      {/* Persona selector */}
      <section className="w-full max-w-3xl mx-auto px-4 pb-16">
        <h2 className="text-center text-xl font-bold mb-6 animate-fade-in animate-fade-in-delay-5">
          你想蒸谁？
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in animate-fade-in-delay-6">
          {PERSONAS.map((p) => (
            <Link
              key={p.key}
              href={`/upload?persona=${p.key}`}
              className="group rounded-xl bg-card/50 border border-border p-4 text-center
                         hover:border-primary/50 hover:bg-card transition-all duration-200
                         hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                {p.emoji}
              </div>
              <div className="font-bold text-sm">{p.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{p.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Scenes */}
      <section className="w-full max-w-3xl mx-auto px-4 pb-12">
        <div className="space-y-3 text-center text-sm text-muted-foreground">
          <p>你的同事跑路了？<span className="text-foreground font-medium">蒸馏他。</span>让经验还能接着用。</p>
          <p>你奶奶的唠叨快忘了？<span className="text-foreground font-medium">蒸馏她。</span>让 AI 替她继续念叨你。</p>
          <p>你前任的语气忘不掉？<span className="text-foreground font-medium">蒸馏 TA。</span>——算了这个你自己决定。</p>
          <p>你自己呢？万一哪天不在了，<span className="text-foreground font-medium">谁来当你？</span></p>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full max-w-3xl mx-auto px-4 pb-20 text-center">
        <Link
          href="/upload"
          className="inline-block px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold
                     text-lg hover:opacity-90 transition-opacity glow-card"
        >
          开始蒸馏
        </Link>
        <p className="mt-4 text-xs text-muted-foreground">
          免费使用 · 无需注册 · 数据保留 7 天后自动删除
        </p>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-border py-6 text-center text-xs text-muted-foreground">
        <p>
          永生.skill — 开源数字永生蒸馏框架 ·{" "}
          <a
            href="https://github.com/agenmod/immortal-skill"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            GitHub
          </a>
        </p>
        <p className="mt-1">
          下次轮到你被蒸馏的时候，至少蒸馏器是开源的。
        </p>
      </footer>
    </main>
  );
}
