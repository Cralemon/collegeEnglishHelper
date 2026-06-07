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

## Step 5 v2 迭代记录

### 叠卡模式

将单卡翻转改为叠卡模式：左滑划走当前卡片展示下一张，右滑找回上一张。使用 framer-motion drag + animate rotateY 实现 3D 翻转。

### 字体规范简化

最初在 `@theme` 中定义了 `--font-display`、`--font-body`、`--font-serif-cjk` 三个字体变量。经澄清后简化为单一 `--font-body`：`EB Garamond → Sarasa Gothic → system-ui`。EB Garamond 只含拉丁字符，fallback 到更纱黑体处理 CJK。删除所有 `font-display` class 引用。

### CSS spacing 命名冲突

Tailwind CSS 4 的 `@theme` 会将 `--space-*` 归一化为 `--spacing-*`，导致 `max-w-sm` 解析为 `12px` 而非 `24rem`。最终将 spacing 变量移出 `@theme` 到 `:root` 解决。

### 布局链路与滚动条

核心难题：卡片使用 `dvh` 计算高度，但中间容器的 `overflow-y-auto` 产生滚动条 → `dvh` 基准突变 → 卡片高度跳变。

**最终方案**：
- `html`：无 overflow（不产生根级滚动条）
- AppLayout 内容 div：`flex flex-col`（无 overflow，不产生中间滚动条）
- 各页面 wrapper：`flex flex-col flex-1 min-h-0`（参与弹性分配）
- settings/review 页面：内部 `overflow-y-auto`（长内容独立滚动）
- 卡片内部：`overflow-y-auto`（卡片内容滚动）
- 唯一的滚动条在卡片内部或页面内容区，不在中间容器

### Textarea 满高

Textarea 组件内有 `div.w-full` 包裹层，无高度属性，导致 `h-full` 无法穿透。新增 `wrapperClassName` prop 解决。

### 导航状态恢复

`prevQuestion`/`nextQuestion`/`setCurrentIndex` 原本无条件设置 `isFlipped: false`。修复后检查 `answerRecords`，已作答题目自动显示反馈面。

---

## AI 反馈数据结构设计

**日期**：2026-06-06

### 讨论目标

设计 AI 反馈的维度、格式，以及与统计/回顾系统的协同机制。

### 核心决策

| 项目 | 决定 |
|------|------|
| 问题定位粒度 | 文本片段匹配（用户原文直接匹配） |
| 问题与维度关系 | 问题挂在维度下（内聚结构） |
| 严重程度分级 | 保留三级：error / warning / suggestion |
| 翻译策略维度 | 新增，字段用数组，不限一句话点评 |
| summary 字段 | 改为 overallSuggestion，聚焦学习建议 |
| 改进点聚类 | 标准化分类标签（IssueCategory），16 个预定义类别 |
| 掌握度追踪 | mastery 字段，出现下降、连续未出现上升 |
| IssueCategory 兜底 | 不需要 other |

### 数据结构核心变化

| 原设计 | 新设计 |
|--------|--------|
| 无具体问题 | `Issue` 挂在维度下 |
| 无分类标签 | `IssueCategory` 16 个标准分类 |
| 无翻译策略 | `TranslationStrategy` 整体分析 |
| summary 字符串 | `overallSuggestion` 数组 |
| 无掌握度 | `mastery` 追踪 |
| 无学习数据 | `LearningData` 用户画像 |

### 学习闭环设计

```
答题 → AI反馈 → 提取改进点 → 聚合统计 → 更新用户画像 → 指导出题 → 答题...
```

对应用户感知：
```
答题 → 暴露问题 → 看到薄弱点 → 针对性训练 → 掌握提升
```

### 掌握度更新规则

- 每次出现该类问题 → mastery 下降（-10）
- 连续 5 次答题未出现该问题 → mastery 上升（+5）
- mastery > 80 视为"已掌握"，不再优先推荐

### IssueCategory 枚举

```typescript
type IssueCategory =
  | 'grammar.tense' | 'grammar.voice' | 'grammar.agreement'
  | 'grammar.article' | 'grammar.preposition' | 'grammar.clause'
  | 'grammar.subjunctive' | 'grammar.word-order'
  | 'vocab.accuracy' | 'vocab.collocation' | 'vocab.formality'
  | 'vocab.diversity'
  | 'structure.choppy' | 'structure.run-on'
  | 'structure.parallelism' | 'structure.coherence';
```

