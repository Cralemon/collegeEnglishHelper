# 用 Agent 开发一个桌面应用：思路、步骤与踩坑记录

> 这不是一个"AI 帮我写代码"的故事，而是一个"我如何指挥 AI 写代码"的记录。

---

## 背景

我要做一个大学英语翻译练习的桌面应用。技术栈：Next.js 16 + React 19 + Tauri v2。目标平台：Android + Windows。

我选择用 AI Agent（Claude Code）作为主要开发工具。这篇文章记录的是**我作为指挥者的思路**，而不是 Agent 的内部工作细节。

---

## 第一阶段：项目规划（人 → Agent → 人确认）

### 做了什么

我写了一份粗略的需求文档（`briefInstruction.md`），然后让 AI 基于它生成完整的开发规划（`FINAL_PLAN.md`）。

### 实际流程

```
我：给出粗略需求（briefInstruction.md）
    ↓
AI：生成完整规划（FINAL_PLAN.md v1.0）
    ↓
我：审阅，提出修改意见
    ↓
AI：迭代修改（v2.0 → v2.3 → v3.0）
    ↓
我：确认最终版本
```

### 关键心得

1. **粗略需求由人写，详细规划可交给 AI**。我不需要自己写 800 行的规划文档，但我需要清楚地表达"我要什么"。`briefInstruction.md` 就是我的原始输入。

2. **规划文档是 Agent 的指令集**。FINAL_PLAN 越清晰，后续 Agent 写代码越可控。模糊的输入 = 模糊的输出。

3. **人必须审阅最终规划**。AI 生成的规划可能有技术选型错误（比如它默认用了 Next.js 15 而非 16）、遗漏关键配置（比如 `output: 'export'`）、或不符合我的实际偏好。审阅这一步不能省。

4. **迭代是正常的**。FINAL_PLAN 从 v1.0 到 v3.0 经历了多次重构。这不叫返工，这叫需求澄清。

---

## 第二阶段：环境初始化（人做）

### 做了什么

Step 1（项目初始化）是我**全权手动完成**的，没有让 Agent 介入。

### 为什么手动做

1. **掌控感**。项目骨架是整个应用的地基。我需要亲手确认每个依赖版本、每个配置项。
2. **理解成本**。手动初始化一次，我就知道 `next.config.ts` 里该有什么、`tauri.conf.json` 的结构是什么。后续让 Agent 改这些文件时，我能判断它的改动是否正确。
3. **避免黑箱**。如果 Agent 初始化了项目，我不确定它用了哪些默认配置，后续排查问题会很被动。

### 手动做了什么

- `pnpm create next-app` 初始化（手动选择 TypeScript、Tailwind CSS、App Router）
- `pnpm tauri init` 初始化 Tauri
- 配置 `next.config.ts`（添加 `output: 'export'`）
- 下载字体文件到 `public/fonts/`
- 整理 `.gitignore`
- 配置 `AGENTS.md`（告诉 Agent 关于 Next.js 版本的注意事项）

### 关键心得

**不是所有任务都适合交给 Agent。** 项目初始化这种"地基型"工作，手动做一次换来的是对项目结构的深度理解。这个理解在后续所有 Agent 协作中都会用到。

---

## 第三阶段：Agent 协作开发（持续）

从 Step 2 开始，我将逐步让 Agent 介入开发。每一步的流程：

```
人：给出当前 Step 的指令
    ↓
Agent：执行（写代码、改配置）
    ↓
人：验收（对照 FINAL_PLAN 检查）
    ↓
人：仓库审查（git status + git diff）
    ↓
人：git commit + 更新 DEVLOG
    ↓
（循环：下一个 Step）
```

---

### Step 2：设计系统与字体 ✅

**执行者**：Agent
**日期**：2026-06-05

#### 方案评估与决策

在开始实现前，Agent 对方案进行了全面评估：

1. **字体配置**：
   - 问题：Source Han Serif 的 `.ttc` 格式兼容性未验证，文件体积大（20MB+）
   - 决策：暂时跳过 Source Han Serif，用系统宋体替代
   - 理由：先完成核心功能，字体可后续优化

2. **CSS 变量管理**：
   - 问题：`FINAL_PLAN.md` 定义的变量需与 Tailwind `@theme` 对齐
   - 决策：使用 Tailwind `@theme inline` 集中管理
   - 理由：直接生成工具类（`bg-primary`、`text-ink`），与 Tailwind 无缝集成

