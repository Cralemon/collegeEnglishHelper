'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui';
import { usePracticeStore } from '@/features/practice';
import { useReviewStore } from '@/features/review';

export function DataManagementSection() {
  const clearAllPractice = usePracticeStore((s) => s.clearAll);
  const clearImprovements = useReviewStore((s) => s.clearImprovements);

  const handleClearData = () => {
    if (!window.confirm('确定要清除所有练习数据吗？此操作不可撤销，包括作答记录和统计数据都将被永久删除。')) {
      return;
    }

    clearAllPractice();
    clearImprovements();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>数据管理</CardTitle>
        <CardDescription>管理你的练习数据和本地存储</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <p className="text-body-sm text-muted">
            清除所有练习记录、作答数据和统计数据。用户设置和 LLM 配置不会被清除。
          </p>
          <Button
            variant="danger"
            size="md"
            onClick={handleClearData}
            className="self-start"
          >
            清除练习数据
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
