## 项目概况

- **产品**：大学英语翻译练习助手（卡片式翻译练习 + AI 反馈）
- **目标平台**：Android + Windows（响应式布局，移动端优先）
- **技术栈**：Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + Tauri v2
- **包管理**：pnpm

## 当前进度

| Phase | 状态 | 说明 |
|-------|------|------|
| Phase 1：项目初始化 | ✅ | Next.js 16 + Tailwind CSS 4 + Radix UI |
| Phase 2：布局与导航 | ✅ | AppLayout + BottomNav + 路由 |
| Phase 3：状态管理与数据层 | ✅ | Zustand stores + localStorage |
| Phase 4：练习页核心 | ✅ | FlashCard 叠卡 + 3D 翻转 + 模拟反馈 |
| Phase 5：数据结构重构 | ✅ | 对齐新 AI 反馈结构（Issue/IssueCategory/TranslationStrategy） |
| Pre Phase 6：首页接口重构 | ✅ | 旧数据迁移 + CardFront/CardBack 改为纯 props 组件 |
| Phase 6：回顾页 | ✅ | StatsOverview + ScoreTrendChart + ImprovementList |
| Phase 7：设置页 | ✅ | 用户信息 + 应用配置 |
| Pre Phase 8：LLM 提示词设计 | ✅ | prompts.ts 已创建，两个 Prompt Builder 函数就绪 |
| **Phase 8：LLM 集成** | ✅ | llmClient.ts + page.tsx 集成，LLM 优先 + mock 降级 |
| **Phase 9：学习闭环** | ✅ | 用户画像 + 智能出题 + 掌握度追踪 |
| **Phase 10：Polish + Tauri** | ✅ | 全局禁止选中/缩放 + Tauri 窗口配置 + 安全区 + 性能清理 |
| 项目完成 | 🎉 | 全部 Phase 1-10 已完成 |

## 写代码前必须阅读

1. `AGENTS.md` — 行为规范（**必须遵守**）
2. `FINAL_PLAN.md` — 完整开发规划（重点看 §5 数据结构 + §6 实施步骤）
3. `../awesome-design-md/design-md/claude/DESIGN.md` — Claude 设计规范（**必须遵守**）

## 关键文件索引

| 用途 | 路径 |
|------|------|
| 全局类型定义 | `src/types/index.ts` |
| 练习页 Store | `src/features/practice/store.ts` |
| 回顾页 Store | `src/features/review/store.ts` |
| 设置 Store | `src/features/settings/store.ts` |
| 模拟反馈生成 | `src/features/practice/services/mockFeedback.ts` |
| LLM 提示词构建 | `src/features/practice/services/prompts.ts` |
| LLM API 客户端 | `src/features/practice/services/llmClient.ts` |
| 反馈面板组件 | `src/features/practice/components/FeedbackPanel.tsx` |
| localStorage 封装 | `src/services/storage.ts` |
| 底部导航 | `src/components/layout/BottomNav.tsx` |
| 基础 UI 组件 | `src/components/ui/` |
| Toast 通知 | `src/components/ui/Toast.tsx` |
| 滚动渐隐容器 | `src/components/layout/ScrollFade.tsx` |
| 题目生成 mock | `src/features/practice/services/mockGenerateQuestions.ts` |
| 首页（核心业务逻辑） | `src/app/page.tsx` |
| 应用布局 | `src/app/layout.tsx` |

---

## Phase 10 实现摘要

### 修改文件

| 文件 | 变更 |
|------|------|
| `src/app/layout.tsx` | 新增 `viewport` 导出（禁止缩放）；body 添加 `safe-area-top safe-area-bottom` |
| `src/app/globals.css` | 删除死 `@font-face SourceHanSerifSC`；移除废弃 `overflow: overlay`；新增 `user-select: none` + `touch-action: manipulation`；新增 `.safe-area-*` / `.safe-mt` / `.safe-mb` 安全区工具类 |
| `src-tauri/tauri.conf.json` | Windows 新增 `minWidth: 360, minHeight: 480` |
| `src/components/layout/BottomNav.tsx` | nav 添加 `safe-mb`（Android 导航栏适配） |
| `src/features/practice/components/CardFront.tsx` | 原文 `<p>` 添加 `break-words` |
| `src/features/review/components/ImprovementList.tsx` | `min-w-[72px]` → `min-w-[60px] sm:min-w-[72px]`（窄屏防溢出） |

### 删除内容

| 内容 | 原因 |
|------|------|
| `public/fonts/SourceHanSerifSC-*-subset.woff2`（~5MB） | fonts.ts 从未引用，字体栈只用 EB Garamond + Sarasa Gothic |
| `globals.css` `@font-face SourceHanSerifSC` | 引用不存在的 .ttc 文件 |

### 关键决策

1. **CSS `env(safe-area-inset-*)`** + Tauri 已有的 `enableEdgeToEdge()` (=Android 边到边渲染)
2. **viewport 从 layout.tsx 导出**：Next.js App Router 规范方式
3. **recharts 体积暂不处理**：ScoreTrendChart 唯一使用，替换需较大重构

---

## 项目已全部完成 🎉

Phase 1-10 全部完成。
