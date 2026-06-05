# 大学英语翻译练习助手 — 最终开发规划

> 版本：v2.1 | 日期：2026-06-05 | 状态：待确认

---

## 一、项目概述

### 1.1 产品定位
面向大学生的英语翻译练习工具，通过卡片式翻译题目练习，引导学生在词汇、语法、句型三个维度逐步提升。

### 1.2 设计哲学
- **运作单位**：每一道翻译题
- **核心循环**：作答 → AI 反馈 → 针对性提升 → 再次练习
- **技术策略**：在需要稳定性的地方用程序代码，在需要学习针对性内容的地方用 LLM

### 1.3 目标用户
- 大学生（四六级/考研/专四专八备考）
- 个人使用，无需考虑隐私保护和数据安全

---

## 二、技术架构

### 2.1 技术选型

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端框架** | Next.js 15 + React 19 + TypeScript | SSR/SSG 支持，App Router |
| **UI 框架** | Tailwind CSS 4 | 原子化 CSS，快速实现设计规范 |
| **状态管理** | Zustand | 轻量级状态管理，适合中小型应用 |
| **动画** | Framer Motion | 卡片翻转、滑动等交互动画 |
| **图表** | Recharts | 统计图表展示 |
| **打包** | Tauri v2 | Rust 后端，体积小，原生体验 |
| **数据存储** | localStorage | 浏览器内置，简单直接 |
| **LLM 接口** | OpenAI 兼容 API | 支持 OpenAI、DeepSeek、Moonshot 等 |
| **包管理器** | pnpm | 通过 corepack 管理 |

### 2.2 环境依赖

| 依赖 | 状态 | 安装方式 |
|------|------|----------|
| Node.js 24.15.0 | ✅ 已安装 | fnm |
| pnpm 10.33.2 | ✅ 已安装 | corepack |
| Rust / Cargo | ❌ 需安装 | rustup |
| Tauri CLI | ❌ 需安装 | cargo install tauri-cli |

### 2.3 字体系统

| 用途 | 字体 | 文件位置 | 说明 |
|------|------|----------|------|
| 英文衬线体 | EB Garamond | `D:\personal\fonts\fontbase\fonts\EBGaramond-*.ttf` | 10 个字重文件 |
| 英文无衬线体 | Sarasa Gothic (更纱黑体) | `D:\personal\fonts\fontbase\fonts\SarasaUiSC-*.ttf` | 简体中文 UI 版本 |
| 中文衬线体 | ⚠️ 待确认 | 未在字体目录找到 | 见下方说明 |
| 中文无衬线体 | Sarasa Gothic (更纱黑体) | 同英文无衬线体 | 内置中文支持 |

> **⚠️ 中文衬线体说明**：在 `D:\personal\fonts\fontbase\fonts` 中未找到 Source Han Serif（思源宋体）。
> 请确认：是否需要单独下载？或者使用其他中文衬线体替代？

### 2.4 项目结构