---

## Phase 5：数据结构重构 ✅

**执行者**：Agent
**日期**：2026-06-06

### 目标

将代码中的数据结构对齐 FINAL_PLAN.md §5.1（v2.1 新设计）。

### 修改内容

| 文件 | 变更 |
|------|------|
| `src/types/index.ts` | 新增 IssueSeverity、IssueCategory（16 类）、Issue、KeyPointHandling、TranslationStrategy、WeakCategory、LearningData；DimensionFeedback 新增 issues/tips；AIFeedback 替换 summary 为 overallSuggestion 数组、新增 translationStrategy；ImprovementPoint 改用 category/mastery/recentIssueIds |
| `src/features/practice/services/mockFeedback.ts` | 生成含 issues（category/severity）和 translationStrategy 的新结构模拟数据 |
| `src/features/practice/components/FeedbackPanel.tsx` | 新增 IssueItem 组件（severity Badge）、StrategySection 组件（approach/keyPoints）；overallSuggestion 替代 summary |
| `src/features/review/store.ts` | extractFromRecords 改为按 IssueCategory 聚合；新增 updateMastery action；category→dimension 映射函数；categoryDescription 中文映射 |

### 关键设计决策

1. **IssueItem 显示**：`userFragment` + severity Badge（error/warning/suggestion 对应不同颜色）+ suggestedFix + reason
2. **StrategySection**：approach 用颜色区分（直译/意译/结合 → primary/amber/success）；keyPoints 展示原文、译文、评估等级
3. **reviewStore 聚合键**：从 `dimension:content`（字符串文本）改为 `IssueCategory`（枚举），聚合更稳定
4. **mastery 初始值**：新出现的 category 初始 mastery = 50，保持中性

### 构建验证

`pnpm run build` 通过，无类型错误。

---

## Pre Phase 6：首页接口重构 ✅

**执行者**：Agent
**日期**：2026-06-06

### 问题背景

Phase 5 更新了数据结构，但 localStorage 中残留的旧 `answerRecords`（无 `issues` 字段）导致 `FeedbackPanel` 运行时 TypeError：`Cannot read properties of undefined (reading 'length')`。

同时，`CardFront`/`CardBack` 直接读取 store 和调用 `generateMockFeedback`，接口不清晰。

### 修改内容

| 文件 | 变更 |
|------|------|
| `src/features/practice/store.ts` | 新增 `version: 2 + migrate`：旧 answerRecords 自动补全 issues/translationStrategy/overallSuggestion |
| `src/features/practice/components/CardFront.tsx` | 改为纯 props 组件，移除 store/mockFeedback 直接依赖 |
| `src/features/practice/components/CardBack.tsx` | 改为纯 props 组件，移除 store 直接依赖 |
| `src/app/page.tsx` | 接管 generateMockFeedback/submitAnswer/currentRecord 查找，向子组件传 props |

### 关键决策

1. **migrate 而非防御性代码**：在 store 层做一次性迁移比在每个组件里做 `issues ?? []` 更干净，且不影响类型安全
2. **迁移时补全最小字段**：旧 `translationStrategy` 用 `{ approach: '直译意译结合', strengths: [], suggestions: [], keyPoints: [] }` 作为 fallback，不崩溃即可
3. **page.tsx 作为 Controller**：CardFront/CardBack 变为纯展示组件，业务逻辑集中在 page.tsx，符合单向数据流

---

## Phase 6：回顾页 ✅

**执行者**：Agent
**日期**：2026-06-06

### 新增内容

| 文件 | 说明 |
|------|------|
| `src/features/review/components/StatsOverview.tsx` | 刷题数/平均分/最高最低分（2×4 网格）+ 三维度平均分进度条 |
| `src/features/review/components/ImprovementList.tsx` | 按 frequency 降序，mastery 彩色进度条（≥80 绿/≥50 黄/<50 红），点击展开关联记录 ID |
| `src/features/review/components/ScoreTrendChart.tsx` | Recharts 3 AreaChart，最近 20 条，CSS 变量主题色，渐变填充 |
| `src/app/review/page.tsx` | 无数据空状态 + 有数据三组件组合（ScoreTrendChart 在 ≥3 条时显示） |

