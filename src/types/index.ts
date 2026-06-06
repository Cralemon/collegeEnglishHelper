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

/** 问题严重程度 */
export type IssueSeverity = 'error' | 'warning' | 'suggestion';

/** 标准化问题分类（用于改进点聚合） */
export type IssueCategory =
  | 'grammar.tense'
  | 'grammar.voice'
  | 'grammar.agreement'
  | 'grammar.article'
  | 'grammar.preposition'
  | 'grammar.clause'
  | 'grammar.subjunctive'
  | 'grammar.word-order'
  | 'vocab.accuracy'
  | 'vocab.collocation'
  | 'vocab.formality'
  | 'vocab.diversity'
  | 'structure.choppy'
  | 'structure.run-on'
  | 'structure.parallelism'
  | 'structure.coherence';

/** 具体问题（挂在维度下） */
export interface Issue {
  /** 用户原文片段 */
  userFragment: string;
  /** 建议修改 */
  suggestedFix: string;
  /** 原因说明 */
  reason: string;
  severity: IssueSeverity;
  category: IssueCategory;
}

/** 关键词处理评估 */
export interface KeyPointHandling {
  originalFragment: string;
  userTranslation: string;
  evaluation: '优秀' | '合格' | '待改进';
  alternativeSuggestion?: string;
}

/** 翻译策略分析 */
export interface TranslationStrategy {
  approach: '直译为主' | '意译为主' | '直译意译结合';
  strengths: string[];
  suggestions: string[];
  keyPoints: KeyPointHandling[];
}

/** 单维度反馈（语法/词汇/句型） */
export interface DimensionFeedback {
  /** 维度分数 0-100 */
  score: number;
  /** 优点列表 */
  strengths: string[];
  /** 改进点概述 */
  improvements: string[];
  /** 具体问题列表 */
  issues: Issue[];
  /** 学习技巧（可选） */
  tips?: string[];
}

/** AI 三维评估反馈 */
export interface AIFeedback {
  grammar: DimensionFeedback;
  vocabulary: DimensionFeedback;
  sentenceStructure: DimensionFeedback;
  translationStrategy: TranslationStrategy;
  /** 整体学习建议 */
  overallSuggestion: string[];
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
  | 'red-theme'
  | 'political'
  | 'motivational'
  | 'technology'
  | 'culture'
  | 'daily-life'
  | 'business'
  | 'academic';

/** 题目偏好配置 */
export interface TopicPreference {
  presetTopics: PresetTopic[];
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

/** 改进点（从 AI 反馈中提取，按 IssueCategory 聚合） */
export interface ImprovementPoint {
  id: string;
  category: IssueCategory;
  dimension: FeedbackDimension;
  description: string;
  frequency: number;
  recentIssueIds: string[];
  firstSeen: number;
  lastSeen: number;
  /** 掌握度 0-100，出现时 -10，连续未出现时 +5 */
  mastery: number;
}

// ============================================================
// 用户学习数据
// ============================================================

/** 薄弱分类详情 */
export interface WeakCategory {
  category: IssueCategory;
  frequency: number;
  mastery: number;
  suggestedFocus: string;
}

/** 用户学习数据（用于个性化出题） */
export interface LearningData {
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
