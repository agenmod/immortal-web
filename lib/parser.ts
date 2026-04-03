export interface ParsedMessage {
  sender: string;
  content: string;
  timestamp?: string;
}

export interface ParseResult {
  messages: ParsedMessage[];
  participants: string[];
  messageCount: number;
  format: string;
}

const WECHAT_LINE_RE =
  /^(\d{4}[-/]\d{1,2}[-/]\d{1,2}\s+\d{1,2}:\d{2}(?::\d{2})?)\s+(.+?)(?:\(.*?\))?[：:]\s*$/;
const WECHAT_DATETIME_RE =
  /^(\d{4}[-/]\d{1,2}[-/]\d{1,2}\s+\d{1,2}:\d{2})/;

const WHATSAPP_RE =
  /^\[?(\d{1,2}\/\d{1,2}\/\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)\]?\s*-?\s*(.+?):\s+(.+)$/;

const IMESSAGE_RE =
  /^(.+?)\s+\((\d{4}[-/]\d{1,2}[-/]\d{1,2}\s+\d{1,2}:\d{2})\)\s*$/;

function parseWechatTxt(text: string): ParseResult {
  const lines = text.split("\n");
  const messages: ParsedMessage[] = [];
  let currentSender = "";
  let currentTimestamp = "";
  let currentContent: string[] = [];

  for (const line of lines) {
    const headerMatch = line.match(WECHAT_LINE_RE);
    const dtMatch = line.match(WECHAT_DATETIME_RE);

    if (headerMatch) {
      if (currentSender && currentContent.length > 0) {
        messages.push({
          sender: currentSender,
          content: currentContent.join("\n").trim(),
          timestamp: currentTimestamp,
        });
      }
      currentTimestamp = headerMatch[1];
      currentSender = headerMatch[2].trim();
      currentContent = [];
    } else if (dtMatch && !headerMatch) {
      if (currentSender && currentContent.length > 0) {
        messages.push({
          sender: currentSender,
          content: currentContent.join("\n").trim(),
          timestamp: currentTimestamp,
        });
        currentContent = [];
      }
      const parts = line.split(/[：:]\s*/);
      if (parts.length >= 2) {
        currentTimestamp = dtMatch[1];
        currentSender = parts[0].replace(WECHAT_DATETIME_RE, "").trim();
        currentContent = [parts.slice(1).join(":").trim()];
      }
    } else if (line.trim()) {
      currentContent.push(line);
    }
  }

  if (currentSender && currentContent.length > 0) {
    messages.push({
      sender: currentSender,
      content: currentContent.join("\n").trim(),
      timestamp: currentTimestamp,
    });
  }

  const participants = [...new Set(messages.map((m) => m.sender))];
  return { messages, participants, messageCount: messages.length, format: "wechat" };
}

function parseWhatsApp(text: string): ParseResult {
  const lines = text.split("\n");
  const messages: ParsedMessage[] = [];

  for (const line of lines) {
    const match = line.match(WHATSAPP_RE);
    if (match) {
      messages.push({
        timestamp: match[1],
        sender: match[2].trim(),
        content: match[3].trim(),
      });
    }
  }

  const participants = [...new Set(messages.map((m) => m.sender))];
  return { messages, participants, messageCount: messages.length, format: "whatsapp" };
}

function parsePlainChat(text: string): ParseResult {
  const lines = text.split("\n").filter((l) => l.trim());
  const messages: ParsedMessage[] = [];
  const colonRe = /^(.{1,20})[：:]\s*(.+)$/;

  for (const line of lines) {
    const match = line.match(colonRe);
    if (match) {
      messages.push({
        sender: match[1].trim(),
        content: match[2].trim(),
      });
    } else {
      messages.push({ sender: "unknown", content: line.trim() });
    }
  }

  const participants = [...new Set(messages.map((m) => m.sender).filter((s) => s !== "unknown"))];
  return { messages, participants, messageCount: messages.length, format: "plain" };
}

export function parseChat(text: string): ParseResult {
  if (!text || !text.trim()) {
    return { messages: [], participants: [], messageCount: 0, format: "empty" };
  }

  const whatsappResult = parseWhatsApp(text);
  if (whatsappResult.messageCount > 2) return whatsappResult;

  const wechatResult = parseWechatTxt(text);
  if (wechatResult.messageCount > 2) return wechatResult;

  return parsePlainChat(text);
}

export function formatForLLM(result: ParseResult, maxChars = 120000): string {
  let output = "";
  let truncated = false;
  for (const msg of result.messages) {
    const line = msg.timestamp
      ? `[${msg.timestamp}] ${msg.sender}: ${msg.content}`
      : `${msg.sender}: ${msg.content}`;
    if (output.length + line.length > maxChars) {
      truncated = true;
      break;
    }
    output += line + "\n";
  }
  if (truncated) {
    output += `\n... (聊天记录共 ${result.messageCount} 条，已截取前 ${Math.round(output.length / 1000)}K 字用于蒸馏)`;
  }
  return output;
}
