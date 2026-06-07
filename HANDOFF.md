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
| Phase 9：学习闭环 | ⬜ **下一步** | 用户画像 + 智能出题 |
| Phase 10：Polish + Tauri | ⬜ | 打包 + 优化 |

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

## Phase 8 实现摘要

### 新增文件

| 文件 | 说明 |
|------|------|
| `src/features/practice/services/llmClient.ts` | LLM API 客户端，fetch 调用 OpenAI 兼容 API + JSON 提取 + 结构校验 |
| `src/features/practice/services/prompts.ts` | Prompt Builder 函数 + 条件块处理 + 学年段自适应评分/难度 |
| `src/components/ui/Toast.tsx` | Toast 通知组件：半透明 pill + backdrop-blur + 3s 自动消失 |

### 核心函数

```typescript
// 翻译反馈评估 — LLM 优先，失败抛 LLMError
evaluateTranslation(config, params): Promise<AIFeedback>

// 题目生成 — LLM 优先，失败抛 LLMError
generateQuestions(config, params): Promise<Question[]>

// 错误类型
class LLMError extends Error { code: LLMErrorCode }
```

### 修改文件

| 文件 | 变更 |
|------|------|
| `src/app/page.tsx` | `handleSubmit`/`handleGenerate` → LLM 优先 + mock 降级；移除人工延迟；标题栏新增 ⋯ 二级菜单（重新生成/清除题目）；NO_API_KEY → Toast error + 拒绝操作 |
| `src/app/layout.tsx` | 包裹 `<ToastProvider>` |
| `src/features/practice/store.ts` | 新增 `clearQuestions()` action（仅清题目，保留 answerRecords）；`clearAll()` 仍清全部 |
| `src/features/practice/index.ts` | 新增 llmClient + prompts 导出 |
| `src/features/settings/components/AppConfigSection.tsx` | 题目偏好区域新增「修改后将在下一次生成题目时生效」提示 |

### 关键决策

1. **纯 fetch 实现**：不引入 Vercel AI SDK，OpenAI 兼容 API 用 fetch 足够
2. **LLMError 分级**：`NO_API_KEY` / `NETWORK_ERROR` / `API_ERROR` / `PARSE_ERROR`，调用方可按 code 区分
3. **NO_API_KEY 硬阻断**：无 Key 时 toast error + 拒绝操作（不降级到 mock）
4. **clearQuestions vs clearAll**：菜单"清除当前题目"仅清题保留记录（回顾页引用不断）；设置页"清除练习数据"全清
5. **JSON 提取鲁棒**：依次尝试 ```json code block → 裸 {}/[] → 回退原文
6. **Toast 半透明 pill**：CSS `var()` 直接引用避免 Tailwind 类名解析问题；`backdrop-filter: blur` 增强层次感；深浅模式外观统一

---

## 下一步：Phase 9 — 学习闭环

### 背景

Phase 8 已接入真实 LLM。Phase 9 将实现「答题→反馈→优化」的完整循环：
每次答题后更新用户画像（LearningData），画像指导下一次出题。

### 数据流

```
page.tsx: submitAnswer(record)
  → practiceStore.submitAnswer()          // 写入 answerRecords
  → reviewStore.extractImprovements()     // 重新聚合所有 answerRecords
    → 计算 improvementPoints              // 按 IssueCategory 聚合 issues
    → 计算 learningData                   // 各维度平均分 / weakCategories / trend
      → weakCategories                    // mastery < 50 的 ImprovementPoint
      → strongCategories                  // mastery > 80 的 IssueCategory
      → recentTrend                       // 对比近 10 次 vs 前 10 次平均分
  → page.tsx: handleGenerate()
    → 读取 reviewStore.learningData.weakCategories
    → 传入 generateQuestions(config, { ..., weakCategories })
```

### 需要修改的文件

| 文件 | 当前状态 | 目标 |
|------|---------|------|
| `src/features/review/store.ts` | 仅有 `improvementPoints` + `extractImprovements()` | 新增 `learningData: LearningData`；`extractImprovements()` 同步计算 LearningData；修复 `updateMastery()` 未实装的逻辑 |
| `src/features/practice/store.ts` | `submitAnswer()` 仅写入 answerRecords | `submitAnswer()` 内调用 `reviewStore.getState().extractImprovements()` |
| `src/app/page.tsx` | `handleGenerate` 未传 `weakCategories` | 读取 `reviewStore.learningData.weakCategories` 并传入 |

### 具体任务

**Step 9.1：reviewStore 扩展 — LearningData 计算**
- 新增 `learningData: LearningData` 状态 + `computeLearningData()` action
- `extractImprovements()` 末尾调用 `computeLearningData()`：
  - `totalQuestions` = answerRecords.length
  - `averageScore` = 所有 record.score 的平均值
  - `dimensionScores` = 各维度 feedback.grammar.score / vocabulary.score / sentenceStructure.score 的平均值
  - `weakCategories` = improvementPoints 中 mastery < 50 的项，映射为 WeakCategory 数组
  - `strongCategories` = mastery > 80 的 IssueCategory 数组
  - `recentTrend` = 将 answerRecords 按时段分组（近 10 次 vs 之前 10 次），比较平均分升降

**Step 9.2：practiceStore 触发链**
- `submitAnswer()` 中，写入 record 后：
  ```typescript
  import { useReviewStore } from '@/features/review';
  const records = get().answerRecords; // 包含刚提交的 record
  useReviewStore.getState().extractImprovements(records);
  ```
- 确保 `extractImprovements()` 是幂等的（每次用全量 records 重建）
- 将 `learningData` 加入 reviewStore 的 `partialize`（持久化）

**Step 9.3：弱项驱动出题**
- `page.tsx` 的 `handleGenerate` 中：
  ```typescript
  const { learningData } = useReviewStore.getState();
  const weakCategories = learningData?.weakCategories ?? [];
  // 传入 generateQuestions
  await generateQuestions(llmConfig, {
    ...otherParams,
    weakCategories, // ← Phase 9 新增
  });
  ```
- `prompts.ts` 的 System Prompt 中 `{{#weakCategories}}` 条件块自动展开

**Step 9.4：掌握度追踪完善**
- 修复 `reviewStore.updateMastery()` — 当前仅有接口，未实现消失检测逻辑
- 实现方式：每次 `extractImprovements()` 时，对比新旧 `improvementPoints`：
  - 新出现的 category → mastery 初始 50
  - 再次出现 → mastery = max(0, mastery - 10)
  - 本次未出现 → 检查 `consecutiveAbsences++`，累积 5 次 → mastery = min(100, mastery + 5)

### 验收标准

1. `pnpm run build` 无类型错误
2. 答完一道题后，`reviewStore.learningData` 自动更新（totalQuestions +1，scores 重新计算）
3. 连续在同一 category 出错 3 次后，`weakCategories` 中出现该 category
4. 重新生成题目时，LLM Prompt 的 user prompt 中包含薄弱领域信息
5. Settings 页面可看到 LearningData 概览（可选 Step 9.5）
