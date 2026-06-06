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
| Phase 6：回顾页 | ⬜ **下一步** | 统计 + 改进点列表 |
| Phase 7：设置页 | ⬜ | 用户信息 + 应用配置 |
| Phase 8：LLM 集成 | ⬜ | 替换 mock 数据 |
| Phase 9：学习闭环 | ⬜ | 用户画像 + 智能出题 |
| Phase 10：Polish + Tauri | ⬜ | 打包 + 优化 |

## 写代码前必须阅读

1. `AGENTS.md` — 行为规范（**必须遵守**）
2. `FINAL_PLAN.md` — 完整开发规划（重点看 §5 数据结构 + §6 实施步骤）
3. `awesome-design-md/design-md/claude/DESIGN.md` — Claude 设计规范（**必须遵守**）

## 关键文件索引

| 用途 | 路径 |
|------|------|
| 全局类型定义 | `src/types/index.ts` |
| 练习页 Store | `src/features/practice/store.ts` |
| 回顾页 Store | `src/features/review/store.ts` |
| 设置 Store | `src/features/settings/store.ts` |
| 模拟反馈生成 | `src/features/practice/services/mockFeedback.ts` |
| 反馈面板组件 | `src/features/practice/components/FeedbackPanel.tsx` |
| localStorage 封装 | `src/services/storage.ts` |
| 底部导航 | `src/components/layout/BottomNav.tsx` |
| 基础 UI 组件 | `src/components/ui/` |

## Pre Phase 6 实现摘要

### 关键变更

1. **旧数据兼容**（`practiceStore`）：新增 `version: 2 + migrate`，旧 `answerRecords`（缺少 `issues`/`translationStrategy`/`overallSuggestion`）在加载时自动补全，修复运行时 TypeError

2. **CardFront 接口重构**：改为纯 props 组件（`question`/`direction`/`draft`/`isEvaluating`/`onDraftChange`/`onSubmit`），移除对 store 和 `generateMockFeedback` 的直接依赖

3. **CardBack 接口重构**：改为纯 props 组件（`record`/`isLastQuestion`/`onNext`），移除对 store 的直接依赖

4. **page.tsx 接管业务逻辑**：`generateMockFeedback` 调用、`submitAnswer`、`currentRecord` 查找全部移至 `page.tsx`，向 CardFront/CardBack 传 props

---

## Phase 5 实现摘要

### 关键变更

1. **类型定义**（`src/types/index.ts`）：
   - 新增：`IssueSeverity`（3 级）、`IssueCategory`（16 类）、`Issue`、`KeyPointHandling`、`TranslationStrategy`、`WeakCategory`、`LearningData`
   - `DimensionFeedback` 新增 `issues: Issue[]`、`tips?: string[]`
   - `AIFeedback`：`summary` 替换为 `overallSuggestion: string[]`，新增 `translationStrategy`
   - `ImprovementPoint`：`content/relatedQuestionIds` 替换为 `category/recentIssueIds/mastery`

2. **模拟数据**（`mockFeedback.ts`）：每个维度生成 1-2 个带 category/severity 的 Issue，生成 TranslationStrategy（approach + keyPoints）

3. **反馈面板**（`FeedbackPanel.tsx`）：新增 `IssueItem`（severity Badge + suggestedFix + reason）、`StrategySection`（approach 颜色区分 + keyPoints 列表）

4. **回顾 Store**（`reviewStore.ts`）：`extractFromRecords` 改为按 `IssueCategory` 聚合；新增 `updateMastery` action；`categoryDescription` 中文映射

## 下一步：Phase 6 回顾页

### 背景

回顾页（`/review`）目前是空白占位。Phase 6 目标是展示练习统计数据和改进点列表，让用户看到自己的薄弱点。

### 需要修改/新建的文件

| 文件 | 当前状态 | 目标 |
|------|---------|------|
| `src/app/review/page.tsx` | 空白占位 | 回顾页完整 UI |
| `src/features/review/store.ts` | 已有 extractImprovements + computeStatistics | 确认接口满足 UI 需求（无需大改） |
| （新建）`src/features/review/components/` | 不存在 | StatsOverview、ImprovementList、ScoreTrendChart |

### 具体任务

**Step 6.1：统计概览卡片（StatsOverview）**
- 新建 `src/features/review/components/StatsOverview.tsx`
- 展示：总刷题数、平均分、最高分/最低分
- 展示三维度平均分（grammar/vocabulary/sentenceStructure），从 `AnswerRecord[]` 计算
- 数据来源：`computeStatistics(records)` + 直接遍历 `records`

**Step 6.2：改进点列表（ImprovementList）**
- 新建 `src/features/review/components/ImprovementList.tsx`
- 数据来源：`useReviewStore` 的 `improvementPoints`
- 展示：按 frequency 降序排列
- 每项显示：`categoryDescription`（中文名）、dimension 标签、frequency 次数、mastery 进度条（0-100）
- mastery 颜色：≥80 success、≥50 warning、<50 error
- 可展开查看：关联的 recentIssueIds（暂时只显示记录 id，Phase 9 再深化）

**Step 6.3：分数趋势图（ScoreTrendChart）**
- 新建 `src/features/review/components/ScoreTrendChart.tsx`
- 安装 recharts：`pnpm add recharts`
- 使用 Recharts 面积图（AreaChart）展示历史分数变化
- X 轴：answeredAt 时间戳（格式化为 MM/DD）
- Y 轴：score（0-100）
- 取最近 20 条记录展示

**Step 6.4：组装回顾页**
- 修改 `src/app/review/page.tsx`
- 从 `practiceStore` 读取 `answerRecords`
- 从 `reviewStore` 读取 `improvementPoints`，调用 `extractImprovements`
- 布局（从上到下）：
  1. 页面标题
  2. StatsOverview
  3. ScoreTrendChart（有足够数据时显示，<3 条时隐藏）
  4. ImprovementList

### 验收标准

1. `pnpm run build` 无类型错误
2. 有作答记录时，回顾页展示统计卡片 + 改进点列表
3. 无作答记录时，展示空状态提示（"去练习后再查看"）
4. 改进点按 frequency 降序排列，mastery 显示颜色正确

---

*Phase 5 已完成（2026-06-06）。Phase 6 完成后更新此文件。*
