## 版本号 + 变更摘要
v1.8.1 — 兴趣改写 + 11 张配图(JPEG<50KB) + AI 工具技能组

## spec 契约
- spec: docs/specs/2026-11-24-interest-images-update.md
- sign_hash: 4e567135... / accept_commit: 526bc6a
- 核销: C1-C9 9/9 ✅

## 测试情况
- test.py 276/276 + 契约 48/48 + cdp-print 31/31
- 报告: docs/reviews/2026-11-24-test-report.md

## 影响范围/兼容性/回滚
- 影响: app.js + resume.json + 11张图(jpeg) + style.css
- 回滚: git revert 1da513f..5bf8707