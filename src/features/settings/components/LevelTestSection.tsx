'use client';

import { useState, useCallback } from 'react';
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
  Badge,
} from '@/components/ui';
import { useSettingsStore } from '@/features/settings';
import { evaluateLevel, LLMError } from '@/features/practice';
import { useToast } from '@/components/ui';
import type { LevelTestResult } from '@/features/practice';
import type { GradeLevel } from '@/types';

/** 5 道测试题，难度递进 */
const TEST_QUESTIONS = [
  '我每天早上六点起床，然后去操场跑步。',
  '这本书比那本有趣得多，我建议你也读一读。',
  '尽管天气不好，我们还是决定按原计划继续旅行。',
  '人工智能的快速发展给传统教育模式带来了前所未有的挑战与机遇。',
  '这一政策的实施不仅促进了经济的可持续发展，还为缩小城乡差距提供了新的思路。',
];

type Step = 'idle' | 'testing' | 'result';

export function LevelTestSection() {
  const { userProfile, setGradeLevel, setVocabularyLevel, llmConfig } =
    useSettingsStore();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>('idle');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>(['', '', '', '', '']);
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<LevelTestResult | null>(null);

  const handleStart = useCallback(() => {
    setAnswers(['', '', '', '', '']);
    setCurrentQ(0);
    setResult(null);
    setStep('testing');
    setDialogOpen(true);
  }, []);

  const handleNext = useCallback(() => {
    if (currentQ < TEST_QUESTIONS.length - 1) {
      setCurrentQ((c) => c + 1);
    }
  }, [currentQ]);

  const handlePrev = useCallback(() => {
    if (currentQ > 0) {
      setCurrentQ((c) => c - 1);
    }
  }, [currentQ]);

  const handleAnswerChange = useCallback((value: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQ] = value;
      return next;
    });
  }, [currentQ]);

  const allAnswered = answers.every((a) => a.trim().length > 0);

  const handleSubmit = useCallback(async () => {
    if (!allAnswered) return;
    setEvaluating(true);

    try {
      const res = await evaluateLevel(
        llmConfig,
        TEST_QUESTIONS.map((q, i) => ({
          sourceText: q,
          userTranslation: answers[i],
        })),
      );

      setResult(res);
      setStep('result');

      // 自动更新用户画像
      const validLevels: GradeLevel[] = [
        '大一', '大二', '大三', '大四', '研一', '研二', '研三',
      ];
      if (validLevels.includes(res.gradeLevel as GradeLevel)) {
        setGradeLevel(res.gradeLevel as GradeLevel);
      }
      setVocabularyLevel(
        Math.max(1000, Math.min(15000, Math.round(res.vocabularyLevel / 500) * 500)),
      );

      toast('水平评估完成，用户画像已更新', 'success');
    } catch (err) {
      if (err instanceof LLMError) {
        if (err.code === 'NO_API_KEY') {
          toast('请先在设置中配置 API Key', 'error');
        } else {
          toast(`评估失败：${err.message.slice(0, 60)}`, 'error');
        }
      } else {
        toast('评估失败，请重试', 'error');
      }
    }

    setEvaluating(false);
  }, [allAnswered, answers, llmConfig, setGradeLevel, setVocabularyLevel, toast]);

  const handleClose = useCallback(() => {
    setDialogOpen(false);
    if (step === 'result') {
      setStep('idle');
    }
  }, [step]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>水平测试</CardTitle>
          <CardDescription>
            通过 5 道翻译题快速评估您的英语水平，生成初始学习画像
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-body-sm text-muted">
              当前：{userProfile.gradeLevel} · 词汇量约{' '}
              {userProfile.vocabularyLevel.toLocaleString()}
            </div>
            <Button variant="outline" size="sm" onClick={handleStart}>
              开始水平测试
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          {step === 'testing' && (
            <>
              <DialogHeader>
                <DialogTitle>
                  水平测试 ({currentQ + 1}/{TEST_QUESTIONS.length})
                </DialogTitle>
                <DialogDescription>
                  请将以下中文翻译为英文
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* 进度条 */}
                <div className="flex gap-1">
                  {TEST_QUESTIONS.map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-1 rounded-full ${
                        answers[i].trim() ? 'bg-primary' : 'bg-surface-cream-strong'
                      }`}
                    />
                  ))}
                </div>

                {/* 原文 */}
                <p className="text-body-md text-ink font-medium leading-relaxed p-3 rounded-lg bg-surface-soft">
                  {TEST_QUESTIONS[currentQ]}
                </p>

                {/* 翻译输入 */}
                <textarea
                  className="w-full min-h-[120px] p-3 rounded-lg border border-hairline bg-surface-card text-body-md text-ink resize-none focus:outline-none focus:border-primary"
                  placeholder="在此输入翻译..."
                  value={answers[currentQ]}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                />
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  disabled={currentQ === 0}
                >
                  上一题
                </Button>
                {currentQ < TEST_QUESTIONS.length - 1 ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleNext}
                    disabled={!answers[currentQ].trim()}
                  >
                    下一题
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!allAnswered}
                    loading={evaluating}
                  >
                    {evaluating ? '评估中...' : '提交评估'}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}

          {step === 'result' && result && (
            <>
              <DialogHeader>
                <DialogTitle>评估结果</DialogTitle>
                <DialogDescription>
                  AI 根据您的翻译水平给出的评估
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-4 rounded-lg bg-surface-soft">
                    <p className="text-display-sm text-primary">{result.gradeLevel}</p>
                    <p className="text-caption text-muted">学年段</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-surface-soft">
                    <p className="text-display-sm text-primary">
                      {result.vocabularyLevel.toLocaleString()}
                    </p>
                    <p className="text-caption text-muted">预估词汇量</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-surface-soft">
                  <p className="text-body-sm text-body">{result.overallAssessment}</p>
                </div>

                <div className="flex items-center gap-2 text-caption text-muted">
                  <Badge variant="success" size="sm">已更新</Badge>
                  用户画像已同步更新到设置
                </div>
              </div>

              <DialogFooter>
                <Button variant="primary" onClick={handleClose}>
                  完成
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