3. **主题闪烁问题**：
   - 问题：用户首次访问时可能看到主题闪烁（FOUC）
   - 决策：添加防闪烁内联脚本
   - 理由：提升用户体验

4. **组件方案**：
   - 选项：shadcn/ui vs 自定义 + CVA
   - 决策：自定义 + CVA
   - 理由：Tailwind CSS 4 兼容性更好，完全符合 Claude 设计风格

#### 实现内容

| 子任务 | 文件 | 说明 |
|--------|------|------|
| 字体配置 | `src/styles/fonts.ts` | EB Garamond + Sarasa Gothic |
| CSS 变量 | `src/app/globals.css` | 色彩/间距/圆角 + 深色主题 |
| 主题 Hook | `src/hooks/useTheme.ts` | localStorage 持久化 + 系统监听 |
| 防闪烁 | `src/components/ThemeScript.tsx` | 内联脚本 |
| Button | `src/components/ui/Button.tsx` | 5 种变体 + 4 种尺寸 |
| Card | `src/components/ui/Card.tsx` | 4 种变体 + 子组件 |
| Input | `src/components/ui/Input.tsx` | Input + Textarea |
| Badge | `src/components/ui/Badge.tsx` | 6 种变体 |
| Tabs | `src/components/ui/Tabs.tsx` | 3 种变体 + Context |
| 预览页面 | `src/app/page.tsx` | 设计系统展示 |

#### 关键决策记录

1. **字体变量命名**：`--font-eb-garamond` 和 `--font-sarasa-gothic`
2. **CSS 变量命名**：遵循 FINAL_PLAN.md 的设计规范
3. **组件变体管理**：使用 CVA（class-variance-authority）
4. **主题存储键**：`ueh_theme`（与 FINAL_PLAN.md 的 localStorage 键名一致）

#### 遗留问题

- ~~Source Han Serif（`.ttc` 格式）暂未配置，需后续处理~~ ✅ 已解决
- ~~响应式断点配置未在 CSS 变量中定义（使用 Tailwind 默认断点）~~ ✅ 已解决

---

### Step 2 迭代优化记录 ✅

**执行者**：Agent + 人类验收
**日期**：2026-06-05

#### 问题发现与修复

在人类验收过程中，发现了多个设计规范问题，Agent 逐一修复：

**1. 排版层级未生效**
- **问题**：`text-display-xl`、`text-display-lg` 等工具类未生成
- **原因**：Tailwind CSS 4 的 `@theme inline` 只处理变量，不生成工具类
- **修复**：在 `@layer utilities` 中定义排版工具类

**2. 思源宋体未配置**
- **问题**：之前跳过了 Source Han Serif
- **修复**：使用 `@font-face` 加载 `.ttc` 格式，完整字体回退栈

**3. 圆角变量命名错误**
- **问题**：使用 `--rounded-lg` 而非 `--radius-lg`
- **原因**：Tailwind CSS 4 使用 `--radius-*` 前缀
- **修复**：改为 `@theme`（非 `@theme inline`）并使用正确的变量名

**4. Tabs 组件间距问题**
- **问题**：TabsList 背景色导致视觉间距过大；TabsContent 与 TabsList 间距过小
- **修复**：移除 TabsList 背景色；添加 TabsContent `pt-2`

**5. Card 组件间距问题**
- **问题**：CardContent 的 `pt-2` 导致独立卡片内容不居中
- **修复**：改用 Card 的 `space-y-2` 自动处理子元素间距

**6. 按钮圆角不一致**
- **问题**：不同大小按钮使用不同圆角
- **修复**：统一使用 `rounded-md`（8px）

**7. Badge 圆角不符合规范**
- **问题**：使用 `rounded-sm/md/lg` 而非 `rounded-pill`
- **修复**：统一使用 `rounded-pill`（9999px）

#### 关键经验

1. **Tailwind CSS 4 的 `@theme inline` vs `@theme`**：
   - `@theme inline`：只处理变量，不覆盖默认值
   - `@theme`：覆盖默认值，生成完整的工具类

2. **CSS 变量命名**：
   - Tailwind 使用 `--radius-*` 而非 `--rounded-*`
   - 需要查阅 Tailwind 源码确认正确的变量名

