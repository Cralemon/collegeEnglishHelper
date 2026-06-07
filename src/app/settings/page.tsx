'use client';

import { ScrollFade } from '@/components/layout/ScrollFade';
import { UserProfileForm, AppConfigSection, LearningDataSection, LevelTestSection, LLMConfigSection, DataManagementSection } from '@/features/settings';

export default function SettingsPage() {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <h1 className="text-display-sm text-ink mb-6 shrink-0">个人设置</h1>

      <ScrollFade>
        <div className="space-y-4 pb-4">
          <UserProfileForm />
          <AppConfigSection />
          <LearningDataSection />
          <LevelTestSection />
          <LLMConfigSection />
          <DataManagementSection />
        </div>
      </ScrollFade>
    </div>
  );
}
