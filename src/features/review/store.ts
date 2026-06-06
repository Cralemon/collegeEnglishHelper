'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AnswerRecord,
  FeedbackDimension,
  ImprovementPoint,
  IssueCategory,
} from '@/types';
import { STORAGE_KEYS } from '@/services/storage';

// ============================================================
// State & Actions 类型
// ============================================================

interface ReviewState {
  /** 改进点列表（从 AI 反馈 issues 中按 IssueCategory 聚合） */
  improvementPoints: ImprovementPoint[];
}

interface ReviewActions {
  /** 从作答记录中提取改进点并更新统计 */
  extractImprovements: (records: AnswerRecord[]) => void;
  /** 更新指定改进点的掌握度 */
  updateMastery: (pointId: string, isOccurred: boolean) => void;
  /** 清空改进点 */
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
const categoryDescription: Record<IssueCategory, string> = {
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

// ============================================================
// 辅助函数：从反馈中提取改进点
// ============================================================

/**
 * 从作答记录中提取所有 issues，按 IssueCategory 聚合为 ImprovementPoint
 */
function extractFromRecords(records: AnswerRecord[]): ImprovementPoint[] {
  const pointMap = new Map<IssueCategory, ImprovementPoint>();

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
          // 出现时掌握度 -10
          existing.mastery = Math.max(0, existing.mastery - 10);
        } else {
          pointMap.set(category, {
            id: category,
            category,
            dimension: categoryToDimension(category),
            description: categoryDescription[category],
            frequency: 1,
            recentIssueIds: [recordId],
            firstSeen: answeredAt,
            lastSeen: answeredAt,
            mastery: 50, // 初始掌握度
          });
        }
      }
    }
  }

  return Array.from(pointMap.values()).sort((a, b) => b.frequency - a.frequency);
}

// ============================================================
// 初始状态
// ============================================================

const initialState: ReviewState = {
  improvementPoints: [],
};

// ============================================================
// Store
// ============================================================

export const useReviewStore = create<ReviewState & ReviewActions>()(
  persist(
    (set) => ({
      ...initialState,

      extractImprovements: (records) => {
        const points = extractFromRecords(records);
        set({ improvementPoints: points });
      },

      updateMastery: (pointId, isOccurred) => {
        set((state) => ({
          improvementPoints: state.improvementPoints.map((p) => {
            if (p.id !== pointId) return p;
            const mastery = isOccurred
              ? Math.max(0, p.mastery - 10)
              : Math.min(100, p.mastery + 5);
            return { ...p, mastery };
          }),
        }));
      },

      clearImprovements: () => set({ improvementPoints: [] }),
    }),
    {
      name: STORAGE_KEYS.IMPROVEMENTS,
      partialize: (state) => ({
        improvementPoints: state.improvementPoints,
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