3. **组件间距设计**：
   - 使用 `space-y-*` 处理子元素间距比在子元素上添加 `pt-*` 更灵活
   - 避免在组件上添加默认 margin，让父容器控制间距

4. **最小变更原则**：
   - 修改时避免影响无关内容
   - 每次修改后验证构建

---

### Step 3：布局与导航 ✅

**执行者**：Agent
**日期**：2026-06-05

#### 方案演进

初始方案为 TopNav（桌面水平导航）+ MobileDrawer（移动端抽屉），后经用户决策重构为底部 Pill 导航栏。

**重构原因**：多端统一体验，避免移动端/桌面端导航割裂。

**最终方案**：
- 底部固定 Pill 导航栏（BottomNav）
- 多端统一：移动端内容区全宽，PC 端跟随内容最大宽度
- 圆角可配置：`--nav-pill-radius` CSS 变量，默认 `9999px`（pill 形态）
- `useNavRadius` Hook：localStorage 持久化圆角值
- 覆盖式悬浮：导航栏覆盖在所有内容之上，内容区底部 padding 预留空间

#### 实现内容

| 子任务 | 文件 | 说明 |
|--------|------|------|
| useNavRadius | `src/hooks/useNavRadius.ts` | localStorage 持久化导航圆角 |
| CSS 变量 | `src/app/globals.css` | `--nav-pill-radius: 9999px` |
| BottomNav | `src/components/layout/BottomNav.tsx` | 底部 pill 导航，动态圆角 |
| AppLayout | `src/components/layout/AppLayout.tsx` | 简化为内容区 + 底部 padding |
| 占位页面 | `src/app/review/page.tsx`、`src/app/settings/page.tsx` | 回顾/设置占位 |

#### 已删除文件

| 文件 | 原因 |
|------|------|
| `src/components/layout/TopNav.tsx` | 被 BottomNav 替代 |
| `src/components/layout/MobileDrawer.tsx` | 被 BottomNav 替代 |

#### 关键决策

1. **圆角默认值**：`9999px`（pill 形态），用户可在设置中调整
2. **存储键**：`ueh_nav_radius`（与 FINAL_PLAN 的 localStorage 键名一致）
3. **导航高度预留**：`pb-24`（96px）为内容区底部 padding
4. **悬浮方式**：`fixed bottom-0` + `pointer-events-none`（容器）/ `pointer-events-auto`（导航本体）

#### 迭代优化

**用户反馈**：
1. 导航标签字号过大
2. 平板+屏幕应使用侧边垂直导航
3. 活跃标签应使用 30% 主题色 pill 背景

**响应式布局演进**：
- 移动端（<768px）：底部水平 pill，内容区全宽
- 平板+（≥768px）：侧边垂直 pill，左/右侧居中，72px 宽

**新增文件**：
| 文件 | 说明 |
|------|------|
| `src/hooks/useNavPosition.ts` | 导航位置 Hook（左/右，localStorage 持久化） |

**修改文件**：
| 文件 | 变更 |
|------|------|
| `src/components/layout/BottomNav.tsx` | 响应式布局 + 活跃标签样式 + 字号缩小 |
| `src/components/layout/AppLayout.tsx` | 响应式 padding（移动端底部预留，平板+左侧预留） |
| `src/app/globals.css` | 新增 `text-caption-small` 工具类（11px） |

**存储键**：`ueh_nav_position`（`left` / `right`）

#### 迭代优化 2

**用户反馈**：
1. 移动端底部导航活跃 tab 与父容器间距不统一（`mx-1.5` 残留）
2. 导航标签字号仍过大（11px）
3. hover 效果圆角应与父容器动态匹配
4. 滑动指示器 transition 未生效，要求撤销

**问题分析**：

| # | 根因 | 修复 |
|---|------|------|
| 1 | link 上 `mx-1.5` 在移动端未移除，桌面端已修但遗漏 | 移除 `mx-1.5`，容器统一用 `gap-1.5`（移动）/ `gap-1`（桌面） |
| 2 | `text-caption-small`（11px）仍偏大 | 改为 `text-[10px] font-medium` |
| 3 | hover 使用固定 `rounded-lg`（12px），未随父容器圆角计算 | `style={{ borderRadius: Math.max(0, radius - padding) }}` |
| 4 | `ResizeObserver` + 绝对定位指示器方案过于复杂，transition 在响应式切换时不可靠 | 移除指示器 div/refs/state/effect，恢复直接背景 |

