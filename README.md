# 大学英语翻译练习助手

面向大学生的英语翻译练习工具，基于 AI 反馈驱动「答题 → 暴露问题 → 针对性训练」的学习闭环。

## 功能

- **卡片式翻译练习** — 层叠翻卡设计，单题作答不信息过载；左滑跳过，右滑回退
- **AI 多维反馈** — 准确性 / 流畅度 / 完整性三维评分 + 问题分类 + 翻译策略分析 + 学习建议
- **回顾与统计** — 刷题数、平均分、维度统计、分数趋势图、改进点列表，支持针对性再练习
- **用户画像** — 根据答题历史生成薄弱项分析，智能指导后续出题方向
- **水平测试** — 快速评估当前英语水平，生成初始用户画像
- **题集管理** — 支持创建/切换题集、随机打乱、作答记录缓存
- **翻译模式** — 单句 / 段落、中译英 / 英译中自由切换
- **多主题** — Claude / 微软 / 谷歌 / iOS 四种设计风格，支持浅色/深色/跟随系统

## 技术栈

| 层面 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) + React 19 |
| 桌面端 | Tauri v2 |
| 样式 | Tailwind CSS 4 |
| 状态管理 | Zustand |
| 动画 | Framer Motion |
| LLM 集成 | 兼容 OpenAI API 的任意服务 |

## 快速开始

### 环境要求

- Node.js 20+
- pnpm（推荐）
- Rust（仅 Tauri 桌面端构建需要）

### 安装

```bash
pnpm install
```

### 开发

```bash
# Web 开发服务器
pnpm dev

# Tauri 桌面应用（Android）
pnpm tauri android dev

# Tauri 桌面应用（Windows）
pnpm tauri dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000) 查看效果。

### 构建

```bash
# Web 静态导出
pnpm build

# Tauri 桌面应用构建
pnpm tauri build
```

## 项目结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── page.tsx            # 练习页（首页）
│   ├── review/             # 回顾页 + 详情页
│   └── settings/           # 设置页
├── components/
│   ├── layout/             # 布局组件（BottomNav, BlurOverlay, ScrollFade）
│   └── ui/                 # UI 组件库（Card, Button, Dialog, Tabs, Toast...）
├── features/
│   ├── practice/           # 练习模块（FlashCard, FeedbackPanel, LLM 客户端）
│   ├── review/             # 回顾模块（统计、趋势图、改进点列表）
│   └── settings/           # 设置模块（用户画像、水平测试、LLM 配置）
├── hooks/                  # 自定义 Hooks
├── services/               # 持久化存储服务
├── styles/                 # 字体配置
├── types/                  # TypeScript 类型定义
└── utils/                  # 工具函数
src-tauri/                  # Tauri 桌面端配置
```

## 配置 LLM

在设置页中填入 LLM API 地址、密钥和模型名称。支持任何兼容 OpenAI API 格式的服务（OpenAI、Ollama、vLLM 等）。

数据仅存储在本地浏览器 `localStorage` 中，不会上传到任何第三方服务器。

## 许可证

MIT
