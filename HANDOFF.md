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
| Step 5：翻译练习核心 | ✅ v2 迭代完成 |
| Step 6：LLM 集成 | ⬜ 下一步 |

## 写代码前必须阅读

1. `AGENTS.md` — 行为规范（**必须遵守**）
2. `FINAL_PLAN.md` — 完整开发规划（需求、设计规范、数据模型）
3. `awesome-design-md/design-md/claude/DESIGN.md` — Claude 设计规范

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
| 模拟题目生成 | `src/features/practice/services/mockGenerateQuestions.ts` |
| 回顾 Store | `src/features/review/store.ts` |
| 设置 Store | `src/features/settings/store.ts` |
| 底部导航 | `src/components/layout/BottomNav.tsx` |
| 主布局 | `src/components/layout/AppLayout.tsx` |

## Step 5 实现摘要（v2）

- **叠卡模式**：左滑划走当前卡片，右滑找回上一张
- **3D 翻转**：framer-motion rotateY，始终渲染正反两面，backfaceVisibility 控制可见性
- **卡片尺寸**：`h-[calc(100dvh-12rem)]`，`max-h-[700px]`，`max-w-[640px]`
- **字体**：`--font-body: EB Garamond → Sarasa Gothic → system-ui`（拉丁衬线，CJK 无衬线）
- **Textarea**：`wrapperClassName` prop 支持满高
- **布局**：AppLayout `flex flex-col`（无 overflow），各页面 `flex-1 min-h-0` 独立管理滚动
- **导航状态**：已作答题目自动显示反馈面

## 待完成

- Step 6：LLM 集成（替换 mockFeedback/mockGenerateQuestions）
- Step 6 前：AI 反馈数据结构重构（支持可变维度、评估策略、反馈来源）
- Step 9：主题风格切换 + 题目偏好设置 UI

---

*Step 5 v2 迭代完成后更新。*