**删除内容**：
- `globals.css` 中 `.nav-indicator-transition` 类及 `@media` 覆盖
- BottomNav 中 `containerRef`、`itemRefs`、`indicatorStyle`、`calculateIndicator`、`useEffect`

**关键经验**：
1. 迭代修改时需检查所有断点，避免修复一个断点遗漏另一个
2. 过渡动画方案需评估响应式布局切换场景的可靠性，不稳定的方案应及时回退
3. 圆角等视觉属性应随父容器动态计算，避免硬编码固定值

---

## 迭代优化 3（v3.10）

**触发**：用户反馈 + 冗余代码检查

**问题分析**：

| # | 问题 | 根因 | 修复 |
|---|------|------|------|
| 1 | `.text-caption-small`（11px）在 globals.css 中定义但从未被任何组件引用 | Step 3 迭代中先定义了 CSS class，后改用 Tailwind 任意值 `text-[10px]`，旧 class 未清理 | 删除该 class |
| 2 | BottomNav 标签字号 10px 过小 | v3.9 从 11px 缩至 10px，过度修正 | 改为 `text-xs`（12px） |
| 3 | AGENTS.md 缺少项目级行为规范 | 仅有 Next.js agent rules，缺少 FINAL_PLAN 中的协作原则 | 从 FINAL_PLAN §7.1 提取关键规范写入 AGENTS.md |

**删除内容**：
- `globals.css` 中 `.text-caption-small` 类（178-183 行）

**修改内容**：
- `BottomNav.tsx`：`text-[10px]` → `text-xs`
- `AGENTS.md`：追加最小变更原则、Step 内细分、仓库审查、DEVLOG 同频更新、版本管理、提交规范、不擅改未要求内容

---

## Step 3 完成：布局与导航

**Step 3 已全部完成**，包含以下子任务：
- AppLayout 响应式容器
- BottomNav 底部 Pill 导航（移动端水平底部 / 平板+垂直侧边）
- 三个页面路由（/、/review、/settings）
- 占位页面
- 多轮迭代优化（字号、间距、圆角、hover、位置切换）

---

## Android APK 构建（v3.11）

**目标**：首次构建 Android release APK

**问题链**（共 5 个，逐一排查）：

| # | 错误 | 根因 | 修复 |
|---|------|------|------|
| 1 | `cargo: command not found` | bash/PowerShell PATH 缺少 `.cargo\bin` | 构建命令前加 `$env:Path` |
| 2 | `node.bat` 进程启动失败 | `BuildTask.kt` 硬编码了 fnm 临时目录路径，该目录已过期 | 改为 fnm 稳定安装路径 |
| 3 | `Cannot find module 'src-tauri\tauri'` | `BuildTask.kt` 用 `node tauri` 调用 CLI，但 `tauri` 不是有效 JS 入口 | 改为 `node ../node_modules/@tauri-apps/cli/tauri.js` |
| 4 | `requires JVM runtime version 11` | 默认 JAVA_HOME 指向 JDK 8，AGP 8.x 需 JDK 11+ | 构建时设 `JAVA_HOME` → JDK 21 |
| 5 | `No key with alias 'ceaEnglish'` | keystore 实际 alias 是 `craenglish`（全小写），配置写错了 | 修正 `keystore.properties` |

**额外修复**：
- 签名配置从根 `build.gradle.kts`（无效）移至 `app/build.gradle.kts`（正确位置）
- `Cargo.toml` 添加 `[profile.release]`：`strip = true`, `lto = true`, `codegen-units = 1`, `opt-level = "s"`

**构建命令**（PowerShell）：
```powershell
$env:JAVA_HOME = "C:\Users\28618\scoop\apps\temurin21-jdk\current"
$env:Path = "C:\Users\28618\scoop\persist\fnm\node-versions\v24.15.0\installation;C:\Users\28618\.cargo\bin;$env:Path"
npx tauri android build --apk
```

**APK 输出位置**：`src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk`

**关键经验**：
1. Tauri 的 `gen/android/` 是自动生成的，但 `BuildTask.kt` 中的 node 路径会在 `tauri android init` 时固化——如果用 fnm 等临时 PATH 管理器，生成的路径会过期
2. Android Gradle Plugin 8.x 强制要求 JDK 17+，scoop 默认的 temurin8-jdk 不够
3. `keytool -list` 可以查看 keystore 中的实际 alias，不要靠记忆

