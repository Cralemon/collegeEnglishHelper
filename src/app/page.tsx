'use client';

import { useState, useCallback } from 'react';
import { usePracticeStore } from '@/features/practice';
import { useSettingsStore } from '@/features/settings';
import {
  FlashCard,
  CardFront,
  CardBack,
  EmptyState,
} from '@/features/practice/components';
import { mockGenerateQuestions } from '@/features/practice/services/mockGenerateQuestions';

export default function HomePage() {
  const { questions, isFlipped, setFlipped, nextQuestion, prevQuestion, setQuestions } =
    usePracticeStore();
  const { userProfile } = useSettingsStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    // 模拟生成延迟
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
    const newQuestions = mockGenerateQuestions(userProfile, 10);
    setQuestions(newQuestions);
    setIsGenerating(false);
  }, [userProfile, setQuestions]);

  if (questions.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <h1 className="font-display text-display-sm text-ink mb-6">翻译练习</h1>
        <div className="flex-1 flex items-center justify-center min-h-0">
          <EmptyState
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <h1 className="font-display text-display-sm text-ink mb-6">翻译练习</h1>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <FlashCard
          isFlipped={isFlipped}
          onFlip={setFlipped}
          front={<CardFront />}
          back={<CardBack />}
          onSwipeLeft={nextQuestion}
          onSwipeRight={prevQuestion}
        />
      </div>
    </div>
  );
}
