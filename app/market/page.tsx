"use client";

import Link from "next/link";
import { useEffect } from "react";
import { listPublicPersonas } from "@/lib/public-personas";
import { track } from "@/lib/track";

export default function MarketPage() {
  const personas = listPublicPersonas();

  useEffect(() => {
    track("page_view", { page: "/market" });
  }, []);

  return (
    <main className="min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-[#8c8578] hover:text-[#6b6560] transition-colors mb-6"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 12L6 8l4-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          返回首页
        </Link>

        <div className="mb-10">
          <p className="text-xs font-bold tracking-widest text-[#e17055] uppercase mb-2">
            公共人格市场
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1a1a1a] tracking-tight">
            开箱即用的<span className="gradient-text">方法论人格</span>
          </h1>
          <p className="mt-3 text-sm text-[#8c8578] leading-relaxed max-w-xl">
            基于公开讲演、访谈与史料整理的预制蒸馏结果，可直接对话或复制指令给其他
            AI。持续扩充中。
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {personas.map((p) => (
            <div
              key={p.id}
              className="card-lift rounded-2xl border border-[#e8e4df] bg-white p-6 shadow-sm flex flex-col"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h2 className="text-xl font-bold text-[#1a1a1a]">{p.name}</h2>
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-[#6c5ce7] bg-[#6c5ce7]/10 px-2 py-1 rounded-md">
                  国际 · 公开资料
                </span>
              </div>
              <p className="text-sm text-[#8c8578] leading-relaxed flex-1 mb-5">
                {p.tagline}
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/chat/${p.id}`}
                  className="btn-primary inline-flex items-center gap-1 px-4 py-2.5 text-sm"
                >
                  在线对话
                </Link>
                <Link
                  href={`/skill/${p.id}`}
                  className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl bg-[#f0eeeb] border border-[#e8e4df] text-sm font-medium text-[#6b6560] hover:bg-[#e8e4df] transition-colors"
                >
                  Skill 页
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-xs text-[#b5afa7] leading-relaxed">
          预制内容仅供学习与方法演练；不代表本人立场或授权。你也可以在
          <Link href="/upload" className="text-[#6c5ce7] hover:underline mx-0.5">
            上传页
          </Link>
          自己蒸馏新的公开人物。
        </p>
      </div>
    </main>
  );
}
