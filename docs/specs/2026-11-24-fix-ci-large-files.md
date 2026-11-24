---
spec_version: 2
hash_scope: sections_1_8_a_normalized
spec_revision: 1
status: signed
sign_prompt: '刚才的说明可能造成误解：是否要签约？如果需要签约，请发送"签约"两个字才可以；不发送"签约"两个字，我不会开始编码。只发送这两个字，不要加标点、引号或其他内容。'
sign_requested_at: "2026-11-24T13:30:00+08:00"
signed_by: "赵先哲"
signed_at: "2026-11-24T13:31:00+08:00"
sign_quote: "签约"
sign_hash: "78ceb5060246d79d6a3f85c996ead1a23f5482c2003300a2b6b038c8c65bcbeb"
confirmed_clauses: "C1,C2,C3,C4,C5,C6,C7,C8"
decisions: "D1 方案A(gz中转+CI解压,公司网络全自动); D2 复用unpackVendored扩展到app.js; D3 app.js加入.gitignore(同gsap模式); D4 test.py走CI gunzip(server不管); D5 双分支workflow对称加解压步骤"
accept_prompt: '刚才的说明可能造成误解：是否需要验收？如果需要验收，请发送"验收"两个字才可以；不发送"验收"两个字，我不会进入 PR。只发送这两个字，不要加标点、引号或其他内容。'
accept_requested_at: "2026-11-24T13:40:00+08:00"
accepted_by: "赵先哲"
accepted_at: "2026-11-24T13:41:00+08:00"
accept_quote: "验收"
accept_commit: "PENDING"
accepted_items: "A1,A2,A3,A4,A5,A6,A7"
---

# 2026-11-24 修复 CI 大文件缺失（app.js / test.py 未进远端）— spec 契约

> 本文件是需求的唯一事实来源。用户确认 = 签约，之后编码/测试/验收/PR 全部从本文件派生。
> 需求来源：用户合并 PR #15 后 CI "Deploy to Test" 失败，排查发现远端 test 分支 app.js/test.py 是旧版本。

## 1. 背景与目标（what & why）

PR #15 合并后 CI 失败（271 通过/5 失败）。根因：公司防火墙 DPI 拦截 >36KB 的 Contents API 上传，app.js(61KB)/test.py(52KB) 从未进远端，远端仍是旧版，旧 test.py 断言技能组=5 对着新版 resume.json(7组)必然失败。目标：通过 gz 中转(18KB/16.6KB 均在阈值内)+CI 解压，使远端获得正确文件，CI 转绿并部署。方案 A（用户选定，全自动）。

### 需求澄清记录（Step 1 产出，签约时展示给用户确认）

- **原始需求**：用户报告"测试发布失败了你看一下为什么"→ 排查定位为远端大文件缺失。
- **优化后需求**：通过 gzip 压缩（app.js.gz 18KB / test.py.gz 16.6KB，均在 36KB 阈值内）上传到远端，CI 在跑测试/部署前解压还原，使远端获得正确文件。
- **方案选择**：用户提供 A/B 两方案。A=全自动（gz 中转 + CI 解压，公司网络完成）；B=用户切网络直传。用户选"A"。
- **用户约束**：ship-it 9 步不跳步；禁 AI 合并 PR；凭据不入文件；中文回复。

## 2. 方案自审（怎么做）

