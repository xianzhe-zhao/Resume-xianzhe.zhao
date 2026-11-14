# CI/CD 部署加固 spec（2026-11-15）

> 依据全局 skill `ship-it` v4.2.0 执行（含新增 CI/CD 自动发布通道规则：推 test 分支触发测试环境部署，
> 合并 main 触发生产部署；workflow 结论 success + 版本核对后才算部署完成）。

## 1. 背景与目标

### 需求来源
用户要求："处理掉 Resume 的问题"（源自 ship-it v4.2.0 审查指出的"ci-deploy.sh 用 `|| true` 吞错误码"），经体检确认修复范围为全套（①吞错误码 ②无 set -e ③密码泄露 ④PM2 路径脆弱 ⑤失败无回滚）。

### 背景事实（全部实测核实）
- 仓库为 **PUBLIC**，真实密码明文提交在 4 个文件（deploy-test.yml、deploy-prod.yml、ci-deploy.sh、deploy-security.sh），公网可见。
- ci-deploy.sh 无 `set -e`：rsync 失败、备份 cp 失败均继续执行；`pm2 start ... || true` 吞掉启动失败，脚本仍打印"✅ 部署完成"退出 0。
- 服务器 192.168.50.100：npx 缓存两份 pm2（7.1.2 / 7.0.3），daemon 为 7.1.1，CLI 写死 npx hash 路径；**daemon 同时承载豹豹助手 3 个生产进程**（baobao-chatbot / baobao-gateway / baobao-guanjia）。
- docs/specs/2026-11-14-dual-branch-deploy.md 的 C2 承诺"部署失败→自动回滚到备份版本"、C4 承诺"备份失败→中止部署"，实现均缺失。
- deploy-security.sh 无任何引用（死脚本），含明文密码。
- 豹豹助手的凭据模式：真实密码只存服务器侧 `.env`/secrets，git 零字面量——本 spec 的 C4 沿用该模式。

### 优化后需求
加固 ci-deploy.sh 与两个 workflow：部署失败正确标红（fail-fast）、失败自动回滚备份、真实密码出库并轮换（豹豹模式 + 服务器 secrets 文件）、PM2 解析健壮化、删除死脚本、同步文档。业务代码（server.js / public / test）零改动。

### 需求澄清记录
| 问题 | 回答 |
|---|---|
| 修复到什么程度？ | 全套修复（①②③④⑤） |
| 凭据存放方式？ | 照豹豹助手：服务器侧文件，不用 GitHub Secrets（用户指定"豹豹助手是怎么做的"） |
| 密码轮换方式？ | 用户提供新密码（**spec 变更**：原签"≥24 位随机"，用户指定 11 位；已告知长度风险，缓解：/api/login 有 5 次/15 分钟 IP 锁定；随时可改 secrets 文件再轮换） |
| pm2 update 是否授权（重启豹豹 3 进程，约 2–5 秒/个）？ | 授权，已执行（13 个进程全部 online，版本警告消除） |
| deploy-security.sh 处理？ | 删除（已删） |

## 2. 方案自审

### 现有能力盘点（实际查过）
- ✅ ci-deploy.sh / deploy-test.yml / deploy-prod.yml（双分支 CI/CD 已跑通，PR #8–#10）
- ✅ 服务器备份机制已存在（每次部署 cp -r 到 `{目录}-backup-{时间戳}`，保留 5 个）
- ✅ workflow Verify 步骤已存在（test: curl 127.0.0.1:3002/ai；prod: curl resume.zxz0608.com/ai）
- ✅ 本地测试 test/test.py（服务自拉起 + 断言，CI 中已在用）
- ✅ SSH 免密通道（本机 → xianzhe@192.168.50.100）
- ✅ docs/security-review-log.md 安全日志惯例已存在

### 三选一决策
**B 扩展** —— 复用既有 ci-deploy.sh 结构与备份机制，加 fail-fast / 回滚 / secrets 读取；不新建部署体系。

### 影响面
- 修改：`scripts/ci-deploy.sh`、`.github/workflows/deploy-test.yml`、`.github/workflows/deploy-prod.yml`、`docs/ci-cd-guide.md`、`README.md`（部署描述行）、`package.json`（1.5.0→1.6.0）、`CHANGELOG.md`、本 spec
- 删除：`scripts/deploy-security.sh`（无引用死脚本）
- 服务器侧：新增 `~/.secrets/resume.env`（真实密码）；（若授权）全局安装 pm2
- 不影响：server.js、public/、test/、data/、豹豹助手 3 个进程（除非授权 pm2 update）

### 兼容性
成功路径行为与旧版一致（rsync 范围、.env 写入时机、PM2 进程名、端口、目录均不变）；变更只影响失败路径的可见性与处置。

### 成本预算
无（不涉及付费 API）。

### 安全增量
本变更本身就是安全修复（凭据出库 + 轮换）；新增外部输入面：无（secrets 文件为服务器本地文件，权限 600）。

