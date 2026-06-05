# 用 Agent 开发一个桌面应用：思路、步骤与踩坑记录

> 这不是一个"AI 帮我写代码"的故事，而是一个"我如何指挥 AI 写代码"的记录。

---

## 背景

我要做一个大学英语翻译练习的桌面应用。技术栈：Next.js 16 + React 19 + Tauri v2。目标平台：Android + Windows。

我选择用 AI Agent（Claude Code）作为主要开发工具。这篇文章记录的是**我作为指挥者的思路**，而不是 Agent 的内部工作细节。

---

## 第一阶段：项目规划（人 → Agent → 人确认）

### 做了什么

我写了一份粗略的需求文档（`briefInstruction.md`），然后让 AI 基于它生成完整的开发规划（`FINAL_PLAN.md`）。

### 实际流程

```
我：给出粗略需求（briefInstruction.md）
    ↓
AI：生成完整规划（FINAL_PLAN.md v1.0）
    ↓
我：审阅，提出修改意见
    ↓
AI：迭代修改（v2.0 → v2.3 → v3.0）
    ↓
我：确认最终版本
```

### 关键心得

1. **粗略需求由人写，详细规划可交给 AI**。我不需要自己写 800 行的规划文档，但我需要清楚地表达"我要什么"。`briefInstruction.md` 就是我的原始输入。

2. **规划文档是 Agent 的指令集**。FINAL_PLAN 越清晰，后续 Agent 写代码越可控。模糊的输入 = 模糊的输出。

3. **人必须审阅最终规划**。AI 生成的规划可能有技术选型错误（比如它默认用了 Next.js 15 而非 16）、遗漏关键配置（比如 `output: 'export'`）、或不符合我的实际偏好。审阅这一步不能省。

4. **迭代是正常的**。FINAL_PLAN 从 v1.0 到 v3.0 经历了多次重构。这不叫返工，这叫需求澄清。

---

## 第二阶段：环境初始化（人做）

### 做了什么

Step 1（项目初始化）是我**全权手动完成**的，没有让 Agent 介入。

### 为什么手动做

1. **掌控感**。项目骨架是整个应用的地基。我需要亲手确认每个依赖版本、每个配置项。
2. **理解成本**。手动初始化一次，我就知道 `next.config.ts` 里该有什么、`tauri.conf.json` 的结构是什么。后续让 Agent 改这些文件时，我能判断它的改动是否正确。
3. **避免黑箱**。如果 Agent 初始化了项目，我不确定它用了哪些默认配置，后续排查问题会很被动。

### 手动做了什么

- `pnpm create next-app` 初始化（手动选择 TypeScript、Tailwind CSS、App Router）
- `pnpm tauri init` 初始化 Tauri
- 配置 `next.config.ts`（添加 `output: 'export'`）
- 下载字体文件到 `public/fonts/`
- 整理 `.gitignore`
- 配置 `AGENTS.md`（告诉 Agent 关于 Next.js 版本的注意事项）

### 关键心得

**不是所有任务都适合交给 Agent。** 项目初始化这种"地基型"工作，手动做一次换来的是对项目结构的深度理解。这个理解在后续所有 Agent 协作中都会用到。

---

## 第三阶段：Agent 协作开发（持续）

从 Step 2 开始，我将逐步让 Agent 介入开发。每一步的流程：

```
人：给出当前 Step 的指令
    ↓
Agent：执行（写代码、改配置）
    ↓
人：验收（对照 FINAL_PLAN 检查）
    ↓
人：仓库审查（git status + git diff）
    ↓
人：git commit + 更新 DEVLOG
    ↓
（循环：下一个 Step）
```

---

### Step 2：设计系统与字体 ✅

**执行者**：Agent
**日期**：2026-06-05

#### 方案评估与决策

在开始实现前，Agent 对方案进行了全面评估：

1. **字体配置**：
   - 问题：Source Han Serif 的 `.ttc` 格式兼容性未验证，文件体积大（20MB+）
   - 决策：暂时跳过 Source Han Serif，用系统宋体替代
   - 理由：先完成核心功能，字体可后续优化

2. **CSS 变量管理**：
   - 问题：`FINAL_PLAN.md` 定义的变量需与 Tailwind `@theme` 对齐
   - 决策：使用 Tailwind `@theme inline` 集中管理
   - 理由：直接生成工具类（`bg-primary`、`text-ink`），与 Tailwind 无缝集成

3. **主题闪烁问题**：
   - 问题：用户首次访问时可能看到主题闪烁（FOUC）
   - 决策：添加防闪烁内联脚本
   - 理由：提升用户体验

4. **组件方案**：
   - 选项：shadcn/ui vs 自定义 + CVA
   - 决策：自定义 + CVA
   - 理由：Tailwind CSS 4 兼容性更好，完全符合 Claude 设计风格

#### 实现内容

| 子任务 | 文件 | 说明 |
|--------|------|------|
| 字体配置 | `src/styles/fonts.ts` | EB Garamond + Sarasa Gothic |
| CSS 变量 | `src/app/globals.css` | 色彩/间距/圆角 + 深色主题 |
| 主题 Hook | `src/hooks/useTheme.ts` | localStorage 持久化 + 系统监听 |
| 防闪烁 | `src/components/ThemeScript.tsx` | 内联脚本 |
| Button | `src/components/ui/Button.tsx` | 5 种变体 + 4 种尺寸 |
| Card | `src/components/ui/Card.tsx` | 4 种变体 + 子组件 |
| Input | `src/components/ui/Input.tsx` | Input + Textarea |
| Badge | `src/components/ui/Badge.tsx` | 6 种变体 |
| Tabs | `src/components/ui/Tabs.tsx` | 3 种变体 + Context |
| 预览页面 | `src/app/page.tsx` | 设计系统展示 |

