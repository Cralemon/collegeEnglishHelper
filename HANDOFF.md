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
| Phase 10：Polish + Tauri | ⬜ **下一步** | 打包 + 优化 |

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

## Phase 9 实现摘要

### 修改文件

| 文件 | 变更 |
|------|------|
| `src/types/index.ts` | `ImprovementPoint` 新增 `consecutiveAbsences: number` |
| `src/features/review/store.ts` | 新增 `learningData` 状态 + `computeLearningData()`；`extractFromRecords` → `extractStatsFromRecords`（纯统计）+ `extractImprovements`（状态对比 + mastery 追踪）；`partialize` 新增 `learningData`；新增 `suggestedFocusText` 16 类建议文案 |
| `src/features/practice/store.ts` | `submitAnswer()` 末尾调用 `useReviewStore.getState().extractImprovements()` |
| `src/app/page.tsx` | `handleGenerate` + `handleSubmit` 读取 `learningData.weakCategories` 传入 LLM |

### 关键决策

1. **两层分离**：`extractStatsFromRecords`（纯 Map 聚合）→ `extractImprovements`（含历史对比的 mastery 决策），职责清晰
2. **mastery 统一管理**：出现 -10 / 新出现 50 / 缺席 5 次 +5，全部在 `extractImprovements` 中决策
3. **recentTrend 阈值 ±5**：避免小波动误判 improving/declining
4. **learningData = null**：records 为空时用 null 而非零值，便于 UI 判断无数据
5. **suggestedFocus 中文文案**：16 类各配具体学习建议

---

## 下一步：Phase 10 — Polish + Tauri

### 背景

Phase 9 已完成学习闭环。Phase 10 聚焦打包发布与细节打磨。

### 需要修改的文件

| 文件 | 当前状态 | 目标 |
|------|---------|------|
| `src/app/layout.tsx` | 无 viewport meta 控制 | 全局禁止文字选中 + 禁止手势缩放 |
| `src-tauri/tauri.conf.json` | 基础配置 | Android safeArea + Windows minWidth/minHeight |
| 各页面 | 基本完成 | 响应式适配检查 + 性能优化 |

### 具体任务

**Step 10.1：全局禁止文字选中 + 手势缩放**
- `layout.tsx` 添加 `user-select: none` + `touch-action: manipulation`
- viewport meta 确认

**Step 10.2：Tauri 打包配置**
- Android 状态栏安全区适配（`app.android.safeArea`）
- Windows 最小窗口大小配置（`app.windows[].minWidth/minHeight`）

**Step 10.3：响应式适配检查 + 性能优化**
- 各断点 UI 审查
- 图片/字体/动画优化

### 验收标准

1. `pnpm run build` 无类型错误
2. `npx tauri android build --apk` 成功
3. `npx tauri build` (Windows) 成功
4. 移动端不可选中文字、不可手势缩放
