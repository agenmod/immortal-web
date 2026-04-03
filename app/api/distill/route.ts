import { NextRequest, NextResponse } from "next/server";
import { createSession, getSession, updateSession } from "@/lib/storage";
import { buildDistillPrompt, PersonaType } from "@/lib/prompts";
import { chatCompletion } from "@/lib/deepseek";
import { parseChat, formatForLLM } from "@/lib/parser";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, persona, description, chatContent } = body;

    if (!name || !chatContent) {
      return NextResponse.json({ error: "缺少必要字段" }, { status: 400 });
    }

    const parsed = parseChat(chatContent);
    const formatted = formatForLLM(parsed);

    const session = createSession({
      name,
      persona: persona as PersonaType,
      description: description || "",
      chatContent: formatted,
    });

    // Start distillation in background
    runDistillation(session.id).catch(console.error);

    return NextResponse.json({ id: session.id, status: "pending" });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "创建失败" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "缺少 id" }, { status: 400 });
  }

  const session = getSession(id);
  if (!session) {
    return NextResponse.json({ error: "会话不存在或已过期" }, { status: 404 });
  }

  return NextResponse.json({
    id: session.id,
    name: session.name,
    persona: session.persona,
    description: session.description,
    status: session.status,
    distillResult: session.distillResult,
    error: session.error,
  });
}

const MAX_PROMPT_CHARS = 100_000;

function truncateChatContent(content: string): string {
  if (content.length <= MAX_PROMPT_CHARS) return content;
  return content.slice(0, MAX_PROMPT_CHARS) +
    `\n\n... (素材过长，已截取前 ${Math.round(MAX_PROMPT_CHARS / 1000)}K 字用于蒸馏)`;
}

async function runDistillation(sessionId: string) {
  const session = getSession(sessionId);
  if (!session) return;

  updateSession(sessionId, { status: "distilling" });

  try {
    const safeContent = truncateChatContent(session.chatContent);

    const prompt = buildDistillPrompt(
      session.name,
      session.persona,
      session.description,
      safeContent
    );

    const result = await chatCompletion(
      [
        { role: "system", content: "你是一个专业的人格蒸馏师。请严格按照要求输出蒸馏结果。" },
        { role: "user", content: prompt },
      ],
      { temperature: 0.6, maxTokens: 8192 }
    );

    updateSession(sessionId, { status: "done", distillResult: result });
  } catch (err) {
    updateSession(sessionId, {
      status: "error",
      error: err instanceof Error ? err.message : "蒸馏过程出错",
    });
  }
}