#### 关键决策记录

1. **字体变量命名**：`--font-eb-garamond` 和 `--font-sarasa-gothic`
2. **CSS 变量命名**：遵循 FINAL_PLAN.md 的设计规范
3. **组件变体管理**：使用 CVA（class-variance-authority）
4. **主题存储键**：`ueh_theme`（与 FINAL_PLAN.md 的 localStorage 键名一致）

#### 遗留问题

- Source Han Serif（`.ttc` 格式）暂未配置，需后续处理
- 响应式断点配置未在 CSS 变量中定义（使用 Tailwind 默认断点）

---

## Agent 协作原则（持续更新）

### 原则 1：先规划，后执行

不要直接说"帮我做一个翻译练习 App"。先有规划文档，再让 Agent 按步骤执行。

```
❌ "帮我做一个翻译练习 App"
✅ "按照 FINAL_PLAN.md 的 Step 2，实现设计系统和字体配置"
```

### 原则 2：每步验收，不要一口气跑完

10 个 Step，每完成一个就验收。验收标准在 FINAL_PLAN 里已经写好。

为什么要验收？
- Agent 可能误解需求
- Agent 可能遗漏关键配置
- 早期发现问题，修复成本低

### 原则 3：让 Agent 读文档，不要假设它知道

这个项目用的是 Next.js 16，Agent 的训练数据可能还停留在 15。所以我专门写了 `AGENTS.md`，告诉 Agent：

> 在写任何代码之前，先读 `node_modules/next/dist/docs/` 里的指南。

**永远不要假设 Agent 了解你使用的具体版本的 API。**

### 原则 4：类型定义先行

在写任何业务代码之前，先把 TypeScript 类型定义好。Agent 写代码时有明确的类型约束，减少错误。

### 原则 5：Git 是安全网

每完成一个有意义的改动就提交。如果 Agent 的改动有问题，`git revert` 比手动修复快得多。

### 原则 6：仓库审查是必要步骤

每次提交前，必须 `git status` + `git diff` 审查变更。这一步不能让 Agent 代劳——你是在检查 Agent 的工作，不是让 Agent 检查自己。

### 原则 7：DEVLOG 与 Git 同频更新

每次有意义的提交，都同步更新 DEVLOG。内容来源就是我们对话中的上下文——我的决策、Agent 的产出、踩过的坑、总结的经验。不更新 = 遗忘。

### 原则 8：Step 内也要细分

一个 Step 可能包含 5-6 个子任务。不要让 Agent 一口气做完再验收，而是拆成子任务逐步推进。比如 Step 2（设计系统与字体）可以拆为：

```
2a. 配置字体（next/font/local）
2b. 实现 CSS 变量（色彩/间距/圆角）
2c. 实现主题切换 Hook + 防闪烁
2d. 实现 Button 组件
2e. 实现 Card 组件
2f. 实现 Input 组件
2g. 实现 Badge + Tabs 组件
2h. 创建设计预览页面
```

每完成一个子任务就验收一次。粒度越细，Agent 出错的影响范围越小，回滚成本越低。

**实际执行结果（Step 2）**：8 个子任务，每个任务完成后验证构建，确保无错误后再继续。最终构建成功，所有组件可正常使用。

---

## 注意事项清单

| # | 注意事项 | 为什么 |
|---|---------|--------|
| 1 | 粗略需求由人写，详细规划可交 AI | 人做决策，AI 做细化 |
| 2 | 人必须审阅 AI 生成的规划 | 可能有技术错误或遗漏 |
| 3 | 项目初始化手动做 | 换来对项目结构的深度理解 |
| 4 | 每步验收后再推进 | 早期发现错误，修复成本低 |
| 5 | 让 Agent 先读文档再写代码 | 避免 API 版本不匹配 |
| 6 | 类型定义先行 | 约束 Agent 的输出质量 |
| 7 | 频繁提交 | Git 是安全网 |
| 8 | 提交前仓库审查 | 检查 Agent 的工作，不是让 Agent 检查自己 |
| 9 | DEVLOG 与 Git 同频更新 | 不更新 = 遗忘 |
| 10 | Step 内细分子任务逐步完成 | 粒度越细，出错影响越小 |
| 11 | 保留 `CLAUDE.md` / `AGENTS.md` | 项目级指令，跨会话生效 |

---

## 当前进度

| Step | 状态 | 说明 |
|------|------|------|
| Step 1：项目初始化 | ✅ 手动完成 | Next.js 16 + Tailwind CSS 4 + Tauri v2 |
| Step 2：设计系统与字体 | ✅ Agent 完成 | Claude 设计系统 + 字体 + 5 个基础组件 |
| Step 3：布局与导航 | ⏳ 下一步 | TopNav + AppLayout + 路由 |
| Step 4-10 | 待开始 | — |

---

*本文档持续更新，与 Git 提交同频。内容来源：开发对话上下文。*
