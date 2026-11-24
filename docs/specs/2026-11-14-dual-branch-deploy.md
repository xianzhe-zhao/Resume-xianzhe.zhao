# 双分支隔离部署 spec（2026-11-14）

## 1. 背景与目标

### 需求来源
用户要求：提交 PR 合并到 main 后先部署到测试环境，回家测试确认后再部署到生产环境。

### 优化后需求
搭建双分支隔离部署流程，main → 测试环境，production → 生产环境，目录完全隔离。

### 需求澄清记录
| 问题 | 回答 |
|---|---|
| 测试和生产是否同一台服务器？ | 是，同一台 192.168.50.100 |
| 如何隔离？ | 不同目录 + 不同端口 + 不同 PM2 进程 |
| 生产部署触发方式？ | 合并 main 到 production 分支 |
| 是否需要回滚机制？ | 是，每次部署前自动备份 |

## 2. 方案自审

### 现有能力盘点
- ✅ 已有自托管 Runner（homeserver）
- ✅ 已有 deploy.yml（单分支部署）
- ✅ 已有测试环境（resume-test，端口 3004）
- ✅ 已有生产环境（resume，端口 3000）
- ✅ 已有部署脚本（scripts/deploy.sh）

### 三选一决策
**B 扩展** — 复用现有 workflow，拆分为两个文件

### 影响面分析
- 新增：`.github/workflows/deploy-test.yml`
- 新增：`.github/workflows/deploy-prod.yml`
- 删除：`.github/workflows/deploy.yml`（旧版）
- 新增：`production` 分支
- 不影响：业务代码、测试代码、数据文件

### 成本预算
无

### 测试策略
- 本地测试：`python test/test.py`（246 项）
- 测试环境验证：`curl http://192.168.50.100:3004/ai`
- 生产环境验证：`curl https://resume.zxz0608.com/ai`

## 3. 技术蓝图

### 前端
无变更

### 后端
无变更

### 数据库
无变更

### 环境依赖
| 环境 | 目录 | 端口 | PM2 进程 | 触发分支 |
|---|---|---|---|---|
| 测试 | `/home/xianzhe/Project/resume-test` | 3004 | `resume-test` | `main` |
| 生产 | `/home/xianzhe/Project/resume` | 3000 | `resume` | `production` |

## 4. 非目标

- 不修改业务代码
- 不修改测试代码
- 不修改数据文件
- 不引入新的依赖

## 5. 契约条款

### C1 测试环境自动部署
- 前置：代码推送到 main 分支或 PR 合并到 main
- 后置：workflow 自动触发，部署到 `/home/xianzhe/Project/resume-test`，PM2 进程 `resume-test` 重启
- 失败：部署失败 → workflow 标红，生产环境不受影响
- 不变式：测试环境部署不影响生产环境

### C2 生产环境手动触发部署
- 前置：合并 main 到 production 分支
- 后置：workflow 自动触发，部署到 `/home/xianzhe/Project/resume`，PM2 进程 `resume` 重启
- 失败：部署失败 → workflow 标红，自动回滚到备份版本
- 不变式：生产部署前必须有备份

### C3 环境隔离
- 前置：两个 workflow 分别监听不同分支
- 后置：测试和生产使用不同目录、端口、PM2 进程
- 失败：配置错误导致部署到错误目录 → 部署前检查目标路径
- 不变式：测试环境的修改不会同步到生产环境

### C4 部署前自动备份
- 前置：任何环境部署前
- 后置：当前版本备份到 `{目录}-backup-{时间戳}`
- 失败：备份失败 → 中止部署
- 不变式：备份目录保留最近 5 个版本

## 6. 验收标准

- [ ] A1：推送到 main 后，测试环境自动更新（http://192.168.50.100:3004/ai）
- [ ] A2：合并到 production 后，生产环境自动更新（https://resume.zxz0608.com/ai）
- [ ] A3：测试环境部署不影响生产环境
- [ ] A4：每次部署前自动创建备份

## 7. 边界与异常

| 场景 | 处理 |
|---|---|
| 测试环境部署失败 | workflow 标红，生产不受影响 |
| 生产环境部署失败 | 自动回滚到备份版本 |
| 同时推送 main 和 production | 两个 workflow 并行执行，互不干扰 |
| 备份空间不足 | 清理最旧的备份，保留最近 5 个 |

## 8. 三问完整性检查

- [x] ① 分支取值范围：`main` / `production`（枚举）
- [x] ② 部署流程状态机：push → CI → 测试/生产部署 → 验证
- [x] ③ 部署输出逻辑：rsync 同步文件 → pm2 restart

## 9. 核销记录（Step 5 填写）

| 条款 | 测试用例 | 结果 | 路径真实性 |
|---|---|---|---|
| C1 | test_c1_test_auto_deploy | 待填 | 自动 |
| C2 | test_c2_prod_manual_deploy | 待填 | 自动 |
| C3 | test_c3_env_isolation | 待填 | 命令行 |
| C4 | test_c4_auto_backup | 待填 | 命令行 |