### 踩坑

- **recharts 3 Tooltip formatter 类型**：参数类型为 `ValueType | undefined`，不能标注 `number`，去掉类型注解即可通过

---

## 当前进度

| Step | 状态 | 说明 |
|------|------|------|
| Step 1：项目初始化 | ✅ 手动完成 | Next.js 16 + Tailwind CSS 4 + Tauri v2 |
| Step 2：设计系统与字体 | ✅ Agent 完成 | Claude 设计系统 + 字体 + 5 个基础组件 |
| Step 3：布局与导航 | ✅ Agent 完成 | AppLayout + 底部 Pill 导航 + 路由 |
| Step 4：状态管理与数据层 | ✅ Agent 完成 | Zustand stores + localStorage + 类型定义 |
| Step 5：翻译练习核心 | ✅ Agent 完成 | FlashCard 叠卡 + 3D 翻转 + 滑动手势 + 模拟反馈 + v2 迭代 |
| Phase 5：数据结构重构 | ✅ Agent 完成 | types/mockFeedback/FeedbackPanel/reviewStore 对齐新结构 |
| Pre Phase 6：首页接口重构 | ✅ Agent 完成 | 旧数据迁移 + CardFront/CardBack 改为纯 props 组件 |
| Phase 6：回顾页 | ✅ Agent 完成 | StatsOverview + ScoreTrendChart + ImprovementList |
| Phase 6 Polish | ✅ Agent 完成 | ScrollFade 双端渐隐 + 卡片高度 + 数字放大 + 展开动画 |
| **Phase 7：设置页** | ✅ Agent 完成 | UserProfileForm + AppConfigSection + LLMConfigSection + DataManagementSection |
| **Pre Phase 8：LLM 提示词设计** | ✅ Agent 完成 | 2 个接入点梳理 + prompts.ts 落地 |
| **Phase 8：LLM 集成** | ✅ Agent 完成 | llmClient.ts + page.tsx 接入 + LLM 优先 mock 降级 |
| Phase 9：学习闭环 | ✅ | reviewStore 扩展 + 弱项驱动出题 |
| Phase 10：Polish + Tauri | ✅ | 全局禁止选中/缩放 + Tauri 窗口配置 + 响应式修复 + 性能清理 |

---

## Phase 7：设置页 ✅

**执行者**：Agent
**日期**：2026-06-06

### 目标

实现设置页完整功能：用户信息管理、应用配置、LLM 配置、数据管理。

### 新增内容

| 文件 | 说明 |
|------|------|
| `src/features/settings/components/UserProfileForm.tsx` | 昵称（Input）、学年段（Tabs underline 7 选项）、词汇量（range slider 1000-15000 step500） |
| `src/features/settings/components/AppConfigSection.tsx` | 翻译方向（中译英/英译中 pills）、翻译模式（单句/段落 pills）、外观主题（浅色/深色/跟随系统 pills）、题目偏好（8 个预设 chip toggle + 自定义 Textarea） |
| `src/features/settings/components/LLMConfigSection.tsx` | API 地址（Input）、API Key（password 输入框 + 显隐切换 eye icon）、模型名称（Input） |
| `src/features/settings/components/DataManagementSection.tsx` | 清除练习数据按钮（window.confirm + practiceStore.clearAll + reviewStore.clearImprovements） |

### 修改内容

| 文件 | 变更 |
|------|------|
| `src/app/settings/page.tsx` | 替换占位内容为四组件组合，使用 ScrollFade + space-y-4 布局 |
| `src/features/settings/index.ts` | 新增 4 个组件导出 |

### 关键决策

1. **学年段用 underline Tabs**：7 个选项（大一至研三）使用 underline variant 比 pills 更紧凑
2. **词汇量用原生 range input**：自定义 accentColor 和渐变背景，移动端原生滑块体验更好
3. **题目偏好用 chip toggle**：Button variant 在 primary/outline 间切换，比 checkbox 更触屏友好
4. **LLM Key 显隐切换**：eye/eye-off SVG icon，默认隐藏 + 安全提示文字
5. **数据清除仅删练习数据**：settingsStore（用户配置/LLM 配置）不受影响，localStorage 键独立

### 构建验证

`pnpm run build` 通过，零类型错误。

