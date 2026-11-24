# 安全审查日志

## 2026-11-15 代码层深度安全审查 + 全量修复（v1.7.0）

- **范围**：server.js / public/admin.js / public/app.js / start.bat / scripts/* 全量人工审查 + 本地实测复现 + 联网漏洞模式检索（时序攻击、XFF 伪造、路径穿越、零依赖静态服务器常见错误）
- **实测复现的问题**（修复前）：
  - 🔴 P0-V1：`/%ZZ` 畸形 percent-encoding → `safeStatic` 抛 URIError → 进程崩溃（匿名单请求 DoS）
  - 🔴 P0-V2：admin.js 误用脱敏 `/api/data` 加载编辑器 → 保存覆写真实手机号
  - 🟠 P1-V3：readBody 字符串拼接跨块损坏多字节中文；P1-V4：XFF 首段可伪造绕过登录限流；P1-V5：项目链接可注入 `javascript:`
  - 🟡 P2 × 若干：esc 缺单引号、replace 模式注入、dirty 失效、时序比较、MIME/魔数/黑名单杂项
- **处置**：全部修复（spec `docs/specs/2026-11-15-security-fixes.md` C1-C12，12/12 核销），新增 30 项测试用例（合计 276 项全过），两个 P0 的 PoC 修复后复验通过
- **垃圾文件**：删除 5 个废弃脚本（deploy.sh / deploy.bat / deploy-remote.sh / generate-pr.sh / fix-readme.py，前两个含 admin123 默认回退隐患）；start.bat 修复 3 处
- **结论**：✅ P0/P1 清零，无遗留阻塞项

## 2026-11-15 完整周期审查（v1.6.0 CI/CD 加固后复核）

- **范围**：全部依赖 + 全部对外接口 + 信任边界 + PR #11 改动面（CI/CD 脚本/workflow/凭据处置）
- **联网核验**：✅ 已核验（官方公告原文 + OSV/GHSA + 服务器实测）
  - **Node.js v24.22.1**（服务器实测）：2026-10-21 安全 releases 修复 10 项漏洞（含高危 CVE-2026-111497 Brotli 解码器越界写 RCE，影响 24.x < 24.22.1）——当前版本即修复版，**不受影响**。公告：TWCERT https://www.twcert.org.tw/tw/cp-104-11309-2266c-1.html 、NVDB 提示 https://mp.weixin.qq.com/s/2VXT7X-DvrJHkEwKokRJ7A 。注意 24.22.1 是最低修复版，后续安全 releases 需跟进
  - **PM2 7.1.2**（服务器实测）：ReDoS GHSA-x5gf-qvw8-r2rm 影响 < 7.0.0，不受影响（https://osv.dev/vulnerability/GHSA-x5gf-qvw8-r2rm ）；捆绑 ws **8.21.0** ≥ 8.20.1，CVE-2026-45736（ws websocket.close 未初始化内存泄露，Moderate CVSS 4.4）不受影响（https://github.com/Unitech/pm2/issues/6116 ）
  - **GSAP 3.12.5 / ScrollTrigger 3.12.5**：复查无安全公告（与 2026-10-31 结论一致）
  - **npm audit**：不适用（零依赖，无 package-lock.json）
  - **Python 3.14.5**：test/test.py 仅标准库，无第三方包，OSV 不适用
- **PR #11 改动面复核**：
  - 当前代码树零真实密码（grep 全树：仅 test 占位符 testpass123 / start.bat 本地默认 admin123）
  - git 历史残留旧密码已轮换作废（P1 处置维持，见下方 2026-11-15 增量条目）
  - `~/.secrets/resume.env` 服务器实测 `-rw-------`（600），目录 700
  - ci-deploy.sh：`set -euo pipefail` + ERR trap 自动回滚 + 密码不回显（printf 直写 .env，600）✅
  - .gitattributes 强制 *.sh/*.yml/*.py LF ✅；.gitignore 覆盖 .env/.tmp/日志 ✅
  - workflow 仅 `push`（test/main）+ `workflow_dispatch` 触发，**无 pull_request_target** → fork PR 无法在自托管 runner 上执行代码 ✅
- **server.js 安全控制抽查**（自 v1.5.0 加固后未变更，本次 PR #11 未触及）：validateResumeData / 登录限流（5 次 15 分钟锁 IP）/ XSS 转义（u003c/u003e）/ path.resolve 防穿越 / CSP / X-Frame-Options / admin123 拒绝——全部在位 ✅
- **信任边界**（不变）：浏览器 → Cloudflare Tunnel（TLS）→ localhost:3000；外部输入面 /api/login（限流）、/api/save（鉴权+校验）、/api/upload（鉴权+魔数+2MB+白名单+固定文件名）、静态文件（防穿越）；新增链路：git push → GitHub → 自托管 runner → 执行仓库脚本（可读 ~/.secrets）——仅仓库协作者可触发，单用户仓库，接受
- **P0 阻断**：无
- **P1 缓解**：无（11-14 的 P1 凭据泄露已闭环：轮换 + 出库 + 删除死脚本）
- **P2 已知**：
  - P2-3 Node 24.22.1 为最低修复版——持续关注后续 Node 安全 releases（无现行动作）
  - P2-1（沿用）start.bat 本地默认 admin123——仅本地开发用，接受
  - P2-4（沿用）旧密码存于公开 git 历史——已轮换无效力，改写公网历史成本高且属假安全，接受
  - P2-5 v1.6.0 起 .env 不写 HOST（默认 127.0.0.1），测试环境 3002 仅服务器本机可达——安全性提升；副作用是局域网无法直接访问测试环境（如需 LAN 联调再评估）
- **结论**：✅ 通过。无 P0/P1，运行时组件均在已修复版本，无新增攻击面。下次周期审查：2026-12-15（每月一次）。

## 2026-11-15 增量检查 + P1 凭据泄露处置（本次变更：CI/CD 加固）

- **距上次周期审查**：15 天（上次 2026-10-31，周期每月一次）
- **新增依赖**：无（变更仅涉部署脚本/workflow/文档；服务器侧新增 pm2 7.1.2 用户前缀安装，非项目依赖）
- **P1 事件：管理密码明文泄露于 PUBLIC 仓库**
  - 事实：双分支 CI/CD 搭建（2026-11-14）时，真实 ADMIN_PASSWORD 明文提交进 4 个文件（deploy-test.yml / deploy-prod.yml / ci-deploy.sh / deploy-security.sh），仓库为 PUBLIC，公网可见约 1 天
  - 处置：①密码轮换——两环境 .env 已随新部署更新，旧密码作废（旧值仍存于 git 历史，但已无效力；改写公网历史成本高且属假安全，不作）；②凭据出库——新密码只存服务器 `~/.secrets/resume.env`（600），脚本缺失即失败、禁止默认值回退；③删除含密码死脚本 deploy-security.sh；④workflow Verify 失败时不再 `cat .env`（防密码进 Actions 日志）
  - 新密码：用户指定（11 位；长度低于建议值已告知，缓解：/api/login 5 次失败锁 IP 15 分钟）；后续再轮换只需改 secrets 文件 + 重新部署
- **附带加固**：ci-deploy.sh fail-fast（set -euo pipefail）+ 失败自动回滚备份 + PM2 三级解析；pm2 daemon 已 update 对齐 7.1.2（13 进程全部 online）
- **结论**：P1 已闭环（轮换 + 出库），无新增攻击面。spec：docs/specs/2026-11-15-cicd-hardening.md

## 2026-10-31 首次完整审查（接入 dev-release-workflow）

- **范围**：server.js（零依赖 Node http）、public/*（vanilla JS）、test/test.py（Python 标准库）、vendored 前端库 gsap.min.js / ScrollTrigger.min.js（3.12.5）
- **联网核验状态**：已联网
  - npm audit：无 package.json 依赖（server.js 仅用 Node 内置模块 http/fs/path/crypto），不适用
  - OSV（Python）：test.py 仅用标准库（urllib/subprocess/json/os），无第三方包，不适用
  - GSAP 3.12.5 / ScrollTrigger 3.12.5：web 检索 GHSA/NVD/CVE，无 GSAP 相关安全公告（GSAP 为纯动画库，无网络/文件/DOM 注入面，官方定位 low risk）
- **信任边界**：
  - 外部输入面 1：`/api/login` 密码比对（等值比较，无注入面）
  - 外部输入面 2：`/api/save` 整包 JSON 落盘（仅登录会话可写；JSON.parse 失败返回 400，不泄露堆栈）
  - 外部输入面 3：`/api/upload` base64 图片（限 2MB、白名单扩展名、固定文件名 avatar.*，无路径穿越）
  - 静态文件：safeStatic 防 `../` 穿越
- **P0 清单**：无
- **P1 清单**：无
- **P2 清单**：
  - P2-1 管理密码默认 admin123（start.bat 明文展示）——本地单机简历系统，风险可接受；已记录，不阻塞
  - P2-2 会话 token 存内存，重启失效——符合设计预期，非缺陷
- **结论**：无 P0/P1，可开工。审查周期：每月一次（本地单机项目，非高危）。

## 2026-10-31 增量检查（本次变更）

- 距上次周期审查：0 天（首次审查）
- 新增依赖：无（gsap/ScrollTrigger 为上次会话已引入的本地 vendored 文件，本次不新增）
- 新外部输入面：无（API 契约不变，不新增端点）
- 结论：无新增攻击面。
