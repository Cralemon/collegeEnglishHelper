'use client';

import { useState, useCallback, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Tabs, TabsList, TabsTrigger } from '@/components/ui';
import { useSettingsStore } from '@/features/settings';
import type { GradeLevel } from '@/types';

const GRADE_LEVELS: GradeLevel[] = ['大一', '大二', '大三', '大四', '研一', '研二', '研三'];

const VOCAB_MIN = 1000;
const VOCAB_MAX = 15000;
const VOCAB_STEP = 500;

export function UserProfileForm() {
  const userProfile = useSettingsStore((s) => s.userProfile);
  const setNickname = useSettingsStore((s) => s.setNickname);
  const setGradeLevel = useSettingsStore((s) => s.setGradeLevel);
  const setVocabularyLevel = useSettingsStore((s) => s.setVocabularyLevel);

  // 词汇量 slider 交互状态
  const [isDragging, setIsDragging] = useState(false);
  const [inputText, setInputText] = useState(String(userProfile.vocabularyLevel));
  const sliderRef = useRef<HTMLInputElement>(null);

  const vocabValue = userProfile.vocabularyLevel;
  const percent = ((vocabValue - VOCAB_MIN) / (VOCAB_MAX - VOCAB_MIN)) * 100;

  const commitVocabulary = useCallback(
    (raw: string) => {
      const n = parseInt(raw, 10);
      if (isNaN(n)) return;
      const clamped = Math.min(VOCAB_MAX, Math.max(VOCAB_MIN, Math.round(n / VOCAB_STEP) * VOCAB_STEP));
      setVocabularyLevel(clamped);
      setInputText(String(clamped));
    },
    [setVocabularyLevel],
  );

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Number(e.target.value);
      setVocabularyLevel(v);
      setInputText(String(v));
    },
    [setVocabularyLevel],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>用户信息</CardTitle>
        <CardDescription>设置你的个人资料，帮助 AI 更好地为你出题</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* 昵称 */}
        <div className="flex flex-col gap-2">
          <label className="text-body-sm font-medium text-ink">昵称</label>
          <Input
            placeholder="输入你的昵称"
            value={userProfile.nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>

        {/* 学年段 */}
        <div className="flex flex-col gap-2">
          <label className="text-body-sm font-medium text-ink">学年段</label>
          <Tabs
            defaultValue={userProfile.gradeLevel}
            value={userProfile.gradeLevel}
            onValueChange={(v) => setGradeLevel(v as GradeLevel)}
          >
            <TabsList variant="underline" className="w-full flex-wrap">
              {GRADE_LEVELS.map((level) => (
                <TabsTrigger key={level} value={level} variant="underline">
                  {level}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* 预估词汇量 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-body-sm font-medium text-ink">预估词汇量</label>
            <input
              type="number"
              min={VOCAB_MIN}
              max={VOCAB_MAX}
              step={VOCAB_STEP}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                commitVocabulary(e.target.value);
              }}
              onBlur={() => setInputText(String(vocabValue))}
              className="w-20 h-8 px-2 text-body-sm font-medium text-primary tabular-nums text-right bg-surface-card border border-hairline rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          {/* Slider + tooltip */}
          <div className="relative">
            {/* Tooltip */}
            <div
              className="absolute -top-8 -translate-x-1/2 bg-surface-dark text-on-dark text-caption font-medium px-2.5 py-1 rounded-md transition-opacity duration-150 pointer-events-none whitespace-nowrap"
              style={{
                left: `${percent}%`,
                opacity: isDragging ? 1 : 0,
              }}
            >
              {vocabValue.toLocaleString()}
              {/* 箭头 */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-surface-dark" />
            </div>

            <input
              ref={sliderRef}
              type="range"
              min={VOCAB_MIN}
              max={VOCAB_MAX}
              step={VOCAB_STEP}
              value={vocabValue}
              onChange={handleSliderChange}
              onMouseDown={() => setIsDragging(true)}
              onTouchStart={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onTouchEnd={() => setIsDragging(false)}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                accentColor: 'var(--color-primary)',
                background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${percent}%, var(--color-hairline) ${percent}%, var(--color-hairline) 100%)`,
              }}
            />
          </div>
          <div className="flex justify-between text-caption text-muted -mt-1">
            <span>{VOCAB_MIN.toLocaleString()}</span>
            <span>{VOCAB_MAX.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
