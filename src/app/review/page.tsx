'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';

export default function ReviewPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-display-sm text-ink">回顾与统计</h1>

      <Card>
        <CardHeader>
          <CardTitle>统计概览</CardTitle>
          <CardDescription>查看练习历史和改进趋势</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-body-md text-muted">
            统计功能将在 Step 8 实现，包括刷题数量、平均分、分数分布图、三维改进点等。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
