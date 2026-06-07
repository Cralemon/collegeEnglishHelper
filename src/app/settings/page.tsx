'use client';

import { ScrollFade } from '@/components/layout/ScrollFade';
import { HeaderPortal } from '@/components/layout/HeaderPortal';
import { UserProfileForm, AppConfigSection, LearningDataSection, LevelTestSection, LLMConfigSection, DataManagementSection } from '@/features/settings';

function SettingsHeader() {
  return (
    <div className="px-4 md:px-8 md:pl-[88px] pt-4 pb-2">
      <h1 className="text-display-sm text-ink mb-4">个人设置</h1>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <>
      <HeaderPortal>
        <SettingsHeader />
      </HeaderPortal>
      <div className="flex flex-col flex-1 min-h-0">
        <ScrollFade>
          <div className="space-y-4 pt-18 pb-24">
            <UserProfileForm />
            <AppConfigSection />
            <LearningDataSection />
            <LevelTestSection />
            <LLMConfigSection />
            <DataManagementSection />
          </div>
        </ScrollFade>
      </div>
    </>
  );
}
