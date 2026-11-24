# 测试报告 — 修复 CI 大文件缺失（spec 2026-11-24-fix-ci-large-files）

**日期**: 2026-11-24
**spec**: docs/specs/2026-11-24-fix-ci-large-files.md (revision 1, sign_hash 78ceb506...)

## 测试文件指纹

| 文件 | sha256 | mtime |
|---|---|---|
| test/test.py | a2958fff86678497568ebc463d5aa6f11ba68e8fcfb3781dde1cfbee40f4ea8f | 2026-11-24T05:39:12.942Z |
| test/test_interest_images.py | c6c320a97af17bbc5e58df2f39f5028f718348b69eef86aea8e3366e0c5ecb91 | 2026-11-24T04:33:29.151Z |
| test/cdp-print.mjs | f1e3ed2cd4464a065fca163ae3822c3e0f9b15bad2d81ccaa1555d5c6ac2897d | 2026-11-23T08:40:42.333Z |

- run_started_at: 2026-11-24T05:39:13.001Z
- run_finished_at: 2026-11-24T05:40:12.911Z

## 支柱 2：契约派生用例（test.py C10b 段，13 项）

**命令**: `python test/test.py`  **退出码**: 0  **结果**: 289/289

| 条款 | 用例名 | 结果 |
|---|---|---|
| C1 | C10b C1 server.js unpackVendored 含 mtimeMs 覆盖判断 | PASS |
| C2 | C10b app.js.gz 在库中(防火墙对策) | PASS |
| C2 | C10b app.js.gz 解压后含图片映射(PROJ_IMGS) | PASS |
| C2 | C10b app.js.gz 解压后含 cover-img | PASS |
| C2 | C10b app.js.gz 解压后与磁盘 app.js 一致 | PASS |
| C3 | C10b test.py.gz 在库中(防火墙对策) | PASS |
| C3 | C10b test.py.gz 解压后断言技能组=7 | PASS |
| C3 | C10b test.py.gz 解压后断言功能=7 | PASS |
| C4 | C10b C4 deploy-test.yml 含 gunzip 解压步骤 | PASS |
| C5 | C10b C5 deploy-prod.yml 含 gunzip 解压步骤 | PASS |
| C6 | C10b C6 无废弃旧 gz 残留 | PASS |
| C7 | C10b C7 .gitignore 含 public/app.js | PASS |
| C8 | C10b C8 全量测试通过(本条为 C8 核销锚点) | PASS |

## 支柱 1：核心功能回归

### test.py（289 项）
**命令**: `python test/test.py`  **退出码**: 0  **结果**: 289/289
含原有 276 项核心回归 + 新增 C10b 13 项防火墙大文件对策断言。

### test_interest_images.py（48 项）
**命令**: `python test/test_interest_images.py`  **退出码**: 0  **结果**: 48/48

### cdp-print.mjs（31 项）
**命令**: `node test/cdp-print.mjs`  **退出码**: 0  **结果**: 31/31

## 测试证据块

### test/test.py
- path: test/test.py
- pre_sha256: a2958fff86678497568ebc463d5aa6f11ba68e8fcfb3781dde1cfbee40f4ea8f
- post_sha256: a2958fff86678497568ebc463d5aa6f11ba68e8fcfb3781dde1cfbee40f4ea8f
- run_started_at: 2026-11-24T05:39:13.001Z
- run_finished_at: 2026-11-24T05:39:23.955Z

### test/test_interest_images.py
- path: test/test_interest_images.py
- pre_sha256: c6c320a97af17bbc5e58df2f39f5028f718348b69eef86aea8e3366e0c5ecb91
- post_sha256: c6c320a97af17bbc5e58df2f39f5028f718348b69eef86aea8e3366e0c5ecb91
- run_started_at: 2026-11-24T05:39:23.955Z
- run_finished_at: 2026-11-24T05:39:31.011Z

### test/cdp-print.mjs
- path: test/cdp-print.mjs
- pre_sha256: f1e3ed2cd4464a065fca163ae3822c3e0f9b15bad2d81ccaa1555d5c6ac2897d
- post_sha256: f1e3ed2cd4464a065fca163ae3822c3e0f9b15bad2d81ccaa1555d5c6ac2897d
- run_started_at: 2026-11-24T05:39:31.011Z
- run_finished_at: 2026-11-24T05:40:12.911Z
