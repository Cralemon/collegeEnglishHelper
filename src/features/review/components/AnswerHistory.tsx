'use client';

import { useRouter } from 'next/navigation';
import { usePracticeStore } from '@/features/practice';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-accent-amber';
  return 'text-error';
}

export function AnswerHistory() {
  const router = useRouter();
  const answerRecords = usePracticeStore((s) => s.answerRecords);
  const questions = usePracticeStore((s) => s.questions);

  // 按时间倒序
  const sorted = [...answerRecords]
    .sort((a, b) => b.answeredAt - a.answeredAt)
    .slice(0, 20);

  if (sorted.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>答题记录</CardTitle>
          <CardDescription>暂无记录</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-body-sm text-muted py-4 text-center">
            完成翻译练习后，记录会显示在这里
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>答题记录</CardTitle>
        <CardDescription>最近 {sorted.length} 次作答</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {sorted.map((r) => {
            const q = questions.find((q) => q.id === r.questionId);
            const preview =
              (q?.sourceText ?? '(已删除)').slice(0, 28) +
              ((q?.sourceText?.length ?? 0) > 28 ? '...' : '');

            return (
              <button
                key={r.id}
                onClick={() => router.push(`/review/detail?id=${r.id}`)}
                className="w-full text-left flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-soft transition-colors"
              >
                {/* 分数 */}
                <span
                  className={`shrink-0 w-10 text-center text-body-sm font-medium ${getScoreColor(r.score)}`}
                >
                  {r.score}
                </span>

                {/* 题目预览 + 时间 */}
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm text-ink truncate">{preview}</p>
                  <p className="text-caption text-muted">{formatDate(r.answeredAt)}</p>
                </div>

                {/* 箭头 */}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="currentColor"
                  className="text-muted shrink-0"
                >
                  <path d="M4.5 2L8.5 6l-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
