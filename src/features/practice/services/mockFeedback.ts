import type { AIFeedback, TranslationDirection } from '@/types';

// ============================================================
// 模拟反馈模板
// ============================================================

const grammarStrengths = [
  '时态使用正确',
  '主谓一致',
  '句子结构完整',
  '被动语态运用恰当',
  '从句使用准确',
  '虚拟语气表达正确',
];

const grammarImprovements = [
  '可尝试使用被动语态增强表达',
  '注意时态的一致性',
  '可用定语从句使句子更紧凑',
  '注意冠词的使用',
  '可尝试倒装句增强语气',
  '注意介词搭配',
];

const vocabularyStrengths = [
  '用词准确',
  '词汇多样性好',
  '高级词汇使用恰当',
  '搭配词组运用自然',
  '专业术语准确',
  '同义词替换得当',
];

const vocabularyImprovements = [
  '可尝试使用更高级的词汇',
  '注意近义词的细微差别',
  '可用短语动词替代简单动词',
  '注意词汇的正式程度',
  '可尝试使用学术词汇',
  '注意固定搭配',
];

const sentenceStrengths = [
  '句式多样',
  '长短句搭配得当',
  '连接词使用自然',
  '段落结构清晰',
  '逻辑连贯',
  '信息层次分明',
];

const sentenceImprovements = [
  '可用从句使句子更紧凑',
  '尝试使用非谓语动词结构',
  '注意句式变化避免单调',
  '可增加过渡句增强连贯性',
  '适当拆分长句提高可读性',
  '可用强调句突出重点',
];

const summaries = [
  '整体翻译质量良好，继续保持！',
  '翻译基本准确，在细节上还可以进一步打磨。',
  '不错的翻译尝试，注意语法和词汇的精准度。',
  '整体表达流畅，部分细节可进一步优化。',
  '翻译思路清晰，建议多练习复杂句式。',
  '基础扎实，可以尝试更高级的表达方式。',
];

// ============================================================
// 工具函数
// ============================================================

function randomPick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function randomScore(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============================================================
// 主函数
// ============================================================

/**
 * 生成模拟 AI 反馈（占位数据）
 *
 * Step 5 使用，Step 6 接入真实 LLM 后废弃。
 * 基于用户翻译文本长度和随机因子生成合理的评估结果。
 */
export function generateMockFeedback(
  _sourceText: string,
  userTranslation: string,
  _direction: TranslationDirection,
): AIFeedback {
  // 用翻译长度作为基础分数因子（翻译越长，基础分越高，模拟"认真作答"）
  const lengthFactor = Math.min(userTranslation.length / 50, 1);
  const baseMin = Math.floor(65 + lengthFactor * 15); // 65-80
  const baseMax = Math.floor(80 + lengthFactor * 15); // 80-95

  const grammarScore = randomScore(baseMin, baseMax);
  const vocabularyScore = randomScore(baseMin, baseMax);
  const sentenceScore = randomScore(baseMin, baseMax);

  return {
    grammar: {
      score: grammarScore,
      strengths: randomPick(grammarStrengths, 2),
      improvements: randomPick(grammarImprovements, 1),
    },
    vocabulary: {
      score: vocabularyScore,
      strengths: randomPick(vocabularyStrengths, 2),
      improvements: randomPick(vocabularyImprovements, 1),
    },
    sentenceStructure: {
      score: sentenceScore,
      strengths: randomPick(sentenceStrengths, 2),
      improvements: randomPick(sentenceImprovements, 1),
    },
    summary: summaries[Math.floor(Math.random() * summaries.length)],
  };
}

/**
 * 计算总分（三维加权平均）
 */
export function computeTotalScore(feedback: AIFeedback): number {
  const { grammar, vocabulary, sentenceStructure } = feedback;
  return Math.round(
    (grammar.score * 0.4 + vocabulary.score * 0.3 + sentenceStructure.score * 0.3),
  );
}
