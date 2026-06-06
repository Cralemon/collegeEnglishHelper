## 项目概况

- **产品**：大学英语翻译练习助手（卡片式翻译练习 + AI 反馈）
- **目标平台**：Android + Windows（响应式布局，移动端优先）
- **技术栈**：Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + Tauri v2
- **包管理**：pnpm

## 当前进度

| Step | 状态 |
|------|------|
| Step 1：项目初始化 | ✅ |
| Step 2：设计系统与字体 | ✅ |
| Step 3：布局与导航 | ✅ |
| Step 4：状态管理与数据层 | ✅ |
| Step 5：翻译练习核心 | ✅ |
| Step 6：LLM 集成 | ⬜ 下一步 |

## 写代码前必须阅读

1. `AGENTS.md` — 行为规范（**必须遵守**）
2. `FINAL_PLAN.md` — 完整开发规划（需求、设计规范、数据模型）
3. `awesome-design-md/design-md/claude/DESIGN.md` — Claude 设计规范

## 已知问题

- `src-tauri/gen/` 是 Tauri 自动生成目录，未在 `.gitignore` 中，提交时忽略
- `BuildTask.kt` 中 node 路径硬编码，换机器或换 node 版本需手动更新
- `public/fonts/` 在 `.gitignore` 中，首次 clone 需手动复制字体文件（WOFF2 子集，~8MB）

## 关键文件索引

| 用途 | 路径 |
|------|------|
| 根布局 | `src/app/layout.tsx` |
| 设计系统变量 | `src/app/globals.css` |
| 字体配置 | `src/styles/fonts.ts` |
| 类型定义 | `src/types/index.ts` |
| localStorage 封装 | `src/services/storage.ts` |
| 练习 Store | `src/features/practice/store.ts` |
| 练习组件 | `src/features/practice/components/` |
| 模拟反馈 | `src/features/practice/services/mockFeedback.ts` |
| 回顾 Store | `src/features/review/store.ts` |
| 设置 Store | `src/features/settings/store.ts` |
| 底部导航 | `src/components/layout/BottomNav.tsx` |
| 主布局 | `src/components/layout/AppLayout.tsx` |

## Step 5 实现摘要

- 安装 `framer-motion` 依赖
- `FlashCard`：3D 翻转容器（perspective + rotateY），支持左右滑动切换题目
- `CardFront`：正面 — 题目展示 + Textarea 输入 + 提交按钮 + 模拟 AI 评估
- `CardBack`：背面 — ScoreDisplay 总分 + FeedbackPanel 三维反馈 + 下一题按钮
- `ScoreDisplay`：大字分数 + 颜色编码（绿/黄/红）+ 等级标签
- `FeedbackPanel`：语法/词汇/句型三维度可折叠面板（`<details>` 原生折叠）
- `EmptyState`：无题目时的引导页面
- `mockFeedback.ts`：模拟 AI 反馈数据生成（Step 6 接入真实 LLM 后废弃）

---

*Step 5 完成后更新。*
