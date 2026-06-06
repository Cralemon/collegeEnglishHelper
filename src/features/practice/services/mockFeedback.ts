import type {
  AIFeedback,
  Issue,
  IssueCategory,
  IssueSeverity,
  KeyPointHandling,
  TranslationDirection,
  TranslationStrategy,
} from '@/types';

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

// ============================================================
// 模拟 Issues 模板（按维度分组）
// ============================================================

type IssueTemplate = Omit<Issue, 'userFragment'>;

const grammarIssueTemplates: IssueTemplate[] = [
  {
    suggestedFix: 'had been → was/were',
    reason: '该句描述过去的一般状态，无需使用过去完成时',
    severity: 'error',
    category: 'grammar.tense',
  },
  {
    suggestedFix: 'is developed → was developed',
    reason: '语境为过去事件，时态应使用过去被动',
    severity: 'warning',
    category: 'grammar.voice',
  },
  {
    suggestedFix: 'a information → an information / some information',
    reason: 'information 为不可数名词，不能与 a 搭配',
    severity: 'error',
    category: 'grammar.article',
  },
  {
    suggestedFix: 'interested in → interested about',
    reason: 'be interested in 为固定介词搭配',
    severity: 'warning',
    category: 'grammar.preposition',
  },
  {
    suggestedFix: 'who → that',
    reason: '先行词为事物时，关系代词应用 that 或 which',
    severity: 'suggestion',
    category: 'grammar.clause',
  },
  {
    suggestedFix: '注意主谓数的一致',
    reason: '集合名词作主语时，谓语动词形式需与上下文保持一致',
    severity: 'warning',
    category: 'grammar.agreement',
  },
];

const vocabularyIssueTemplates: IssueTemplate[] = [
  {
    suggestedFix: 'say → mention / state',
    reason: '正式文体中 say 过于口语化，建议使用 mention 或 state',
    severity: 'suggestion',
    category: 'vocab.formality',
  },
  {
    suggestedFix: 'make → achieve / accomplish',
    reason: 'make 语义模糊，achieve 或 accomplish 表达更精准',
    severity: 'warning',
    category: 'vocab.accuracy',
  },
  {
    suggestedFix: 'do research → conduct research',
    reason: 'conduct research 为正式学术搭配',
    severity: 'suggestion',
    category: 'vocab.collocation',
  },
  {
    suggestedFix: '尝试使用 furthermore / moreover 等替换重复的 also',
    reason: '多次使用同一连接词使行文单调，建议丰富过渡词汇',
    severity: 'suggestion',
    category: 'vocab.diversity',
  },
];

const sentenceIssueTemplates: IssueTemplate[] = [
  {
    suggestedFix: '将两个短句合并为一个含定语从句的复合句',
    reason: '连续短句节奏碎片化，合并后表意更紧凑',
    severity: 'suggestion',
    category: 'structure.choppy',
  },
  {
    suggestedFix: '在 and 前添加句号，拆分为两句',
    reason: '句子过长（超过 40 词），影响可读性',
    severity: 'warning',
    category: 'structure.run-on',
  },
  {
    suggestedFix: '并列结构应保持一致：to do, to see, to achieve',
    reason: '并列成分形式不一致（动名词与不定式混用）',
    severity: 'error',
    category: 'structure.parallelism',
  },
  {
    suggestedFix: '添加过渡词 however / therefore 明确段落逻辑关系',
    reason: '段落间缺少显性连接，逻辑跳跃',
    severity: 'warning',
    category: 'structure.coherence',
  },
];

const overallSuggestions = [
  ['整体翻译思路清晰，继续保持逻辑表达习惯。', '建议多积累正式书面用语，提升词汇精准度。'],
  ['时态和语态使用较为规范，语法基础扎实。', '可以尝试引入更复杂的从句结构，丰富句式层次。'],
  ['词汇选择基本准确，语义传达到位。', '注意固定搭配的使用，减少母语干扰造成的错误搭配。'],
  ['句式变化有待加强，避免过多重复句型。', '建议练习使用非谓语动词（分词/不定式）压缩信息量。'],
  ['翻译整体流畅，可进一步打磨措辞精度。', '多阅读目的语原文，培养地道表达的语感。'],
];

