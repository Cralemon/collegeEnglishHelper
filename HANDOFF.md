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
| Phase 8：LLM 集成 | ⬜ **下一步** | 替换 mock 数据 |
| Phase 9：学习闭环 | ⬜ | 用户画像 + 智能出题 |
| Phase 10：Polish + Tauri | ⬜ | 打包 + 优化 |/cl 

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

---

## Phase 7 实现摘要

### 新增文件

| 文件 | 说明 |
|------|------|
| `src/features/settings/components/UserProfileForm.tsx` | 昵称（Input）、学年段（Tabs underline 7 选项大一到研三）、词汇量（range slider 1000-15000 step500） |
| `src/features/settings/components/AppConfigSection.tsx` | 翻译方向/翻译模式/外观主题（Tabs pills）、题目偏好（8 预设 chip toggle + 自定义 Textarea） |
| `src/features/settings/components/LLMConfigSection.tsx` | API 地址（Input）、API Key（password + eye 显隐切换 + 安全提示）、模型名称（Input） |
| `src/features/settings/components/DataManagementSection.tsx` | 清除练习数据按钮（window.confirm + practiceStore.clearAll + reviewStore.clearImprovements），仅删练习数据不删设置 |

### 修改文件

- `src/app/settings/page.tsx`：替换占位文字为四组件组合，ScrollFade + space-y-4
- `src/features/settings/index.ts`：新增 4 个组件导出

### 关键决策

1. **学年段用 underline Tabs**：7 个选项用 underline variant 比 pills 更紧凑
2. **词汇量用原生 range input**：移动端原生滑块体验最好，自定义 accentColor + 渐变背景
3. **题目偏好用 chip toggle**：Button variant 在 primary/outline 间切换，比 checkbox 更触屏友好
4. **LLM Key 显隐切换**：eye/eye-off SVG icon，默认隐藏
5. **数据清除仅删练习数据**：settingsStore（用户配置/LLM 配置）不受影响

---

## 下一步：Phase 8 LLM 集成

### 背景

目前练习页使用 `mockFeedback.ts` 生成模拟 AI 反馈。Phase 8 目标是接入真实 LLM（通过 Vercel AI SDK），实现 AI 驱动的翻译评估与反馈。

### 需要修改/新建的文件

| 文件 | 当前状态 | 目标 |
|------|---------|------|
| `src/features/practice/services/mockFeedback.ts` | 模拟反馈 | 保留作为 fallback，新建 LLM 调用服务 |
| （新建）`src/app/api/feedback/route.ts` | 不存在 | Next.js API Route，调用 LLM 返回 AIFeedback |
| （新建）`src/features/practice/services/llmFeedback.ts` | 不存在 | LLM 调用 + prompt 构建 + 响应校验 |
| `src/features/practice/components/FeedbackPanel.tsx` | 已完成 | 可能需要适配流式响应 loading 状态 |
| `src/app/page.tsx` | 已完成 | 替换 generateMockFeedback → LLM 调用 |

### 具体任务

**Step 8.1：API Route**
- 新建 `src/app/api/feedback/route.ts`
- POST handler 接收 `{ question, userTranslation, userProfile }` → 调用 LLM → 返回 `AIFeedback`
- 使用 Vercel AI SDK `streamText` 或直接 `fetch` 调用 OpenAI 兼容 API

**Step 8.2：Prompt 构建**
- 新建 `src/features/practice/services/llmFeedback.ts`
- 基于 FINAL_PLAN §8 设计 System Prompt + User Prompt
- 输出 JSON Schema 约束（AIFeedback 结构 + IssueCategory 枚举）
- JSON 校验 + fallback 处理（解析失败时返回 mock 数据）

**Step 8.3：集成到练习页**
- 修改 `src/app/page.tsx`：提交答案时调用 LLM API Route 替代 `generateMockFeedback`
- loading 状态：`isEvaluating` 期间显示加载动画
- 错误处理：调用失败时 fallback 到 mock 数据

**Step 8.4：设置页联动**
- 确认 LLM 配置（`/settings` 中的 API 地址/Key/模型）在 LLM 调用中生效
- API Route 读取 `llmConfig`（从请求 body 或 server-side 读取）

### 验收标准

1. `pnpm run build` 无类型错误
2. 填入有效 API Key 后能获得真实 AI 反馈
3. API 调用失败时不崩溃，fallback 到模拟数据
4. FeedbackPanel 正确展示真实 LLM 返回的数据

---

*Phase 7 已完成（2026-06-06）。Phase 8 完成后更新此文件。*
