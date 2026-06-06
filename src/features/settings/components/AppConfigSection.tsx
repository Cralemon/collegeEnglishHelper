'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, Tabs, TabsList, TabsTrigger, Textarea, Button } from '@/components/ui';
import { useSettingsStore } from '@/features/settings';
import { useTheme } from '@/hooks/useTheme';
import type { PresetTopic, ThemePreference, TranslationDirection, TranslationMode } from '@/types';

const PRESET_TOPICS: { value: PresetTopic; label: string }[] = [
  { value: 'red-theme', label: '红色主题' },
  { value: 'political', label: '政治经济' },
  { value: 'motivational', label: '励志名言' },
  { value: 'technology', label: '科技前沿' },
  { value: 'culture', label: '文化历史' },
  { value: 'daily-life', label: '日常生活' },
  { value: 'business', label: '商务职场' },
  { value: 'academic', label: '学术教育' },
];

export function AppConfigSection() {
  const userProfile = useSettingsStore((s) => s.userProfile);
  const setTranslationDirection = useSettingsStore((s) => s.setTranslationDirection);
  const setTranslationMode = useSettingsStore((s) => s.setTranslationMode);
  const setThemeStore = useSettingsStore((s) => s.setTheme);
  const togglePresetTopic = useSettingsStore((s) => s.togglePresetTopic);
  const setCustomTopics = useSettingsStore((s) => s.setCustomTopics);
  const { setTheme } = useTheme();

  const handleThemeChange = (v: string) => {
    const theme = v as ThemePreference;
    setThemeStore(theme);
    setTheme(theme);
  };

  const selectedTopics = userProfile.topicPreference.presetTopics;

  return (
    <Card>
      <CardHeader>
        <CardTitle>应用配置</CardTitle>
        <CardDescription>自定义翻译练习的方式和外观</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* 翻译方向 */}
        <div className="space-y-1.5">
          <label className="text-body-sm font-medium text-ink">翻译方向</label>
          <Tabs
            defaultValue={userProfile.translationDirection}
            value={userProfile.translationDirection}
            onValueChange={(v) => setTranslationDirection(v as TranslationDirection)}
          >
            <TabsList variant="pills">
              <TabsTrigger value="zh-en" variant="pills">中译英</TabsTrigger>
              <TabsTrigger value="en-zh" variant="pills">英译中</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 翻译模式 */}
        <div className="space-y-1.5">
          <label className="text-body-sm font-medium text-ink">翻译模式</label>
          <Tabs
            defaultValue={userProfile.translationMode}
            value={userProfile.translationMode}
            onValueChange={(v) => setTranslationMode(v as TranslationMode)}
          >
            <TabsList variant="pills">
              <TabsTrigger value="single" variant="pills">单句翻译</TabsTrigger>
              <TabsTrigger value="paragraph" variant="pills">段落翻译</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 外观主题 */}
        <div className="space-y-1.5">
          <label className="text-body-sm font-medium text-ink">外观主题</label>
          <Tabs
            defaultValue={userProfile.theme}
            value={userProfile.theme}
            onValueChange={(v) => handleThemeChange(v)}
          >
            <TabsList variant="pills">
              <TabsTrigger value="light" variant="pills">浅色</TabsTrigger>
              <TabsTrigger value="dark" variant="pills">深色</TabsTrigger>
              <TabsTrigger value="system" variant="pills">跟随系统</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 题目偏好 */}
        <div className="space-y-1.5">
          <label className="text-body-sm font-medium text-ink">题目偏好</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_TOPICS.map(({ value, label }) => {
              const isSelected = selectedTopics.includes(value);
              return (
                <Button
                  key={value}
                  variant={isSelected ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => togglePresetTopic(value)}
                >
                  {label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* 自定义题目偏好 */}
        <div className="space-y-1.5">
          <label className="text-body-sm font-medium text-ink">自定义偏好（可选）</label>
          <Textarea
            placeholder="描述你希望练习的翻译主题，例如：体育赛事、环保话题、文学作品..."
            value={userProfile.topicPreference.customTopics}
            onChange={(e) => setCustomTopics(e.target.value)}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}
