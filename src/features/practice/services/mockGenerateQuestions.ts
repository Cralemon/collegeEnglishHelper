import type {
  Question,
  TranslationDirection,
  TopicPreference,
  PresetTopic,
  Difficulty,
  UserProfile,
} from '@/types';

// ============================================================
// 预设类型的示例题目库
// ============================================================

const topicQuestionBank: Record<PresetTopic, string[]> = {
  'red-theme': [
    '长征精神是中国革命的重要象征，激励着一代又一代人。',
    '红军战士们不畏艰难险阻，翻越了无数座雪山。',
    '革命先烈用鲜血和生命换来了今天的和平与幸福。',
    '延安精神强调自力更生、艰苦奋斗的优良传统。',
    '井冈山是中国革命的摇篮，承载着厚重的历史记忆。',
  ],
  political: [
    '政府工作报告提出了今年经济社会发展的主要预期目标。',
    '全面深化改革是推动国家发展的根本动力。',
    '法治建设是国家治理体系和治理能力现代化的重要保障。',
    '国际合作是应对全球性挑战的必由之路。',
    '人民代表大会制度是中国的根本政治制度。',
  ],
  motivational: [
    '成功不是终点，失败也不是末日，重要的是继续前行的勇气。',
    '每一天都是新的开始，不要让昨天的遗憾影响今天的努力。',
    '坚持不一定成功，但放弃一定失败。',
    '梦想不会逃跑，逃跑的永远是自己。',
    '人生没有彩排，每一天都是现场直播。',
  ],
  technology: [
    '人工智能正在深刻改变我们的生活方式和工作模式。',
    '量子计算有望在未来十年内实现商业化应用。',
    '5G技术的普及为物联网发展提供了坚实的基础。',
    '区块链技术在金融领域的应用前景广阔。',
    '可再生能源技术的进步正在推动全球能源转型。',
  ],
  culture: [
    '中国传统节日承载着丰富的文化内涵和历史记忆。',
    '书法是中国传统文化的瑰宝，体现了东方美学。',
    '茶文化在中国有着数千年的历史，影响深远。',
    '京剧是中国国粹，融合了唱、念、做、打多种艺术形式。',
    '中华文明源远流长，是世界上唯一未曾中断的古老文明。',
  ],
  'daily-life': [
    '他每天早上六点起床，然后去公园跑步。',
    '周末的时候，我喜欢和朋友一起去咖啡馆聊天。',
    '这家餐厅的菜非常好吃，尤其是他们的招牌菜。',
    '她习惯在睡前阅读半小时的书。',
    '春节期间，家家户户都会贴春联、放鞭炮。',
  ],
  business: [
    '公司今年的营业收入同比增长了百分之十五。',
    '市场调研是制定营销策略的重要前提。',
    '供应链管理的优化可以显著降低企业运营成本。',
    '品牌建设需要长期投入和持续创新。',
    '数字化转型已经成为企业发展的必然趋势。',
  ],
  academic: [
    '研究表明，早期教育对儿童的认知发展有重要影响。',
    '这项实验的结果与我们的假设基本一致。',
    '论文引用了大量文献来支持其核心论点。',
    '跨学科研究有助于解决复杂的科学问题。',
    '学术诚信是科研工作者必须遵守的基本准则。',
  ],
};

const generalQuestions: Record<TranslationDirection, string[]> = {
  'zh-en': [
    '学习一门外语需要持之以恒的努力和正确的方法。',
    '环境保护是每个公民应尽的责任和义务。',
    '科技的发展使人们的生活变得更加便利。',
    '阅读是获取知识和开阔视野的重要途径。',
    '健康的生活方式包括合理饮食和适量运动。',
    '音乐能够陶冶情操，丰富人们的精神世界。',
    '教育公平是社会公平的重要基础。',
    '创新是引领发展的第一动力。',
    '良好的沟通能力是职场成功的关键因素之一。',
    '旅行可以让人放松身心，增长见识。',
  ],
  'en-zh': [
    'The rapid development of technology has transformed the way we communicate.',
    'Education is the most powerful weapon which you can use to change the world.',
    'The environment is something we all share, and we all need to protect it.',
    'Reading is to the mind what exercise is to the body.',
    'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    'The only way to do great work is to love what you do.',
    'Climate change is one of the most pressing challenges of our time.',
    'Cultural diversity is a source of strength and innovation.',
    'The best time to plant a tree was twenty years ago; the second best time is now.',
    'Knowledge speaks, but wisdom listens.',
  ],
};

// ============================================================
// 工具函数
// ============================================================

function randomPick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function pickDifficulty(gradeLevel: UserProfile['gradeLevel']): Difficulty {
  const levelMap: Record<string, Difficulty> = {
    '大一': 'easy',
    '大二': 'easy',
    '大三': 'medium',
    '大四': 'medium',
    '研一': 'hard',
    '研二': 'hard',
    '研三': 'hard',
  };
  return levelMap[gradeLevel] ?? 'medium';
}

// ============================================================
// 主函数
// ============================================================

/**
 * 基于用户画像和题目偏好生成模拟翻译题目
 *
 * Step 5 使用，Step 6 接入真实 LLM 后可废弃或保留为 fallback。
 */
export function mockGenerateQuestions(
  profile: UserProfile,
  count: number = 10,
): Question[] {
  const { translationDirection, topicPreference, gradeLevel } = profile;
  const difficulty = pickDifficulty(gradeLevel);
  const now = Date.now();

  // 收集题目来源
  const sources: string[] = [];

  // 从选中的预设类型中收集
  for (const topic of topicPreference.presetTopics) {
    sources.push(...(topicQuestionBank[topic] ?? []));
  }

  // 从通用题库中补充
  sources.push(...generalQuestions[translationDirection]);

  // 去重并随机选取
  const unique = [...new Set(sources)];
  const selected = randomPick(unique, Math.min(count, unique.length));

  // 如果不够，用通用题库重复填充
  while (selected.length < count) {
    const extra = randomPick(generalQuestions[translationDirection], 1);
    if (!selected.includes(extra[0])) {
      selected.push(extra[0]);
    }
    if (selected.length >= generalQuestions[translationDirection].length) break;
  }

  return selected.map((text, i) => ({
    id: generateId(),
    sourceText: text,
    translationDirection,
    category: topicPreference.presetTopics[0] ?? 'general',
    difficulty,
    createdAt: now + i,
  }));
}