### 测试策略
- 本地：`bash -n` 语法检查（WSL/git-bash 若可用，否则服务器端 bash -n）+ `python test/test.py`
- 服务器 /tmp 故障注入：脚本副本 + 临时目标目录，注入失败验证 trap 回滚（不碰真实环境）
- E2E：推 test 分支 → workflow 全绿 + curl 200 + 新密码登录成功/旧密码 401
- 回归：核心页面 /、/ai、登录接口、admin 数据读写（只读）

## 3. 技术蓝图

- **前端**：无变更
- **后端**：无变更（server.js 不动）
- **数据库**：无变更（data/ 由部署同步，行为不变）
- **环境依赖**：
  - 服务器新增 `~/.secrets/resume.env`（内容 `ADMIN_PASSWORD=<新密码>`，chmod 600）
  - （若授权）`npm i -g pm2`（/opt 不可写 → 用户前缀 `~/.npm-global`，或沿用 npx 路径解析）+ `pm2 update` 对齐 daemon（重启全部 5 个 PM2 进程）
  - GitHub Actions 环境无新增依赖

## 4. 非目标

- 不修改业务代码、测试代码、数据文件
- 不改变双分支→环境的映射（test→测试 3002，main→生产 3000）
- 不引入 GitHub Secrets（用户选择豹豹模式：服务器侧文件）
- 不清理 git 历史中的旧密码（已泄露，靠轮换作废；改写公网历史成本高且有假安全风险）
- 不动豹豹助手任何进程/配置（pm2 update 除外，且需显式授权）
- 不为 start.bat / deploy.sh 的 admin123 默认值做处理（server.js 已拒绝该值，属本地开发路径）

## 5. 契约条款

### C1 部署脚本 fail-fast
- 前置：ci-deploy.sh 被 deploy-test.yml / deploy-prod.yml 的 Deploy 步骤调用
- 后置：脚本启用 `set -euo pipefail`；rsync 失败、.env 写入失败、pm2 start 失败 → 脚本以非零退出，workflow 在 Deploy 步骤标红（不再出现"服务没起来但 ✅ 部署完成"）；pm2 start 之后追加健康检查（`/ai` 20 秒内须返回 200，因 pm2 start 秒回成功 ≠ 服务可用，应用可能启动即崩）——健康检查失败同样在 Deploy 步骤标红并触发回滚
- 失败：非关键步骤（旧备份清理）失败 → 输出 WARN 继续执行，不中止
- 不变式：成功路径产物与旧版一致（同步范围、.env 内容结构、进程名、端口）

### C2 吞错范围收窄到单条已知无害命令
- 前置：原脚本存在 5 处 `|| true`
- 后置：`pm2 delete` 改为"仅当 `pm2 describe` 存在该进程时执行"，删除已存在进程失败 → 中止；`kill -9` 保留容错（lsof 与 kill 之间进程消失属已知无害）；`pm2 save` 失败 → 打 WARN 不中止；`pm2 start` 一律不吞错
- 失败：pm2 start 返回非零 → 立即中止并进入回滚流程（C3）
- 不变式：不再有任何"掩盖部署失败"的容错

### C3 部署失败自动回滚（兑现 dual-branch spec C2/C4 承诺）
- 前置：本次部署已创建备份目录（`{TARGET_DIR}-backup-{时间戳}`）
- 后置：脚本以 trap 捕获失败（含 pm2 start 失败与健康检查失败）→ 将最近备份恢复到 TARGET_DIR → 以备份中的 .env 重启 PM2 进程 → 以非零退出；workflow Verify 步骤保持独立兜底
- 失败：首次部署（无备份可回滚）→ 直接非零退出，明确提示"无备份可回滚"
- 不变式：回滚后环境 = 失败前版本（代码 + .env + 进程）；备份保留策略（最近 5 个）不变；豹豹助手进程不被触碰（只操作 resume / resume-test 两个进程名）

### C4 真实密码出库（豹豹模式）
- 前置：仓库 PUBLIC；当前 4 个文件含明文真实密码
- 后置：ci-deploy.sh 从 `~/.secrets/resume.env` 读取 ADMIN_PASSWORD（文件缺失/为空 → 部署失败并明确报错，禁止任何默认值回退）；deploy-test.yml 与 deploy-prod.yml 删除明文 ADMIN_PASSWORD env；测试步骤的 `test_password_for_ci` 保留（非真实凭据）；deploy-security.sh 删除
- 失败：secrets 文件缺失 → Deploy 步骤标红 + 报错信息指明文件路径；不得静默使用旧密码或 admin123
- 不变式 🔒：真实密码不出现在任何 git 文件、workflow 日志、脚本输出；.env 仍在 rsync 之后写入（防 --delete 清除）

### C5 密码轮换 + 安全记录
- 前置：旧密码已泄露于公网 git 历史（仓库 PUBLIC）
- 后置：用户指定新密码（11 位，含符号；长度低于建议值已告知，由 /api/login 的 5 次/15 分钟 IP 锁定缓解）→ 写入服务器 `~/.secrets/resume.env` → 随 test / prod 部署更新两环境 .env → `docs/security-review-log.md` 新增条目（泄露事实、轮换动作、日期、剩余风险：git 历史仍含旧密码但已作废）
- 失败：任一环境旧密码仍可登录 `/api/login` → 轮换未完成，不得合并 main
- 不变式 🔒：旧密码（原 4 文件中的明文值）在两环境均失效；新密码不写入任何 git 文件

