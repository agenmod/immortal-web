import { NextRequest, NextResponse } from "next/server";
import { visionOCR } from "@/lib/deepseek";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
]);

const TEXT_TYPES = new Set([
  "text/plain",
  "text/csv",
  "text/markdown",
  "application/json",
]);

async function extractPDF(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  const text = result.text || "";
  await parser.destroy();
  return text;
}

async function extractDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function extractImage(buffer: Buffer, mimeType: string): Promise<string> {
  const base64 = buffer.toString("base64");
  return visionOCR(base64, mimeType);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "没有上传文件" }, { status: 400 });
    }

    const results: { name: string; text: string; type: string }[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        results.push({
          name: file.name,
          text: `[文件过大，跳过: ${(file.size / 1024 / 1024).toFixed(1)}MB]`,
          type: "error",
        });
        continue;
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const mime = file.type || "";
      const ext = file.name.split(".").pop()?.toLowerCase() || "";

      try {
        let text = "";
        let fileType = "unknown";

        if (TEXT_TYPES.has(mime) || ["txt", "csv", "md", "json"].includes(ext)) {
          text = buffer.toString("utf-8");
          fileType = "text";
        } else if (
          mime === "application/pdf" ||
          ext === "pdf"
        ) {
          text = await extractPDF(buffer);
          fileType = "pdf";
        } else if (
          mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          ext === "docx"
        ) {
          text = await extractDocx(buffer);
          fileType = "docx";
        } else if (IMAGE_TYPES.has(mime) || ["jpg", "jpeg", "png", "webp", "gif", "bmp"].includes(ext)) {
          const imageMime = mime || `image/${ext === "jpg" ? "jpeg" : ext}`;
          text = await extractImage(buffer, imageMime);
          fileType = "image";
        } else if (ext === "doc") {
          return NextResponse.json(
            { error: "暂不支持 .doc 格式，请转换为 .docx 后上传" },
            { status: 400 }
          );
        } else {
          text = buffer.toString("utf-8");
          fileType = "text";
        }

        results.push({ name: file.name, text: text.trim(), type: fileType });
      } catch (err) {
        results.push({
          name: file.name,
          text: `[解析失败: ${err instanceof Error ? err.message : "未知错误"}]`,
          type: "error",
        });
      }
    }

    const combinedText = results
      .filter((r) => r.type !== "error")
      .map((r) => {
        if (results.length > 1) {
          return `--- ${r.name} (${r.type}) ---\n${r.text}`;
        }
        return r.text;
      })
      .join("\n\n");

    return NextResponse.json({
      files: results.map((r) => ({
        name: r.name,
        type: r.type,
        chars: r.text.length,
        error: r.type === "error" ? r.text : undefined,
      })),
      text: combinedText,
      totalChars: combinedText.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "上传处理失败" },
      { status: 500 }
    );
  }
}