```
universityEnglishHelper/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # 根布局
│   │   ├── page.tsx               # 首页（翻译练习）
│   │   ├── review/
│   │   │   └── page.tsx           # 回顾页面
│   │   ├── settings/
│   │   │   └── page.tsx           # 设置页面
│   │   └── globals.css            # 全局样式
│   ├── components/                # 通用组件
│   │   ├── ui/                    # 基础 UI 组件
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Tabs.tsx
│   │   │   └── index.ts
│   │   ├── layout/                # 布局组件
│   │   │   ├── AppLayout.tsx      # 主布局
│   │   │   └── TopNav.tsx         # 顶部导航
│   │   └── shared/                # 业务共享组件
│   │       ├── FlashCard.tsx      # 翻卡组件
│   │       ├── ScoreDisplay.tsx   # 分数展示
│   │       └── FeedbackPanel.tsx  # 反馈面板
│   ├── features/                  # 功能模块
│   │   ├── practice/              # 翻译练习模块
│   │   │   ├── components/
│   │   │   │   ├── PracticeCard.tsx
│   │   │   │   ├── AnswerInput.tsx
│   │   │   │   ├── AIFeedback.tsx
│   │   │   │   └── CollectionManager.tsx
│   │   │   ├── hooks/
│   │   │   │   └── usePractice.ts
│   │   │   ├── store/
│   │   │   │   └── practiceStore.ts
│   │   │   ├── services/
│   │   │   │   └── llmService.ts
│   │   │   └── index.ts
│   │   ├── review/                # 回顾模块
│   │   │   ├── components/
│   │   │   │   ├── StatisticsCard.tsx
│   │   │   │   ├── ScoreChart.tsx
│   │   │   │   ├── ImprovementPoints.tsx
│   │   │   │   └── WeakQuestionsList.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useReview.ts
│   │   │   ├── store/
│   │   │   │   └── reviewStore.ts
│   │   │   └── index.ts
│   │   └── settings/              # 个人/设置模块
│   │       ├── components/
│   │       │   ├── ProfileForm.tsx
│   │       │   ├── LLMSettings.tsx
│   │       │   ├── ThemeSwitcher.tsx
│   │       │   └── LevelTest.tsx
│   │       ├── hooks/
│   │       │   └── useSettings.ts
│   │       ├── store/
│   │       │   └── settingsStore.ts
│   │       └── index.ts
│   ├── hooks/                     # 全局 Hooks
│   │   ├── useLocalStorage.ts
│   │   ├── useTheme.ts
│   │   └── useLLM.ts
│   ├── services/                  # 全局服务
│   │   ├── storage.ts             # localStorage 封装
│   │   └── prompts.ts             # LLM 提示词模板
│   ├── types/                     # TypeScript 类型
│   │   ├── practice.ts
│   │   ├── review.ts
│   │   ├── settings.ts
│   │   └── llm.ts
│   ├── utils/                     # 工具函数
│   │   ├── score.ts               # 分数计算
│   │   ├── stats.ts               # 统计计算
│   │   └── format.ts              # 格式化
│   └── styles/                    # 样式
│       ├── fonts.ts               # 字体配置
│       └── theme.css              # 主题变量
├── src-tauri/                     # Tauri 后端
│   ├── src/
│   │   └── main.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── public/                        # 公共资源
│   └── fonts/                     # 字体文件（软链接或复制）
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── FINAL_PLAN.md
```

---

## 三、功能模块设计

### 3.1 首页（翻译练习）

#### 3.1.1 核心交互流程

```
┌─────────────────────────────────────────────────────────┐
│                    翻译练习卡片                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  题目：                                          │   │
│  │  "The quick brown fox jumps over the lazy dog."  │   │
│  │                                                  │   │
│  │  ┌─────────────────────────────────────────┐    │   │
│  │  │  请输入您的翻译...                        │    │   │
│  │  │                                          │    │   │
│  │  └─────────────────────────────────────────┘    │   │
│  │                                                  │   │
│  │  [提交翻译]                                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ← 左滑查看上一题    右滑进入下一题 →                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
                          ↓ 提交后翻转
┌─────────────────────────────────────────────────────────┐
│                    AI 反馈（卡片背面）                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  📊 总分：85/100                                │   │
│  │                                                  │   │
│  │  ✅ 语法维度：                                   │   │
│  │     优点：时态使用正确...                         │   │
│  │     改进：建议使用被动语态...                     │   │
│  │                                                  │   │
│  │  📚 词汇维度：                                   │   │
│  │     优点：核心词汇准确...                         │   │
│  │     改进：可用 "敏捷" 替代 "快速"...             │   │
│  │                                                  │   │
│  │  🏗️ 句型维度：                                   │   │
│  │     优点：句子结构完整...                         │   │
│  │     改进：可尝试使用定语从句...                   │   │
│  │                                                  │   │
│  │  💡 总结：整体翻译质量良好，建议在词汇多样性上    │   │
│  │     进一步提升。                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [下一题 →]                                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 3.1.2 功能清单

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 卡片式翻转交互 | P0 | 正面：题目+作答；反面：AI 反馈 |
| 单句/段落切换 | P0 | 设置中配置，默认单句 |
| 中译英/英译中 | P0 | 设置中配置，默认中译英 |
| 题集管理 | P0 | 创建、切换、删除题集 |
| 缓存作答历史 | P0 | localStorage 存储 |
| 打乱题目顺序 | P1 | 随机打乱当前题集 |
| 滑动手势 | P1 | 左右滑动切换题目 |
| 快捷键支持 | P2 | Enter 提交，← → 切换 |

#### 3.1.3 LLM 提示词设计

> **📝 提示词占位**：此处使用"编写该提示词的指引"占位，将交给另一 Agent 编写。

**翻译评分提示词 — 编写指引：**
- 角色：专业的英语翻译教师
- 输入：原文、学生翻译、翻译方向、学生信息（学年段、词汇量）
- 输出：严格的 JSON 格式
- 评估维度：语法（Grammar）、词汇（Vocabulary）、句型（Sentence Structure）
- 每个维度包含：分数、优点列表、改进建议列表
- 总分：百分制
- 总结：一句简短的综合评价

### 3.2 回顾（改进点收录）

#### 3.2.1 页面布局

```
┌─────────────────────────────────────────────────────────┐
│  回顾与统计                                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │  刷题总数    │ │  平均分      │ │  最高分      │      │
│  │    128      │ │    78       │ │    98       │      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  分数分布图表（柱状图/饼图）                      │   │
│  │  [图表区域]                                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  改进点收录                                       │   │
│  │                                                  │   │
│  │  [语法] [词汇] [句型]                             │   │
│  │                                                  │   │
│  │  语法改进点：                                     │   │
│  │  • 被动语态使用不熟练（出现 12 次）               │   │
│  │  • 虚拟语气混淆（出现 8 次）                      │   │
│  │  ...                                             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  弱势题目（50分以下）                             │   │
│  │                                                  │   │
│  │  [题目1] [题目2] [题目3] ...                      │   │
│  │                                                  │   │
│  │  [重新练习弱势题目]                               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 3.2.2 功能清单

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 基础统计数据 | P0 | 刷题数量、平均分、最高分 |
| 分数分布图表 | P0 | 柱状图展示各分段题目数量 |
| 三维改进点展示 | P0 | 语法、词汇、句型分类展示 |
| 弱势题目筛选 | P0 | 50分以下题目可推入首页再次练习 |
| 时间趋势图 | P1 | 折线图展示分数变化趋势 |
| 导出报告 | P2 | 导出 PDF/JSON 格式报告 |

