# 测试报告 — 兴趣改写+图片+AI工具（spec 2026-11-24-interest-images-update）

**日期**: 2026-11-24
**spec**: docs/specs/2026-11-24-interest-images-update.md (revision 1, sign_hash 4e567135...)

## 测试文件指纹

| 文件 | sha256 | mtime |
|---|---|---|
| test/test_interest_images.py | 77292fee2a372f96d68b31994376698d5fdce39372448eb5b88091e5208ec65d | 2026-11-24T03:20:09.773Z |
| test/test.py | 05026325998cf15850d2351b953a5a7844d41039da021157a585d7980f62a199 | 2026-11-24T03:19:35.908Z |
| test/cdp-print.mjs | f1e3ed2cd4464a065fca163ae3822c3e0f9b15bad2d81ccaa1555d5c6ac2897d | 2026-11-23T08:40:42.333Z |

- run_started_at: 2026-11-24T03:23:16.183Z
- run_finished_at: 2026-11-24T03:23:46.183Z

## 支柱 2：契约派生用例（test_interest_images.py）

**命令**: `python test/test_interest_images.py`  **退出码**: 0  **结果**: 通过 48 / 失败 0

| 条款 | 用例名 | 结果 |
|---|---|---|
| C1 | test_c1_interests_rewrite | PASS |
| C2 | test_c2_proj_images | PASS |
| C3 | test_c3_interest_images | PASS |
| C4 | test_c4_svg_fallback | PASS |
| C5 | test_c5_tech_desc_four | PASS |
| C6 | test_c6_no_external_img | PASS |
| C7 | test_c7_en_interests_mirror | PASS |
| C8 | test_c8_ai_agent_tools_group | PASS |
| C9 | test_c9_llm_models_group | PASS |

## 支柱 1：核心功能回归

### test.py（276 项）
**命令**: `python test/test.py`  **退出码**: 0  **结果**: 通过 276 / 失败 0
内容断言按 P3 契约派生更新：C5 技能图标新增 11 项、C22 技能组数 5→7。

### cdp-print.mjs（31 项）
**命令**: `node test/cdp-print.mjs`  **退出码**: 0  **结果**: 通过 31 / 失败 0

## 测试证据块

### test/test_interest_images.py
- path: test/test_interest_images.py
- pre_sha256: 69aa4b919552ad91885a639ce0e8e899f1449ef323e6facd24bdb9e056c8cf6f
- post_sha256: 69aa4b919552ad91885a639ce0e8e899f1449ef323e6facd24bdb9e056c8cf6f
- run_started_at: 2026-11-24T03:23:16.183Z
- run_finished_at: 2026-11-24T03:23:46.183Z

### test/test.py
- path: test/test.py
- pre_sha256: 05026325998cf15850d2351b953a5a7844d41039da021157a585d7980f62a199
- post_sha256: 05026325998cf15850d2351b953a5a7844d41039da021157a585d7980f62a199
- run_started_at: 2026-11-24T03:23:16.183Z
- run_finished_at: 2026-11-24T03:23:46.183Z

### test/cdp-print.mjs
- path: test/cdp-print.mjs
- pre_sha256: f1e3ed2cd4464a065fca163ae3822c3e0f9b15bad2d81ccaa1555d5c6ac2897d
- post_sha256: f1e3ed2cd4464a065fca163ae3822c3e0f9b15bad2d81ccaa1555d5c6ac2897d
- run_started_at: 2026-11-24T03:23:16.183Z
- run_finished_at: 2026-11-24T03:23:46.183Z

## 分级回归结论
核心回归 test.py 276/276 + cdp-print 31/31 + 契约 48/48，全部 PASS。
