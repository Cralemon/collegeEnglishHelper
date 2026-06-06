<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Agent 行为规范

> 在每次会话中必须始终遵守。

## 1. 最小变更原则

在做任何修改前，确保不要对任何与待修改特性无关的内容发生变化。修改应精准、最小化，避免意外覆盖或回退已有的正确调整。

## 2. Step 内细分

每个 Step 内的工作应拆分为子任务，逐步完成并验收，而非一次性交付整个 Step。

## 3. 仓库审查

每步提交前必须审查仓库状态（`git status` + `git diff`），确认无遗漏、无误提交，再 commit。

## 4. DEVLOG 同频更新

每次有意义的提交，同步更新 `DEVLOG.md`，记录决策、踩坑与经验。

## 5. FINAL_PLAN 版本管理

每次功能性变更后，更新 `FINAL_PLAN.md` 底部版本历史表：

```
| 版本 | 日期 | 变更内容 |
```

## 6. 提交规范 (Conventional Commits)

```
<type>(<scope>): <description>
```

| Type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `chore` | 构建/工具 |
| `docs` | 文档 |
| `refactor` | 重构 |
| `perf` | 性能 |
| `build` | 构建系统 |

## 7. 不要修改未被要求的内容

用户未明确要求修改的文件、样式、组件，即使看起来"可以优化"，也不要擅自改动。

## 8. HANDOFF 写作规范

交接文档（`HANDOFF.md`）是 Agent 会话间协作的核心。每次 Step 完成后必须更新。

### 结构顺序

```markdown
## 项目概况
@FINAL_PLAN.md

## 当前进度
| Phase | 状态 | 说明 |
（标记下一步 Phase）

## 写代码前必须阅读
1. AGENTS.md
2. FINAL_PLAN.md
3. 设计规范

## 关键文件索引
| 用途 | 路径 |
（列出所有业务相关文件）

## 上一 Phase 实现摘要
- 关键技术决策
- 实现要点（简短列表）

## 下一步：Phase N <标题>
### 背景
（为什么要做这一步）

### 需要修改的文件
| 文件 | 当前状态 | 目标 |

### 具体任务
Step N.1：...
Step N.2：...
（每个 Step 列出要改什么、改成什么）

```

### 写作原则

1. **下一步必须详细**：新 Agent 读完就能开工，不需要再问"从哪开始"
2. **列出具体文件**：不要只说"更新类型定义"，要说"在 `src/types/index.ts` 中新增 X、Y、Z"
3. **标注当前状态 vs 目标**：让 Agent 知道要改什么、改成什么
