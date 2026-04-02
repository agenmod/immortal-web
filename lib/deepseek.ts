const ARK_API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
const ARK_MODEL = "doubao-seed-1-8-251228";
const ARK_VISION_MODEL = "doubao-vision-pro-32k";

function getApiKey(): string {
  const key = process.env.ARK_API_KEY;
  if (!key) throw new Error("ARK_API_KEY not set");
  return key;
}

type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | ContentPart[];
}

export async function chatCompletion(
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number; vision?: boolean }
): Promise<string> {
  const model = options?.vision ? ARK_VISION_MODEL : ARK_MODEL;

  const res = await fetch(ARK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ark API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content ?? "";
}

export async function visionOCR(base64Image: string, mimeType: string): Promise<string> {
  const dataUrl = `data:${mimeType};base64,${base64Image}`;
  const result = await chatCompletion(
    [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "这是一张聊天记录截图。请完整提取图中所有对话内容，保持原始格式（发送者: 消息内容），每条消息一行。只输出聊天内容，不要加任何说明。",
          },
          {
            type: "image_url",
            image_url: { url: dataUrl },
          },
        ],
      },
    ],
    { temperature: 0.1, maxTokens: 4096, vision: true }
  );
  return result;
}

export async function* chatCompletionStream(
  messages: ChatMessage[]
): AsyncGenerator<string> {
  const res = await fetch(ARK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: ARK_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
      stream: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ark API error ${res.status}: ${err}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;
      const data = trimmed.slice(6);
      if (data === "[DONE]") return;

      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        // skip malformed chunks
      }
    }
  }
}
