# 大学英语翻译练习助手 — 开发规划

> v3.5 | 2026-06-05 | 已确认

---

## 一、项目概述

**产品定位**：面向大学生的英语翻译练习工具，通过卡片式翻译题目练习，引导学生在词汇、语法、句型三个维度逐步提升。

**目标平台**：Android + Windows（响应式布局，移动端优先）

**设计哲学**：
- 运作单位为每一道翻译题
- 核心循环：作答 → AI 反馈 → 针对性提升 → 再次练习
- 稳定性用程序代码，学习针对性用 LLM

**目标用户**：大学生（四六级/考研/专四专八），个人使用。

---

## 二、功能需求

### 2.1 翻译练习（首页）

#### 交互流程

```
正面（作答）                    背面（AI 反馈）
┌─────────────────────┐        ┌─────────────────────┐
│ 原文：               │        │ 📊 总分：85/100     │
│ "The quick brown..." │  翻转  │                     │
│                     │ ────→  │ ✅ 语法：90         │
│ [翻译输入框]         │        │    优点：时态正确    │
│                     │        │    改进：用被动语态   │
│ [提交翻译]          │        │                     │
│                     │        │ 📚 词汇：80         │
│ ← 左滑 | 右滑 →     │        │ 🏗️ 句型：85         │
└─────────────────────┘        │                     │
                               │ 💡 总结：整体良好... │
                               │                     │
                               │ [下一题 →]           │
                               └─────────────────────┘
```

#### 功能清单

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 卡片翻转 | P0 | 正面作答，背面 AI 反馈，3D 翻转动画 |
| 单句/段落切换 | P0 | 设置中配置，默认单句 |
| 中译英/英译中 | P0 | 设置中配置，默认中译英 |
| 题集管理 | P0 | 创建、切换、删除题集 |
| 作答缓存 | P0 | localStorage 持久化 |
| 打乱顺序 | P1 | 随机打乱当前题集 |
| 滑动手势 | P1 | 移动端左右滑动切换 |
| 快捷键 | P2 | Enter 提交，← → 切换 |

#### 作答流程详解

1. **题目展示**：显示原文、翻译方向标识、题集信息
2. **用户输入**：textarea 多行输入，支持段落翻译，自动高度
3. **提交**：调用 LLM 评估，显示 loading 状态
4. **翻转展示**：卡片 3D 翻转，展示三维反馈 + 总分 + 总结
5. **下一题**：点击按钮或滑动进入下一题，记录作答历史

#### LLM 提示词（占位）

> 交给另一 Agent 编写。指引：角色为专业英语翻译教师，输入原文+学生翻译+翻译方向+学生信息，输出 JSON 格式三维评估（语法/词汇/句型），每维度含分数、优点、改进，总分百分制 + 总结。

---

### 2.2 回顾与统计

#### 页面结构

