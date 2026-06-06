# 大学英语翻译练习助手 — 最终规划书

> **Agent 行为准则：实现规划目标时必须主动提出更优方案，不得盲目执行。**

---

## 1. 项目核心

面向大学生的英语翻译练习工具，提供即时 AI 反馈，通过「答题→暴露问题→针对性训练」的循环提升翻译能力。

### 1.1 核心循环

```
答题 → AI反馈 → 提取改进点 → 聚合统计 → 更新用户画像 → 指导出题 → 答题...
```

### 1.2 设计哲学

- 翻译练习是核心，提供详细反馈作为提升手段
- 卡片式单题展示，避免信息过载
- 个性化学习，根据用户薄弱点针对性出题

---

## 2. 技术栈

| 层面 | 技术选择 |
|------|---------|
| 框架 | Next.js 16 (App Router) |
| UI 组件 | Radix Primitives |
| 样式 | Tailwind CSS 4 |
| 状态管理 | Zustand |
| LLM 调用 | Vercel AI SDK (ai@6) |
| 图表 | 面积图 (Recharts) |
| 持久化 | localStorage → IndexedDB |

---

## 3. LLM 使用边界

| 任务 | 方式 | 原因 |
|------|------|------|
| 格式化解析、评分计算 | 程序 | 稳定可靠 |
| 分数数字校验 | 程序 | 避免 LLM 幻觉 |
| 翻译质量评估 | LLM | 需要语义理解 |
| 优点/改进点生成 | LLM | 需要教学知识 |
| 问题分类标签 | LLM + 固定枚举 | 稳定且灵活 |

---

## 4. 页面架构

### 4.1 练习页（首页）

- **正面**：题目 + 翻译输入框 + 提交按钮
- **反面**：三维评分 + 问题列表 + 翻译策略分析
- 滑动卡片切换题目，支持上一张/下一张

### 4.2 回顾页

- 统计概览：刷题数、平均分、各维度分数、分段统计
- 改进点列表：按 frequency/mastery 排序，可展开查看详情
- 分数趋势图：展示历史分数变化

### 4.3 个人/设置页

- 用户信息：昵称、学年段、词汇量、翻译模式
- 应用设置：主题选择、深浅色选择、字体选择、题目偏好（单句、段落、翻译语言方向）、查看当前画像
- 水平测试：通过生成测试快速生成用户画像（最后添加）
- LLM 配置：API 地址、密钥、模型选择
- 数据管理：清除数据、导出/导入

---

## 5. 数据结构

### 5.1 核心类型定义

```typescript
// ====== 题目 ======
type TranslationDirection = 'zh-en' | 'en-zh';
type Difficulty = 'easy' | 'medium' | 'hard';

interface Question {
  id: string;
  sourceText: string;
  translationDirection: TranslationDirection;
  category: string;
  difficulty: Difficulty;
  createdAt: number;
}

// ====== AI 反馈 ======
type FeedbackDimension = 'grammar' | 'vocabulary' | 'sentenceStructure';

type IssueSeverity = 'error' | 'warning' | 'suggestion';

// 标准化问题分类（用于改进点聚合）
type IssueCategory =
  | 'grammar.tense' | 'grammar.voice' | 'grammar.agreement'
  | 'grammar.article' | 'grammar.preposition' | 'grammar.clause'
  | 'grammar.subjunctive' | 'grammar.word-order'
  | 'vocab.accuracy' | 'vocab.collocation' | 'vocab.formality'
  | 'vocab.diversity'
  | 'structure.choppy' | 'structure.run-on'
  | 'structure.parallelism' | 'structure.coherence';

interface Issue {
  userFragment: string;            // 问题片段
  suggestedFix: string;            // 建议修改
  reason: string;                  // 原因
  severity: IssueSeverity;
  category: IssueCategory;         // 标准化分类
}

interface DimensionFeedback {
  score: number;                   // 0-100
  strengths: string[];             // 优点
  improvements: string[];          // 改进点概述
  issues: Issue[];                 // 具体问题
  tips?: string[];                 // 学习技巧
}

interface TranslationStrategy {
  approach: '直译为主' | '意译为主' | '直译意译结合';
  strengths: string[];
  suggestions: string[];
  keyPoints: KeyPointHandling[];
}

interface KeyPointHandling {
  originalFragment: string;
  userTranslation: string;
  evaluation: '优秀' | '合格' | '待改进';
  alternativeSuggestion?: string;
}

interface AIFeedback {
  grammar: DimensionFeedback;
  vocabulary: DimensionFeedback;
  sentenceStructure: DimensionFeedback;
  translationStrategy: TranslationStrategy;
  overallSuggestion: string[];     // 整体学习建议
}

// ====== 作答记录 ======
interface AnswerRecord {
  id: string;
  questionId: string;
  userTranslation: string;
  score: number;
  feedback: AIFeedback;
  answeredAt: number;
}

// ====== 改进点聚合 ======
interface ImprovementPoint {
  id: string;
  category: IssueCategory;
  dimension: FeedbackDimension;
  description: string;
  frequency: number;
  recentIssueIds: string[];
  firstSeen: number;
  lastSeen: number;
  mastery: number;                 // 0-100
}

// ====== 用户学习数据 ======
interface LearningData {
  totalQuestions: number;
  averageScore: number;
  dimensionScores: {
    grammar: number;
    vocabulary: number;
    sentenceStructure: number;
  };
  weakCategories: WeakCategory[];
  strongCategories: IssueCategory[];
  recentTrend: 'improving' | 'stable' | 'declining';
}

interface WeakCategory {
  category: IssueCategory;
  frequency: number;
  mastery: number;
  suggestedFocus: string;
}

// ====== 用户信息 ======
interface UserProfile {
  nickname: string;
  gradeLevel: GradeLevel;
  vocabularyLevel: number;
  translationMode: TranslationMode;
  translationDirection: TranslationDirection;
  theme: ThemePreference;
  topicPreference: TopicPreference;
}

// ====== LLM 配置 ======
interface LLMConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
}
```

