# 测试报告 — 简历内容更新（spec 2026-11-23-resume-content-update）

**日期**: 2026-11-23
**spec**: docs/specs/2026-11-23-resume-content-update.md (revision 1, sign_hash a030dd91...)
**变更类型**: refactor（纯数据内容更新 + app.js 图标映射配套）

## 测试文件指纹

| 文件 | sha256 | mtime |
|---|---|---|
| test/test_resume_content.py | b075c9ad3fb77e4a16e2e30218bea7c546b6091e1562f4a1a140f9ddeaead64a | 2026-11-23T09:13:00.822Z |
| test/test.py | 4d92ec5ca47d3df5... | 2026-11-23T09:11:13.832Z |
| test/cdp-print.mjs | f1e3ed2cd4464a06... | 2026-11-23T08:40:42.333Z |

- run_started_at: 2026-11-23T09:13:21.068Z
- run_finished_at: 2026-11-23T09:13:51.071Z

## 支柱 2：契约派生用例（test_resume_content.py）

**命令**: `python test/test_resume_content.py`
**退出码**: 0
**结果**: 通过 95 / 失败 0 / 总计 95

逐条款覆盖:

| 条款 | 用例名 | 结果 |
|---|---|---|
| C1 | test_c1_projects_count_order（项目数4+序列+七字段） | PASS |
| C2 | test_c2_baobao_items_seven（items 7+豹豹文档+设计规范+stack） | PASS |
| C3 | test_c3_shipit_entry（title/badge/link/desc/items/stack） | PASS |
| C4 | test_c4_kb_entry_rag_planned（PARA+RAG数据收集阶段+320+） | PASS |
| C5 | test_c5_aipro_unchanged（末位+零依赖+items4+MCP/SSE） | PASS |
| C6 | test_c6_ai_summary（编码发布工作流+个人知识库+实时协作文档+AWS保留） | PASS |
| C7 | test_c7_advantage_four_projects（4个项目+不含3个） | PASS |
| C8 | test_c8_skills_rag_mcp_prompt（6项+RAG/MCP/Prompt Engineering） | PASS |
| C9 | test_c9_certs_honors_unified（certs3+honors1+AWS进certs出honors+summary/adv保留） | PASS |
| C10 | test_c10_token_placeholder（未写入具体token数字） | PASS |
| C11 | test_c11_en_mirror_sync（中英项目数/id序列/items数/certs/honors/skills/summary/adv一致） | PASS |
| C12 | test_c12_other_versions_unchanged（it/test/erp summary/advantages不变） | PASS |

## 支柱 1：核心功能回归

### test.py（276 项）

**命令**: `python test/test.py`
**退出码**: 0
**结果**: 通过 276 / 失败 0 / 总计 276

说明: 本次数据内容变化（项目3→4、baobao items 5→7、新增技能 RAG/MCP/Prompt Engineering）导致 3 项内容相关断言按新契约更新（spec P3 测试从契约派生）:
- C5 每个技能均有专属图标：app.js ICONS 新增 RAG/MCP/Prompt Engineering 图标映射（C8 配套）
- C6 中文 5 项功能 → 7 项功能（baobao items 5→7）
- C6 英文 5 项功能 → 7 项功能（en baobao items 5→7）

非内容相关断言（安全/路由/鉴权/XSS/路径遍历等）全部未改，全绿。

### cdp-print.mjs（31 项）

**命令**: `node test/cdp-print.mjs`
**退出码**: 0
**结果**: 通过 31 / 失败 0 / 总计 31

打印/PDF 流程回归全绿，无未捕获 JS 异常。

## 分级回归结论

触及核心展示数据（projects/certs/honors/skills/ai.summary/advantages）→ 核心回归:
- test.py 276/276 PASS
- cdp-print.mjs 31/31 PASS
- 契约用例 95/95 PASS

**结论**: 全部通过，无 FAIL。

## 测试证据块（check_spec 机器校验）

### test/test_resume_content.py
- path: test/test_resume_content.py
- pre_sha256: 6bbb3d7cef729074ced5a848d4b77ca8d7e95942f93121cbb06205146027b470
- post_sha256: 6bbb3d7cef729074ced5a848d4b77ca8d7e95942f93121cbb06205146027b470
- run_started_at: 2026-11-23T09:14:28.835Z
- run_finished_at: 2026-11-23T09:14:58.835Z

### test/test.py
- path: test/test.py
- pre_sha256: 4d92ec5ca47d3df5a1014cdb62557bc53863059fbe5ca3c0eded21b4fa468b16
- post_sha256: 4d92ec5ca47d3df5a1014cdb62557bc53863059fbe5ca3c0eded21b4fa468b16
- run_started_at: 2026-11-23T09:14:28.835Z
- run_finished_at: 2026-11-23T09:14:58.835Z

### test/cdp-print.mjs
- path: test/cdp-print.mjs
- pre_sha256: f1e3ed2cd4464a065fca163ae3822c3e0f9b15bad2d81ccaa1555d5c6ac2897d
- post_sha256: f1e3ed2cd4464a065fca163ae3822c3e0f9b15bad2d81ccaa1555d5c6ac2897d
- run_started_at: 2026-11-23T09:14:28.835Z
- run_finished_at: 2026-11-23T09:14:58.835Z