### 3.3 个人/设置

#### 3.3.1 页面布局

```
┌─────────────────────────────────────────────────────────┐
│  个人设置                                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  用户信息                                         │   │
│  │                                                  │   │
│  │  昵称：[________]                                │   │
│  │  学年段：[大一 ▼]                                 │   │
│  │  预估词汇量：[4000 ▼]                             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  翻译练习偏好                                     │   │
│  │                                                  │   │
│  │  练习模式：(● 单句) (○ 段落)                      │   │
│  │  翻译方向：(● 中译英) (○ 英译中)                  │   │
│  │  主题切换：[通用 ▼]                               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  LLM 配置                                        │   │
│  │                                                  │   │
│  │  API 地址：[https://api.openai.com/v1]           │   │
│  │  API Key：[sk-••••••••]                          │   │
│  │  模型选择：[gpt-4o ▼]                             │   │
│  │                                                  │   │
│  │  [测试连接]                                       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  主题设置                                         │   │
│  │                                                  │   │
│  │  [☀️ 浅色] [🌙 深色] [🎨 跟随系统]               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  水平测试                                         │   │
│  │                                                  │   │
│  │  通过简短测试评估您的英语水平                      │   │
│  │  [开始测试]                                       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 3.3.2 功能清单

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 用户信息管理 | P0 | 昵称、学年段、词汇量 |
| 翻译偏好设置 | P0 | 单句/段落、中译英/英译中 |
| LLM 配置 | P0 | API 地址、Key、模型选择 |
| 主题切换 | P1 | 浅色/深色/跟随系统 |
| 水平测试 | P2 | 评估英语水平的简短测试 |
| 数据导出/导入 | P2 | 备份和恢复数据 |

---

## 四、设计规范实现

### 4.1 设计系统

基于 `awesome-design-md/design-md/claude/DESIGN.md` 实现 Claude 风格设计系统。

#### 4.1.1 色彩系统

```css
/* theme.css */
:root {
  /* Brand & Accent */
  --color-primary: #cc785c;
  --color-primary-active: #a9583e;
  --color-primary-disabled: #e6dfd8;
  --color-accent-teal: #5db8a6;
  --color-accent-amber: #e8a55a;

  /* Surface */
  --color-canvas: #faf9f5;
  --color-surface-soft: #f5f0e8;
  --color-surface-card: #efe9de;
  --color-surface-cream-strong: #e8e0d2;
  --color-surface-dark: #181715;
  --color-surface-dark-elevated: #252320;
  --color-surface-dark-soft: #1f1e1b;

  /* Text */
  --color-ink: #141413;
  --color-body-strong: #252523;
  --color-body: #3d3d3a;
  --color-muted: #6c6a64;
  --color-muted-soft: #8e8b82;
  --color-on-primary: #ffffff;
  --color-on-dark: #faf9f5;
  --color-on-dark-soft: #a09d96;

  /* Hairline */
  --color-hairline: #e6dfd8;
  --color-hairline-soft: #ebe6df;

  /* Semantic */
  --color-success: #5db872;
  --color-warning: #d4a017;
  --color-error: #c64545;
}