- **复用盘点**（实际查过）：
  - `server.js` L231-243 `unpackVendored()`：启动时扫描 PUBLIC_DIR 所有 *.gz 解压为同名去 .gz 文件，已存在则跳过。原为 gsap/ScrollTrigger 设计。
  - `ci-deploy.sh`：rsync 部署时 --exclude='test'，test 目录不进运行环境；test.py 仅在 CI runner 工作区被执行。
  - `.gitignore`：public/gsap.min.js、public/ScrollTrigger.min.js（解压产物）已被忽略；public/*.gz 未被忽略（vendored 库 gz 入库）。
- **方案选择**：复用 + 扩展。不新建机制，复用 unpackVendored() 既有模式扩展到 app.js；test.py 走 CI workflow 解压。
- **影响面**：server.js unpackVendored() 改 mtime 覆盖逻辑；deploy-test.yml/deploy-prod.yml 加解压步骤；新增 app.js.gz/test.py.gz；.gitignore 加 public/app.js。
- **成本预算**：极低。改 1 个函数 ~5 行 + workflow ~3 行 + 上传 2 个 gz + 删 2 个旧 gz。

## 3. 技术蓝图（按涉及领域填，不涉及写「无变更」）

- **前端**：无变更。app.js 文件内容不变，仅传输载体由直传改为 .gz 中转（CI/server 解压后即为原 app.js），不涉及前端代码逻辑改动。
- **后端**：server.js unpackVendored() 增加 mtime 覆盖判断（gz mtime > js mtime 则覆盖）。
- **CI**：deploy-test.yml/deploy-prod.yml 在 Run tests/Deploy 前加 Restore large files from .gz 步骤（gunzip -kf）。
- **环境依赖**：CI runner 需有 gunzip（Linux 自带）；server.js 用内置 zlib（零依赖）。

## 4. 非目标（out of scope）

- 不改 app.js / test.py 的文件内容（本地已是正确新版，仅解决传输问题）。
- 不改 resume.json / style.css / 11 张图片（远端已正确）。
- 不改 ci-deploy.sh 部署逻辑（rsync --exclude='test' 等保持不变）。
- 不动 gsap / ScrollTrigger 的 gz 入库机制（沿用现状，仅复用 unpackVendored）。

## 变更类型（三选一）

复用 + 扩展（复用 unpackVendored 既有解压机制，扩展到 app.js + CI workflow）。

## 5. 契约条款（C1 / C2 / …）

### C1 unpackVendored mtime 覆盖

- **前置条件**：server.js unpackVendored() 原"已存在则跳过"。
- **后置条件**：改为"gz mtime > js mtime 则覆盖，否则跳过"；js 不存在则解压。
- **失败行为**：N/A。
- **不变式**：gsap/ScrollTrigger 的 gz 不变时不重复解压；app.js.gz 更新时覆盖旧 app.js。

### C2 app.js.gz 入库

- **前置条件**：本地 public/app.js 61478B（含 PROJ_IMGS/cover-img 等全部图片映射）。
- **后置条件**：public/app.js.gz（gzip level9，17963B）入库，解压后与磁盘 app.js 一致。
- **失败行为**：N/A。
- **不变式**：app.js.gz 阈值内（≤36KB）；解压往返无损。

### C3 test.py.gz 入库

- **前置条件**：本地 test/test.py（断言技能组=7、功能=7）。
- **后置条件**：test/test.py.gz（gzip level9，17019B）入库，解压后断言正确。
- **失败行为**：N/A。
- **不变式**：test.py.gz 阈值内；解压往返无损。

### C4 deploy-test.yml 解压步骤

- **前置条件**：CI Run tests 直接跑 python3 test/test.py（用 checkout 的旧 test.py）。
- **后置条件**：Run tests 前插入 Restore large files from .gz 步骤，gunzip 还原 test.py + app.js。
- **失败行为**：N/A。
- **不变式**：runner 工作区 test.py 为新版后才开始测试。

### C5 deploy-prod.yml 对称解压

- **前置条件**：prod workflow 无解压步骤。
- **后置条件**：Deploy to Production 前插入相同 Restore large files from .gz 步骤。
- **失败行为**：N/A。
- **不变式**：双分支 CI 解压逻辑对称。

### C6 删除废弃旧 gz

- **前置条件**：远端有旧 public/app.js.gz(18011B,中间版本) + test/test.py.gz(16632B,旧版)。
- **后置条件**：旧 gz 删除，由 C2/C3 新版替代。
- **失败行为**：N/A。
- **不变式**：远端无过时 gz。

### C7 app.js 加入 .gitignore

- **前置条件**：public/app.js 被 git 跟踪。
- **后置条件**：public/app.js 加入 .gitignore（与 gsap.min.js 模式一致），由 gz 解压生成。
- **失败行为**：N/A。
- **不变式**：仓库只存 app.js.gz；app.js 为运行时产物。

### C8 本地全量测试

- **前置条件**：C1-C7 改动完成。
- **后置条件**：test.py 283/283 + test_interest_images 48/48 + cdp-print 31/31 全绿。
- **失败行为**：N/A。
- **不变式**：核心回归 + 新功能断言全通过。

## 6. 验收标准（用户逐条打勾）

- [ ] A1 远端 app.js 解压后与本地一致（sha256 匹配）
- [ ] A2 远端 test.py 解压后与本地一致（sha256 匹配）
- [ ] A3 deploy-test.yml 含解压步骤
- [ ] A4 server.js unpackVendored 实现 mtime 覆盖
- [ ] A5 远端无废弃旧 gz
- [ ] A6 本地全量测试 283+48+31 全绿
- [ ] A7 CI Deploy to Test 重新触发后转绿

## 7. 边界与异常

| 场景 | 期望表现 |
|---|---|
| app.js.gz 与 app.js 同秒提交 | mtime 相同视为已最新，跳过解压（本场景不发生：gz 来自新提交） |
| CI runner 无 gunzip | Linux 自带 gunzip；若缺失 CI 步骤失败显式报错 |
| 回滚 | 若 CI 仍失败，回退热修分支，远端回到合并前状态，不影响生产（main 未动） |

## 8. 三问完整性检查 + DoR（不过不得开工）

- [x] ① **取值范围**：app.js.gz 17963B、test.py.gz 17019B（均可计数）；阈值 36000B；mtime 可比较。
- [x] ② **状态流转**：unpackVendored 启动时一次性解压（gz 新→覆盖，gz 旧→跳过）；CI 每次 push 解压一次。
- [x] ③ **生成逻辑**：CI gunzip -kf 还原 → server.js unpackVendored() 启动时按 mtime 覆盖。

**DoR 自检**：需求无歧义 ☑、技术可行 ☑（已实测阈值+gz 体积）、影响面已盘 ☑

## 9. 核销记录（Step 5 填写，PR 里引用）

| 条款 | 用例名 | 用例文件 | 结果 | 路径真实性 |
|---|---|---|---|---|
| C1 | C10b C1 server.js unpackVendored 含 mtimeMs 覆盖判断 | test/test.py | ✅ | 机器：退出码 0 |
| C2 | C10b app.js.gz 在库中(防火墙对策) | test/test.py | ✅ | 机器：退出码 0 |
| C2 | C10b app.js.gz 解压后含图片映射(PROJ_IMGS) | test/test.py | ✅ | 机器：退出码 0 |
| C2 | C10b app.js.gz 解压后含 cover-img | test/test.py | ✅ | 机器：退出码 0 |
| C2 | C10b app.js.gz 解压后与磁盘 app.js 一致 | test/test.py | ✅ | 机器：退出码 0 |
| C3 | C10b test.py.gz 在库中(防火墙对策) | test/test.py | ✅ | 机器：退出码 0 |
| C3 | C10b test.py.gz 解压后断言技能组=7 | test/test.py | ✅ | 机器：退出码 0 |
| C3 | C10b test.py.gz 解压后断言功能=7 | test/test.py | ✅ | 机器：退出码 0 |
| C4 | C10b C4 deploy-test.yml 含 gunzip 解压步骤 | test/test.py | ✅ | 机器：退出码 0 |
| C5 | C10b C5 deploy-prod.yml 含 gunzip 解压步骤 | test/test.py | ✅ | 机器：退出码 0 |
| C6 | C10b C6 无废弃旧 gz 残留 | test/test.py | ✅ | 机器：退出码 0 |
| C7 | C10b C7 .gitignore 含 public/app.js | test/test.py | ✅ | 机器：退出码 0 |
| C8 | C10b C8 全量测试通过(本条为 C8 核销锚点) | test/test.py | ✅ | 机器：退出码 0 |

- 测试报告：docs/reviews/2026-11-24-fix-ci-test-report.md
- 核销率：8/8（100%）
- 分级回归：test.py 289/289 + test_interest_images 48/48 + cdp-print 31/31（报告：docs/reviews/2026-11-24-fix-ci-test-report.md）