---

## Phase 6 Polish ✅

**执行者**：Agent
**日期**：2026-06-06

### 变更内容

| 文件 | 变更 |
|------|------|
| `src/components/layout/ScrollFade.tsx`（新建） | 顶部 + 底部双端渐隐遮罩，ResizeObserver + scroll 检测，到顶/底时遮罩淡出 |
| `src/features/practice/components/FlashCard.tsx` | 去掉无效的 `h-[calc(100dvh-13rem)]`（flex 子元素中不生效），改为 `mb-6` |
| `src/features/review/components/StatsOverview.tsx` | 数字 `text-display-sm → text-display-md`，sub `text-caption → text-body-sm` |
| `src/features/review/components/ImprovementList.tsx` | 展开动画改用 `grid-template-rows: 0fr→1fr`；进度条移入 button 内消除浮动问题 |
| `src/app/review/page.tsx` | 滚动区域换用 `<ScrollFade>` |
| `src/app/settings/page.tsx` | 滚动区域换用 `<ScrollFade>` |

### 踩坑

- **text-display-md 自定义类未生效**：`@layer utilities` 中定义的 `.text-display-md` 在 Tailwind CSS 4 下未被正确应用，渲染结果为 `text-md`（16px 而非 36px）。改用标准 Tailwind 类 `text-5xl`（48px）+ `font-bold` 解决。自定义 CSS 工具类在 CSS4 JIT 下存在兼容风险，优先使用标准类。

### 技术笔记

- **flex 子元素中 h-[calc(...)] 不生效**：`flex-1` 让高度由父容器弹性分配，`h-[calc(...)]` 只在高度比弹性分配结果小时才起约束作用。要让卡片在弹性布局中矮一点，应在元素上加 `mb-*` 从分配空间中扣减，而非设置一个通常被覆盖的固定高度。
- **grid 高度动画**：`grid-template-rows: 0fr → 1fr` + 内层 `overflow-hidden` 是纯 CSS 实现任意高度折叠动画的标准方案，无需 JS 测量。

---

## Pre Phase 8：LLM 提示词设计 ✅

**执行者**：Agent
**日期**：2026-06-07

### 目标

梳理项目中 LLM 接入点，为每个接入点设计 System Prompt + User Prompt，并落地为可复用的函数。

### LLM 接入点全景

| # | 接入点 | 当前 mock | 调用位置 | 触发时机 |
|---|--------|----------|---------|---------|
| 1 | 翻译反馈评估 | `mockFeedback.ts` | `page.tsx` → `handleSubmit` | 用户提交翻译后 |
| 2 | 题目生成 | `mockGenerateQuestions.ts` | `page.tsx` → `handleGenerate` | 空状态 / 最后一题"生成下一组" |

### 新增内容

| 文件 | 说明 |
|------|------|
| `src/features/practice/services/prompts.ts` | 两个 Prompt Builder 函数 + 参数类型 + 占位符/条件块处理 |

### 核心函数

```typescript
// 接入点 1 — 翻译反馈评估
buildFeedbackPrompt(params: FeedbackPromptParams): PromptPair
// params: { sourceText, userTranslation, direction, gradeLevel, vocabularyLevel, weakCategories? }

// 接入点 2 — 题目生成
buildQuestionGenerationPrompt(params: QuestionGenerationPromptParams): PromptPair
// params: { direction, gradeLevel, vocabularyLevel, presetTopics, customTopics, count, weakCategories?, existingTexts? }
```

### 关键设计决策

1. **参数化设计**：所有占位符通过参数对象传入，函数为纯函数，不依赖 store，方便测试和复用
2. **条件块机制**：`{{#key}}...{{/key}}` Handlebars 风格，`weakCategories` 和 `existingTexts` 为可选参数时自动移除整块内容
3. **学年段自适应评分**：`getScoringStandard()` 根据 gradeLevel 动态生成评分标准说明（大一大二宽松 → 研究生严格）
4. **学年段自适应难度**：`getDifficultyDistribution()` 返回 easy:medium:hard 比例（大一 4:4:2 → 研究生 1:4:5）
5. **主题标签中文化**：`PresetTopic` enum 值自动映射为中文标签（如 `'red-theme'` → `'红色主题'`）
6. **纯字符串操作**：`fill()` 函数做 `{{key}}` 替换，不引入 Handlebars 等模板引擎依赖

