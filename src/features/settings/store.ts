'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  UserProfile,
  LLMConfig,
  Collection,
  GradeLevel,
  TranslationMode,
  TranslationDirection,
  ThemePreference,
  TopicPreference,
  PresetTopic,
} from '@/types';
import { STORAGE_KEYS } from '@/services/storage';

// ============================================================
// 默认值
// ============================================================

const defaultUserProfile: UserProfile = {
  nickname: '',
  gradeLevel: '大一',
  vocabularyLevel: 4000,
  translationMode: 'single',
  translationDirection: 'zh-en',
  theme: 'system',
  topicPreference: {
    presetTopics: [],
    customTopics: '',
  },
};

const defaultLLMConfig: LLMConfig = {
  apiUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4o',
};

// ============================================================
// State & Actions 类型
// ============================================================

interface SettingsState {
  /** 用户个人信息与偏好 */
  userProfile: UserProfile;
  /** LLM API 配置 */
  llmConfig: LLMConfig;
  /** 题集列表 */
  collections: Collection[];
  /** 当前激活的题集 ID */
  activeCollectionId: string | null;
}

interface SettingsActions {
  // --- 用户信息 ---
  setNickname: (nickname: string) => void;
  setGradeLevel: (gradeLevel: GradeLevel) => void;
  setVocabularyLevel: (level: number) => void;

  // --- 翻译偏好 ---
  setTranslationMode: (mode: TranslationMode) => void;
  setTranslationDirection: (direction: TranslationDirection) => void;
  setTheme: (theme: ThemePreference) => void;

  // --- 题目偏好 ---
  togglePresetTopic: (topic: PresetTopic) => void;
  setCustomTopics: (text: string) => void;

  // --- LLM 配置 ---
  setLLMConfig: (config: Partial<LLMConfig>) => void;

  // --- 题集管理 ---
  addCollection: (collection: Collection) => void;
  updateCollection: (id: string, updates: Partial<Omit<Collection, 'id' | 'createdAt'>>) => void;
  removeCollection: (id: string) => void;
  setActiveCollection: (id: string | null) => void;
}

// ============================================================
// 初始状态
// ============================================================

const initialState: SettingsState = {
  userProfile: defaultUserProfile,
  llmConfig: defaultLLMConfig,
  collections: [],
  activeCollectionId: null,
};

// ============================================================
// Store
// ============================================================

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      ...initialState,

      // --- 用户信息 ---
      setNickname: (nickname) =>
        set((state) => ({
          userProfile: { ...state.userProfile, nickname },
        })),

      setGradeLevel: (gradeLevel) =>
        set((state) => ({
          userProfile: { ...state.userProfile, gradeLevel },
        })),

      setVocabularyLevel: (vocabularyLevel) =>
        set((state) => ({
          userProfile: { ...state.userProfile, vocabularyLevel },
        })),

      // --- 翻译偏好 ---
      setTranslationMode: (translationMode) =>
        set((state) => ({
          userProfile: { ...state.userProfile, translationMode },
        })),

      setTranslationDirection: (translationDirection) =>
        set((state) => ({
          userProfile: { ...state.userProfile, translationDirection },
        })),

      setTheme: (theme) =>
        set((state) => ({
          userProfile: { ...state.userProfile, theme },
        })),

      // --- 题目偏好 ---
      togglePresetTopic: (topic) =>
        set((state) => {
          const current = state.userProfile.topicPreference.presetTopics;
          const next = current.includes(topic)
            ? current.filter((t) => t !== topic)
            : [...current, topic];
          return {
            userProfile: {
              ...state.userProfile,
              topicPreference: { ...state.userProfile.topicPreference, presetTopics: next },
            },
          };
        }),

      setCustomTopics: (text) =>
        set((state) => ({
          userProfile: {
            ...state.userProfile,
            topicPreference: { ...state.userProfile.topicPreference, customTopics: text },
          },
        })),

      // --- LLM 配置 ---
      setLLMConfig: (config) =>
        set((state) => ({
          llmConfig: { ...state.llmConfig, ...config },
        })),

      // --- 题集管理 ---
      addCollection: (collection) =>
        set((state) => ({
          collections: [...state.collections, collection],
        })),

      updateCollection: (id, updates) =>
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === id
              ? { ...c, ...updates, updatedAt: Date.now() }
              : c,
          ),
        })),

      removeCollection: (id) =>
        set((state) => ({
          collections: state.collections.filter((c) => c.id !== id),
          activeCollectionId:
            state.activeCollectionId === id ? null : state.activeCollectionId,
        })),

      setActiveCollection: (id) => set({ activeCollectionId: id }),
    }),
    {
      name: STORAGE_KEYS.USER_PROFILE,
      // 分别持久化用户信息、LLM 配置、题集
      partialize: (state) => ({
        userProfile: state.userProfile,
        llmConfig: state.llmConfig,
        collections: state.collections,
        activeCollectionId: state.activeCollectionId,
      }),
    },
  ),
);
