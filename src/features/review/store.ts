'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AnswerRecord,
  FeedbackDimension,
  ImprovementPoint,
  IssueCategory,
  LearningData,
  Question,
  WeakCategory,
} from '@/types';
import { STORAGE_KEYS } from '@/services/storage';

// ============================================================
// State & Actions 类型
// ============================================================

interface ReviewState {
  /** 改进点列表（从 AI 反馈 issues 中按 IssueCategory 聚合） */
  improvementPoints: ImprovementPoint[];
  /** 用户学习数据（用于个性化出题） */
  learningData: LearningData | null;
}

interface ReviewActions {
  /** 从作答记录中提取改进点并更新学习数据 */
  extractImprovements: (records: AnswerRecord[]) => void;
  /** 手动更新指定改进点的掌握度（测试/调试用） */
  updateMastery: (pointId: string, isOccurred: boolean) => void;
  /** 清空改进点与学习数据 */
  clearImprovements: () => void;
}

// ============================================================
// 辅助函数：category → dimension 映射
// ============================================================

const DIMENSIONS: FeedbackDimension[] = ['grammar', 'vocabulary', 'sentenceStructure'];

function categoryToDimension(category: IssueCategory): FeedbackDimension {
  if (category.startsWith('grammar.')) return 'grammar';
  if (category.startsWith('vocab.')) return 'vocabulary';
  return 'sentenceStructure';
}

// category 的中文描述（用于 description 字段）
export const categoryDescription: Record<IssueCategory, string> = {
  'grammar.tense': '时态使用',
  'grammar.voice': '语态（主动/被动）',
  'grammar.agreement': '主谓一致',
  'grammar.article': '冠词使用',
  'grammar.preposition': '介词搭配',
  'grammar.clause': '从句结构',
  'grammar.subjunctive': '虚拟语气',
  'grammar.word-order': '语序',
  'vocab.accuracy': '词义准确性',
  'vocab.collocation': '词汇搭配',
  'vocab.formality': '语体正式度',
  'vocab.diversity': '词汇多样性',
  'structure.choppy': '句子碎片化',
  'structure.run-on': '句子过长',
  'structure.parallelism': '并列结构一致性',
  'structure.coherence': '段落连贯性',
};

// 薄弱点建议文案
const suggestedFocusText: Record<IssueCategory, string> = {
  'grammar.tense': '重点练习时态判断与使用',
  'grammar.voice': '注意区分主动与被动语态',
  'grammar.agreement': '加强主谓一致性的敏感度',
  'grammar.article': '重点练习冠词使用规则',
  'grammar.preposition': '积累常用介词搭配',
  'grammar.clause': '练习从句构造与连接词使用',
  'grammar.subjunctive': '掌握虚拟语气的使用场景',
  'grammar.word-order': '注意中英语序差异',
  'vocab.accuracy': '提升选词的精确度',
  'vocab.collocation': '积累地道词汇搭配',
  'vocab.formality': '注意语体正式度的把控',
  'vocab.diversity': '扩展词汇量，避免重复用词',
  'structure.choppy': '练习句子合并，减少碎片化',
  'structure.run-on': '学习断句技巧，避免过长句',
  'structure.parallelism': '注意并列结构的一致性',
  'structure.coherence': '加强段落逻辑连贯性',
};

// ============================================================
// 辅助函数：从反馈中提取改进点（纯统计，不处理 mastery）
// ============================================================

/** 提取的原始统计数据（不含掌握度信息） */
interface RawPointStats {
  dimension: FeedbackDimension;
  description: string;
  frequency: number;
  recentIssueIds: string[];
  firstSeen: number;
  lastSeen: number;
}

/**
 * 从作答记录中提取 issues，按 IssueCategory 聚合为基础统计
 * 不涉及 mastery 计算——mastery 由 extractImprovements 结合历史状态处理
 */
