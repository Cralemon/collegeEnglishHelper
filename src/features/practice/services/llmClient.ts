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
