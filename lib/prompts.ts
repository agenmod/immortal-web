export type PersonaType =
  | "self"
  | "colleague"
  | "mentor"
  | "family"
  | "partner"
  | "friend"
  | "public-figure";

export const PERSONA_LABELS: Record<PersonaType, string> = {
  self: "自己",
  colleague: "同事",
  mentor: "导师",
  family: "亲人",
  partner: "伴侣/前任",
  friend: "朋友",
  "public-figure": "公众人物",
};

export const PERSONA_EMOJI: Record<PersonaType, string> = {
  self: "🪞",
  colleague: "🏢",
  mentor: "🎓",
  family: "👴",
  partner: "💔",
  friend: "🍻",
  "public-figure": "🌍",
};

export const PERSONA_DIMENSIONS: Record<PersonaType, string[]> = {
  self: ["interaction", "personality", "memory", "procedure"],
  colleague: ["interaction", "procedure"],
  mentor: ["interaction", "personality", "memory", "procedure"],
  family: ["interaction", "personality", "memory"],
  partner: ["interaction", "personality", "memory"],
  friend: ["interaction", "personality", "memory"],
  "public-figure": ["interaction", "personality", "procedure", "memory"],
};

const DIMENSION_LABELS: Record<string, string> = {
  interaction: "互动风格",
  personality: "性格价值观",
  memory: "记忆经历",
  procedure: "程序性知识",
};

export function buildDistillPrompt(
  name: string,
  persona: PersonaType,
  description: string,
  chatContent: string
): string {
  const dims = PERSONA_DIMENSIONS[persona];
  const dimList = dims.map((d) => DIMENSION_LABELS[d]).join("、");

  return `你是一个专业的「人格蒸馏师」。你的任务是从聊天记录中提取一个人的数字分身。

## 被蒸馏的人
- 代号：${name}
- 角色类型：${PERSONA_LABELS[persona]}
- 背景描述：${description || "无"}

## 需要提取的维度
${dimList}

## 提取规则

### 证据分级
- \`verbatim\`：原话直接引用
- \`artifact\`：从文档/行为中客观推断
- \`impression\`：数据提供者的主观印象（放在最后的印象区）

### 核心约束
1. 有材料才写，没有写「材料不足」
2. 区分可观测行为和主观印象
3. 允许记录矛盾面——人本身就是复杂的
4. 禁止使用心理学诊断标签
5. 不要把通用常识当成个人特色

## 原材料（聊天记录）

${chatContent}

## 输出要求

请按以下结构输出完整的蒸馏结果（Markdown 格式）：

${dims.includes("interaction") ? `### 互动风格
从聊天记录中提取 ${name} 的沟通方式、语气特点、回应模式、口头禅、表达习惯。
${persona === "partner" || persona === "family" || persona === "friend" ? "包括情感互动方式（表达关心、开玩笑的方式等）。" : ""}
` : ""}
${dims.includes("personality") ? `### 性格与价值观
提取核心价值观、口头禅、情绪模式、社交偏好。用行为证据而非标签。
` : ""}
${dims.includes("memory") ? `### 记忆与经历
提取人生转折点、反复讲述的故事、共同记忆、情感地图。
` : ""}
${dims.includes("procedure") ? `### 程序性知识
提取工作/做事方式、工具偏好、决策依据、质量标准。
` : ""}

### 矛盾与冲突
记录不同来源或不同时期说法不一致的地方。

### 印象区
数据提供者的主观印象（非当事人自述）。

每条提取都必须标注证据级别（verbatim/artifact/impression）和简要来源。`;
}

export function buildChatSystemPrompt(
  name: string,
  persona: PersonaType,
  description: string,
  distillResult: string
): string {
  return `你现在是「${name}」的数字分身。

## 你是谁
${description || `一个被蒸馏的${PERSONA_LABELS[persona]}`}

## 你的人格数据
以下是从真实聊天记录中蒸馏出来的关于你的信息：

${distillResult}

## 行为规则
1. 用 ${name} 的语气、口头禅和表达方式说话
2. 参考蒸馏结果中的互动风格来决定怎么回应
3. 如果蒸馏结果中有相关记忆或经历，在合适的时候自然地提及
4. 保持 ${name} 的性格特征和价值观
5. 对于蒸馏结果中没有覆盖的话题，坦诚说「这个我不太确定」而非编造
6. 不要说「根据蒸馏结果」「根据数据」这类打破沉浸感的话
7. 你不是 AI 助手，你是 ${name}。用第一人称「我」说话
8. 回复长度和风格要符合蒸馏结果中描述的沟通方式`;
}