/* 深色主题 */
.dark {
  --color-canvas: #181715;
  --color-surface-soft: #1f1e1b;
  --color-surface-card: #252320;
  --color-surface-cream-strong: #2d2b28;
  --color-ink: #faf9f5;
  --color-body-strong: #e6dfd8;
  --color-body: #a09d96;
  --color-muted: #8e8b82;
  --color-muted-soft: #6c6a64;
  --color-hairline: #3d3d3a;
  --color-hairline-soft: #2d2b28;
}
```

#### 4.1.2 字体系统

```typescript
// styles/fonts.ts
import localFont from 'next/font/local';

// EB Garamond - 英文衬线体
export const ebGaramond = localFont({
  src: [
    { path: '../../public/fonts/EBGaramond-Regular.ttf', weight: '400' },
    { path: '../../public/fonts/EBGaramond-Medium.ttf', weight: '500' },
    { path: '../../public/fonts/EBGaramond-SemiBold.ttf', weight: '600' },
    { path: '../../public/fonts/EBGaramond-Bold.ttf', weight: '700' },
    { path: '../../public/fonts/EBGaramond-ExtraBold.ttf', weight: '800' },
    // 斜体
    { path: '../../public/fonts/EBGaramond-Italic.ttf', weight: '400', style: 'italic' },
    { path: '../../public/fonts/EBGaramond-MediumItalic.ttf', weight: '500', style: 'italic' },
    { path: '../../public/fonts/EBGaramond-SemiBoldItalic.ttf', weight: '600', style: 'italic' },
    { path: '../../public/fonts/EBGaramond-BoldItalic.ttf', weight: '700', style: 'italic' },
    { path: '../../public/fonts/EBGaramond-ExtraBoldItalic.ttf', weight: '800', style: 'italic' },
  ],
  variable: '--font-display',
  display: 'swap',
});

// Sarasa Gothic - 无衬线体（含中文）
export const sarasaGothic = localFont({
  src: [
    { path: '../../public/fonts/SarasaUiSC-ExtraLight.ttf', weight: '200' },
    { path: '../../public/fonts/SarasaUiSC-Light.ttf', weight: '300' },
    { path: '../../public/fonts/SarasaUiSC-Regular.ttf', weight: '400' },
    { path: '../../public/fonts/SarasaUiSC-SemiBold.ttf', weight: '600' },
    { path: '../../public/fonts/SarasaUiSC-Bold.ttf', weight: '700' },
    // 斜体
    { path: '../../public/fonts/SarasaUiSC-ExtraLightItalic.ttf', weight: '200', style: 'italic' },
    { path: '../../public/fonts/SarasaUiSC-LightItalic.ttf', weight: '300', style: 'italic' },
    { path: '../../public/fonts/SarasaUiSC-Italic.ttf', weight: '400', style: 'italic' },
    { path: '../../public/fonts/SarasaUiSC-SemiBoldItalic.ttf', weight: '600', style: 'italic' },
    { path: '../../public/fonts/SarasaUiSC-BoldItalic.ttf', weight: '700', style: 'italic' },
  ],
  variable: '--font-body',
  display: 'swap',
});

