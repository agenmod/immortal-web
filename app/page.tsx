"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getHistory, HistoryEntry } from "@/lib/history";

const PERSONA_EMOJI: Record<string, string> = {
  self: "🪞", colleague: "🏢", mentor: "🎓", family: "👴",
  partner: "💔", friend: "🍻", "public-figure": "🌍",
};

const PERSONAS = [
  { key: "self", label: "自己", desc: "全维度数字分身" },
  { key: "colleague", label: "同事", desc: "跑路了也留下经验" },
  { key: "mentor", label: "导师", desc: "让教诲继续响着" },
  { key: "family", label: "亲人", desc: "让唠叨不会消失" },
  { key: "partner", label: "前任", desc: "你自己决定" },
  { key: "friend", label: "朋友", desc: "最好笑的对话别丢了" },
  { key: "public-figure", label: "名人", desc: "仅限公开资料" },
];

const STEPS = [
  { n: "01", title: "上传聊天记录", desc: "微信、飞书、iMessage — 粘贴或上传 txt" },
  { n: "02", title: "七维蒸馏", desc: "说话方式 · 性格锚点 · 反面校准 · 记忆 · 立场 · 情感 · 做事方式" },
  { n: "03", title: "对话 & 导出", desc: "在线聊天，或下载 Skill 文件丢给任何 AI" },
];

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  return `${days}天前`;
}

export default function Home() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  return (
    <main className="flex flex-col items-center">
      {/* Hero */}
      <section className="w-full max-w-2xl mx-auto px-5 pt-20 pb-10 animate-fade-in">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
          <span className="gradient-text">永生</span>
          <span className="text-muted-foreground font-light">.skill</span>
        </h1>
        <p className="mt-5 text-lg text-foreground/80 leading-relaxed animate-fade-in animate-fade-in-delay-1">
          与其等着被别人蒸，不如先蒸自己。
        </p>
        <p className="text-sm text-muted-foreground animate-fade-in animate-fade-in-delay-2">
          不蒸馒头争口气。顺便还能蒸馏下身边的人。
        </p>
      </section>

      <hr className="hero-rule w-full max-w-2xl mx-auto" />

      {/* Manifesto */}
      <section className="w-full max-w-2xl mx-auto px-5 py-10 animate-fade-in animate-fade-in-delay-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          2026 年了，所有人都在被蒸馏。<br />
          但凭什么别人来决定你被蒸成什么样？
        </p>
      </section>

      {/* History */}
      {history.length > 0 && (
        <section className="w-full max-w-2xl mx-auto px-5 pb-8 animate-fade-in">
          <p className="text-xs text-muted-foreground mb-3 uppercase tracking-widest">你蒸馏过的人</p>
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {history.map((entry) => (
              <Link
                key={entry.id}
                href={`/chat/${entry.id}`}
                className="flex-shrink-0 flex items-center gap-2.5 px-4 py-2 rounded-lg
                           bg-card border border-border hover:border-primary/40
                           transition-colors"
              >
                <span className="text-base">{PERSONA_EMOJI[entry.persona] || "🧬"}</span>
                <div className="text-left">
                  <div className="text-sm font-medium">{entry.name}</div>
                  <div className="text-[11px] text-muted-foreground">{timeAgo(entry.createdAt)}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Steps */}
      <section className="w-full max-w-2xl mx-auto px-5 pb-12">
        <div className="space-y-4">
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              className={`flex gap-4 items-start animate-fade-in animate-fade-in-delay-${i + 4}`}
            >
              <span className="text-xs font-mono text-primary/60 pt-0.5 w-6 shrink-0">{s.n}</span>
              <div>
                <p className="text-sm font-medium">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="hero-rule w-full max-w-2xl mx-auto" />

      {/* Persona selector */}
      <section className="w-full max-w-2xl mx-auto px-5 py-12">
        <p className="text-xs text-muted-foreground mb-5 uppercase tracking-widest">你想蒸谁</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PERSONAS.map((p) => (
            <Link
              key={p.key}
              href={`/upload?persona=${p.key}`}
              className="group rounded-lg bg-card border border-border p-3.5
                         hover:border-primary/40 transition-colors"
            >
              <div className="text-xl mb-1.5">{PERSONA_EMOJI[p.key]}</div>
              <div className="text-sm font-medium">{p.label}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{p.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Scenes */}
      <section className="w-full max-w-2xl mx-auto px-5 pb-10">
        <div className="space-y-2.5 text-sm text-muted-foreground">
          <p>同事跑路了？<span className="text-foreground">蒸馏他。</span>让经验还能接着用。</p>
          <p>奶奶的唠叨快忘了？<span className="text-foreground">蒸馏她。</span>让 AI 替她继续念叨你。</p>
          <p>前任的语气忘不掉？<span className="text-foreground">蒸馏 TA。</span>——算了这个你自己决定。</p>
          <p>你自己呢？万一哪天不在了，<span className="text-foreground">谁来当你？</span></p>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full max-w-2xl mx-auto px-5 pb-20">
        <Link
          href="/upload"
          className="inline-block px-7 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium
                     text-sm hover:opacity-90 transition-opacity"
        >
          开始蒸馏 →
        </Link>
        <p className="mt-3 text-[11px] text-muted-foreground">
          免费 · 无需注册 · 7 天后自动删除
        </p>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-border py-8 px-5">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-muted-foreground">
          <p>
            永生.skill — 开源数字永生蒸馏框架
          </p>
          <div className="flex gap-4">
            <a href="https://github.com/agenmod/immortal-skill" target="_blank" rel="noopener noreferrer"
               className="hover:text-foreground transition-colors">Skill 框架</a>
            <a href="https://github.com/agenmod/immortal-web" target="_blank" rel="noopener noreferrer"
               className="hover:text-foreground transition-colors">Web 源码</a>
          </div>
        </div>
        <p className="max-w-2xl mx-auto mt-2 text-[11px] text-muted-foreground/60">
          下次轮到你被蒸馏的时候，至少蒸馏器是开源的。
        </p>
      </footer>
    </main>
  );
}