```
┌─────────────────────────────────────────────────────────┐
│  回顾与统计                                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [刷题总数] [平均分] [最高分]                              │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  分数分布图表（Recharts 柱状图）                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  改进点收录                                       │   │
│  │  [语法] [词汇] [句型]                             │   │
│  │                                                  │   │
│  │  • 被动语态使用不熟练（12 次）                    │   │
│  │  • 虚拟语气混淆（8 次）                          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  弱势题目（< 50 分）                              │   │
│  │  [题目1] [题目2] ...                              │   │
│  │  [重新练习弱势题目]                               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 功能清单

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 基础统计 | P0 | 刷题数量、平均分、最高分 |
| 分数分布图 | P0 | 柱状图展示各分段题目数量 |
| 三维改进点 | P0 | 语法/词汇/句型分类，含频率统计 |
| 弱势题目 | P0 | < 50 分题目可推入首页重练 |
| 时间趋势 | P1 | 折线图展示分数变化 |
| 导出报告 | P2 | PDF/JSON 格式 |

#### 改进点提取逻辑

从 AI 反馈的 `improvements` 字段提取，按维度分类，统计出现频率：
- 同一改进点出现多次时 frequency +1
- 关联 `relatedQuestionIds` 追溯来源
- 按频率降序排列展示

---

### 2.3 个人设置

#### 页面结构

```
┌─────────────────────────────────────────────────────────┐
│  个人设置                                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  用户信息                                                │
│  昵称：[________]  学年段：[大一 ▼]  词汇量：[4000 ▼]   │
│                                                         │
│  翻译偏好                                                │
│  模式：(● 单句) (○ 段落)    方向：(● 中译英) (○ 英译中) │
│                                                         │
│  LLM 配置                                               │
│  API 地址：[https://api.openai.com/v1]                  │
│  API Key：  [sk-••••••••]                               │
│  模型：    [gpt-4o ▼]    [测试连接]                      │
│                                                         │
│  主题：[☀️ 浅色] [🌙 深色] [🎨 跟随系统]                │
│                                                         │
│  水平测试：通过简短测试评估英语水平  [开始测试]            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 功能清单

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 用户信息 | P0 | 昵称、学年段（大一~研三）、词汇量 |
| 翻译偏好 | P0 | 单句/段落、中译英/英译中 |
| LLM 配置 | P0 | API 地址、Key、模型选择、连接测试 |
| 主题切换 | P1 | 浅色/深色/跟随系统 |
| 水平测试 | P2 | 评估英语水平的简短测试 |
| 数据导入导出 | P2 | 备份和恢复 |

#### LLM 连接测试

调用 `{apiUrl}/models` 接口，验证 API Key 有效性。成功显示可用模型列表，失败显示错误信息。

---

## 三、技术架构

### 3.1 技术选型

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Next.js 16 + React 19 + TypeScript | App Router, 静态导出 |
| UI 框架 | Tailwind CSS 4 | 原子化 CSS |
| 状态管理 | Zustand | 轻量级，支持持久化 |
| 动画 | Framer Motion | 翻转、滑动 |
| 图表 | Recharts | 统计图表 |
| 打包 | Tauri v2 | Android + Windows |
| 存储 | localStorage | 浏览器内置 |
| LLM | OpenAI 兼容 API | 支持多种服务 |
| 包管理 | pnpm | corepack 管理 |

### 3.2 环境依赖

| 依赖 | 状态 | 版本 | 安装方式 |
|------|------|------|----------|
| Node.js | ✅ 已安装 | 24.15.0 | fnm |
| pnpm | ✅ 已安装 | 10.33.2 | corepack |
| Rust / Cargo | ✅ 已安装 | 1.96.0 | rustup |
| Visual Studio | ✅ 已安装 | Community 2026 | 官方安装器 |
| Android Studio | ✅ 已安装 | — | JetBrains Toolbox |
| Tauri CLI | ✅ 已安装 | 2.11.2 | pnpm (devDependency) |

### 3.3 字体系统

| 用途 | 字体 | 文件 |
|------|------|------|
| 英文衬线 | EB Garamond | `public/fonts/EBGaramond-*.ttf` (10 文件) |
| 英文无衬线 | Sarasa Gothic | `public/fonts/SarasaUiSC-*.ttf` (10 文件) |
| 中文衬线 | Source Han Serif | `public/fonts/SourceHanSerif.ttc` |
| 中文无衬线 | Sarasa Gothic | 同英文无衬线 |

> 字体文件在 `.gitignore` 中忽略，首次开发需从本地复制。

### 3.4 项目结构

```
src/
├── app/                    # Next.js 页面
│   ├── layout.tsx          # 根布局（字体、主题）
│   ├── page.tsx            # 首页（翻译练习）
│   ├── review/page.tsx     # 回顾页面
│   └── settings/page.tsx   # 设置页面
├── components/
│   ├── ui/                 # 基础组件（Button, Card, Input, Badge, Tabs）
│   ├── layout/             # 布局（TopNav, AppLayout）
│   └── shared/             # 业务共享（FlashCard, ScoreDisplay, FeedbackPanel）
├── features/
│   ├── practice/           # 练习模块（components, hooks, store, services）
│   ├── review/             # 回顾模块（components, hooks, store）
│   └── settings/           # 设置模块（components, hooks, store）
├── hooks/                  # 全局 Hooks（useLocalStorage, useTheme, useLLM）
├── services/               # 全局服务（storage, prompts）
├── types/                  # TypeScript 类型
├── utils/                  # 工具函数（score, stats, format）
└── styles/                 # 样式（fonts.ts, theme.css）
src-tauri/                  # Tauri 后端
public/fonts/               # 字体文件
```

---

## 四、设计规范

基于 `awesome-design-md/design-md/claude/DESIGN.md` 实现 Claude 风格。

### 4.1 色彩系统

```css
:root {
  --color-primary: #cc785c;           /* 珊瑚色主色调 */
  --color-primary-active: #a9583e;
  --color-primary-disabled: #e6dfd8;
  --color-canvas: #faf9f5;            /* 奶油色画布 */
  --color-surface-card: #efe9de;      /* 卡片背景 */
  --color-surface-dark: #181715;      /* 深色表面 */
  --color-ink: #141413;               /* 主文字 */
  --color-body: #3d3d3a;              /* 正文 */
  --color-muted: #6c6a64;             /* 次要文字 */
  --color-hairline: #e6dfd8;          /* 边框 */
  --color-success: #5db872;
  --color-warning: #d4a017;
  --color-error: #c64545;
}

.dark {
  --color-canvas: #181715;
  --color-surface-card: #252320;
  --color-ink: #faf9f5;
  --color-body: #a09d96;
  --color-hairline: #3d3d3a;
}
```

### 4.2 字体配置

```typescript
// styles/fonts.ts
import localFont from 'next/font/local';

export const ebGaramond = localFont({
  src: [
    { path: '../../public/fonts/EBGaramond-Regular.ttf', weight: '400' },
    { path: '../../public/fonts/EBGaramond-Medium.ttf', weight: '500' },
    { path: '../../public/fonts/EBGaramond-SemiBold.ttf', weight: '600' },
    { path: '../../public/fonts/EBGaramond-Bold.ttf', weight: '700' },
    { path: '../../public/fonts/EBGaramond-ExtraBold.ttf', weight: '800' },
    { path: '../../public/fonts/EBGaramond-Italic.ttf', weight: '400', style: 'italic' },
    { path: '../../public/fonts/EBGaramond-MediumItalic.ttf', weight: '500', style: 'italic' },
    { path: '../../public/fonts/EBGaramond-SemiBoldItalic.ttf', weight: '600', style: 'italic' },
    { path: '../../public/fonts/EBGaramond-BoldItalic.ttf', weight: '700', style: 'italic' },
    { path: '../../public/fonts/EBGaramond-ExtraBoldItalic.ttf', weight: '800', style: 'italic' },
  ],
  variable: '--font-display',
  display: 'swap',
});

export const sarasaGothic = localFont({
  src: [
    { path: '../../public/fonts/SarasaUiSC-ExtraLight.ttf', weight: '200' },
    { path: '../../public/fonts/SarasaUiSC-Light.ttf', weight: '300' },
    { path: '../../public/fonts/SarasaUiSC-Regular.ttf', weight: '400' },
    { path: '../../public/fonts/SarasaUiSC-SemiBold.ttf', weight: '600' },
    { path: '../../public/fonts/SarasaUiSC-Bold.ttf', weight: '700' },
    { path: '../../public/fonts/SarasaUiSC-ExtraLightItalic.ttf', weight: '200', style: 'italic' },
    { path: '../../public/fonts/SarasaUiSC-LightItalic.ttf', weight: '300', style: 'italic' },
    { path: '../../public/fonts/SarasaUiSC-Italic.ttf', weight: '400', style: 'italic' },
    { path: '../../public/fonts/SarasaUiSC-SemiBoldItalic.ttf', weight: '600', style: 'italic' },
    { path: '../../public/fonts/SarasaUiSC-BoldItalic.ttf', weight: '700', style: 'italic' },
  ],
  variable: '--font-body',
  display: 'swap',
});

export const fontVariables = `${ebGaramond.variable} ${sarasaGothic.variable}`;
```

```css
/* globals.css */
@font-face {
  font-family: 'Source Han Serif SC';
  src: url('/fonts/SourceHanSerif.ttc') format('truetype-collection');
  font-weight: 100 900;
  font-display: swap;
}

@theme {
  --font-display: var(--font-display), 'Georgia', serif;
  --font-body: var(--font-body), 'Inter', sans-serif;
  --font-serif-cjk: 'Source Han Serif SC', serif;
  --font-code: 'JetBrains Mono', monospace;
}
```

### 4.3 排版层级

| Token | 字体 | 大小 | 字重 | 用途 |
|-------|------|------|------|------|
| `display-xl` | EB Garamond | 64px | 400 | 首页大标题 |
| `display-lg` | EB Garamond | 48px | 400 | 章节标题 |
| `display-md` | EB Garamond | 36px | 400 | 子章节标题 |
| `display-sm` | EB Garamond | 28px | 400 | 卡片标题 |
| `title-lg` | Sarasa Gothic | 22px | 500 | 重要标签 |
| `title-md` | Sarasa Gothic | 18px | 500 | 卡片标题 |
| `title-sm` | Sarasa Gothic | 16px | 500 | 列表标签 |
| `body-md` | Sarasa Gothic | 16px | 400 | 正文 |
| `body-sm` | Sarasa Gothic | 14px | 400 | 辅助文字 |
| `caption` | Sarasa Gothic | 13px | 500 | 标签 |
| `code` | JetBrains Mono | 14px | 400 | 代码块 |

### 4.4 间距与圆角

```css
:root {
  --spacing-xxs: 4px;   --spacing-xs: 8px;
  --spacing-sm: 12px;    --spacing-md: 16px;
  --spacing-lg: 24px;    --spacing-xl: 32px;
  --spacing-xxl: 48px;   --spacing-section: 96px;

  --rounded-xs: 4px;     --rounded-sm: 6px;
  --rounded-md: 8px;     --rounded-lg: 12px;
  --rounded-xl: 16px;    --rounded-pill: 9999px;
}
```

### 4.5 响应式设计

#### 断点

| 断点 | 宽度 | 设备 |
|------|------|------|
| `xs` | < 640px | 手机竖屏 |
| `sm` | 640-767px | 手机横屏 |
| `md` | 768-1023px | 平板 |
| `lg` | 1024-1279px | 小笔记本 |
| `xl` | 1280-1535px | 桌面 |
| `2xl` | ≥ 1536px | 大屏 |

#### 组件适配策略

| 组件 | 移动端 (< 768px) | 平板 (768-1023px) | 桌面 (≥ 1024px) |
|------|------------------|-------------------|-----------------|
| TopNav | 汉堡菜单 + 抽屉 | 紧凑水平导航 | 完整导航 |
| 练习卡片 | 全宽堆叠 | 居中留白 | 最大 640px |
| 统计卡片 | 单列 | 2 列 | 3 列 |
| 改进点 | 可折叠列表 | 可折叠列表 | 3 列 Tab |
| 设置表单 | 单列全宽 | 单列 480px | 双列 640px |
| 题集管理 | 底部抽屉 | 可收起侧边栏 | 固定侧边栏 |

#### 布局原则

1. **移动优先**：默认移动端，`md:`、`lg:` 扩展
2. **触控友好**：按钮最小 44px，间距 ≥ 8px
3. **弹性布局**：Flexbox + Grid，避免固定宽度
4. **字体缩放**：移动端 display 系列减少 20-30%
5. **安全区域**：`env(safe-area-inset-*)` 适配刘海屏

#### 移动端特殊处理

- **滑动手势**：`react-swipeable` 左右滑动切换题目
- **虚拟键盘**：输入框聚焦自动滚动到可视区域
- **触摸反馈**：`active:scale-95` 缩放效果
- **底部安全区**：`pb-safe` 适配 iPhone 底部横条

---

## 五、数据模型

### 5.1 核心类型

```typescript
// 题目
interface Question {
  id: string;
  sourceText: string;
  translationDirection: 'zh-en' | 'en-zh';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: number;
}

// 作答记录
interface AnswerRecord {
  id: string;
  questionId: string;
  userTranslation: string;
  score: number;                // 0-100
  feedback: AIFeedback;
  answeredAt: number;
}

// AI 反馈
interface AIFeedback {
  grammar: DimensionFeedback;
  vocabulary: DimensionFeedback;
  sentenceStructure: DimensionFeedback;
  summary: string;
}

interface DimensionFeedback {
  score: number;
  strengths: string[];
  improvements: string[];
}

// 题集
interface Collection {
  id: string;
  name: string;
  description?: string;
  questionIds: string[];
  createdAt: number;
  updatedAt: number;
}

// 用户信息
interface UserProfile {
  nickname: string;
  gradeLevel: '大一' | '大二' | '大三' | '大四' | '研一' | '研二' | '研三';
  vocabularyLevel: number;
  translationMode: 'single' | 'paragraph';
  translationDirection: 'zh-en' | 'en-zh';
  theme: 'light' | 'dark' | 'system';
}

// LLM 配置
interface LLMConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
}

// 改进点
interface ImprovementPoint {
  id: string;
  dimension: 'grammar' | 'vocabulary' | 'sentenceStructure';
  content: string;
  frequency: number;
  relatedQuestionIds: string[];
  firstSeen: number;
  lastSeen: number;
}
```

### 5.2 localStorage 键名

```typescript
const STORAGE_KEYS = {
  QUESTIONS: 'ueh_questions',
  ANSWERS: 'ueh_answers',
  COLLECTIONS: 'ueh_collections',
  USER_PROFILE: 'ueh_user_profile',
  LLM_CONFIG: 'ueh_llm_config',
  IMPROVEMENTS: 'ueh_improvements',
} as const;
```

---

## 六、LLM 集成

### 6.1 服务封装

```typescript
class LLMService {
  constructor(private config: LLMConfig) {}

  async evaluateTranslation(params: {
    sourceText: string;
    userTranslation: string;
    direction: 'zh-en' | 'en-zh';
    userProfile: UserProfile;
  }): Promise<AIFeedback> {
    const prompt = buildEvaluationPrompt(params);

    const response = await fetch(`${this.config.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: 'system', content: '...' }, // 占位，由另一 Agent 编写
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${this.config.apiUrl}/models`, {
        headers: { 'Authorization': `Bearer ${this.config.apiKey}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
```

### 6.2 提示词（占位）

> 交给另一 Agent 编写。

**翻译评分**：角色=英语翻译教师，输入=原文+翻译+方向+学生信息，输出=JSON 三维评估（语法/词汇/句型），每维度分数+优点+改进，总分百分制+总结。

**水平测试**：角色=评估专家，输入=学生信息+测试作答，输出=评估结果+水平等级。

---

## 七、开发计划（Agent 模式）

### 7.1 原则

1. **逐步交付**：每步完成后应用可正常打开，关键功能可测试
2. **To-Do 维护**：每步维护待办清单，验收后再推进
3. **独立可测**：每步交付物独立可运行
4. **仓库审查**：每步提交前必须审查仓库状态（`git status` + `git diff`），确认无遗漏、无误提交，再 commit
5. **DEVLOG 同频更新**：每次有意义的提交，同步更新 `DEVLOG.md`，记录决策、踩坑与经验
6. **Step 内细分**：每个 Step 内的工作应拆分为子任务，逐步完成并验收，而非一次性交付整个 Step

### 7.2 步骤

#### Step 1：项目初始化 ✅

**目标**：Next.js + Tauri 项目骨架

**交付物**：
- Next.js 16 (App Router) + Tailwind CSS 4 + TypeScript
- Tauri v2 基础配置
- `pnpm dev` 和 `pnpm tauri dev` 可启动

**To-Do**：
- [x] 初始化 Next.js 项目
- [x] 配置 Tailwind CSS 4
- [x] 初始化 Tauri v2
- [x] 验证开发服务器启动
- [x] 配置 `output: 'export'`（Tauri 静态导出）
- [x] 整理 `.gitignore`（.idea/、public/fonts/、src-tauri/target/）

> **注意**：字体文件已下载到 `public/fonts/` 但未提交 Git（在 `.gitignore` 中忽略）。首次 clone 后需手动复制字体文件。

---

#### Step 2：设计系统与字体

**目标**：Claude 设计系统 + 字体 + 基础组件

**交付物**：
- 色彩/字体/间距 CSS 变量
- EB Garamond + Sarasa Gothic + Source Han Serif 配置
- Button、Card、Input、Badge、Tabs 组件
- 浅色/深色主题切换
- 响应式断点配置

**To-Do**：
- [x] 复制字体到 public/fonts/
- [x] 配置 next/font/local + @font-face
- [x] 实现 CSS 变量（色彩/间距/圆角）
- [x] 实现 5 个基础组件
- [x] 实现主题切换
- [x] 创建设计预览页面

---

#### Step 3：布局与导航

**目标**：主布局 + 路由 + 响应式导航

**交付物**：
- TopNav（桌面水平导航 + 移动端汉堡菜单）
- AppLayout（响应式容器）
- 三个页面路由（首页/回顾/设置）
- 移动端抽屉导航

**To-Do**：
- [ ] 实现 TopNav + 汉堡菜单
- [ ] 实现 AppLayout
- [ ] 实现移动端抽屉导航
- [ ] 配置路由
- [ ] 创建占位页面
- [ ] 验证页面切换

---

#### Step 4：状态管理与数据层

**目标**：Zustand stores + localStorage

**交付物**：
- TypeScript 类型定义
- localStorage 封装
- practiceStore、reviewStore、settingsStore
- 数据持久化

**To-Do**：
- [ ] 定义类型
- [ ] 实现 localStorage 封装
- [ ] 实现 3 个 stores
- [ ] 验证持久化

---

#### Step 5：翻译练习核心

**目标**：卡片式翻译练习交互

**交付物**：
- FlashCard（3D 翻转 + 滑动手势）
- AnswerInput（移动端键盘适配）
- PracticeCard（响应式布局）
- 作答流程（输入→提交→翻转→查看）
- 模拟 AI 反馈（占位数据）

**To-Do**：
- [ ] 实现 FlashCard + 3D 翻转
- [ ] 实现滑动手势
- [ ] 实现 AnswerInput
- [ ] 实现 PracticeCard
- [ ] 实现模拟反馈
- [ ] 验证作答流程

---

#### Step 6：LLM 集成

**目标**：OpenAI 兼容 API 调用

**交付物**：
- LLM 服务层
- API 配置界面
- 提示词占位指引
- 真实 AI 反馈
- 连接测试

**To-Do**：
- [ ] 实现 LLM 服务层
- [ ] 实现 API 配置界面
- [ ] 编写提示词指引（占位）
- [ ] 集成到练习流程
- [ ] 实现连接测试
- [ ] 验证 AI 反馈

---

#### Step 7：题集管理

**目标**：题集 CRUD + 打乱 + 缓存

**交付物**：
- CollectionManager 组件
- 题集创建/切换/删除
- 题目打乱
- 作答历史缓存

**To-Do**：
- [ ] 实现 CollectionManager
- [ ] 实现题集 CRUD
- [ ] 实现打乱
- [ ] 实现缓存
- [ ] 验证功能

---

#### Step 8：回顾与统计

**目标**：统计图表 + 改进点展示

**交付物**：
- StatisticsCard（响应式网格）
- ScoreChart（Recharts 自适应）
- ImprovementPoints（移动端折叠）
- WeakQuestionsList
- 重新练习功能

**To-Do**：
- [ ] 实现 StatisticsCard
- [ ] 实现 ScoreChart
- [ ] 实现 ImprovementPoints
- [ ] 实现 WeakQuestionsList
- [ ] 实现改进点提取
- [ ] 实现重新练习
- [ ] 验证回顾页面

---

#### Step 9：设置页面

**目标**：用户信息 + 偏好 + LLM 配置

**交付物**：
- ProfileForm（响应式）
- LLMSettings
- ThemeSwitcher
- 设置持久化

**To-Do**：
- [ ] 实现 ProfileForm
- [ ] 实现 LLMSettings
- [ ] 实现 ThemeSwitcher
- [ ] 实现持久化
- [ ] 验证设置

---

#### Step 10：打包与优化

**目标**：Tauri 打包（Android + Windows）+ 性能优化

**交付物**：
- Android APK / AAB 打包
- Windows MSI / EXE 打包
- 应用图标
- 懒加载优化
- 响应式测试
- 可分发应用

**To-Do**：
- [ ] 配置 Android 打包（SDK、NDK、签名）
- [ ] 配置 Windows 打包
- [ ] 设计应用图标
- [ ] 实现懒加载
- [ ] Android 端测试（竖屏 360-412px，横屏 640-926px）
- [ ] Windows 端测试（1280px+）
- [ ] 最终验收

---

## 八、版本管理规范

### 8.1 分支策略

```
main (保护分支)
├── develop (开发主线)
│   ├── feature/step-{n}-{description}
│   └── ...
├── hotfix/{description}
└── release/v{version}
```

### 8.2 提交规范 (Conventional Commits)

```
<type>(<scope>): <description>
```

| Type | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(practice): add flashcard` |
| `fix` | Bug 修复 | `fix(llm): handle JSON error` |
| `chore` | 构建/工具 | `chore: configure Tailwind` |
| `docs` | 文档 | `docs: update plan` |
| `refactor` | 重构 | `refactor(storage): extract utils` |
| `perf` | 性能 | `perf: lazy load charts` |
| `build` | 构建系统 | `build(tauri): configure icon` |

### 8.3 版本号 (SemVer)

```
v{MAJOR}.{MINOR}.{PATCH}
```

- MAJOR：不兼容变更
- MINOR：新功能
- PATCH：Bug 修复

### 8.4 工作流

```bash
# 开始新步骤
git checkout develop
git checkout -b feature/step-1-project-init

# 开发提交
git commit -m "feat: initialize Next.js project"

# 完成合并
git checkout develop
git merge --no-ff feature/step-1-project-init
git tag -a milestone/step-1 -m "Step 1 complete"
git push origin develop --tags
```

### 8.5 追踪命令

| 目的 | 命令 |
|------|------|
| 按类型筛选 | `git log --oneline --grep="feat"` |
| 查看里程碑 | `git tag -l "milestone/*"` |
| 追踪文件 | `git log --follow -- <file>` |
| 安全回滚 | `git revert <commit>` |

### 8.6 远程仓库

| 仓库 | 地址 |
|------|------|
| `origin` | `https://github.com/Cralmeon/collegeEnglishHelper.git` |

---

## 九、附录

### A. 项目文档

| 文档 | 用途 |
|------|------|
| `FINAL_PLAN.md` | 开发规划（本文档） |
| `AGENTS.md` | Agent 指令（Next.js 版本注意事项） |
| `CLAUDE.md` | Claude Code 项目指令（指向 AGENTS.md） |
| `DEVLOG.md` | 开发博客：Agent 开发思路与经验 |
| `briefInstruction.md` | 原始需求简述 |

### B. 参考资源

- Claude 设计规范：`awesome-design-md/design-md/claude/DESIGN.md`
- Next.js：https://nextjs.org
- Tauri：https://tauri.app
- Framer Motion：https://www.framer.com/motion
- Recharts：https://recharts.org

### C. 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-06-05 | 初始版本 |
| v2.0 | 2026-06-05 | Next.js、字体、Agent 模式、提示词占位 |
| v2.1 | 2026-06-05 | 响应式设计规范 |
| v2.2 | 2026-06-05 | 字体配置完成（思源宋体） |
| v2.3 | 2026-06-05 | 版本管理规范 |
| v3.0 | 2026-06-05 | 全文重构：精简冗余，细化功能描述，重组章节顺序 |
| v3.1 | 2026-06-05 | 更新环境状态：Rust、VS、Android Studio 已安装 |
| v3.2 | 2026-06-05 | Step 1 标记完成；修正技术栈版本（Next.js 16）；补充项目文档索引；新增 DEVLOG.md；新增仓库审查原则 |
| v3.3 | 2026-06-05 | 明确目标平台：Android + Windows |
| v3.4 | 2026-06-05 | 新增 DEVLOG 同频更新原则；重写 DEVLOG.md 修正阶段描述 |
| v3.5 | 2026-06-05 | 新增原则：Step 内细分，逐步完成 |