---

## 字体优化（v3.12）

**问题**：APK 767MB，远超正常值（~30MB）

**根因**：`public/fonts/` 包含 297MB 字体文件，被 `next build` 复制到 `out/fonts/`，Tauri 再嵌入 APK

| 字体 | 原始大小 | 优化后 | 方式 |
|------|---------|--------|------|
| SourceHanSerif.ttc（35 个字体） | 163MB | 5.0MB | 提取 SC Regular+Bold → WOFF2 子集（3818 CJK 字符） |
| SarasaUiSC（10 个变体） | 134MB | 2.9MB | 保留 Regular/SemiBold/Bold → WOFF2 子集 |
| EBGaramond（10 个变体） | 5MB | 暂移除 | 待补充 WOFF2 版本 |
| **总计** | **297MB** | **7.9MB** | **↓ 97%** |

**WOFF2 子集字符集**：
- 应用源码中的所有字符（207 个）
- CJK 常用字 3818 个（U+4E00-U+5CFF）
- 基本 Latin + 数字 + 标点
- CJK 标点符号

**修改文件**：
- `src/styles/fonts.ts`：移除 EB Garamond，Sarasa 改用 WOFF2
- `src/app/globals.css`：`--font-display` 移除 `var(--font-eb-garamond)` 引用
- `public/fonts/`：删除所有 TTF/TTC，保留 WOFF2 子集

**关键经验**：
1. `public/` 目录会被 Next.js 原样复制到 `out/`——大文件会直接膨胀 APK
2. TTC 文件包含多个语言变体，提取需要的变体可以大幅减少体积
3. `fonttools` 的 subset + WOFF2 转换一步到位，3818 字符子集约 2.5MB
4. Android 自带思源宋体（Noto Serif CJK），CJK 字体不需要嵌入——但 Web/Desktop 需要

---

## EB Garamond 字体补回

**日期**：2026-06-06

**背景**：v3.12 字体优化时 EB Garamond 被标记为"暂移除，待补充 WOFF2 版本"，但后续未补回，导致 `--font-display` 回退到 Source Han Serif SC。

**修复**：
- 从 Google Fonts 下载 EB Garamond Latin WOFF2 子集（40KB）
- `src/styles/fonts.ts`：重新添加 `ebGaramond` 导出，恢复 `fontVariables` 拼接
- `src/app/globals.css`：`--font-display` 改回 `var(--font-eb-garamond), Georgia, serif`

**注意**：字体文件在 `.gitignore` 中，首次 clone 需手动下载。

---

## Step 4：状态管理与数据层 ✅

**执行者**：Agent
**日期**：2026-06-06

### 实现内容

| 子任务 | 文件 | 说明 |
|--------|------|------|
| 安装 Zustand | `package.json` | zustand 5.0.14 |
| 类型定义 | `src/types/index.ts` | Question, AnswerRecord, AIFeedback, Collection, UserProfile, LLMConfig, ImprovementPoint 等全部业务类型 |
| localStorage 封装 | `src/services/storage.ts` | 类型安全的 storageGet/Set/Remove + Zustand persist 适配器 |
| practiceStore | `src/features/practice/store.ts` | 题目列表、当前索引、草稿、作答记录、翻转状态、打乱顺序 |
| reviewStore | `src/features/review/store.ts` | 改进点提取（去重+频率统计）、统计计算工具函数 |
| settingsStore | `src/features/settings/store.ts` | 用户信息、LLM 配置、题集 CRUD、当前激活题集 |

### 关键设计决策

1. **Zustand 5 + persist 中间件**：使用 `partialize` 只持久化必要数据，临时状态（isEvaluating、isFlipped、draft）不持久化
2. **reviewStore 的改进点提取**：`extractFromRecords` 为纯函数，从作答记录中提取改进点并按频率排序，使用 `dimension:content` 作为去重键
3. **computeStatistics**：独立导出的纯函数，不依赖 store 状态，方便在组件中直接计算
4. **settingsStore 合并管理**：用户信息、LLM 配置、题集统一在一个 store 中，使用单一 localStorage 键持久化

### 新增需求（用户追加）

