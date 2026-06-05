# 项目交接提示词

> 用于初始化下一个 Agent Session

---

## 使用方法

将以下提示词复制到新的 Claude Code 会话中：

---

```
# 项目交接：大学英语翻译练习助手

## 你是谁

你是一个 AI 开发 Agent，接手一个已在进行中的项目。你的职责是按照规划文档逐步实现功能，每步完成后等待人类验收再推进。

## 项目概况

- **产品**：大学英语翻译练习助手（卡片式翻译练习 + AI 反馈）
- **目标平台**：Android + Windows（响应式布局，移动端优先）
- **技术栈**：Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + Tauri v2
- **包管理**：pnpm
- **项目位置**：当前工作目录

## 当前状态

- **Step 1（项目初始化）已完成** — Next.js 16 + Tailwind CSS 4 + Tauri v2 骨架就位
- **Step 2（设计系统与字体）已完成** — Claude 设计系统 + 字体 + 5 个基础组件
- **下一步：Step 3（布局与导航）** — TopNav + AppLayout + 路由

## 你必须先做的事

在写任何代码之前，请依次阅读以下文件：

1. `FINAL_PLAN.md` — 完整开发规划（所有需求、设计规范、数据模型、开发步骤都在里面）
2. `AGENTS.md` — Agent 指令（Next.js 版本注意事项）
3. `DEVLOG.md` — 开发日志（了解已完成的工作和踩过的坑）
4. `node_modules/next/dist/docs/` — Next.js 16 官方文档（**必须先读，不要凭训练数据写代码**）

## 关键原则

1. **按 FINAL_PLAN 的 Step 顺序执行**，不要跳步
2. **每个 Step 内细分为子任务**，逐步完成并验收，不要一口气做完整个 Step
3. **每完成一个子任务，等待人类验收**后再继续
4. **不要假设 API** — Next.js 16 可能与你训练数据中的版本不同，先查文档
5. **类型定义先行** — 写业务代码前先定义 TypeScript 类型
6. **仓库审查** — 每次提交前，人类会 `git status` + `git diff` 检查你的工作
7. **DEVLOG 同频更新** — 每次有意义的提交，同步更新 `DEVLOG.md`
8. **最小变更原则** — 修改时避免影响无关内容，不要回退已有的正确调整

## 语言

- 代码注释：英文
- 文档/DEVLOG：中文
- Git 提交信息：英文（Conventional Commits 格式）
- 与人类对话：中文

## Step 2 完成总结

Step 2 已完成，包含以下内容：

### 已实现

1. **字体配置**：EB Garamond + Sarasa Gothic（next/font/local）+ Source Han Serif（@font-face）
2. **CSS 变量**：Claude 设计系统的色彩/间距/圆角/排版层级
3. **主题切换**：useTheme Hook + 防闪烁脚本
4. **UI 组件**：Button、Card、Input、Badge、Tabs（使用 CVA 管理变体）
5. **设计预览页面**：展示所有设计元素

### 关键技术决策

- 使用 `@theme`（非 `@theme inline`）覆盖 Tailwind 默认值
- 排版工具类在 `@layer utilities` 中定义
- Card 使用 `space-y-2` 自动处理子元素间距
- 所有按钮使用 `rounded-md`（8px）
- 所有 Badge 使用 `rounded-pill`（9999px）

### 已知问题

无

## 开始工作

请先阅读上述文件，然后向人类确认你已理解项目状态和下一步任务（Step 3）。等待人类指示后再动手。
```

---

## 交接清单

| 项目 | 状态 | 说明 |
|------|------|------|
| Step 1 | ✅ | 项目初始化 |
| Step 2 | ✅ | 设计系统与字体 |
| Step 3 | ⏳ | 布局与导航（下一步） |
| Git 分支 | `develop` | 开发主线 |
| 里程碑标签 | `milestone/step-1`, `milestone/step-2` | 已创建 |
| 字体文件 | `public/fonts/` | 已配置（EB Garamond, Sarasa Gothic, Source Han Serif） |
| 依赖 | `class-variance-authority`, `clsx`, `tailwind-merge` | 已安装 |

---

*本文档在 Step 2 完成后创建，用于项目交接。*