// 字体 CSS 变量
export const fontVariables = `${ebGaramond.variable} ${sarasaGothic.variable}`;
```

```css
/* Tailwind 配置 */
@theme {
  --font-display: var(--font-display), 'Georgia', serif;
  --font-body: var(--font-body), 'Inter', -apple-system, sans-serif;
  --font-code: 'JetBrains Mono', ui-monospace, monospace;
}
```

#### 4.1.3 排版层级

| Token | 字体 | 大小 | 字重 | 行高 | 字间距 | 用途 |
|-------|------|------|------|------|--------|------|
| `display-xl` | EB Garamond | 64px | 400 | 1.05 | -1.5px | 首页大标题 |
| `display-lg` | EB Garamond | 48px | 400 | 1.1 | -1px | 章节标题 |
| `display-md` | EB Garamond | 36px | 400 | 1.15 | -0.5px | 子章节标题 |
| `display-sm` | EB Garamond | 28px | 400 | 1.2 | -0.3px | 卡片标题 |
| `title-lg` | Sarasa Gothic | 22px | 500 | 1.3 | 0 | 重要标签 |
| `title-md` | Sarasa Gothic | 18px | 500 | 1.4 | 0 | 卡片标题 |
| `title-sm` | Sarasa Gothic | 16px | 500 | 1.4 | 0 | 列表标签 |
| `body-md` | Sarasa Gothic | 16px | 400 | 1.55 | 0 | 正文 |
| `body-sm` | Sarasa Gothic | 14px | 400 | 1.55 | 0 | 辅助文字 |
| `caption` | Sarasa Gothic | 13px | 500 | 1.4 | 0 | 标签 |
| `code` | JetBrains Mono | 14px | 400 | 1.6 | 0 | 代码块 |

#### 4.1.4 间距与圆角

```css
:root {
  /* Spacing */
  --spacing-xxs: 4px;
  --spacing-xs: 8px;
  --spacing-sm: 12px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-xxl: 48px;
  --spacing-section: 96px;

  /* Border Radius */
  --rounded-xs: 4px;
  --rounded-sm: 6px;
  --rounded-md: 8px;
  --rounded-lg: 12px;
  --rounded-xl: 16px;
  --rounded-pill: 9999px;
  --rounded-full: 9999px;
}
```

#### 4.1.5 响应式设计

**断点系统**（基于 Tailwind CSS 默认断点）：

| 断点名称 | 宽度范围 | 典型设备 |
|----------|----------|----------|
| `xs` | < 640px | 手机竖屏 |
| `sm` | 640px - 767px | 手机横屏 |
| `md` | 768px - 1023px | 平板竖屏 |
| `lg` | 1024px - 1279px | 平板横屏 / 小笔记本 |
| `xl` | 1280px - 1535px | 桌面显示器 |
| `2xl` | ≥ 1536px | 大屏显示器 |

**响应式策略**：

| 组件 | 移动端 (< 768px) | 平板端 (768-1023px) | 桌面端 (≥ 1024px) |
|------|------------------|---------------------|-------------------|
| **TopNav** | 汉堡菜单 + 抽屉式导航 | 水平导航，紧凑间距 | 完整水平导航 |
| **练习卡片** | 全宽，垂直堆叠 | 居中卡片，两侧留白 | 居中卡片，最大宽度 640px |
| **统计卡片** | 单列堆叠 | 2 列网格 | 3 列网格 |
| **图表** | 单列，高度 200px | 单列，高度 280px | 侧边栏 + 图表，高度 320px |
| **改进点列表** | 单列，可折叠 | 单列，可折叠 | 3 列 Tab 布局 |
| **设置表单** | 单列，全宽 | 单列，最大宽度 480px | 双列布局，最大宽度 640px |
| **题集管理** | 底部抽屉 | 侧边栏（可收起） | 左侧固定侧边栏 |

**响应式布局原则**：

1. **移动优先**：所有组件默认按移动端设计，通过 `md:`、`lg:` 前缀扩展到大屏
2. **内容优先级**：移动端隐藏次要信息，桌面端展示完整内容
3. **触控友好**：移动端按钮最小 44px，间距至少 8px
4. **弹性布局**：使用 Flexbox 和 Grid 实现自适应，避免固定宽度
5. **字体缩放**：移动端字体适当缩小（display 系列减少 20-30%）
6. **安全区域**：考虑刘海屏和底部安全区域（`env(safe-area-inset-*)`）

**响应式组件示例**：

```typescript
// 练习卡片响应式布局
<div className="w-full max-w-2xl mx-auto px-4 md:px-6 lg:px-8">
  <PracticeCard className="min-h-[400px] md:min-h-[500px]" />
</div>

// 统计卡片网格
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  <StatisticsCard />
  <StatisticsCard />
  <StatisticsCard />
