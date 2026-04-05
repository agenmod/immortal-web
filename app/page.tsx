"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { track } from "@/lib/track";
import { copyToClipboard } from "@/lib/clipboard";

const PERSONAS = [
  { key: "self", emoji: "🪞", label: "蒸自己", desc: "全维度数字分身" },
  { key: "colleague", emoji: "🏢", label: "蒸同事", desc: "跑路了也留下经验" },
  { key: "mentor", emoji: "🎓", label: "蒸导师", desc: "让教诲继续响着" },
  { key: "family", emoji: "👴", label: "蒸亲人", desc: "让唠叨不会消失" },
  { key: "partner", emoji: "💔", label: "蒸前任", desc: "你自己决定" },
  { key: "friend", emoji: "🍻", label: "蒸朋友", desc: "最好笑的对话别丢了" },
  { key: "public-figure", emoji: "🌍", label: "国际名人", desc: "公开方法论 · 海外公开资料" },
];

const SKILL_CMD = `请读取 https://symbiotime.com/skill.md 的内容，学会其中的七维蒸馏方法论，然后等我发聊天记录给你蒸馏`;

function SkillCommandSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(SKILL_CMD);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
    track("copy_skill_cmd", { page: "/" });
  };

  return (
    <section className="max-w-3xl mx-auto px-6 py-20">
      <div className="rounded-2xl border border-[#e17055]/20 bg-[#e17055]/5 p-8 sm:p-10">
        <div className="flex items-start gap-4 sm:gap-6">
          <div className="shrink-0 w-12 h-12 rounded-xl bg-[#e17055] flex items-center justify-center text-white text-xl">🧬</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">不想来网站？一行指令教会你的 AI 蒸馏</h3>
            <p className="text-sm text-[#8c8578] mb-4">
              复制下面这行发给豆包 / Kimi / ChatGPT，它就学会了七维蒸馏术。然后直接发聊天记录，在你自己的 AI 里就能蒸。
            </p>
            <div className="rounded-xl bg-[#1a1a1a] p-4 flex items-start gap-3">
              <code className="flex-1 text-[#e17055] font-mono text-xs leading-relaxed break-all select-all">
                {SKILL_CMD}
              </code>
              <button
                onClick={handleCopy}
                className="shrink-0 px-3 py-2 rounded-lg bg-[#e17055] text-white text-xs font-semibold hover:bg-[#d0604a] transition-colors"
              >
                {copied ? "已复制 ✓" : "复制"}
              </button>
            </div>
            <p className="text-xs text-[#b5afa7] mt-3">
              无需注册、无需来网站，你的 AI 直接变成蒸馏师。聊天记录全程留在你本地。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  useEffect(() => { track("page_view", { page: "/" }); }, []);
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="hero-bg">
        <div className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="anim-fade inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#e8e4df] bg-white/80 backdrop-blur text-xs font-medium text-[#8c8578] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e17055]" />
            七维蒸馏 · 对齐 Soul Spec 标准
          </div>

          <h1 className="anim-fade anim-d1 text-5xl sm:text-7xl font-black tracking-tight leading-[1.1]">
            <span className="gradient-text">永生</span>
            <span className="text-[#c4beb6] font-light">.skill</span>
          </h1>

          <p className="anim-fade anim-d2 mt-6 text-xl sm:text-2xl text-[#1a1a1a] font-semibold">
            把任何人从聊天记录里<span className="gradient-text font-bold">蒸馏</span>出来
          </p>

          <p className="anim-fade anim-d3 mt-3 text-sm text-[#8c8578] max-w-md mx-auto leading-relaxed">
            与其等着被别人蒸，不如先蒸自己。不蒸馒头争口气！
          </p>

          <div className="anim-fade anim-d4 mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/upload"
              className="btn-primary inline-flex items-center gap-2 px-7 py-3.5 text-base"
            >
              开始蒸馏
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <Link
              href="/market"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white border border-[#e8e4df] text-[#6b6560] font-medium text-sm hover:border-[#6c5ce7]/30 hover:text-[#6c5ce7] transition-all"
            >
              公共人格市场
            </Link>
            <a
              href="https://github.com/agenmod/immortal-skill"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white border border-[#e8e4df] text-[#6b6560] font-medium text-sm hover:border-[#d0cac3] hover:shadow-sm transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-center text-2xl font-bold text-[#1a1a1a] mb-3">三步蒸馏，一键永生</h2>
        <p className="text-center text-sm text-[#8c8578] mb-12">上传聊天记录 → AI 七维提取 → 下载或在线对话</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { n: "01", title: "上传聊天记录", desc: "微信、飞书、iMessage……粘贴或上传 txt 文件", color: "from-[#6c5ce7]/5 to-[#6c5ce7]/10", accent: "#6c5ce7" },
            { n: "02", title: "七维 AI 蒸馏", desc: "说话方式 · 性格锚点 · 反面校准 · 记忆 · 立场 · 情感 · 做事方式", color: "from-[#e17055]/5 to-[#e17055]/10", accent: "#e17055" },
            { n: "03", title: "复制指令 & 分享", desc: "一键复制完整人格指令，粘贴给豆包 / Kimi / ChatGPT 直接用", color: "from-[#6c5ce7]/5 to-[#e17055]/10", accent: "#6c5ce7" },
          ].map((s) => (
            <div key={s.n} className={`card-lift rounded-2xl bg-gradient-to-br ${s.color} border border-[#e8e4df] p-6`}>
              <div className="text-xs font-bold tracking-widest mb-4" style={{ color: s.accent }}>{s.n}</div>
              <h3 className="font-bold text-base text-[#1a1a1a] mb-2">{s.title}</h3>
              <p className="text-sm text-[#8c8578] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Highlight: 7 dimensions */}
      <section className="bg-[#f5f0eb] border-y border-[#e8e4df]">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest text-[#e17055] uppercase mb-3">维度体系 v2</p>
            <h2 className="text-2xl font-bold text-[#1a1a1a]">不是简单复读机，是七维人格蒸馏</h2>
            <p className="text-sm text-[#8c8578] mt-2">对齐 Soul Spec 开放标准，下载即可导入 OpenClaw / Cursor / 任何 AI</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "说话方式", desc: "句式、口头禅、标点习惯", icon: "🗣️", core: true },
              { label: "性格锚点", desc: "遇到X会Y的行为模式", icon: "🎯", core: true },
              { label: "反面校准", desc: "TA 绝对不会说的话", icon: "🚫", core: true },
              { label: "关键记忆", desc: "反复提及的故事和经历", icon: "💭", core: true },
              { label: "立场观点", desc: "对具体话题的态度", icon: "📐", core: false },
              { label: "情感模式", desc: "开心/生气/关心的表达", icon: "❤️", core: false },
              { label: "做事方式", desc: "决策风格和工作习惯", icon: "⚡", core: false },
              { label: "矛盾面", desc: "真人就是前后不一致的", icon: "🔀", core: false },
            ].map((d) => (
              <div key={d.label} className="bg-white rounded-xl p-4 border border-[#e8e4df] shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{d.icon}</span>
                  {d.core && <span className="text-[10px] font-bold text-[#e17055] bg-[#e17055]/10 px-1.5 py-0.5 rounded">核心</span>}
                </div>
                <p className="text-sm font-semibold text-[#1a1a1a]">{d.label}</p>
                <p className="text-xs text-[#8c8578] mt-0.5">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* One-line skill command */}
      <SkillCommandSection />

      {/* Persona selector */}
      <section className="max-w-3xl mx-auto px-6 pt-0 pb-20">
        <h2 className="text-center text-2xl font-bold text-[#1a1a1a] mb-3">你想蒸谁？</h2>
        <p className="text-center text-sm text-[#8c8578] mb-10">选一个角色类型，AI 会针对性地蒸馏不同维度</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PERSONAS.map((p) => (
            <Link
              key={p.key}
              href={`/upload?persona=${p.key}`}
              className="card-lift rounded-xl border border-[#e8e4df] bg-white p-4 hover:border-[#6c5ce7]/30 transition-all"
            >
              <div className="text-2xl mb-2">{p.emoji}</div>
              <div className="font-bold text-sm text-[#1a1a1a]">{p.label}</div>
              <div className="text-xs text-[#8c8578] mt-0.5">{p.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Scenes */}
      <section className="bg-[#f5f0eb] border-y border-[#e8e4df]">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <div className="max-w-lg mx-auto space-y-5 text-center">
            <p className="text-[#8c8578]">同事跑路了？<span className="text-[#1a1a1a] font-semibold">蒸馏他。</span>让经验还能接着用。</p>
            <p className="text-[#8c8578]">奶奶的唠叨快忘了？<span className="text-[#1a1a1a] font-semibold">蒸馏她。</span>让 AI 替她继续念叨你。</p>
            <p className="text-[#8c8578]">前任的语气忘不掉？<span className="text-[#1a1a1a] font-semibold">蒸馏 TA。</span>——算了这个你自己决定。</p>
            <p className="text-[#8c8578]">你自己呢？万一哪天不在了，<span className="text-[#1a1a1a] font-semibold">谁来当你？</span></p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-sm text-[#8c8578] mb-3">2026 年了，所有人都在被蒸馏。</p>
        <p className="text-2xl font-bold text-[#1a1a1a] mb-8">但凭什么别人来决定你被蒸成什么样？</p>
        <Link
          href="/upload"
          className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-base"
        >
          开始蒸馏
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Link>
        <p className="mt-5 text-xs text-[#b5afa7]">
          免费使用 · 无需注册 · 数据保留 7 天后自动删除
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e8e4df] py-8 px-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-[#b5afa7]">
          <p>永生.skill — 开源数字永生蒸馏框架</p>
          <div className="flex flex-wrap gap-5">
            <Link href="/market" className="hover:text-[#6b6560] transition-colors">公共人格市场</Link>
            <a href="https://github.com/agenmod/immortal-skill" target="_blank" rel="noopener noreferrer"
               className="hover:text-[#6b6560] transition-colors">Skill 框架</a>
            <a href="https://github.com/agenmod/immortal-web" target="_blank" rel="noopener noreferrer"
               className="hover:text-[#6b6560] transition-colors">Web 源码</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
