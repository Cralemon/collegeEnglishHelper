'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AnswerRecord, ImprovementPoint, FeedbackDimension } from '@/types';
import { STORAGE_KEYS } from '@/services/storage';

// ============================================================
// State & Actions 类型
// ============================================================

interface ReviewState {
  /** 改进点列表（从 AI 反馈中提取，按频率统计） */
  improvementPoints: ImprovementPoint[];
}

interface ReviewActions {
  /**
   * 从作答记录中提取改进点并更新统计
   * 对同一条改进点出现多次时 frequency +1
   */
  extractImprovements: (records: AnswerRecord[]) => void;
  /** 清空改进点 */
  clearImprovements: () => void;
}

// ============================================================
// 辅助函数：从反馈中提取改进点
// ============================================================

const DIMENSIONS: FeedbackDimension[] = ['grammar', 'vocabulary', 'sentenceStructure'];

/**
 * 生成改进点的唯一键（用于去重）
 */
function improvementKey(dimension: FeedbackDimension, content: string): string {
  return `${dimension}:${content.trim().toLowerCase()}`;
}

/**
 * 从作答记录中提取所有改进点，合并去重并统计频率
 */
function extractFromRecords(records: AnswerRecord[]): ImprovementPoint[] {
  const now = Date.now();
  const pointMap = new Map<string, ImprovementPoint>();

  for (const record of records) {
    const { feedback, questionId, answeredAt } = record;

    for (const dimension of DIMENSIONS) {
      const dimFeedback = feedback[dimension];
      if (!dimFeedback?.improvements) continue;

      for (const content of dimFeedback.improvements) {
        const key = improvementKey(dimension, content);
        const existing = pointMap.get(key);

        if (existing) {
          existing.frequency += 1;
          existing.lastSeen = Math.max(existing.lastSeen, answeredAt);
          if (!existing.relatedQuestionIds.includes(questionId)) {
            existing.relatedQuestionIds.push(questionId);
          }
        } else {
          pointMap.set(key, {
            id: key,
            dimension,
            content,
            frequency: 1,
            relatedQuestionIds: [questionId],
            firstSeen: answeredAt,
            lastSeen: answeredAt,
          });
        }
      }
    }
  }

  // 按频率降序排列
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
 *
 * @param records - 作答记录列表
 * @returns 统计信息对象
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

  // 分数分布：0-9, 10-19, ..., 90-100
  const distribution = Array.from({ length: 11 }, (_, i) => {
    const min = i * 10;
    const max = i === 10 ? 100 : min + 9;
    const count = scores.filter((s) => s >= min && s <= max).length;
    return { range: `${min}-${max}`, count };
  });

  // 弱势题目（< 50 分）
  const weakQuestionIds = [
    ...new Set(
      records.filter((r) => r.score < 50).map((r) => r.questionId),
    ),
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