在 Step 10 中新增两个 Tauri 平台适配需求：
1. **Android 安全区适配**：配置 `app.android.safeArea`，适配状态栏/导航栏
2. **桌面端最小窗口**：配置 `app.windows[].minWidth/minHeight`，防止布局混乱

---

## 设计规范对齐 & 主题风格重构

### 背景

新 Agent 交接后，首先阅读了 Claude 设计规范（`awesome-design-md/design-md/claude/DESIGN.md`），确认项目的视觉语言与 Claude 品牌一致。

### 关键发现

设计规范定义了一套完整的 **warm-canvas editorial** 风格：
- 奶油色画布（#faf9f5）+ 珊瑚色主色（#cc785c）+ 深色产品表面（#181715）
- 衬线显示字体（Copernicus/EB Garamond）+ 人文无衬线正文（StyreneB/Inter）
- 色块优先的层次系统，极少使用阴影

### 主题切换重构

原方案中"主题切换"仅指浅色/深色/跟随系统。经澄清，主题切换应为**不同 UI 风格**的切换：

| 主题风格 | 视觉特征 |
|---------|---------|
| Claude（默认） | 暖色调奶油画布 + 珊瑚主色 + 衬线标题 |
| 微软 | Fluent Design 风格，Mica 材质，圆角卡片 |
| 谷歌 | Material Design 3，动态色彩，大圆角 |
| iOS | 毛玻璃效果，SF Pro 字体，极简线条 |

同时保留独立的**外观模式**（浅色/深色/跟随系统），与主题风格叠加。

### 数据模型变更

`UserProfile` 中原 `theme` 字段拆分为：
- `themeStyle`: `'claude' | 'microsoft' | 'google' | 'ios'` — UI 风格
- `colorScheme`: `'light' | 'dark' | 'system'` — 外观模式

### FINAL_PLAN.md 更新

- v3.13 → v3.14
- 设置页面线框图更新（主题风格 + 外观模式分两行）
- 功能清单拆分为"主题风格"和"外观模式"两项
- 数据模型更新
- Step 9 交付物拆分 ThemeStyleSwitcher + ColorSchemeSwitcher

## CSS spacing 命名冲突修复

### 问题

在 Tailwind CSS 4 的 `@theme` 块中定义 `--spacing-sm: 12px` 会覆盖 Tailwind 内部的 spacing token。`max-w-sm` 映射到 `max-width: var(--spacing-sm)`，原本应为 `24rem`，但被覆盖为 `12px`，导致文字容器宽度极小。

### 修复

将自定义 spacing 变量重命名为 `--space-*` 前缀，避免与 Tailwind 内部 `--spacing-*` 冲突。

## 题目偏好与生成

### 新增功能

- **题目偏好配置**：用户可在设置中选择预设题目类型（红色主题、政治、励志、科技、文化、日常、商务、学术）或输入自定义偏好
- **题目生成**：无题目时，首页显示卡片式空状态 + 两个按钮（前往设置、生成题目）
- **模拟生成**：`mockGenerateQuestions` 根据用户画像（学年段、翻译方向、题目偏好）生成 10 道模拟题目
- **数据模型**：`UserProfile` 新增 `topicPreference: TopicPreference` 字段

### 数据模型

```typescript
type PresetTopic = 'red-theme' | 'political' | 'motivational' | 'technology' | 'culture' | 'daily-life' | 'business' | 'academic';
interface TopicPreference {
  presetTopics: PresetTopic[];
  customTopics: string;
}
```

---

## 当前进度

| Step | 状态 | 说明 |
|------|------|------|
| Step 1：项目初始化 | ✅ 手动完成 | Next.js 16 + Tailwind CSS 4 + Tauri v2 |
| Step 2：设计系统与字体 | ✅ Agent 完成 | Claude 设计系统 + 字体 + 5 个基础组件 |
| Step 3：布局与导航 | ✅ Agent 完成 | AppLayout + 底部 Pill 导航 + 路由 |
| Step 4：状态管理与数据层 | ✅ Agent 完成 | Zustand stores + localStorage + 类型定义 |
| Step 5：翻译练习核心 | ✅ Agent 完成 | FlashCard 3D 翻转 + 滑动手势 + 模拟反馈 |
| Step 6-10 | 待开始 | — |

---

*本文档持续更新，与 Git 提交同频。内容来源：开发对话上下文。*
