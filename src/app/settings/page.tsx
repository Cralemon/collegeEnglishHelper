'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-display-sm text-ink">个人设置</h1>

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
  );
}
