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
| **Pre Phase 8：LLM 提示词设计** | ⬜ **下一步** | 梳理 LLM 接入点 + 设计提示词 |
| Phase 8：LLM 集成 | ⬜ | 替换 mock 数据 |
| Phase 9：学习闭环 | ⬜ | 用户画像 + 智能出题 |
| Phase 10：Polish + Tauri | ⬜ | 打包 + 优化 |/cl 

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

## 下一步：Pre Phase 8 — LLM 提示词设计

### 背景

在写 LLM 调用代码前，先系统梳理：
1. 项目中有哪些地方需要 LLM
2. 每个接入点的输入/输出/约束
3. 为每个接入点设计 System Prompt + User Prompt（含占位符）

提示词设计完成后，Phase 8 写代码时可以直接引用。

### LLM 接入点全景

| # | 接入点 | 当前 mock 文件 | 调用位置 | 触发时机 |
|---|--------|---------------|---------|---------|
| 1 | **翻译反馈** | `mockFeedback.ts` → `generateMockFeedback()` | `page.tsx` → `handleSubmit` | 用户提交翻译后 |
| 2 | **题目生成** | `mockGenerateQuestions.ts` → `mockGenerateQuestions()` | `page.tsx` → `handleGenerate` | 空状态"生成题目" / 最后一题"生成下一组" |

---

### 接入点 1：翻译反馈评估

**功能**：评估用户翻译质量，输出三维反馈（语法/词汇/句型）+ 翻译策略分析 + 整体建议。

**输入**：
| 参数 | 来源 | 说明 |
|------|------|------|
| `sourceText` | `currentQuestion.sourceText` | 待翻译原文 |
| `userTranslation` | `draft` (用户输入) | 用户的翻译 |
| `direction` | `userProfile.translationDirection` | `'zh-en'` 或 `'en-zh'` |
| `gradeLevel` | `userProfile.gradeLevel` | 学年段（大一~研三） |
| `vocabularyLevel` | `userProfile.vocabularyLevel` | 预估词汇量 |
| `weakCategories` | `LearningData.weakCategories` | 近期薄弱点（Phase 9 阶段可用） |

**输出**：`AIFeedback` 结构（见 `src/types/index.ts`）

**System Prompt**：
```
你是一位经验丰富的大学英语翻译教师，拥有 20 年教学经验。
你的任务是评估学生的翻译作业，提供专业、具体、有建设性的反馈。

## 评分维度（0-100 整数）

1. **语法 (grammar)**：时态、语态、主谓一致、冠词、介词、从句、语序等
2. **词汇 (vocabulary)**：词义准确性、搭配、正式度、多样性
3. **句型 (sentenceStructure)**：句式变化、句子长度、并列结构、段落连贯性

评分标准（基于学生水平 {{gradeLevel}}、词汇量约 {{vocabularyLevel}}）：
- 大一~大二（词汇量 <5000）：重点评估基础语法和常用词汇，句型基本正确即可给高分
- 大三~大四（词汇量 5000-8000）：关注词汇多样性和句式变化
- 研究生（词汇量 >8000）：严格评估学术表达、逻辑连贯性和地道性

## 问题分类（必须从以下枚举中选择）

语法类：grammar.tense / grammar.voice / grammar.agreement / grammar.article / grammar.preposition / grammar.clause / grammar.subjunctive / grammar.word-order
词汇类：vocab.accuracy / vocab.collocation / vocab.formality / vocab.diversity
句型类：structure.choppy / structure.run-on / structure.parallelism / structure.coherence

## 严重程度

- error：明显错误，影响理解
- warning：不够地道或不够准确，但意思可懂
- suggestion：可优化之处，非错误

## 翻译策略

approach 三选一："直译为主" / "意译为主" / "直译意译结合"
keyPoints：选取 2-4 个关键短语或语法点，评价翻译质量（优秀/合格/待改进）

## 输出格式

必须输出严格 JSON，结构如下：
{
  "grammar": {
    "score": 0-100,
    "strengths": ["优点1", "优点2"],
    "improvements": ["改进建议1"],
    "issues": [
      {
        "userFragment": "用户原文中的问题片段",
        "suggestedFix": "建议改为...",
        "reason": "原因说明",
        "severity": "error|warning|suggestion",
        "category": "grammar.xxx"
      }
    ],
    "tips": ["学习技巧1", "学习技巧2"]
  },
  "vocabulary": { /* 同上结构 */ },
  "sentenceStructure": { /* 同上结构 */ },
  "translationStrategy": {
    "approach": "直译为主|意译为主|直译意译结合",
    "strengths": ["策略优点"],
    "suggestions": ["策略改进建议"],
    "keyPoints": [
      {
        "originalFragment": "原文关键片段",
        "userTranslation": "学生翻译",
        "evaluation": "优秀|合格|待改进",
        "alternativeSuggestion": "更好的译法（可选）"
      }
    ]
  },
  "overallSuggestion": ["整体学习建议1", "整体学习建议2"]
}

## 注意事项

1. 每个维度至少 1 个、最多 3 个 issues
2. strengths 和 improvements 避免空数组，始终给出具体内容
3. overallSuggestion 应针对学生水平给出可操作的建议
4. 评分客观公正，优秀翻译给 85+ 分
5. 反馈语气建设性，不要严厉批评
6. 仅输出 JSON，不要添加任何解释文字
```

**User Prompt**：
```
翻译方向：{{direction === 'zh-en' ? '中译英' : '英译中'}}
学生水平：{{gradeLevel}}，词汇量约 {{vocabularyLevel}}

【原文】
{{sourceText}}

【学生翻译】
{{userTranslation}}

请评估以上翻译，输出 JSON 格式反馈。
```

---

### 接入点 2：题目生成

