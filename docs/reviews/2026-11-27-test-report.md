# 2026-11-27 测试报告 — canon 落地 + 四方向 + Admin 大改 + 面试题库

> spec：docs/specs/2026-11-27-v8-integrate-four-directions.md
> 测试日期：2026-11-27
> 测试环境：临时目录隔离（3999 端口自启自停，不碰 3000 生产）

## 测试文件与结果

| 测试文件 | 用例数 | 通过 | 失败 | 退出码 | 命令 |
|---|---|---|---|---|---|
| test/test.py | 285 | 285 | 0 | 0 | python test/test.py |
| test/test_interest_images.py | 47 | 47 | 0 | 0 | python test/test_interest_images.py |
| test/test_resume_content.py | 80 | 80 | 0 | 0 | python test/test_resume_content.py |

## 测试文件证据块

### test/test.py
- path: test/test.py
- pre_sha256: 31e176ada95a2db5d4b50c2a74cf65ea08996c36061ea41c0ba9f945fa81667d
- post_sha256: 31e176ada95a2db5d4b50c2a74cf65ea08996c36061ea41c0ba9f945fa81667d
- run_started_at: 2026-11-27T13:19:37.941Z
- run_finished_at: 2026-11-27T13:19:47.310Z
- 命令: python test/test.py
- 退出码: 0
- 结果: 通过 285 / 失败 0 / 总计 285

### test/test_resume_content.py
- path: test/test_resume_content.py
- pre_sha256: 89cc8f591de20fad962c3f88e332d037d9f53348056ecfee8884f350aab657f5
- post_sha256: 89cc8f591de20fad962c3f88e332d037d9f53348056ecfee8884f350aab657f5
- run_started_at: 2026-11-27T13:19:37.941Z
- run_finished_at: 2026-11-27T13:19:47.310Z
- 命令: python test/test_resume_content.py
- 退出码: 0
- 结果: 通过 80 / 失败 0 / 总计 80

### test/test_interest_images.py
- path: test/test_interest_images.py
- pre_sha256: 2a26440850b7258d06e7491be09fae54cce521d888d807be96d0204aecfa1f49
- post_sha256: 2a26440850b7258d06e7491be09fae54cce521d888d807be96d0204aecfa1f49
- run_started_at: 2026-11-27T13:19:37.941Z
- run_finished_at: 2026-11-27T13:19:47.310Z
- 命令: python test/test_interest_images.py
- 退出码: 0
- 结果: 通过 47 / 失败 0 / 总计 47

## 支柱 1：核心功能回归（test.py 全量）

test.py 285 项全绿，覆盖：
- [1] 多版本页面（四方向 /ai /fullstack /erp /pm 200）
- [2] 数据 API（versions 含四方向）
- [3] 静态资源
- [4] 鉴权 / 保存 / 头像上传
- [C1]-[C28] 既有功能断言（适配 canon 后全绿）
- [C30] 面试题库 API（新增）
- [C29][SF] 安全加固（保持）

## 支柱 2：新功能达标（契约派生用例）

| 条款 | 用例名 | 结果 |
|---|---|---|
| C1 | test_route_four_dirs | ✅ PASS |
| C2 | test_base_canon | ✅ PASS |
| C3 | test_versions_four | ✅ PASS |
| C4 | test_app_hardcode_four | ✅ PASS |
| C5 | test_admin_edit_fields | ✅ PASS |
| C6 | test_interview_api | ✅ PASS |
| C7 | test_admin_interview_tab | ✅ PASS |
| C8 | test_interview_sync_hint | ✅ PASS |
| C9 | test_py_new_dirs | ✅ PASS |
| C10 | test_resume_content_canon | ✅ PASS |
| C11 | test_content_truth | ✅ PASS |

## 分级回归

核心功能回归（test.py 全量 285 项）—— 全绿。

## 备注

- test.py 此前因 v1.9.0 单版本化后未同步断言导致 KeyError 'it' 崩溃，本轮随四方向重建一并修绿。
- test_resume_content.py / test_interest_images.py 因 canon 改了 skills 组名/组数/项目 items 数，按 C10 精神（测试从契约派生）适配断言。