### C6 PM2 解析健壮化
- 前置：原脚本写死 npx 缓存 hash 路径；服务器存在两份 npx pm2 + 1 个 daemon 版本
- 后置：解析顺序 = `command -v pm2` → 用户全局路径（若安装）→ npx glob（取版本最高的一份）→ 全部失败则报错并中止；daemon 与 CLI 版本不一致的输出视为非致命警告（不作失败判据）；`pm2 update`（对齐 daemon）仅在用户显式授权后作为一次性服务器操作执行，脚本内不含 pm2 update / kill / delete all
- 失败：解析不到任何 pm2 二进制 → 部署失败并提示安装命令
- 不变式 🔒：脚本只操作 resume / resume-test 两个 PM2 进程名，任何情况下不触碰 baobao-* 进程

### C7 文档与版本同步
- 前置：package.json version = 1.5.0；CHANGELOG.md 存在
- 后置：package.json → 1.6.0；CHANGELOG.md 顶部新增本次变更记录；docs/ci-cd-guide.md 更新（密码来源与轮换、回滚机制、pm2 解析说明）；README 部署相关表述同步；spec 入库
- 失败：版本号或文档与实际实现不一致 → 未达标
- 不变式：SemVer minor 递增（无 API 变更）

## 6. 验收标准

- [ ] A1 ci-deploy.sh 含 `set -euo pipefail`，`pm2 start` 无 `|| true`；`bash -n` 通过；服务器 /tmp 故障注入测试：注入失败后备份目录被恢复、进程以备份 .env 重启、退出码非零
- [ ] A2 推送 test 分支后 workflow 全绿（Run tests + Deploy to Test + Verify 三步），curl http://192.168.50.100:3002/ai 返回 200
- [ ] A3 test 环境用新密码登录 `/api/login` 成功；旧密码返回 401/失败
- [ ] A4 全仓 git grep 旧密码字面量零命中（旧值只存在于 git 历史）；`~/.secrets/resume.env` 权限 600；新密码不出现在任何 git 文件
- [ ] A5 服务器上单独运行 PM2 解析逻辑，输出可用 pm2 路径与版本；豹豹 3 个进程全程 online（pm2 list 前后对比）
- [ ] A6 docs/ci-cd-guide.md / README / CHANGELOG / package.json(1.6.0) 与实现一致
- [ ] A7 合并 main 后生产部署成功：https://resume.zxz0608.com/ai 返回 200；生产旧密码失效、新密码可登录

## 7. 边界与异常

| 场景 | 处理 |
|---|---|
| secrets 文件缺失 | 部署失败，报错指明路径；不回退默认密码 |
| 首次部署无备份 | 跳过回滚，直接非零退出 |
| rsync 部分失败 | set -o pipefail 捕获非零 → 中止 + 回滚 |
| pm2 daemon 与 CLI 版本不一致 | 警告输出，不作失败判据 |
| 端口被无关进程占用 | lsof + kill -9（现状保留，kill 失败容错） |
| 豹豹进程受影响 | 不允许发生：脚本仅按进程名操作 resume/resume-test；pm2 update 仅在授权下单独执行 |
| 回滚本身失败 | 退出非零并打印手动恢复指引（备份目录路径） |
| 新密码丢失 | 服务器 secrets 文件即真源，可随时查阅/再轮换 |

## 8. 三问完整性检查

- [x] ① 取值范围：环境枚举 test/prod；退出码二值；密码为可打印字符集 ≥24 位；pm2 解析结果为路径或报错
- [x] ② 状态流转：push test → workflow(测试/部署/验证) → 部署成功→curl 200→新密码核验 / 部署失败→trap→恢复备份→重启→非零退出；guard = 无备份不回滚、豹豹进程不可触碰
- [x] ③ 生成逻辑：每处变更一句话——脚本加 set -e 与收窄容错、trap 回滚、读 secrets 文件、pm2 多级解析、yml 删明文、删死脚本、文档版本同步

**DoR**：需求无歧义 ☑、技术可行 ☑、影响面已盘 ☑

## 9. 核销记录（Step 5 填写）

| 条款 | 测试用例 | 结果 | 路径真实性 |
|---|---|---|---|
| C1 | test_c1_fail_fast | 待填 | bash -n + 故障注入 |
| C2 | test_c2_narrowed_tolerances | 待填 | 代码审查 + 故障注入 |
| C3 | test_c3_auto_rollback | 待填 | 服务器 /tmp 故障注入 |
| C4 | test_c4_secret_out_of_git | 待填 | git grep + 服务器实跑 |
| C5 | test_c5_password_rotation | 待填 | 登录接口实测（新/旧密码） |
| C6 | test_c6_pm2_resolution | 待填 | 服务器实跑解析逻辑 |
| C7 | test_c7_docs_version_sync | 待填 | 文本断言 |
