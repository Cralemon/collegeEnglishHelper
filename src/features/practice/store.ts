'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Question, AnswerRecord } from '@/types';
import { STORAGE_KEYS } from '@/services/storage';

// ============================================================
// State & Actions 类型
// ============================================================

interface PracticeState {
  /** 当前题集的题目列表 */
  questions: Question[];
  /** 当前题目索引 */
  currentIndex: number;
  /** 用户输入草稿（未提交） */
  draft: string;
  /** 作答记录（按时间正序） */
  answerRecords: AnswerRecord[];
  /** AI 评估中 */
  isEvaluating: boolean;
  /** 卡片是否翻转（显示反馈面） */
  isFlipped: boolean;
}

interface PracticeActions {
  /** 加载题集 */
  setQuestions: (questions: Question[]) => void;
  /** 跳转到指定题目 */
  setCurrentIndex: (index: number) => void;
  /** 下一题 */
  nextQuestion: () => void;
  /** 上一题 */
  prevQuestion: () => void;
  /** 更新输入草稿 */
  setDraft: (draft: string) => void;
  /** 提交作答记录 */
  submitAnswer: (record: AnswerRecord) => void;
  /** 设置评估状态 */
  setEvaluating: (isEvaluating: boolean) => void;
  /** 设置翻转状态 */
  setFlipped: (isFlipped: boolean) => void;
  /** 打乱题目顺序 */
  shuffleQuestions: () => void;
  /** 重置练习状态（保留题目） */
  resetPractice: () => void;
  /** 清空全部数据 */
  clearAll: () => void;
}

// ============================================================
// 初始状态
// ============================================================

const initialState: PracticeState = {
  questions: [],
  currentIndex: 0,
  draft: '',
  answerRecords: [],
  isEvaluating: false,
  isFlipped: false,
};

// ============================================================
// Store
// ============================================================

export const usePracticeStore = create<PracticeState & PracticeActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setQuestions: (questions) =>
        set({ questions, currentIndex: 0, draft: '', isFlipped: false }),

      setCurrentIndex: (index) => {
        const { questions } = get();
        if (index >= 0 && index < questions.length) {
          set({ currentIndex: index, draft: '', isFlipped: false });
        }
      },

      nextQuestion: () => {
        const { currentIndex, questions } = get();
        if (currentIndex < questions.length - 1) {
          set({ currentIndex: currentIndex + 1, draft: '', isFlipped: false });
        }
      },

      prevQuestion: () => {
        const { currentIndex } = get();
        if (currentIndex > 0) {
          set({ currentIndex: currentIndex - 1, draft: '', isFlipped: false });
        }
      },

      setDraft: (draft) => set({ draft }),

      submitAnswer: (record) =>
        set((state) => ({
          answerRecords: [...state.answerRecords, record],
          isFlipped: true,
          draft: '',
        })),

      setEvaluating: (isEvaluating) => set({ isEvaluating }),

      setFlipped: (isFlipped) => set({ isFlipped }),

      shuffleQuestions: () =>
        set((state) => {
          const shuffled = [...state.questions];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          return { questions: shuffled, currentIndex: 0, draft: '', isFlipped: false };
        }),

      resetPractice: () =>
        set({ currentIndex: 0, draft: '', isFlipped: false, isEvaluating: false }),

      clearAll: () => set(initialState),
    }),
    {
      name: STORAGE_KEYS.QUESTIONS,
      // 只持久化题目和作答记录，不持久化临时状态
      partialize: (state) => ({
        questions: state.questions,
        currentIndex: state.currentIndex,
        answerRecords: state.answerRecords,
      }),
    },
  ),
);