### 5.2 改进点聚类机制

- LLM 输出 issues 时，从预定义 `IssueCategory` 中选择分类
- 相同 `category` 的 issues 自动聚合到 `ImprovementPoint`
- `mastery` 计算：每次出现下降，连续未出现上升

### 5.3 掌握度更新规则

```typescript
// 伪代码
function updateMastery(point: ImprovementPoint, isOccurred: boolean) {
  if (isOccurred) {
    point.mastery = Math.max(0, point.mastery - 10);
    point.frequency++;
    point.lastSeen = Date.now();
  } else {
    // 连续 5 次未出现，每次 +5
    point.mastery = Math.min(100, point.mastery + 5);
  }
}
```

---

## 6. 实施步骤

### Phase 1：项目初始化 ✅

- [x] Next.js 16 + Tailwind CSS 4 + Radix UI
- [x] 项目结构、主题变量、基础组件库

### Phase 2：布局与导航 ✅

- [x] AppLayout 响应式容器
- [x] BottomNav 底部 Pill 导航（移动端水平 / 平板+垂直侧边）
- [x] 三个页面路由（/、/review、/settings）

### Phase 3：状态管理与数据层 ✅

- [x] 类型定义（types/index.ts）— 旧结构
- [x] Zustand Store（practiceStore、reviewStore、settingsStore）
- [x] localStorage 持久化

### Phase 4：练习页核心 ✅

- [x] 正面：题目展示 + 翻译输入
- [x] 反面：三维评分卡片
- [x] 叠卡模式 + 3D 翻转 + 滑动手势
- [x] 模拟反馈（mockFeedback.ts）— 旧结构

### Phase 5：数据结构重构 ⬜ 下一步

**目标**：将代码中的数据结构对齐 FINAL_PLAN §5 新设计

- [ ] 更新 `types/index.ts`：新增 Issue、IssueCategory、TranslationStrategy、LearningData 等类型
- [ ] 更新 `mockFeedback.ts`：生成符合新结构的模拟数据
- [ ] 更新 `FeedbackPanel.tsx`：展示 issues 列表（severity 标记）+ 翻译策略分析
- [ ] 更新 `reviewStore.ts`：基于 Issue.category 聚合改进点，计算 mastery

### Phase 6：回顾页 ⬜

**目标**：展示统计数据和改进点，支持薄弱点追踪

- [ ] 统计概览卡片：刷题数、平均分、各维度分数
- [ ] 改进点列表：按 category 聚合，按 frequency/mastery 排序，可展开查看详情
- [ ] 分数趋势图（Recharts 面积图）
- [ ] 薄弱点筛选：点击改进点可筛选相关题目

### Phase 7：设置页 ⬜

**目标**：用户信息管理 + 应用配置

- [ ] 用户信息表单：昵称、学年段、词汇量
- [ ] 应用设置：主题风格、深浅色、翻译方向、题目偏好
- [ ] LLM 配置：API 地址、密钥、模型选择
- [ ] 数据管理：清除数据、导出/导入
- [ ] 用户画像展示：weakCategories、recentTrend

### Phase 8：LLM 集成 ⬜

**目标**：替换 mock 数据，接入真实 LLM

- [ ] Prompt 设计：输出 AIFeedback 结构，包含 IssueCategory 枚举约束
- [ ] Vercel AI SDK 集成：API Route + 流式响应
- [ ] 输出校验：JSON Schema 验证 + fallback 处理
- [ ] 题目生成：基于用户画像（weakCategories）智能出题

### Phase 9：学习闭环 ⬜

**目标**：实现答题→反馈→优化的完整循环

- [ ] 用户画像更新：每次答题后更新 LearningData
- [ ] 掌握度追踪：updateMastery 逻辑（出现 -10，连续未出现 +5）
- [ ] 智能出题：基于 weakCategories 优先推荐薄弱点相关题目
- [ ] 难度调整：根据 mastery 动态调整题目难度

### Phase 10：Polish + Tauri ⬜

- [ ] 响应式适配检查
- [ ] Tauri Android/Windows 打包
- [ ] 性能优化（图片、字体、动画）
- [ ] 水平测试功能（快速生成用户画像）

---

## 8. Prompt 设计要点

### 8.1 输出格式要求

LLM 需要输出符合 `AIFeedback` 结构的 JSON，关键约束：

- `score`：0-100 整数
- `issues`：每个 issue 必须包含 `category`（从预定义枚举选择）和 `severity`
- `translationStrategy.approach`：三选一
- `overallSuggestion`：字符串数组

### 8.2 Prompt 示例框架

```
你是一位大学英语翻译教师。请评估以下翻译，输出 JSON 格式反馈。

题目：{sourceText}
用户翻译：{userTranslation}

要求：
1. 语法/词汇/句型三维评分（0-100）
2. 每个维度列出具体问题，问题分类必须从以下枚举选择：
   [IssueCategory 枚举列表]
3. 分析翻译策略（直译/意译/结合）
4. 给出整体学习建议
```

---

## 9. 版本历史

| 版本 | 日期 | 变更内容 |
|------|------|---------|
| v1.0 | 2026/06/05 | 初始版本 |
| v2.0 | 2026/06/06 | 重新设计：精简架构、AI反馈三维评估、自适应布局、Radix UI、Tauri |
| v2.1 | 2026/06/06 | AI反馈数据结构深化：新增 Issue 标准化分类、翻译策略维度、掌握度追踪、用户学习数据 |