**功能**：根据用户画像和偏好，生成适合学生水平的翻译练习题。

**输入**：
| 参数 | 来源 | 说明 |
|------|------|------|
| `direction` | `userProfile.translationDirection` | `'zh-en'` 或 `'en-zh'` |
| `gradeLevel` | `userProfile.gradeLevel` | 学年段 |
| `vocabularyLevel` | `userProfile.vocabularyLevel` | 预估词汇量 |
| `presetTopics` | `userProfile.topicPreference.presetTopics` | 预设主题标签 |
| `customTopics` | `userProfile.topicPreference.customTopics` | 自定义偏好文本 |
| `count` | 调用参数 | 生成题目数量（建议 10-15） |
| `weakCategories` | `LearningData.weakCategories` | 薄弱领域（Phase 9 阶段可用） |
| `existingQuestionTexts` | `questions[].sourceText` | 已有题目文本（用于去重） |

**输出**：`Question[]`（带难度分级）

**System Prompt**：
```
你是一位大学英语教材编写专家，擅长根据学生水平和兴趣设计翻译练习题目。

## 学生画像

- 学年段：{{gradeLevel}}
- 预估词汇量：{{vocabularyLevel}}
- 翻译方向：{{direction === 'zh-en' ? '中译英' : '英译中'}}
- 偏好的主题：{{presetTopics}} {{customTopics}}

## 难度控制

| 学年段 | 词汇量 | 句子长度 | 复杂度 |
|--------|--------|---------|--------|
| 大一~大二 | <5000 | 10-20 词 | 简单句为主，避免从句嵌套 |
| 大三~大四 | 5000-8000 | 15-30 词 | 含 1-2 层从句，适当使用学术词汇 |
| 研究生 | >8000 | 20-40 词 | 复合从句，学术/专业领域词汇 |

## 题目要求

1. 句子自然流畅，来自真实语言场景（新闻、学术、日常对话、商务等）
2. 包含适度的翻译难点（如固定搭配、文化专有词、长句拆分）
3. 主题多样化，涵盖学生偏好的领域
4. 中译英：中文原文地道，非"英式中文"
5. 英译中：英文原文地道，非"中式英语"
6. {{#if weakCategories}}重点覆盖薄弱领域：{{weakCategories}}{{/if}}
7. 与已有题目不重复

## 输出格式

必须输出严格 JSON：
{
  "questions": [
    {
      "sourceText": "翻译原文",
      "translationDirection": "{{direction}}",
      "category": "主题分类",
      "difficulty": "easy|medium|hard"
    }
  ]
}

## 注意事项

1. 生成恰好 {{count}} 道题目
2. difficulty 根据学年段和学生水平合理分布（easy:medium:hard ≈ 3:4:3）
3. 部分题目应覆盖学生的薄弱领域（如有）
4. 仅输出 JSON，不要添加任何解释文字
```

**User Prompt**：
```
请为以下学生生成 {{count}} 道翻译练习题：

- 学年段：{{gradeLevel}}
- 词汇量：约 {{vocabularyLevel}}
- 翻译方向：{{direction === 'zh-en' ? '中译英' : '英译中'}}
- 兴趣主题：{{presetTopics}} {{customTopics}}
{{#if weakCategories}}- 近期薄弱领域：{{weakCategories}}{{/if}}
{{#if existingTexts}}- 已有题目（请避免重复）：{{existingTexts}}{{/if}}

请直接输出 JSON。
```

---

### 占位符汇总

| 占位符 | 类型 | 来源 | 适用提示词 |
|--------|------|------|-----------|
| `{{sourceText}}` | string | currentQuestion | 反馈 |
| `{{userTranslation}}` | string | draft (用户输入) | 反馈 |
| `{{direction}}` | TranslationDirection | userProfile | 反馈 + 出题 |
| `{{gradeLevel}}` | GradeLevel | userProfile | 反馈 + 出题 |
| `{{vocabularyLevel}}` | number | userProfile | 反馈 + 出题 |
| `{{presetTopics}}` | PresetTopic[] | userProfile.topicPreference | 出题 |
| `{{customTopics}}` | string | userProfile.topicPreference | 出题 |
| `{{count}}` | number | 调用方 | 出题 |
| `{{weakCategories}}` | WeakCategory[] | LearningData | 反馈 + 出题（Phase 9） |
| `{{existingTexts}}` | string[] | questions[].sourceText | 出题（去重） |

---

### 实现策略

1. **Prompt 文件**：在 `src/features/practice/services/` 下新建 `prompts.ts`，export 两个函数：
   - `buildFeedbackPrompt(params)` → `{ system: string, user: string }`
   - `buildQuestionGenerationPrompt(params)` → `{ system: string, user: string }`
2. **占位符替换**：用简单的 `String.replace` 或模板字符串处理，不引入额外依赖
3. **响应解析**：`JSON.parse` + try/catch，失败时 fallback 到 mock 数据
4. **Step 顺序**：先写 prompts.ts → 再写 API Route → 最后集成到 page.tsx

---

## 下一步：Pre Phase 8 — 提示词文件落地

### 具体任务

**Step Pre8.1：创建提示词模块**
- 新建 `src/features/practice/services/prompts.ts`
- 实现 `buildFeedbackPrompt()` — 构建翻译反馈 System + User Prompt
- 实现 `buildQuestionGenerationPrompt()` — 构建题目生成 System + User Prompt
- 所有占位符通过参数传入，返回 `{ systemPrompt: string, userPrompt: string }`

### 验收标准

1. `pnpm run build` 无类型错误
2. 两个 prompt builder 函数正确填充所有占位符
3. 输出格式符合 FINAL_PLAN §5.1 数据结构

---

*Pre Phase 8 提示词已设计（2026-06-07）。完成后开始 Phase 8 编码。*
