# immortal-web

永生.skill 的 Web 版本 — 让不会编程的用户也能蒸馏数字分身。

## 功能

- 上传聊天记录（粘贴文本 / 拖拽 txt 文件）
- 选择角色类型（自己/同事/导师/亲人/前任/朋友/国际公众人物·方法论）
- AI 四维蒸馏（互动风格 + 性格价值观 + 记忆经历 + 做事方式）
- 在线与数字分身对话
- 分享对话链接

## 技术栈

- Next.js 16 (App Router)
- Tailwind CSS 4
- 火山引擎 Ark API (豆包 doubao-seed)
- TypeScript

## 本地开发

```bash
npm install
cp .env.example .env.local
# 编辑 .env.local 填入火山引擎 Ark API Key
npm run dev
```

打开 http://localhost:3000

## 环境变量

| 变量 | 说明 |
|------|------|
| `ARK_API_KEY` | 火山引擎 Ark API 密钥 |

## 部署

支持部署到：
- 腾讯云 EdgeOne Pages（国内推荐）
- Cloudflare Pages
- Vercel

## 关联项目

- [immortal-skill](https://github.com/agenmod/immortal-skill) — 开源蒸馏框架（CLI + OpenClaw Skill）
