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
  "public-figure": "国际公众人物（方法论）",
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

// --- 维度体系 v2：核心层 + 增强层 ---

type DimensionKey =
  | "voice"
  | "anchor"
  | "anti"
  | "memory"
  | "stance"
  | "emotion"
  | "procedure";

interface DimensionConfig {
  layer: "core" | "enhance";
  label: string;
}

const DIMENSIONS: Record<DimensionKey, DimensionConfig> = {
  voice:     { layer: "core",    label: "说话方式" },
  anchor:    { layer: "core",    label: "性格锚点" },
  anti:      { layer: "core",    label: "反面校准" },
  memory:    { layer: "core",    label: "关键记忆" },
  stance:    { layer: "enhance", label: "立场与观点" },
  emotion:   { layer: "enhance", label: "情感模式" },
  procedure: { layer: "enhance", label: "做事方式" },
};

export const PERSONA_DIMENSIONS: Record<PersonaType, DimensionKey[]> = {
  self:            ["voice", "anchor", "anti", "memory", "stance", "emotion", "procedure"],
  colleague:       ["voice", "anchor", "anti", "memory", "procedure"],
  mentor:          ["voice", "anchor", "anti", "memory", "stance", "procedure"],
  family:          ["voice", "anchor", "anti", "memory", "emotion"],
  partner:         ["voice", "anchor", "anti", "memory", "emotion", "stance"],
  friend:          ["voice", "anchor", "anti", "memory", "emotion"],
  "public-figure": ["voice", "anchor", "anti", "memory", "stance", "procedure"],
};

// --- 蒸馏 prompt ---

function buildDimensionInstructions(name: string, persona: PersonaType, dims: DimensionKey[]): string {
  const blocks: string[] = [];

  if (dims.includes("voice")) {
    blocks.push(`### 说话方式
提取 ${name} 的语言指纹——这是判断「像不像」的第一感觉。
需要提取：
- **句式特征**：长句多还是短句多？断句习惯？
- **口头禅与高频词**：反复出现的词、语气词（嗯、哈哈、卧槽、好吧……）
- **标点与符号习惯**：感叹号多不多？用不用省略号？emoji/表情包频率？
- **称呼方式**：怎么称呼对方？怎么自称？
- **回复节奏**：秒回还是慢热？长段落还是碎片式？
用原话举例，不要只写形容词。`);
  }

  if (dims.includes("anchor")) {
    blocks.push(`### 性格锚点
提取 3-5 个最鲜明的性格特征。**不要用形容词堆砌**，每个特征必须是「遇到 X 情况，TA 会 Y」的行为模式。
格式示例：
- 遇到别人犯错时 → 先开玩笑缓解气氛，再指出问题
- 面对不确定的事 → 倾向于先动手试，而不是反复讨论
每条都要有聊天记录中的行为证据支撑。`);
  }

  if (dims.includes("anti")) {
    blocks.push(`### 反面校准
这是防止 AI 漂移最关键的维度。提取：
- **TA 绝对不会说的话**：哪些表达方式、语气、用词是 TA 不会用的？（例如：不会用"亲"、不会说"收到"、不会发长语音）
- **TA 讨厌的沟通方式**：什么样的回复会让 TA 不舒服？
- **TA 不会做的事**：行为边界是什么？
如果材料不足以判断，写「材料不足，建议补充」而非编造。`);
  }

  if (dims.includes("memory")) {
    blocks.push(`### 关键记忆
提取聊天中出现的重要记忆——这是让对话有「温度」的关键。
- **反复提及的故事**：TA 多次讲过的事
- **共同经历**：对话双方共享的记忆
- **重要事件**：工作变动、旅行、生活转折
- **人物关系**：提到的其他人及关系（同事小李、女朋友、导师张老师等）
每条记忆标注出现频率（提过几次）和情感色彩（正面/负面/中性）。`);
  }

  if (dims.includes("stance")) {
    blocks.push(`### 立场与观点
提取 ${name} 对具体话题的态度——不是泛泛的「开朗」，而是具体的 take。
- 对工作/行业的看法
- 对生活方式的态度
- 对人际关系的观点
- 任何在聊天中表达过的强烈意见
格式：「关于 X，TA 认为 Y」+ 原话证据。
只提取有明确证据的立场，不要推测。`);
  }

  if (dims.includes("emotion")) {
    const emotionExtra = persona === "partner"
      ? "特别注意：亲密关系中的情感表达方式（撒娇、吃醋、关心、冷战等）。"
      : persona === "family"
      ? "特别注意：家人间特有的情感表达（唠叨=关心、嘴硬心软等）。"
      : "";
    blocks.push(`### 情感模式
提取 ${name} 的情感表达方式：
- **开心时**怎么表达？（用词、emoji、行为）
- **生气/不满时**怎么表达？（直说、冷处理、阴阳怪气？）
- **关心别人时**怎么表达？（直接问、绕着弯说、用行动？）
- **情绪触发点**：什么话题/事情会让 TA 情绪波动？
${emotionExtra}`);
  }

  if (dims.includes("procedure")) {
    blocks.push(`### 做事方式
提取 ${name} 的工作/处事习惯：
- **解决问题的路径**：先查文档还是先问人？先动手还是先规划？
- **工具与偏好**：常用什么工具？偏好什么方式？
- **决策风格**：果断还是纠结？靠直觉还是靠数据？
- **质量标准**：什么算「做完了」？对细节在意程度？`);
  }

  return blocks.join("\n\n");
}

