## 项目概况

- **产品**：大学英语翻译练习助手（卡片式翻译练习 + AI 反馈）
- **目标平台**：Android + Windows（响应式布局，移动端优先）
- **技术栈**：Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + Tauri v2
- **包管理**：pnpm

## 当前进度

| Step | 状态 |
|------|------|
| Step 1：项目初始化 | ✅ |
| Step 2：设计系统与字体 | ✅ |
| Step 3：布局与导航 | ✅ |
| Step 4：状态管理与数据层 | ✅ |
| Step 5：翻译练习核心 | ⬜ 下一步 |

## 写代码前必须阅读

1. `AGENTS.md` — 行为规范（**必须遵守**）
2. `FINAL_PLAN.md` — 完整开发规划（需求、设计规范、数据模型）
3. `DEVLOG.md` — 开发日志（已完成工作、踩坑记录）

## 已知问题

- `src-tauri/gen/` 是 Tauri 自动生成目录，未在 `.gitignore` 中，提交时忽略
- `BuildTask.kt` 中 node 路径硬编码，换机器或换 node 版本需手动更新
- `public/fonts/` 在 `.gitignore` 中，首次 clone 需手动复制字体文件（WOFF2 子集，~8MB）

## 关键文件索引

| 用途 | 路径 |
|------|------|
| 根布局 | `src/app/layout.tsx` |
| 设计系统变量 | `src/app/globals.css` |
| 字体配置 | `src/styles/fonts.ts` |
| 类型定义 | `src/types/index/index.ts` |
| localStorage 封装 | `src/services/storage.ts` |
| 练习 Store | `src/features/practice/store.ts` |
| 回顾 Store | `src/features/review/store.ts` |
| 设置 Store | `src/features/settings/store.ts` |
| 底部导航 | `src/components/layout/BottomNav.tsx` |
| 主布局 | `src/components/layout/AppLayout.tsx` |

---

*Step 4 完成后更新。*
