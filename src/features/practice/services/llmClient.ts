/**
 * LLM API 客户端
 *
 * 通过 OpenAI 兼容 API 调用 LLM：
 * - evaluateTranslation()  — 翻译反馈评估
 * - generateQuestions()     — 题目生成
 *
 * 错误时抛出 LLMError（code 区分类型），调用方按需 fallback。
 */

import type { AIFeedback, LLMConfig, Question } from '@/types';
import {
  buildFeedbackPrompt,
  buildQuestionGenerationPrompt,
} from './prompts';
import type {
  FeedbackPromptParams,
  QuestionGenerationPromptParams,
} from './prompts';

// ============================================================
// 错误类型
// ============================================================

/** LLM 调用错误码 */
export type LLMErrorCode =
  | 'NO_API_KEY'
  | 'NETWORK_ERROR'
  | 'API_ERROR'
  | 'PARSE_ERROR';

export class LLMError extends Error {
  code: LLMErrorCode;
  constructor(code: LLMErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'LLMError';
  }
}

// ============================================================
// JSON 提取
// ============================================================

/**
 * 从 LLM 原始响应中提取 JSON 字符串。
 * 处理常见的包装格式：```json ... ```、裸 JSON、前导说明文字。
 */
function extractJSON(text: string): string {
  // 1. 优先提取 ```json code block
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) {
    return codeBlock[1].trim();
  }

  // 2. 尝试定位最外层 { } 或 [ ]
  const objStart = text.indexOf('{');
  const arrStart = text.indexOf('[');
  let start = -1;
  let end = -1;

  if (objStart !== -1 && (arrStart === -1 || objStart < arrStart)) {
    start = objStart;
    end = text.lastIndexOf('}');
  } else if (arrStart !== -1) {
    start = arrStart;
    end = text.lastIndexOf(']');
  }

  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1);
  }

  // 3. 回退：返回原文
  return text.trim();
}

// ============================================================
// LLM 调用
// ============================================================

/**
 * 调用 OpenAI 兼容 Chat Completions API。
 *
 * 超时 60s，非 2xx 响应抛出 LLMError('API_ERROR')。
 */
