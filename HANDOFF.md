## 项目概况

- **产品**：大学英语翻译练习助手（卡片式翻译练习 + AI 反馈）
- **目标平台**：Android + Windows（响应式布局，移动端优先）
- **技术栈**：Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + Tauri v2
- **包管理**：pnpm
- **项目位置**：当前工作目录

## 当前状态

- **Step 1（项目初始化）✅** — Next.js 16 + Tailwind CSS 4 + Tauri v2 骨架就位
- **Step 2（设计系统与字体）✅** — Claude 设计系统 + 字体 + 5 个基础组件
- **Step 3（布局与导航）✅** — AppLayout + BottomNav + 三页面路由 + 多轮迭代优化
- **Android APK 构建 ✅** — 签名配置就绪，已成功构建 release APK
- **字体优化 ✅** — 297MB → 7.9MB（WOFF2 子集）

## 你必须先做的事

在写任何代码之前，请依次阅读以下文件：

1. `FINAL_PLAN.md` — 完整开发规划（所有需求、设计规范、数据模型、开发步骤都在里面）
2. `AGENTS.md` — Agent 行为规范（**必须遵守**，包含最小变更原则、版本管理等）
3. `DEVLOG.md` — 开发日志（了解已完成的工作和踩过的坑）
4. `node_modules/next/dist/docs/` — Next.js 16 官方文档（**必须先读，不要凭训练数据写代码**）

## 关键原则

1. **按 FINAL_PLAN 的 Step 顺序执行**，不要跳步
2. **每个 Step 内细分为子任务**，逐步完成并验收，不要一口气做完整个 Step
3. **每完成一个子任务，等待人类验收**后再继续
4. **不要假设 API** — Next.js 16 可能与你训练数据中的版本不同，先查文档
5. **类型定义先行** — 写业务代码前先定义 TypeScript 类型
6. **仓库审查** — 每次提交前，人类会 `git status` + `git diff` 检查你的工作
7. **DEVLOG 同频更新** — 每次有意义的提交，同步更新 `DEVLOG.md`
8. **最小变更原则** — 修改时避免影响无关内容，不要回退已有的正确调整
9. **不要修改未被要求的内容** — 用户未明确要求的文件、样式、组件，即使看起来"可以优化"，也不要擅自改动

## 已知问题

- `src-tauri/gen/` 目录未在 `.gitignore` 中（Tauri 自动生成，可忽略）
- `BuildTask.kt` 中的 node 路径硬编码——如果换机器或换 node 版本，需要手动更新

## 下一步

请先阅读上述文件，然后向人类确认你已理解项目状态和下一步任务（**Step 4：状态管理与数据层**）。等待人类指示后再动手。

---

## 交接清单

| 项目 | 状态 | 说明 |
|------|------|------|
| Step 1 | ✅ | 项目初始化 |
| Step 2 | ✅ | 设计系统与字体 |
| Step 3 | ✅ | 布局与导航 |
| Git 分支 | `develop` | 开发主线 |
| 里程碑标签 | `milestone/step-1`, `milestone/step-2` | 已创建 |
| 字体文件 | `public/fonts/` | WOFF2 子集（Sarasa Gothic 3 weight + Source Han Serif SC 2 weight），EB Garamond 待补充 |
| FINAL_PLAN | v3.12 | 版本管理已同步 |
| DEVLOG | 包含 3 轮迭代 + Android 构建 + 字体优化记录 | 完整 |
| 依赖 | `class-variance-authority`, `clsx`, `tailwind-merge` | 已安装 |
| BottomNav | `src/components/layout/BottomNav.tsx` | 多端统一 pill 导航 |
| AppLayout | `src/components/layout/AppLayout.tsx` | 响应式主布局 |
| Hooks | `useNavRadius`, `useNavPosition` | localStorage 持久化 |
| Android 签名 | `src-tauri/gen/android/keystore.properties` | alias: `craenglish` |
| APK 输出 | `src-tauri/gen/android/app/build/outputs/apk/universal/release/` | universal release |
| FINAL_PLAN | v3.11 | 版本管理已同步 |
| DEVLOG | 包含 3 轮迭代 + Android 构建记录 | 完整 |

---

*本文档在 Step 3 完成后更新，用于项目交接。*
