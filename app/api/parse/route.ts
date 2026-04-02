import { NextRequest, NextResponse } from "next/server";
import { parseChat, formatForLLM } from "@/lib/parser";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "缺少聊天文本" }, { status: 400 });
    }

    const result = parseChat(text);
    const formatted = formatForLLM(result);

    return NextResponse.json({
      format: result.format,
      participants: result.participants,
      messageCount: result.messageCount,
      formatted,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "解析失败" },
      { status: 500 }
    );
  }
}
