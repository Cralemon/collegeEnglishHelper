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
| Phase 7：设置页 | ⬜ **下一步** | 用户信息 + 应用配置 |
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
| 滚动渐隐容器 | `src/components/layout/ScrollFade.tsx` |

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

## Phase 6 Polish 实现摘要

### 变更内容

- **ScrollFade**（新建 `src/components/layout/ScrollFade.tsx`）：顶部 + 底部双端渐隐遮罩，`ResizeObserver + scroll` 检测滚动位置，到顶/底时对应遮罩 `opacity-0`
- **FlashCard**：去掉对 flex 子元素无效的 `h-[calc(100dvh-13rem)]`，改为 `mb-6` 从弹性分配高度中扣减底部空间
- **StatsOverview**：数字改用标准 Tailwind 类 `text-5xl`（48px）+ `font-bold`（自定义 `text-display-md` 在 CSS4 下未生效），sub 标签 `text-caption → text-body-sm`
- **ImprovementList**：展开区域改用 `grid-template-rows: 0fr → 1fr` CSS 高度动画（200ms），进度条移入 button 内部消除位置异常
- **review / settings page**：滚动区域替换为 `<ScrollFade>`

---

## Phase 6 实现摘要

### 新增文件

| 文件 | 说明 |
|------|------|
| `src/features/review/components/StatsOverview.tsx` | 刷题数/平均分/最高最低分 + 三维度平均分进度条 |
| `src/features/review/components/ImprovementList.tsx` | 按 frequency 降序，mastery 进度条颜色，点击展开关联记录 |
| `src/features/review/components/ScoreTrendChart.tsx` | Recharts AreaChart，最近 20 条，CSS 变量主题色 |
| `src/features/review/components/index.ts` | 导出入口 |

### 修改文件

- `src/app/review/page.tsx`：无数据空状态 + 有数据组装三组件（ScoreTrendChart 在 ≥3 条时才渲染）

### 关键决策

1. **recharts 3.8.1**：Tooltip `formatter` 参数类型为 `ValueType | undefined`，不可直接标注 `number`
2. **图表颜色**：使用 `var(--color-primary)` 等 CSS 变量，自动跟随主题
3. **extractImprovements 时机**：在 `useEffect` 中依赖 `answerRecords` 变化触发，确保回顾页数据始终最新

## 下一步：Phase 7 设置页

### 背景

设置页（`/settings`）目前是占位文字。Phase 7 目标是实现用户信息管理和应用配置，所有表单数据持久化到 `settingsStore`。

### 需要修改/新建的文件

| 文件 | 当前状态 | 目标 |
|------|---------|------|
| `src/app/settings/page.tsx` | 空白占位 | 设置页完整 UI |
| （新建）`src/features/settings/components/` | 不存在 | UserProfileForm、AppConfigSection、LLMConfigSection、DataManagementSection |

### 具体任务

**Step 7.1：用户信息表单（UserProfileForm）**
- 新建 `src/features/settings/components/UserProfileForm.tsx`
- 字段：昵称（Input）、学年段（Tabs/选择）、预估词汇量（滑块或数字输入）
- 数据源：`useSettingsStore` 的 `userProfile`，即时更新（onChange 触发 store action）

**Step 7.2：应用配置区（AppConfigSection）**
- 新建 `src/features/settings/components/AppConfigSection.tsx`
- 翻译方向：中译英 / 英译中（切换按钮）
- 翻译模式：单句 / 段落（切换按钮）
- 外观主题：浅色 / 深色 / 跟随系统（`ThemePreference` 三选一）
- 题目偏好：预设类型多选 + 自定义文本输入

**Step 7.3：LLM 配置区（LLMConfigSection）**
- 新建 `src/features/settings/components/LLMConfigSection.tsx`
- 字段：API 地址、API Key（密码输入框）、模型名称
- 数据源：`useSettingsStore` 的 `llmConfig`

**Step 7.4：数据管理区（DataManagementSection）**
- 新建 `src/features/settings/components/DataManagementSection.tsx`
- 清除练习数据按钮（调用 `practiceStore.clearAll` + `reviewStore.clearImprovements`）
- 操作前弹出确认（使用 `window.confirm` 即可，Phase 10 再优化）

**Step 7.5：组装设置页**
- 修改 `src/app/settings/page.tsx`
- 布局：垂直滚动，各区域卡片分组，标题 + 内容

### 验收标准

1. `pnpm run build` 无类型错误
2. 昵称、学年段等修改后刷新页面数据仍保留（持久化验证）
3. 清除数据后首页和回顾页数据清空

---

*Phase 6 + Polish 已完成（2026-06-06）。Phase 7 完成后更新此文件。*
