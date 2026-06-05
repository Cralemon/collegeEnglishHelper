'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';

export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-display-sm text-ink">翻译练习</h1>

      <Card>
        <CardHeader>
          <CardTitle>卡片式翻译练习</CardTitle>
          <CardDescription>中译英 / 英译中 + AI 三维反馈</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-body-md text-muted">
            翻译练习核心功能将在 Step 5 实现，包括 FlashCard 3D 翻转、滑动手势、作答流程、模拟 AI 反馈等。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
