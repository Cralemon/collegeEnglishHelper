/**
 * LLM 提示词模板
 *
 * 为两个 LLM 接入点提供 System Prompt + User Prompt 构建函数。
 * 所有占位符通过参数传入，返回 { systemPrompt, userPrompt }。
 *
 * 接入点 1 — 翻译反馈评估：buildFeedbackPrompt()
 * 接入点 2 — 题目生成：       buildQuestionGenerationPrompt()
 */

import type {
  GradeLevel,
  PresetTopic,
  TranslationDirection,
  WeakCategory,
} from '@/types';

// ============================================================
// 参数类型
// ============================================================

/** 接入点 1：翻译反馈评估参数 */
export interface FeedbackPromptParams {
  sourceText: string;
  userTranslation: string;
  direction: TranslationDirection;
  gradeLevel: GradeLevel;
  vocabularyLevel: number;
  /** Phase 9 阶段接入，当前可选 */
  weakCategories?: WeakCategory[];
}

/** 接入点 2：题目生成参数 */
export interface QuestionGenerationPromptParams {
  direction: TranslationDirection;
  gradeLevel: GradeLevel;
  vocabularyLevel: number;
  presetTopics: PresetTopic[];
  customTopics: string;
  count: number;
  /** Phase 9 阶段接入，当前可选 */
  weakCategories?: WeakCategory[];
  /** 已有题目原文，用于去重 */
  existingTexts?: string[];
}

/** Prompt 构建结果 */
export interface PromptPair {
  systemPrompt: string;
  userPrompt: string;
}

// ============================================================
// 工具函数
// ============================================================

/** 将学年段映射为水平描述 */
function describeLevel(gradeLevel: GradeLevel, vocabularyLevel: number): string {
  const year = gradeLevel.startsWith('研') ? '研究生' : gradeLevel;
  return `${year}，词汇量约 ${vocabularyLevel.toLocaleString()}`;
}

/** 根据学年段生成评分标准说明 */
function getScoringStandard(gradeLevel: GradeLevel, vocabularyLevel: number): string {
  if (gradeLevel.startsWith('研') || vocabularyLevel > 8000) {
    return '研究生（词汇量 >8000）：严格评估学术表达、逻辑连贯性和地道性';
  }
  if (gradeLevel === '大三' || gradeLevel === '大四' || vocabularyLevel >= 5000) {
    return '大三~大四（词汇量 5000-8000）：关注词汇多样性和句式变化';
  }
  return '大一~大二（词汇量 <5000）：重点评估基础语法和常用词汇，句型基本正确即可给高分';
}

/** 根据学年段生成题目难度分布 */
function getDifficultyDistribution(gradeLevel: GradeLevel): string {
  if (gradeLevel.startsWith('研')) return 'easy:medium:hard ≈ 1:4:5';
  if (gradeLevel === '大三' || gradeLevel === '大四') return 'easy:medium:hard ≈ 3:4:3';
  return 'easy:medium:hard ≈ 4:4:2';
}

/** 根据学年段生成句子长度与复杂度要求 */
function getSentenceRequirements(gradeLevel: GradeLevel, vocabularyLevel: number): string {
  if (gradeLevel.startsWith('研') || vocabularyLevel > 8000) {
    return '20-40 词，可含复合从句和学术/专业领域词汇';
  }
  if (gradeLevel === '大三' || gradeLevel === '大四' || vocabularyLevel >= 5000) {
    return '15-30 词，含 1-2 层从句，适当使用学术词汇';
  }
  return '10-20 词，以简单句为主，避免从句嵌套';
}

/** 将预设主题转为中文标签列表 */
function formatPresetTopics(topics: PresetTopic[]): string {
  const LABELS: Record<PresetTopic, string> = {
    'red-theme': '红色主题',
    political: '政治经济',
    motivational: '励志名言',
    technology: '科技前沿',
    culture: '文化历史',
    'daily-life': '日常生活',
    business: '商务职场',
    academic: '学术教育',
  };
  if (topics.length === 0) return '无特定偏好（通用）';
  return topics.map((t) => LABELS[t] || t).join('、');
}

/**
 * 简易占位符替换：将 {{key}} 替换为对应值
 * 仅做字符串替换，不做条件判断——条件逻辑由调用方在传参前处理
 */
