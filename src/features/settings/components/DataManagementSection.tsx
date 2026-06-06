'use client';

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui';
import { usePracticeStore } from '@/features/practice';
import { useReviewStore } from '@/features/review';

export function DataManagementSection() {
  const clearAllPractice = usePracticeStore((s) => s.clearAll);
  const clearImprovements = useReviewStore((s) => s.clearImprovements);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClearData = () => {
    clearAllPractice();
    clearImprovements();
    setDialogOpen(false);
  };

  return (
    <>
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
              onClick={() => setDialogOpen(true)}
              className="self-start"
            >
              清除练习数据
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认清除数据</DialogTitle>
            <DialogDescription>
              此操作不可撤销。所有作答记录和统计数据将被永久删除，但用户设置和 LLM 配置不会受影响。确定要继续吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" size="md" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button variant="danger" size="md" onClick={handleClearData}>
              确认清除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