function extractStatsFromRecords(
  records: AnswerRecord[],
): Map<IssueCategory, RawPointStats> {
  const pointMap = new Map<IssueCategory, RawPointStats>();

  for (const record of records) {
    const { feedback, id: recordId, answeredAt } = record;

    for (const dimension of DIMENSIONS) {
      const dimFeedback = feedback[dimension];
      if (!dimFeedback?.issues) continue;

      for (const issue of dimFeedback.issues) {
        const { category } = issue;
        const existing = pointMap.get(category);

        if (existing) {
          existing.frequency += 1;
          existing.lastSeen = Math.max(existing.lastSeen, answeredAt);
          if (!existing.recentIssueIds.includes(recordId)) {
            existing.recentIssueIds.push(recordId);
          }
        } else {
          pointMap.set(category, {
            dimension: categoryToDimension(category),
            description: categoryDescription[category],
            frequency: 1,
            recentIssueIds: [recordId],
            firstSeen: answeredAt,
            lastSeen: answeredAt,
          });
        }
      }
    }
  }

  return pointMap;
}

// ============================================================
// 辅助函数：计算 LearningData
// ============================================================

function computeLearningData(
  records: AnswerRecord[],
  points: ImprovementPoint[],
): LearningData | null {
  if (records.length === 0) {
    return null;
  }

  // totalQuestions & averageScore
  const totalQuestions = records.length;
  const averageScore = Math.round(
    records.reduce((sum, r) => sum + r.score, 0) / totalQuestions,
  );

  // 各维度平均分
  const dimensionScores = {
    grammar: Math.round(
      records.reduce((sum, r) => sum + r.feedback.grammar.score, 0) /
        totalQuestions,
    ),
    vocabulary: Math.round(
      records.reduce((sum, r) => sum + r.feedback.vocabulary.score, 0) /
        totalQuestions,
    ),
    sentenceStructure: Math.round(
      records.reduce(
        (sum, r) => sum + r.feedback.sentenceStructure.score,
        0,
      ) / totalQuestions,
    ),
  };

  // weakCategories: mastery < 50
  const weakCategories: WeakCategory[] = points
    .filter((p) => p.mastery < 50)
    .map((p) => ({
      category: p.category,
      frequency: p.frequency,
      mastery: p.mastery,
      suggestedFocus: suggestedFocusText[p.category],
    }));

  // strongCategories: mastery > 80
  const strongCategories: IssueCategory[] = points
    .filter((p) => p.mastery > 80)
    .map((p) => p.category);

  // recentTrend: 对比近 10 次 vs 前 10 次平均分
  let recentTrend: LearningData['recentTrend'] = 'stable';
  if (records.length >= 5) {
    const sorted = [...records].sort((a, b) => a.answeredAt - b.answeredAt);
    const recent = sorted.slice(-10);
    const older = sorted.slice(-20, -10);

    if (older.length > 0) {
      const recentAvg =
        recent.reduce((sum, r) => sum + r.score, 0) / recent.length;
      const olderAvg =
        older.reduce((sum, r) => sum + r.score, 0) / older.length;
      const diff = recentAvg - olderAvg;

      if (diff > 5) recentTrend = 'improving';
      else if (diff < -5) recentTrend = 'declining';
      else recentTrend = 'stable';
    }
  }

  return {
    totalQuestions,
    averageScore,
    dimensionScores,
    weakCategories,
    strongCategories,
    recentTrend,
  };
}

// ============================================================
// 初始状态
// ============================================================

const initialState: ReviewState = {
  improvementPoints: [],
  learningData: null,
};

// ============================================================
// Store
// ============================================================