function fill(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}

// ============================================================
// 接入点 1：翻译反馈评估
// ============================================================

const FEEDBACK_SYSTEM_PROMPT = `你是一位经验丰富的大学英语翻译教师，拥有 20 年教学经验。
你的任务是评估学生的翻译作业，提供专业、具体、有建设性的反馈。

## 评分维度（0-100 整数）

1. **语法 (grammar)**：时态、语态、主谓一致、冠词、介词、从句、语序等
2. **词汇 (vocabulary)**：词义准确性、搭配、正式度、多样性
3. **句型 (sentenceStructure)**：句式变化、句子长度、并列结构、段落连贯性

## 评分标准

根据学生水平动态调整：
{{scoringStandard}}

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
6. 仅输出 JSON，不要添加任何解释文字`;

const FEEDBACK_USER_PROMPT = `翻译方向：{{directionLabel}}
学生水平：{{studentLevel}}
{{#weakCategories}}近期薄弱领域：{{weakCategoriesText}}{{/weakCategories}}

【原文】
{{sourceText}}

【学生翻译】
{{userTranslation}}

请评估以上翻译，输出 JSON 格式反馈。`;

/**
 * 构建翻译反馈评估提示词
 *
 * 参数全部必填（weakCategories 除外）。
 */
export function buildFeedbackPrompt(params: FeedbackPromptParams): PromptPair {
  const {
    sourceText,
    userTranslation,
    direction,
    gradeLevel,
    vocabularyLevel,
    weakCategories,
  } = params;

  const directionLabel = direction === 'zh-en' ? '中译英' : '英译中';
  const studentLevel = describeLevel(gradeLevel, vocabularyLevel);
  const scoringStandard = getScoringStandard(gradeLevel, vocabularyLevel);

  // 构建 system prompt
  const systemPrompt = fill(FEEDBACK_SYSTEM_PROMPT, {
    scoringStandard,
  });

  // 构建 user prompt（处理条件块）
  let userPrompt = FEEDBACK_USER_PROMPT;

  // 薄弱领域条件块
  if (weakCategories && weakCategories.length > 0) {
    const weakText = weakCategories
      .map((w) => `${w.category}（掌握度 ${w.mastery}%）`)
      .join('、');
    userPrompt = userPrompt.replace(
      /\{\{#weakCategories\}\}[\s\S]*?\{\{\/weakCategories\}\}/g,
      `近期薄弱领域：${weakText}`,
    );
  } else {
    userPrompt = userPrompt.replace(
      /\{\{#weakCategories\}\}[\s\S]*?\{\{\/weakCategories\}\}/g,
      '',
    );
  }

  userPrompt = fill(userPrompt, {
    directionLabel,
    studentLevel,
    sourceText,
    userTranslation,
  });

  return { systemPrompt, userPrompt };
}

// ============================================================
// 接入点 2：题目生成
// ============================================================

const QUESTION_GENERATION_SYSTEM_PROMPT = `你是一位大学英语教材编写专家，擅长根据学生水平和兴趣设计翻译练习题目。

## 学生画像

- 学年段：{{gradeLevel}}
- 预估词汇量：{{vocabularyLevel}}
- 翻译方向：{{directionLabel}}
- 偏好的主题：{{topicsText}}

## 难度控制

| 学年段 | 词汇量 | 句子长度 | 复杂度 |
|--------|--------|---------|--------|
| 大一~大二 | <5000 | 10-20 词 | 简单句为主，避免从句嵌套 |
| 大三~大四 | 5000-8000 | 15-30 词 | 含 1-2 层从句，适当使用学术词汇 |
| 研究生 | >8000 | 20-40 词 | 复合从句，学术/专业领域词汇 |

当前学生要求：{{sentenceRequirement}}

## 题目要求

1. 句子自然流畅，来自真实语言场景（新闻、学术、日常对话、商务等）
2. 包含适度的翻译难点（如固定搭配、文化专有词、长句拆分）
3. 主题多样化，涵盖学生偏好的领域
4. 中译英：中文原文地道，非"英式中文"
5. 英译中：英文原文地道，非"中式英语"
6. {{#weakCategories}}重点覆盖薄弱领域：{{weakCategoriesText}}{{/weakCategories}}
7. 与已有题目不重复{{#existingTexts}}（已有题目参考：{{existingTextsText}}）{{/existingTexts}}

## 难度分布

{{difficultyDistribution}}

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
2. difficulty 按 {{difficultyDistribution}} 分布
3. 部分题目应覆盖学生的薄弱领域（如有）
4. 仅输出 JSON，不要添加任何解释文字`;

const QUESTION_GENERATION_USER_PROMPT = `请为以下学生生成 {{count}} 道翻译练习题：

- 学年段：{{gradeLevel}}
- 词汇量：约 {{vocabularyLevel}}
- 翻译方向：{{directionLabel}}
- 兴趣主题：{{topicsText}}
{{#weakCategories}}- 近期薄弱领域：{{weakCategoriesText}}{{/weakCategories}}
{{#existingTexts}}- 已有题目（请避免重复）：{{existingTextsText}}{{/existingTexts}}

请直接输出 JSON。`;

/**
 * 构建题目生成提示词
 *
 * count 建议 10-15，weakCategories / existingTexts 可选（Phase 9 接入）。
 */
export function buildQuestionGenerationPrompt(
  params: QuestionGenerationPromptParams,
): PromptPair {
  const {
    direction,
    gradeLevel,
    vocabularyLevel,
    presetTopics,
    customTopics,
    count,
    weakCategories,
    existingTexts,
  } = params;

  const directionLabel = direction === 'zh-en' ? '中译英' : '英译中';
  const vocabLabel = vocabularyLevel.toLocaleString();

  // 主题文本：预设 + 自定义
  const presetText = formatPresetTopics(presetTopics);
  const topicsText = customTopics.trim()
    ? `${presetText}；自定义：${customTopics.trim()}`
    : presetText;

  const sentenceRequirement = getSentenceRequirements(gradeLevel, vocabularyLevel);
  const difficultyDistribution = getDifficultyDistribution(gradeLevel);

  // 薄弱领域文本
  const weakCategoriesText =
    weakCategories && weakCategories.length > 0
      ? weakCategories
          .map((w) => `${w.category}（掌握度 ${w.mastery}%）`)
          .join('、')
      : '';

  // 已有题目文本
  const existingTextsText =
    existingTexts && existingTexts.length > 0
      ? existingTexts.slice(0, 30).join('；')
      : '';

  // 处理 System Prompt 条件块
  let systemPrompt = QUESTION_GENERATION_SYSTEM_PROMPT;
  systemPrompt = resolveConditionalBlock(
    systemPrompt,
    'weakCategories',
    weakCategoriesText,
  );
  systemPrompt = resolveConditionalBlock(
    systemPrompt,
    'existingTexts',
    existingTextsText,
  );

  systemPrompt = fill(systemPrompt, {
    gradeLevel,
    vocabularyLevel: vocabLabel,
    directionLabel,
    topicsText,
    sentenceRequirement,
    difficultyDistribution,
    direction,
    count: String(count),
    weakCategoriesText,
    existingTextsText,
  });

  // 处理 User Prompt 条件块
  let userPrompt = QUESTION_GENERATION_USER_PROMPT;
  userPrompt = resolveConditionalBlock(
    userPrompt,
    'weakCategories',
    weakCategoriesText,
  );
  userPrompt = resolveConditionalBlock(
    userPrompt,
    'existingTexts',
    existingTextsText,
  );

  userPrompt = fill(userPrompt, {
    count: String(count),
    gradeLevel,
    vocabularyLevel: vocabLabel,
    directionLabel,
    topicsText,
    weakCategoriesText,
    existingTextsText,
  });

  return { systemPrompt, userPrompt };
}

// ============================================================
// 条件块处理工具
// ============================================================

/**
 * 处理 Handlebars 风格的条件块：
 * `{{#key}}...content...{{/key}}`
 * 如果 value 非空，保留 content 并替换内部占位符；否则删除整个块。
 */
function resolveConditionalBlock(
  template: string,
  key: string,
  value: string,
): string {
  const regex = new RegExp(
    `\\{\\{#${key}\\}\\}([\\s\\S]*?)\\{\\{/${key}\\}\\}`,
    'g',
  );
  if (value) {
    return template.replace(regex, (_match, content: string) => {
      return content.replace(`{{${key}Text}}`, value);
    });
  }
  return template.replace(regex, '');
}
