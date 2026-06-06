/**
 * 大学英语翻译练习助手 — 核心类型定义
 *
 * 所有业务实体的 TypeScript 接口，基于 FINAL_PLAN.md §5.1
 */

// ============================================================
// 题目
// ============================================================

/** 翻译方向 */
export type TranslationDirection = 'zh-en' | 'en-zh';

/** 题目难度 */
export type Difficulty = 'easy' | 'medium' | 'hard';

/** 翻译题目 */
export interface Question {
  id: string;
  sourceText: string;
  translationDirection: TranslationDirection;
  category: string;
  difficulty: Difficulty;
  createdAt: number;
}

// ============================================================
// AI 反馈
// ============================================================

/** 单维度反馈（语法/词汇/句型） */
export interface DimensionFeedback {
  /** 维度分数 0-100 */
  score: number;
  /** 优点列表 */
  strengths: string[];
  /** 改进点列表 */
  improvements: string[];
}

/** AI 三维评估反馈 */
export interface AIFeedback {
  grammar: DimensionFeedback;
  vocabulary: DimensionFeedback;
  sentenceStructure: DimensionFeedback;
  /** 总结评语 */
  summary: string;
}

// ============================================================
// 作答记录
// ============================================================

/** 单次作答记录 */
export interface AnswerRecord {
  id: string;
  questionId: string;
  userTranslation: string;
  /** 总分 0-100 */
  score: number;
  feedback: AIFeedback;
  answeredAt: number;
}

// ============================================================
// 题集
// ============================================================

/** 题集（题目集合） */
export interface Collection {
  id: string;
  name: string;
  description?: string;
  questionIds: string[];
  createdAt: number;
  updatedAt: number;
}

// ============================================================
// 用户信息
// ============================================================

/** 学年段 */
export type GradeLevel = '大一' | '大二' | '大三' | '大四' | '研一' | '研二' | '研三';

/** 翻译模式 */
export type TranslationMode = 'single' | 'paragraph';

/** 主题偏好 */
export type ThemePreference = 'light' | 'dark' | 'system';

/** 预设题目类型 */
export type PresetTopic =
  | 'red-theme'       // 红色主题（革命、爱国）
  | 'political'       // 政治
  | 'motivational'    // 励志
  | 'technology'      // 科技
  | 'culture'         // 文化
  | 'daily-life'      // 日常生活
  | 'business'        // 商务
  | 'academic';       // 学术

/** 题目偏好配置 */
export interface TopicPreference {
  /** 选中的预设类型 */
  presetTopics: PresetTopic[];
  /** 自定义偏好描述（自由文本） */
  customTopics: string;
}

/** 用户个人信息与偏好 */
export interface UserProfile {
  nickname: string;
  gradeLevel: GradeLevel;
  vocabularyLevel: number;
  translationMode: TranslationMode;
  translationDirection: TranslationDirection;
  theme: ThemePreference;
  /** 题目偏好 */
  topicPreference: TopicPreference;
}

// ============================================================
// LLM 配置
// ============================================================

/** LLM API 配置 */
export interface LLMConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
}

// ============================================================
// 改进点（统计用）
// ============================================================

/** 反馈维度（用于改进点分类） */
export type FeedbackDimension = 'grammar' | 'vocabulary' | 'sentenceStructure';

/** 改进点（从 AI 反馈中提取，按频率统计） */
export interface ImprovementPoint {
  id: string;
  dimension: FeedbackDimension;
  content: string;
  frequency: number;
  relatedQuestionIds: string[];
  firstSeen: number;
  lastSeen: number;
}