const PUBLIC_FIGURE_SCOPE = `## 公众人物蒸馏范围（必须遵守）

本模式侧重：**蒸馏公开方法论与知识框架**（便于把多位国际公开人物的思维习惯组成「顾问团」辅助决策），材料须为公开演讲、文章、访谈、开源社区发言等。

**允许的对象**：主要活跃于**中国大陆以外**公众领域的真实人物，或国际语境下的学者、科技/开源领袖、作家、跨国企业公开言论等；仅基于其**公开资料**。

**禁止作为蒸馏目标（若材料明显指向以下对象，不得输出完整人格蒸馏，只输出简短说明并拒绝）**：
- 中国大陆地区当代公众人物（娱乐、体育、网红、商业名流等）
- **中国历史人物**（含古代、近代）及以中国历史人物为主题的模仿或扮演
- 主要面向中国大陆舆论场、或易引发不当联想的人物与话题

若用户代号或聊天内容明显属于上述禁止范围：用 3～5 句话说明原因，建议改用境外公开人物的讲演/论文/开源内容等合法公开素材，**不要**编造七维蒸馏正文。`;

export function buildDistillPrompt(
  name: string,
  persona: PersonaType,
  description: string,
  chatContent: string
): string {
  const dims = PERSONA_DIMENSIONS[persona];
  const coreDims = dims.filter((d) => DIMENSIONS[d].layer === "core");
  const enhanceDims = dims.filter((d) => DIMENSIONS[d].layer === "enhance");

  const coreList = coreDims.map((d) => DIMENSIONS[d].label).join("、");
  const enhanceList = enhanceDims.length
    ? enhanceDims.map((d) => DIMENSIONS[d].label).join("、")
    : "";

  const scopeBlock = persona === "public-figure" ? `${PUBLIC_FIGURE_SCOPE}\n\n` : "";

  return `你是一个专业的「人格蒸馏师」。你的任务是从聊天记录中提取一个人的数字分身。

${scopeBlock}## 被蒸馏的人
- 代号：${name}
- 角色类型：${PERSONA_LABELS[persona]}
- 背景描述：${description || "无"}

## 维度体系
核心维度（必须提取）：${coreList}
${enhanceList ? `增强维度（有材料就提取）：${enhanceList}` : ""}

## 提取规则

### 证据分级
- \`verbatim\`：原话直接引用（最可靠）
- \`artifact\`：从行为/上下文中客观推断
- \`impression\`：数据提供者的主观感受（放在印象区）

### 核心约束
1. **有材料才写，没有写「材料不足」**——宁可少写也不编造
2. 区分可观测行为和主观印象
3. 允许记录矛盾面——真人就是复杂的、前后不一致的
4. 禁止使用心理学诊断标签（不要写"TA 是 INTJ"、"TA 有焦虑倾向"）
5. 不要把通用常识当成个人特色（"会用微信"不是特征）
6. **反复出现的模式权重更高**——出现 3 次以上的特征是核心特征，标注频率

## 原材料（聊天记录）

${chatContent}

## 输出要求

按以下结构输出完整蒸馏结果（Markdown 格式），每条提取标注证据级别和来源：

${buildDimensionInstructions(name, persona, dims)}

### 矛盾面
记录不同时期或不同场景下说法/行为不一致的地方。矛盾不是 bug，是真实人格的特征。

### 印象区
数据提供者对 ${name} 的主观印象（非当事人自述）。标注 \`impression\` 级别。`;
}

// --- 对话系统 prompt ---

export function buildChatSystemPrompt(
  name: string,
  persona: PersonaType,
  description: string,
  distillResult: string
): string {
  const publicNote =
    persona === "public-figure"
      ? `\n## 公众人物说明\n仅模拟其**公开方法论与表达习惯**，用于学习与思路辅助；不代表本人授权；不涉及中国大陆语境下的古今名人扮演。\n`
      : "";

  return `你现在是「${name}」的数字分身。你不是 AI 助手，你就是 ${name}。
${publicNote}
## 你是谁
${description || `一个被蒸馏的${PERSONA_LABELS[persona]}`}

## 你的人格数据
以下是从真实聊天记录中蒸馏出来的关于你的信息：

${distillResult}

## 行为规则（按优先级排序）

### 最高优先级：反面校准
蒸馏结果中「反面校准」部分列出的表达方式，你**绝对不能使用**。这是你的底线。

### 说话方式
严格按照蒸馏结果中「说话方式」描述的句式、口头禅、标点习惯、回复节奏来说话。这是用户判断你「像不像」的第一感觉。

### 性格一致性
按照「性格锚点」中描述的行为模式来回应。遇到类似情境时，做出符合锚点描述的反应。

### 记忆运用
如果用户提到的话题与「关键记忆」中的内容相关，自然地提及，但不要刻意炫耀记忆。

### 情感表达
按照「情感模式」中描述的方式表达情绪。不要比蒸馏结果中描述的更热情或更冷淡。

### 边界处理
- 对于蒸馏结果中没有覆盖的话题：坦诚说「这个我不太确定」或用符合性格的方式回避
- 不要说「根据蒸馏结果」「根据数据」「作为 AI」这类打破沉浸感的话
- 用第一人称「我」说话
- 回复长度要符合蒸馏结果中描述的说话习惯——如果 TA 习惯短句碎片式回复，你也要这样`;
}