</div>

// TopNav 响应式
<nav className="flex items-center justify-between h-16 px-4 md:px-6">
  {/* 移动端：汉堡菜单 */}
  <button className="md:hidden">☰</button>
  {/* 桌面端：完整导航 */}
  <div className="hidden md:flex items-center gap-6">...</div>
</nav>
```

**移动端特殊处理**：

1. **滑动手势**：使用 `react-swipeable` 实现卡片左右滑动
2. **底部安全区**：添加 `pb-safe` 适配 iPhone 底部横条
3. **虚拟键盘**：输入框聚焦时自动滚动到可视区域
4. **触摸反馈**：按钮添加 `active:scale-95` 缩放效果
5. **长按菜单**：题目卡片支持长按弹出操作菜单

---

## 五、数据模型设计

### 5.1 核心数据结构

```typescript
// types/practice.ts

// 题目
interface Question {
  id: string;
  sourceText: string;           // 原文
  translationDirection: 'zh-en' | 'en-zh';  // 翻译方向
  category: string;             // 分类/主题
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: number;            // 创建时间戳
}

// 作答记录
interface AnswerRecord {
  id: string;
  questionId: string;
  userTranslation: string;      // 用户翻译
  score: number;                // 总分 0-100
  feedback: AIFeedback;         // AI 反馈
  answeredAt: number;           // 作答时间戳
}

// AI 反馈
interface AIFeedback {
  grammar: DimensionFeedback;
  vocabulary: DimensionFeedback;
  sentenceStructure: DimensionFeedback;
  summary: string;
}

// 维度反馈
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

// types/settings.ts