### 构建验证

`pnpm run build` 通过，零类型错误。

---

---

## Phase 8：LLM 集成 ✅

**执行者**：Agent
**日期**：2026-06-07

### 目标

接入真实 LLM（OpenAI 兼容 API），替换 mock 数据作为主要反馈来源。LLM 失败时自动降级到 mock。

### 新增内容

| 文件 | 说明 |
|------|------|
| `src/features/practice/services/llmClient.ts` | LLM API 客户端：`callLLM()` → `extractJSON()` → `evaluateTranslation()` / `generateQuestions()` |

### 核心设计

```
page.tsx
  → evaluateTranslation(config, params)
    → buildFeedbackPrompt(params)  // prompts.ts
    → callLLM(config, sys, user)   // fetch OpenAI API
    → extractJSON(raw)             // handle ```json blocks
    → validate structure           // check score/translationStrategy/etc.
    → return AIFeedback
  (on error) → generateMockFeedback()  // mock fallback
```

### 错误分级（LLMError.code）

| Code | 触发条件 | 处理 |
|------|---------|------|
| `NO_API_KEY` | apiKey 为空 | mock fallback |
| `NETWORK_ERROR` | fetch 失败 / 超时 60s | mock fallback |
| `API_ERROR` | 非 2xx 响应 | mock fallback |
| `PARSE_ERROR` | JSON 解析失败 / 结构校验失败 | mock fallback |

### 修改内容

| 文件 | 变更 |
|------|------|
| `src/app/page.tsx` | `handleSubmit`：LLM → mock fallback，移除 800ms 人工延迟；`handleGenerate`：LLM → mock fallback，移除 600ms 人工延迟，传入 existingTexts 去重 |
| `src/features/practice/index.ts` | 新增 `evaluateTranslation`/`generateQuestions`/`LLMError`/`LLMErrorCode` 导出 |

### 关键决策

1. **纯 fetch，不引入 AI SDK**：OpenAI 兼容 API 足够简单，fetch 直接调用减少依赖
2. **60s 超时**：AbortController + setTimeout，覆盖大多数 LLM 响应时间
3. **JSON 提取三层策略**：```json block → 裸 {}[] 定位 → 回退原文
4. **结构校验不重试**：校验失败直接抛 PARSE_ERROR，由调用方决定是否重试（当前不重试，直接 mock fallback）
5. **mock 保留为安全网**：用户无感知降级，console.warn 输出错误码方便调试

### 构建验证

`pnpm run build` 通过，零类型错误。

---

## Phase 9：学习闭环 ✅

**执行者**：Agent
**日期**：2026-06-07

### 目标

实现「答题→反馈→优化」的完整循环：每次答题后更新用户画像（LearningData），画像指导下一次出题。

### 新增内容

| 文件 | 说明 |
|------|------|
| （无新增文件） | Phase 9 为纯存量改造 |

### 修改内容

| 文件 | 变更 |
|------|------|
| `src/types/index.ts` | `ImprovementPoint` 新增 `consecutiveAbsences: number` 字段 |
| `src/features/review/store.ts` | 新增 `learningData` 状态 + `computeLearningData()`；`extractFromRecords` 拆分为纯统计 `extractStatsFromRecords` + 状态对比 `extractImprovements`；掌握度追踪：出现 -10 + 连续缺席 5 次 +5；`clearImprovements` 同时清 `learningData`；`partialize` 新增 `learningData`；新增 `suggestedFocusText` 薄弱点建议文案 |
| `src/features/practice/store.ts` | `submitAnswer()` 末尾调用 `useReviewStore.getState().extractImprovements()` 触发聚合链 |
| `src/app/page.tsx` | `handleGenerate` / `handleSubmit` 读取 `learningData.weakCategories` 传入 LLM |

### 关键设计决策

