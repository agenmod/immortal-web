import { NextRequest } from "next/server";
import { getSession } from "@/lib/storage";
import { buildChatSystemPrompt, PersonaType } from "@/lib/prompts";
import { chatCompletionStream } from "@/lib/deepseek";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, messages } = await req.json();

    if (!sessionId || !messages) {
      return new Response(JSON.stringify({ error: "缺少参数" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const session = getSession(sessionId);
    if (!session || session.status !== "done" || !session.distillResult) {
      return new Response(JSON.stringify({ error: "会话不存在或蒸馏未完成" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const systemPrompt = buildChatSystemPrompt(
      session.name,
      session.persona as PersonaType,
      session.description,
      session.distillResult
    );

    const llmMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.slice(-20),
    ];

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of chatCompletionStream(llmMessages)) {
            const data = `data: ${JSON.stringify({ content: chunk })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : "流式输出错误";
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: errMsg })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "请求失败" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