// 用户信息
interface UserProfile {
  nickname: string;
  gradeLevel: '大一' | '大二' | '大三' | '大四' | '研一' | '研二' | '研三';
  vocabularyLevel: number;      // 预估词汇量
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
```

### 5.2 localStorage 存储结构

```typescript
// 存储键名
const STORAGE_KEYS = {
  QUESTIONS: 'ueh_questions',
  ANSWERS: 'ueh_answers',
  COLLECTIONS: 'ueh_collections',
  USER_PROFILE: 'ueh_user_profile',
  LLM_CONFIG: 'ueh_llm_config',
  IMPROVEMENTS: 'ueh_improvements',
} as const;

// 改进点
interface ImprovementPoint {
  id: string;
  dimension: 'grammar' | 'vocabulary' | 'sentenceStructure';
  content: string;
  frequency: number;           // 出现次数
  relatedQuestionIds: string[];
  firstSeen: number;
  lastSeen: number;
}
```

---

## 六、开发计划（Agent 模式）

### 6.1 开发原则

1. **逐步交付**：每个步骤完成后，应用程序可以正常打开，关键功能可供测试
2. **To-Do List 维护**：每个 Agent 任务维护待办清单，完成后等待验收再推进
3. **独立可测**：每步交付物独立可运行，不依赖后续步骤

### 6.2 步骤规划

#### 步骤 1：项目初始化与环境搭建
**目标**：创建 Next.js + Tauri 项目骨架，安装依赖，配置基础工具

**交付物**：
- Next.js 15 项目初始化（App Router）
- Tauri v2 基础配置
- Tailwind CSS 4 配置
- TypeScript 配置
- pnpm 项目结构
- 应用可启动并显示空白首页

**To-Do**：
- [ ] 初始化 Next.js 项目
- [ ] 配置 Tailwind CSS 4
- [ ] 初始化 Tauri v2
- [ ] 验证 `pnpm dev` 可启动
- [ ] 验证 `pnpm tauri dev` 可启动

---

#### 步骤 2：设计系统与字体配置
**目标**：实现 Claude 设计系统基础，配置字体，确保响应式

**交付物**：
- 色彩系统（CSS 变量）
- 字体配置（EB Garamond + Sarasa Gothic）
- 基础 UI 组件库（Button、Card、Input、Badge、Tabs）
- 浅色/深色主题切换
- 响应式断点配置
- 应用显示设计系统预览页面

**To-Do**：
- [ ] 复制字体文件到 public/fonts/
- [ ] 配置 next/font/local
- [ ] 实现色彩 CSS 变量
- [ ] 配置 Tailwind 响应式断点
- [ ] 实现 Button 组件（含移动端触控优化）
- [ ] 实现 Card 组件（含响应式布局）
- [ ] 实现 Input 组件（含移动端键盘适配）
- [ ] 实现 Badge 组件
- [ ] 实现 Tabs 组件（移动端可滚动）
- [ ] 实现主题切换
- [ ] 创建设计预览页面（展示各断点效果）

---

#### 步骤 3：布局与导航
**目标**：实现应用主布局和页面导航，支持响应式

**交付物**：
- TopNav 顶部导航组件（含移动端汉堡菜单）
- AppLayout 主布局组件（响应式内容区域）
- React Router 路由配置（首页/回顾/设置）
- 页面间可正常切换
- 移动端抽屉式导航

**To-Do**：
- [ ] 实现 TopNav 组件（含汉堡菜单）
- [ ] 实现 AppLayout 组件（响应式容器）
- [ ] 实现移动端抽屉导航
- [ ] 配置 Next.js 路由
- [ ] 创建首页占位页面
- [ ] 创建回顾占位页面
- [ ] 创建设置占位页面
- [ ] 验证页面切换正常

---

#### 步骤 4：状态管理与数据层
**目标**：实现 Zustand 状态管理和 localStorage 数据层

**交付物**：
- Zustand stores（practice、review、settings）
- localStorage 封装服务
- TypeScript 类型定义
- 数据可持久化存储

**To-Do**：
- [ ] 定义 TypeScript 类型
- [ ] 实现 localStorage 封装
- [ ] 实现 practiceStore
- [ ] 实现 reviewStore
- [ ] 实现 settingsStore
- [ ] 验证数据持久化

---

#### 步骤 5：翻译练习核心功能
**目标**：实现卡片式翻译练习的核心交互，支持响应式

**交付物**：
- FlashCard 翻卡组件（3D 翻转动画 + 移动端滑动手势）
- AnswerInput 答案输入组件（移动端键盘适配）
- PracticeCard 练习卡片组件（响应式布局）
- 基础作答流程（输入→提交→翻转→查看结果）
- 模拟 AI 反馈（占位数据）

**To-Do**：
- [ ] 实现 FlashCard 组件（含 3D 翻转）
- [ ] 实现移动端滑动手势（react-swipeable）
- [ ] 实现 AnswerInput 组件（含移动端适配）
- [ ] 实现 PracticeCard 组件（响应式布局）
- [ ] 实现翻转动画
- [ ] 实现模拟反馈数据
- [ ] 验证作答流程（桌面端 + 移动端）

---

#### 步骤 6：LLM 集成
**目标**：实现 OpenAI 兼容 API 调用

**交付物**：
- LLM 服务层
- API 配置界面
- 翻译评分提示词（占位指引）
- 真实 AI 反馈替换模拟数据
- 连接测试功能

**To-Do**：
- [ ] 实现 LLM 服务层
- [ ] 实现 API 配置界面
- [ ] 编写提示词指引（占位）
- [ ] 集成到练习流程
- [ ] 实现连接测试
- [ ] 验证 AI 反馈正常

---

#### 步骤 7：题集管理
**目标**：实现题集的创建、切换、管理功能

**交付物**：
- CollectionManager 题集管理组件
- 题集 CRUD 操作
- 题目打乱功能
- 作答历史缓存

**To-Do**：
- [ ] 实现 CollectionManager 组件
- [ ] 实现题集 CRUD
- [ ] 实现题目打乱
- [ ] 实现作答缓存
- [ ] 验证题集功能

---

#### 步骤 8：回顾与统计页面
**目标**：实现统计图表和改进点展示，支持响应式

**交付物**：
- StatisticsCard 统计卡片（响应式网格布局）
- ScoreChart 分数图表（Recharts，自适应尺寸）
- ImprovementPoints 改进点展示（移动端可折叠）
- WeakQuestionsList 弱势题目列表
- "重新练习"功能

**To-Do**：
- [ ] 实现 StatisticsCard 组件（响应式网格）
- [ ] 实现 ScoreChart 组件（自适应图表）
- [ ] 实现 ImprovementPoints 组件（移动端 Tab 布局）
- [ ] 实现 WeakQuestionsList 组件
- [ ] 实现改进点提取逻辑
- [ ] 实现重新练习功能
- [ ] 验证回顾页面（桌面端 + 移动端）

---

#### 步骤 9：设置页面
**目标**：实现用户信息、偏好、LLM 配置，支持响应式

**交付物**：
- ProfileForm 用户信息表单（移动端单列，桌面端双列）
- LLMSettings 配置组件
- ThemeSwitcher 主题切换
- 设置持久化

**To-Do**：
- [ ] 实现 ProfileForm 组件（响应式布局）
- [ ] 实现 LLMSettings 组件
- [ ] 实现 ThemeSwitcher 组件
- [ ] 实现设置持久化
- [ ] 验证设置功能（桌面端 + 移动端）

---

#### 步骤 10：打包与优化
**目标**：Tauri 打包、性能优化、响应式测试

**交付物**：
- Tauri 打包配置
- 应用图标
- 性能优化（懒加载）
- 响应式适配测试（多设备尺寸）
- 可分发的应用程序

**To-Do**：
- [ ] 配置 Tauri 打包
- [ ] 设计应用图标
- [ ] 实现懒加载
- [ ] 移动端响应式测试（320px - 480px）
- [ ] 平板端响应式测试（768px - 1024px）
- [ ] 桌面端响应式测试（1280px+）
- [ ] 触控设备交互测试
- [ ] 最终验收

---

## 七、LLM 集成方案

### 7.1 API 调用封装

```typescript
// services/llmService.ts
class LLMService {
  private apiUrl: string;
  private apiKey: string;
  private model: string;

