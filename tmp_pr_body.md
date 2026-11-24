## 版本号 + 变更摘要
v1.8.1 — 兴趣改写 + 11 张配图 + AI 工具技能组

## spec 契约
- spec: docs/specs/2026-11-24-interest-images-update.md
- sign_quote: 签约 / sign_hash: 4e56713587b8183c9d470c6ae442502ca7e36e12717a904ba9fbbcc15f72aa93
- accept_quote: 验收 / accept_commit: 526bc6a
- 安全增量: 无新增依赖/外部输入面（仅新增 PNG 图片资源）
- 核销: C1-C9 9/9 ✅

## 测试情况
- test.py 276/276 + 契约 48/48 + cdp-print 31/31
- 报告: docs/reviews/2026-11-24-test-report.md
- 独立审查: docs/reviews/2026-11-24-reviewer.md (BLOCK 项已修复)

## 影响范围/兼容性/回滚
- 影响: app.js(渲染+文案) + resume.json(技能栏) + 11张图 + style.css(.cover-img)
- 兼容: 向前兼容，svgArt 无图回退 SVG
- 回滚: git revert f542f12..5bf8707