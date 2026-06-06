'use client';

import { usePracticeStore } from '@/features/practice';
import {
  FlashCard,
  CardFront,
  CardBack,
  EmptyState,
} from '@/features/practice/components';

export default function HomePage() {
  const { questions, isFlipped, setFlipped, nextQuestion, prevQuestion } =
    usePracticeStore();

  if (questions.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-display-sm text-ink">翻译练习</h1>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-display-sm text-ink">翻译练习</h1>

      <FlashCard
        isFlipped={isFlipped}
        onFlip={setFlipped}
        front={<CardFront />}
        back={<CardBack />}
        onSwipeLeft={nextQuestion}
        onSwipeRight={prevQuestion}
      />
    </div>
  );
}