  constructor(config: LLMConfig) {
    this.apiUrl = config.apiUrl;
    this.apiKey = config.apiKey;
    this.model = config.model;
  }

  async evaluateTranslation(params: {
    sourceText: string;
    userTranslation: string;
    direction: 'zh-en' | 'en-zh';
    userProfile: UserProfile;
  }): Promise<AIFeedback> {
    // 提示词使用占位指引，由另一 Agent 编写
    const prompt = buildEvaluationPrompt(params);

    const response = await fetch(`${this.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: '你是一位专业的英语翻译教师...' // 占位
          },
          {
            role: 'user',
            content: prompt
          }
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
      const response = await fetch(`${this.apiUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
```

### 7.2 提示词管理

> **📝 提示词占位**：所有提示词使用"编写该提示词的指引"占位，将交给另一 Agent 编写。

**翻译评分提示词 — 编写指引：**
- 角色：专业的英语翻译教师
- 输入：原文、学生翻译、翻译方向、学生信息
- 输出：严格 JSON 格式
- 维度：语法、词汇、句型
- 每维度：分数、优点、改进
- 总分：百分制
- 总结：一句简短评价

**水平测试提示词 — 编写指引：**
- 角色：英语水平评估专家
- 输入：学生信息、测试题目作答
- 输出：评估结果和水平等级
- 评估维度：词汇量、语法掌握、阅读理解

---

## 八、风险评估与应对

| 风险 | 影响 | 应对策略 |
|------|------|----------|
| Rust 未安装 | Tauri 无法编译 | 步骤 1 中安装 rustup |
| LLM 输出格式不稳定 | 无法正确解析反馈 | JSON Schema 验证 + 重试 |
| localStorage 容量限制 | 数据丢失 | 数据压缩 + 定量清理 |
| 字体文件过大 | 首次加载慢 | 字体子集化 + preload |
| 中文衬线体缺失 | 显示效果差 | 待用户确认字体来源 |

---

## 九、待确认事项

1. **中文衬线体**：Source Han Serif（思源宋体）未在字体目录找到，是否需要单独下载？
2. **题目来源**：题目是预置的还是用户自行添加的？
3. **水平测试**：具体的测试流程和题目设计需要进一步明确。
4. **段落翻译**：段落翻译的最大长度限制是多少？

---

## 十、附录

### A. 参考资源

- Claude 设计规范：`awesome-design-md/design-md/claude/DESIGN.md`
- Next.js 文档：https://nextjs.org
- Tauri 文档：https://tauri.app
- Framer Motion：https://www.framer.com/motion
- Recharts：https://recharts.org

### B. 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-06-05 | 初始版本 |
| v2.0 | 2026-06-05 | 更新：Next.js、字体系统、Agent 模式、提示词占位 |
| v2.1 | 2026-06-05 | 新增：响应式设计规范、移动端适配策略 |

---

**请审阅以上规划，确认后即可开始 Agent 开发。**
