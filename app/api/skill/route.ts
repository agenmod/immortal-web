import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/storage";
import { buildPersonaFile } from "@/lib/history";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return new NextResponse("缺少 id 参数", { status: 400 });
  }

  const session = getSession(id);
  if (!session || session.status !== "done") {
    return new NextResponse("会话不存在或蒸馏尚未完成", { status: 404 });
  }

  const md = buildPersonaFile(
    session.name,
    session.persona,
    session.description,
    session.distillResult || ""
  );

  const cmd = `请按以下人格设定跟我对话，你就是${session.name}。以下是完整人格数据：\n\n${md}`;

  const format = req.nextUrl.searchParams.get("format");

  if (format === "cmd") {
    return new NextResponse(cmd, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new NextResponse(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `inline; filename="${session.name}.md"`,
    },
  });
}
