'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';

export default function SettingsPage() {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <h1 className="text-display-sm text-ink mb-6 shrink-0">个人设置</h1>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle>用户偏好</CardTitle>
            <CardDescription>配置个人信息和翻译偏好</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-body-md text-muted">
              设置功能将在 Step 9 实现，包括昵称、学年段、词汇量、翻译偏好、LLM 配置、主题切换等。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
