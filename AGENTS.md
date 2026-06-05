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
