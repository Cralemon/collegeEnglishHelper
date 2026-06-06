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
| Phase 5：数据结构重构 | ⬜ **下一步** | 对齐新设计的 AI 反馈结构 |
| Phase 6：回顾页 | ⬜ | 统计 + 改进点列表 |
| Phase 7：设置页 | ⬜ | 用户信息 + 应用配置 |
| Phase 8：LLM 集成 | ⬜ | 替换 mock 数据 |
| Phase 9：学习闭环 | ⬜ | 用户画像 + 智能出题 |
| Phase 10：Polish + Tauri | ⬜ | 打包 + 优化 |

## 写代码前必须阅读

1. `AGENTS.md` — 行为规范（**必须遵守**）
2. `FINAL_PLAN.md` — 完整开发规划（重点看 §5 数据结构 + §6 实施步骤）
3. `awesome-design-md/design-md/claude/DESIGN.md` — Claude 设计规范（**必须遵守**）

## 下一步：Phase 5 数据结构重构

### 背景

FINAL_PLAN.md §5 已重新设计 AI 反馈数据结构，但代码中的类型定义还是旧版。Phase 5 的目标是将代码对齐新设计。

### 需要修改的文件

| 文件 | 当前状态 | 目标 |
|------|---------|------|
| `src/types/index.ts` | 旧结构：`DimensionFeedback` 无 `issues` 字段 | 新增 Issue、IssueCategory、TranslationStrategy、LearningData 等类型 |
| `src/features/practice/services/mockFeedback.ts` | 生成旧结构 | 生成符合新结构的模拟数据（含 issues、translationStrategy） |
| `src/features/practice/components/FeedbackPanel.tsx` | 展示旧结构 | 展示 issues 列表（severity 标记）+ 翻译策略分析 |
| `src/features/review/store.ts` | 基于 `improvements` 字符串聚合 | 基于 `Issue.category` 聚合，计算 mastery |

### 新数据结构要点

1. **Issue** 挂在 `DimensionFeedback.issues` 下，携带 `category`（16 个标准分类）和 `severity`（error/warning/suggestion）
2. **TranslationStrategy** 新增维度，包含 approach、strengths、suggestions、keyPoints
3. **ImprovementPoint** 按 `IssueCategory` 聚合，新增 `mastery` 字段（0-100）
4. **LearningData** 用户学习数据，包含 weakCategories、recentTrend 等

### 具体任务

**Step 5.1：更新类型定义**
- 在 `src/types/index.ts` 中新增：
  - `IssueSeverity`：`'error' | 'warning' | 'suggestion'`
  - `IssueCategory`：16 个标准化分类枚举
  - `Issue`：userFragment、suggestedFix、reason、severity、category
  - `FeedbackExample`：userFragment、suggestedFragment、reason
  - `TranslationStrategy`、`KeyPointHandling`
  - `LearningData`、`WeakCategory`
- 修改 `DimensionFeedback`：新增 `issues: Issue[]`、`tips?: string[]`
- 修改 `AIFeedback`：新增 `translationStrategy`、`overallSuggestion: string[]`（替代 `summary`）

**Step 5.2：更新模拟反馈**
- 修改 `mockFeedback.ts` 的 `generateMockFeedback` 函数
- 为每个维度生成 1-3 个模拟 issues（含 category、severity）
- 生成模拟 translationStrategy
- 生成 overallSuggestion 数组（替代 summary 字符串）

**Step 5.3：更新反馈面板**
- 修改 `FeedbackPanel.tsx` 展示新结构
- 每个维度下新增 issues 列表（按 severity 颜色标记）
- 新增 TranslationStrategy 展示区域
- overallSuggestion 替代原 summary

**Step 5.4：更新回顾 Store**
- 修改 `reviewStore.ts` 的 `extractFromRecords` 函数
- 基于 `Issue.category` 聚合（而非字符串匹配）
- 新增 `mastery` 计算逻辑
- 导出 `updateMastery` 函数

### 验收标准

1. `npm run build` 无类型错误
2. 练习页反馈面展示 issues 列表 + 翻译策略
3. 回顾页改进点按 category 聚合，显示 mastery

---

*Phase 5 完成后更新此文件。*