export const useReviewStore = create<ReviewState & ReviewActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      extractImprovements: (records) => {
        // Step 1: 从当前记录提取原始统计
        const freshStats = extractStatsFromRecords(records);

        // Step 2: 获取旧的改进点（用于 mastery 追踪）
        const oldPoints = get().improvementPoints;
        const oldMap = new Map(oldPoints.map((p) => [p.category, p]));

        const newPoints: ImprovementPoint[] = [];

        // Step 3: 处理本次出现的 categories
        for (const [category, stats] of freshStats) {
          const old = oldMap.get(category);
          if (old) {
            // 再次出现：基于旧 mastery 扣减
            newPoints.push({
              id: category,
              category,
              ...stats,
              mastery: Math.max(0, old.mastery - 10),
              consecutiveAbsences: 0,
            });
          } else {
            // 新出现的 category
            newPoints.push({
              id: category,
              category,
              ...stats,
              mastery: 50,
              consecutiveAbsences: 0,
            });
          }
          oldMap.delete(category);
        }

        // Step 4: 本次未出现的 categories（检查连续缺席）
        for (const [, old] of oldMap) {
          const consecutiveAbsences = (old.consecutiveAbsences ?? 0) + 1;
          const mastery =
            consecutiveAbsences >= 5
              ? Math.min(100, old.mastery + 5)
              : old.mastery;
          newPoints.push({
            ...old,
            consecutiveAbsences,
            mastery,
          });
        }

        // 按 frequency 降序
        newPoints.sort((a, b) => b.frequency - a.frequency);

        // Step 5: 计算学习数据
        const learningData = computeLearningData(records, newPoints);

        set({ improvementPoints: newPoints, learningData });
      },

      updateMastery: (pointId, isOccurred) => {
        set((state) => ({
          improvementPoints: state.improvementPoints.map((p) => {
            if (p.id !== pointId) return p;
            const mastery = isOccurred
              ? Math.max(0, p.mastery - 10)
              : Math.min(100, p.mastery + 5);
            return {
              ...p,
              mastery,
              consecutiveAbsences: isOccurred ? 0 : p.consecutiveAbsences,
            };
          }),
        }));
      },

      clearImprovements: () =>
        set({ improvementPoints: [], learningData: null }),
    }),
    {
      name: STORAGE_KEYS.IMPROVEMENTS,
      partialize: (state) => ({
        improvementPoints: state.improvementPoints,
        learningData: state.learningData,
      }),
    },
  ),
);

// ============================================================
// 派生统计工具（纯函数，不存储状态）
// ============================================================

export interface PracticeStatistics {
  /** 总作答数 */
  totalAnswers: number;
  /** 平均分 */
  averageScore: number;
  /** 最高分 */
  maxScore: number;
  /** 最低分 */
  minScore: number;
  /** 分数分布（10 分一档） */
  scoreDistribution: { range: string; count: number }[];
  /** 弱势题目（< 50 分）的 questionId 列表 */
  weakQuestionIds: string[];
}

/**
 * 从作答记录计算统计信息
 */
export function computeStatistics(records: AnswerRecord[]): PracticeStatistics {
  if (records.length === 0) {
    return {
      totalAnswers: 0,
      averageScore: 0,
      maxScore: 0,
      minScore: 0,
      scoreDistribution: [],
      weakQuestionIds: [],
    };
  }

  const scores = records.map((r) => r.score);
  const totalAnswers = records.length;
  const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / totalAnswers);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);

  const distribution = Array.from({ length: 11 }, (_, i) => {
    const min = i * 10;
    const max = i === 10 ? 100 : min + 9;
    const count = scores.filter((s) => s >= min && s <= max).length;
    return { range: `${min}-${max}`, count };
  });

  const weakQuestionIds = [
    ...new Set(records.filter((r) => r.score < 50).map((r) => r.questionId)),
  ];

  return {
    totalAnswers,
    averageScore,
    maxScore,
    minScore,
    scoreDistribution: distribution,
    weakQuestionIds,
  };
}

// ============================================================
// 方向拆分统计
// ============================================================

export interface DirectionSplitStats {
  enzh: { records: AnswerRecord[]; stats: PracticeStatistics };
  zhen: { records: AnswerRecord[]; stats: PracticeStatistics };
}

/**
 * 按翻译方向拆分作答记录并分别计算统计
 * - en-zh = 英译汉
 * - zh-en = 汉译英
 */
export function computeDirectionSplitStats(
  records: AnswerRecord[],
  questions: Question[],
): DirectionSplitStats {
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  const enzh: AnswerRecord[] = [];
  const zhen: AnswerRecord[] = [];

  for (const r of records) {
    const q = questionMap.get(r.questionId);
    if (!q) continue;
    if (q.translationDirection === 'en-zh') {
      enzh.push(r);
    } else {
      zhen.push(r);
    }
  }

  return {
    enzh: { records: enzh, stats: computeStatistics(enzh) },
    zhen: { records: zhen, stats: computeStatistics(zhen) },
  };
}