async function callLLM(
  config: LLMConfig,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  if (!config.apiKey || config.apiKey.trim() === '') {
    throw new LLMError('NO_API_KEY', '未配置 API Key');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);

  let response: Response;
  try {
    response = await fetch(`${config.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new LLMError('NETWORK_ERROR', '请求超时（60s）');
    }
    throw new LLMError('NETWORK_ERROR', `网络请求失败：${String(err)}`);
  }
  clearTimeout(timer);

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new LLMError(
      'API_ERROR',
      `API 返回 ${response.status} ${response.statusText}${body ? `：${body.slice(0, 200)}` : ''}`,
    );
  }

  const data = await response.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;

  if (!content || typeof content !== 'string') {
    throw new LLMError('PARSE_ERROR', 'LLM 响应缺少 choices[0].message.content');
  }

  return content;
}

// ============================================================
// 翻译反馈评估
// ============================================================

/**
 * 调用 LLM 评估翻译质量，返回结构化 AIFeedback。
 *
 * 流程：构建 prompt → 调用 API → 提取 JSON → 解析为 AIFeedback
 * 任何步骤失败抛出 LLMError，调用方应 fallback 到 mock 数据。
 */
export async function evaluateTranslation(
  config: LLMConfig,
  params: FeedbackPromptParams,
): Promise<AIFeedback> {
  const { systemPrompt, userPrompt } = buildFeedbackPrompt(params);

  const raw = await callLLM(config, systemPrompt, userPrompt);
  const jsonText = extractJSON(raw);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new LLMError('PARSE_ERROR', `无法解析 LLM 返回的 JSON：${jsonText.slice(0, 200)}`);
  }

  // 基础结构校验
  if (typeof parsed !== 'object' || parsed === null) {
    throw new LLMError('PARSE_ERROR', 'LLM 返回的 JSON 不是对象');
  }

  const feedback = parsed as Record<string, unknown>;

  for (const dim of ['grammar', 'vocabulary', 'sentenceStructure']) {
    const d = feedback[dim] as Record<string, unknown> | undefined;
    if (!d || typeof d.score !== 'number') {
      throw new LLMError(
        'PARSE_ERROR',
        `LLM 返回缺少 ${dim}.score 字段`,
      );
    }
  }

  if (!feedback.translationStrategy || !Array.isArray(feedback.overallSuggestion)) {
    throw new LLMError(
      'PARSE_ERROR',
      'LLM 返回缺少 translationStrategy 或 overallSuggestion 字段',
    );
  }

  return feedback as unknown as AIFeedback;
}

// ============================================================
// 题目生成
// ============================================================

/**
 * 调用 LLM 生成翻译练习题目。
 *
 * 流程：构建 prompt → 调用 API → 提取 JSON → 解析为 Question[]
 * 返回的 Question 自动补齐 id 和 createdAt。
 * 任何步骤失败抛出 LLMError，调用方应 fallback 到 mock 数据。
 */
export async function generateQuestions(
  config: LLMConfig,
  params: QuestionGenerationPromptParams,
): Promise<Question[]> {
  const { systemPrompt, userPrompt } = buildQuestionGenerationPrompt(params);

  const raw = await callLLM(config, systemPrompt, userPrompt);
  const jsonText = extractJSON(raw);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new LLMError('PARSE_ERROR', `无法解析 LLM 返回的 JSON：${jsonText.slice(0, 200)}`);
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new LLMError('PARSE_ERROR', 'LLM 返回的 JSON 不是对象');
  }

  const wrapper = parsed as Record<string, unknown>;
  const rawQuestions: unknown[] = Array.isArray(wrapper.questions)
    ? wrapper.questions
    : [];

  if (rawQuestions.length === 0) {
    throw new LLMError('PARSE_ERROR', 'LLM 返回的 questions 数组为空');
  }

  const now = Date.now();
  const questions: Question[] = rawQuestions.map((q, i) => {
    const item = q as Record<string, unknown>;
    return {
      id: `q_llm_${now}_${i}`,
      sourceText: String(item.sourceText ?? ''),
      translationDirection: (item.translationDirection as Question['translationDirection']) ?? params.direction,
      category: String(item.category ?? 'general'),
      difficulty: (item.difficulty as Question['difficulty']) ?? 'medium',
      createdAt: now,
    };
  });

  return questions;
}

// ============================================================
// 水平测试评估
// ============================================================

/** 水平测试单题作答 */
export interface LevelTestAnswer {
  sourceText: string;
  userTranslation: string;
}

/** 水平测试评估结果 */
export interface LevelTestResult {
  gradeLevel: string;
  vocabularyLevel: number;
  overallAssessment: string;
}

const LEVEL_EVAL_SYSTEM_PROMPT = `你是一位大学英语水平评估专家。你会根据学生的翻译测试题答案，评估其英语水平。

## 评估维度

1. 学年段（gradeLevel）：大一 / 大二 / 大三 / 大四 / 研一 / 研二 / 研三
2. 预估词汇量（vocabularyLevel）：1000 ~ 15000 的整数
3. 综合评语（overallAssessment）：1-2 句话总结学生水平

## 评估标准

- 大一~大二：基础语法尚可，词汇量有限（<5000），复杂句型驾驭不足
- 大三~大四：语法较扎实，词汇量中等（5000-8000），能处理中等复杂度句子
- 研究生：语法扎实，词汇量大（>8000），能处理学术/专业文本

## 输出格式

必须输出严格 JSON：
{
  "gradeLevel": "大二",
  "vocabularyLevel": 4500,
  "overallAssessment": "学生具备基础翻译能力，语法基本正确，但词汇量和复杂句型处理有待提升。"
}

仅输出 JSON，不要添加任何解释文字。`;

/**
 * 调用 LLM 评估学生水平，返回学年段 + 词汇量 + 评语。
 */
export async function evaluateLevel(
  config: LLMConfig,
  answers: LevelTestAnswer[],
): Promise<LevelTestResult> {
  const answersText = answers
    .map(
      (a, i) =>
        `【题目${i + 1}】\n原文：${a.sourceText}\n学生翻译：${a.userTranslation}`,
    )
    .join('\n\n');

  const raw = await callLLM(config, LEVEL_EVAL_SYSTEM_PROMPT, answersText);
  const jsonText = extractJSON(raw);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new LLMError(
      'PARSE_ERROR',
      `水平测试：无法解析 LLM 返回的 JSON：${jsonText.slice(0, 200)}`,
    );
  }

  const result = parsed as Record<string, unknown>;

  if (!result.gradeLevel || typeof result.gradeLevel !== 'string') {
    throw new LLMError('PARSE_ERROR', '水平测试：缺少 gradeLevel 字段');
  }
  if (!result.vocabularyLevel || typeof result.vocabularyLevel !== 'number') {
    throw new LLMError('PARSE_ERROR', '水平测试：缺少 vocabularyLevel 字段');
  }

  return {
    gradeLevel: result.gradeLevel,
    vocabularyLevel: Math.round(result.vocabularyLevel),
    overallAssessment:
      typeof result.overallAssessment === 'string'
        ? result.overallAssessment
        : '',
  };
}