const strategyApproaches: TranslationStrategy['approach'][] = [
  '直译为主',
  '意译为主',
  '直译意译结合',
];

const strategyStrengths = [
  '忠实原文结构，信息对应清晰',
  '语义传达准确，未产生歧义',
  '有效平衡直译与意译，表达自然',
  '关键信息保留完整',
];

const strategySuggestions = [
  '部分从属结构可意译以符合目的语习惯',
  '可适当调整语序使译文更符合中文/英文逻辑',
  '文化专有词建议加注或意译处理',
  '长定语建议拆分改写，避免头重脚轻',
];

const mockKeyPoints: KeyPointHandling[] = [
  {
    originalFragment: '核心概念',
    userTranslation: 'core concept',
    evaluation: '优秀',
  },
  {
    originalFragment: '在……的背景下',
    userTranslation: 'in the context of',
    evaluation: '合格',
    alternativeSuggestion: 'against the backdrop of',
  },
  {
    originalFragment: '充分发挥',
    userTranslation: 'fully play',
    evaluation: '待改进',
    alternativeSuggestion: 'give full play to / fully leverage',
  },
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

function buildIssues(
  templates: IssueTemplate[],
  count: number,
  fragment: string,
): Issue[] {
  return randomPick(templates, count).map((t) => ({
    ...t,
    userFragment: fragment,
  }));
}

// ============================================================
// 主函数
// ============================================================

/**
 * 生成模拟 AI 反馈（占位数据）
 *
 * Phase 8 接入真实 LLM 后废弃。
 * 基于用户翻译文本长度和随机因子生成合理的评估结果。
 */
export function generateMockFeedback(
  _sourceText: string,
  userTranslation: string,
  _direction: TranslationDirection,
): AIFeedback {
  const lengthFactor = Math.min(userTranslation.length / 50, 1);
  const baseMin = Math.floor(65 + lengthFactor * 15);
  const baseMax = Math.floor(80 + lengthFactor * 15);

  const grammarScore = randomScore(baseMin, baseMax);
  const vocabularyScore = randomScore(baseMin, baseMax);
  const sentenceScore = randomScore(baseMin, baseMax);

  // 截取用户翻译片段用作 issue.userFragment 占位
  const fragment = userTranslation.slice(0, 20) || 'sample fragment';

  const strategyApproach = strategyApproaches[Math.floor(Math.random() * strategyApproaches.length)];
  const suggestions = randomPick(overallSuggestions, 1)[0];

  const translationStrategy: TranslationStrategy = {
    approach: strategyApproach,
    strengths: randomPick(strategyStrengths, 2),
    suggestions: randomPick(strategySuggestions, 2),
    keyPoints: randomPick(mockKeyPoints, 2),
  };

  return {
    grammar: {
      score: grammarScore,
      strengths: randomPick(grammarStrengths, 2),
      improvements: randomPick(grammarImprovements, 1),
      issues: buildIssues(grammarIssueTemplates, randomScore(1, 2), fragment),
      tips: ['每次写作后检查时态一致性', '多积累被动语态句型'],
    },
    vocabulary: {
      score: vocabularyScore,
      strengths: randomPick(vocabularyStrengths, 2),
      improvements: randomPick(vocabularyImprovements, 1),
      issues: buildIssues(vocabularyIssueTemplates, randomScore(1, 2), fragment),
    },
    sentenceStructure: {
      score: sentenceScore,
      strengths: randomPick(sentenceStrengths, 2),
      improvements: randomPick(sentenceImprovements, 1),
      issues: buildIssues(sentenceIssueTemplates, randomScore(1, 2), fragment),
    },
    translationStrategy,
    overallSuggestion: suggestions,
  };
}

/**
 * 计算总分（三维加权平均）
 */
export function computeTotalScore(feedback: AIFeedback): number {
  const { grammar, vocabulary, sentenceStructure } = feedback;
  return Math.round(
    grammar.score * 0.4 + vocabulary.score * 0.3 + sentenceStructure.score * 0.3,
  );
}
