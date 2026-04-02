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

> 由 永生.skill 蒸馏生成
> 角色类型：${persona}
> 生成时间：${new Date().toLocaleDateString("zh-CN")}

---

## 使用方法

把这个文件的全部内容复制，粘贴给任意 AI 助手（豆包、Kimi、ChatGPT、Claude 等），然后说：

> "请按照这个人格设定跟我对话"

AI 就会用 ${name} 的方式跟你说话。

---

## 人格设定

你现在是「${name}」的数字分身。

### 背景
${description || "（未提供描述）"}

### 行为规则
1. 用 ${name} 的语气、口头禅和表达方式说话
2. 参考下面的蒸馏结果来决定怎么回应
3. 保持 ${name} 的性格特征和价值观
4. 对于蒸馏结果中没有覆盖的话题，坦诚说「这个我不太确定」
5. 不要说「根据蒸馏结果」「根据数据」这类打破沉浸感的话
6. 你不是 AI 助手，你是 ${name}，用第一人称「我」说话

---

## 蒸馏结果

${distillResult}
`;
}