1. **extractStatsFromRecords vs extractImprovements**：将原始统计（纯 Map 聚合）与掌握度追踪（含历史状态对比）分离为两层，职责清晰
2. **mastery 由 extractImprovements 统一管理**：不从 `extractStatsFromRecords` 计算，而在对比旧状态时决策——新出现 50、再次出现 -10、缺席累积 5 次 +5
3. **缺席检测**：`extractImprovements` 对比 freshStats 与旧 `improvementPoints`，旧有而本次未出现的 category → `consecutiveAbsences++`（兜底机制，正常场景下不会触发，因为全量 records 包含所有历史 issues）
4. **recentTrend 阈值 ±5**：近 10 次 vs 前 10 次平均分差值 >5 才判定 improving/declining，避免小波动误判
5. **learningData 为 null vs 空结构**：records 为空时 `learningData = null`（而非零值结构），便于 UI 层判断"无数据"状态
6. **suggestedFocus 中文文案**：16 类 IssueCategory 各配具体学习建议，LLM prompt 直接引用

### 数据流

```
page.tsx: submitAnswer(record)
  → practiceStore.submitAnswer()          // 写入 answerRecords
  → reviewStore.extractImprovements()     // 聚合所有 answerRecords
    → extractStatsFromRecords()           // Map<IssueCategory, RawPointStats>
    → 对比旧 improvementPoints           // mastery 增减 + consecutiveAbsences
    → computeLearningData()               // LearningData
      → totalQuestions / averageScore
      → dimensionScores (grammar/vocab/sentenceStructure 平均)
      → weakCategories (mastery < 50)
      → strongCategories (mastery > 80)
      → recentTrend (近 10 vs 前 10)
  → page.tsx: handleGenerate()
    → 读取 learningData.weakCategories
    → 传入 generateQuestions() → prompts.ts 条件块展开
```

### 构建验证

`pnpm run build` 通过，零类型错误。

---

## Phase 10：Polish + Tauri ✅

**执行者**：Agent
**日期**：2026-06-07

### 目标

全局 UX 打磨（禁止选中/缩放）、Tauri 打包配置、响应式修复、性能清理。

### 修改内容

| 文件 | 变更 |
|------|------|
| `src/app/layout.tsx` | 新增 `viewport` 导出（`maximumScale=1, userScalable=false`）；body 添加 `safe-area-top safe-area-bottom` |
| `src/app/globals.css` | 删除死代码：`@font-face SourceHanSerifSC`（引用不存在的 .ttc）；移除废弃的 `overflow: overlay`；新增全局 `user-select: none`（input/textarea 除外）+ `touch-action: manipulation`；新增 `.safe-area-*` 和 `.safe-mt/safe-mb` 安全区工具类 |
| `src-tauri/tauri.conf.json` | Windows 新增 `minWidth: 360, minHeight: 480` |
| `src/components/layout/BottomNav.tsx` | nav 添加 `safe-mb`（Android 导航栏安全区适配） |
| `src/features/practice/components/CardFront.tsx` | 原文 `<p>` 添加 `break-words`（防止长单词溢出） |
| `src/features/review/components/ImprovementList.tsx` | `min-w-[72px]` → `min-w-[60px] sm:min-w-[72px]`（<360px 屏幕防溢出） |

### 删除内容

| 内容 | 大小 | 原因 |
|------|------|------|
| `public/fonts/SourceHanSerifSC-Regular-subset.woff2` | 2.5MB | 从未被 fonts.ts 引用，死数据 |
| `public/fonts/SourceHanSerifSC-Bold-subset.woff2` | 2.5MB | 同上 |
| `globals.css` `@font-face SourceHanSerifSC` 块 | — | 引用不存在的 `SourceHanSerif.ttc`，字体栈中也未使用 |

### 关键决策

1. **viewport 在 layout.tsx 导出**：Next.js App Router 支持从 layout 导出 `viewport` 对象，比 meta tag 更规范
2. **安全区使用 CSS `env()`**：Tauri 的 `enableEdgeToEdge()` 已存在于 MainActivity.kt，CSS 侧负责添加对应的 padding/margin
3. **字体清理**：Source Han Serif woff2 子集在 v3.12 字体优化时生成，但 fonts.ts 只用 EB Garamond + Sarasa Gothic，Source Han Serif 从未接入字体栈。APK 可减少 ~5MB
4. **recharts 体积问题暂不处理**：ScoreTrendChart 是唯一使用 recharts 的组件，替换为手写 SVG 需较大重构，留待后续

### 构建验证

`pnpm run build` 通过，零类型错误。

---

*本文档持续更新，与 Git 提交同频。内容来源：开发对话上下文。*
