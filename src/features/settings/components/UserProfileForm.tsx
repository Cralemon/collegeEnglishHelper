'use client';

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>用户信息</CardTitle>
        <CardDescription>设置你的个人资料，帮助 AI 更好地为你出题</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* 昵称 */}
        <div className="space-y-2">
          <label className="text-body-sm font-medium text-ink">昵称</label>
          <Input
            placeholder="输入你的昵称"
            value={userProfile.nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>

        {/* 学年段 */}
        <div className="space-y-2">
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-body-sm font-medium text-ink">预估词汇量</label>
            <span className="text-title-sm text-primary tabular-nums">
              {userProfile.vocabularyLevel.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min={VOCAB_MIN}
            max={VOCAB_MAX}
            step={VOCAB_STEP}
            value={userProfile.vocabularyLevel}
            onChange={(e) => setVocabularyLevel(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              accentColor: 'var(--color-primary)',
              background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${((userProfile.vocabularyLevel - VOCAB_MIN) / (VOCAB_MAX - VOCAB_MIN)) * 100}%, var(--color-hairline) ${((userProfile.vocabularyLevel - VOCAB_MIN) / (VOCAB_MAX - VOCAB_MIN)) * 100}%, var(--color-hairline) 100%)`,
            }}
          />
          <div className="flex justify-between text-caption text-muted">
            <span>{VOCAB_MIN.toLocaleString()}</span>
            <span>{VOCAB_MAX.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
