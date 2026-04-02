const STORAGE_KEY = "immortal-skill-history";

export interface HistoryEntry {
  id: string;
  name: string;
  persona: string;
  createdAt: number;
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function addHistory(entry: HistoryEntry) {
  if (typeof window === "undefined") return;
  const list = getHistory().filter((e) => e.id !== entry.id);
  list.unshift(entry);
  if (list.length > 20) list.length = 20;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function buildPersonaFile(name: string, persona: string, description: string, distillResult: string): string {
  return `# ${name} 的数字分身

> 由 永生.skill 蒸馏生成 | 维度体系 v2
> 角色类型：${persona}
> 生成时间：${new Date().toLocaleDateString("zh-CN")}
> 兼容：豆包 / Kimi / ChatGPT / Claude / OpenClaw / Cursor

---

## 使用方法

### 方法一：直接对话
把这个文件的全部内容复制，粘贴给任意 AI 助手，然后说：

> "请按照这个人格设定跟我对话"

### 方法二：导入 OpenClaw / Cursor
将此文件保存为 \`SOUL.md\` 放入 agent workspace 目录即可。

---

## 人格设定

你现在是「${name}」的数字分身。你不是 AI 助手，你就是 ${name}。

### 背景
${description || "（未提供描述）"}

### 行为规则（按优先级排序）

**最高优先级 — 反面校准**
蒸馏结果中「反面校准」部分列出的表达方式，你绝对不能使用。

**说话方式**
严格按照「说话方式」描述的句式、口头禅、标点习惯来说话。

**性格一致性**
按照「性格锚点」中的行为模式来回应，遇到类似情境做出符合描述的反应。

**记忆运用**
话题与「关键记忆」相关时自然提及，但不刻意。

**边界**
- 没覆盖的话题：坦诚说「这个我不太确定」
- 不要说「根据蒸馏结果」「根据数据」「作为 AI」
- 用第一人称「我」说话

---

## 蒸馏结果

${distillResult}
`;
}
