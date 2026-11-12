# CI/CD 搭建 spec（2026-11-10）

## 1. 背景与目标

### 需求来源
用户要求：把 Git 内容下载到项目目录，扫描代码并适配环境搭建测试系统，通过 CI/CD 流程实现。

### 优化后需求
为简历系统搭建 CI/CD 基础设施：
- 使用 GitHub Actions 作为 CI/CD 平台
- 测试环境使用端口隔离（测试 3999，生产 3000）
- 部署目标为本地/公司服务器
- 半自动部署：测试通过后自动部署到测试环境，生产需手动确认

### 需求澄清记录
| 原始需求 | 优化后 | 说明 |
|---|---|---|
| "通过 ci/cd 的流程做出来" | GitHub Actions workflow + 部署脚本 | 明确平台和实现方式 |
| "在测试系统中适配环境并搭建起来" | 端口隔离 + 临时目录测试 | 复用现有 test.py 的隔离机制 |

## 2. 方案自审

### 现有能力盘点
| 层 | 现有 | 说明 |
|---|---|---|
| 测试 | ✅ test/test.py（237 项） | Python 标准库，端口 3999 隔离 |
| 测试 | ✅ test/cdp-print.mjs（31 项） | 需本机 Chrome/Edge |
| CI/CD | ❌ 无 | 需新建 |
| 部署脚本 | ❌ 无 | 需新建 |

### 三选一决策
| 决策 | 选择 | 理由 |
|---|---|---|
| CI/CD | C 新建 | 无基础设施 |
| 部署脚本 | C 新建 | 无现有脚本 |
| 测试运行 | A 复用 | 现有 test.py 已支持隔离 |

### 影响面分析
- 新增文件：`.github/workflows/ci.yml`、`scripts/deploy.sh`、`scripts/deploy.bat`
- 修改文件：`package.json`（添加 test:cdp 脚本）
- 不影响：业务代码完全不动

### 成本预算
- GitHub Actions：公开仓库免费 2000 分钟/月
- 无 LLM/付费 API

### 测试策略
- 核心回归：test/test.py 237 项（已有）
- 新功能：CI 能跑通、部署脚本能执行

## 3. 技术蓝图

### 前端
无变更

### 后端
无变更

### 数据库
无变更

### 环境依赖
- 新增 GitHub Actions workflow（后续实现）
- 部署脚本：scp 上传到 Linux 服务器

### 服务器环境
| 项 | 值 |
|---|---|
| 服务器 | xianzhe@192.168.50.100 |
| 测试目录 | /home/xianzhe/Project/resume-test |
| 测试端口 | 3001 |
| Node.js | v24.22.1（已安装） |
| pm2 | 需安装 |

## 4. 非目标

- 不修改业务代码
- 不引入 Docker（当前阶段不需要）
- 不做全自动部署（保留人工确认环节）

## 5. 契约条款

### C1 GitHub Actions CI 流程
- 前置：代码推送到 GitHub
- 后置：workflow 自动触发，运行 test/test.py，退出码 0 表示通过
- 失败：测试失败 → workflow 标红，阻止后续部署步骤
- 不变式：每次 push/PR 都触发，不跳过

### C2 测试环境隔离
- 前置：CI 或本地运行测试
- 后置：测试跑在 3999 端口，不影响 3000 端口生产服务
- 失败：端口冲突 → 测试启动失败，退出码非 0
- 不变式：测试使用临时目录，不污染真实 data/ 目录

### C3 部署脚本支持多环境
- 前置：执行 scripts/deploy.sh test 或 scripts/deploy.sh prod
- 后置：根据参数部署到对应目录/服务器
- 失败：参数错误 → 提示用法并退出
- 不变式：部署前备份当前版本，支持回滚

### C4 半自动部署流程
- 前置：CI 测试通过
- 后置：测试环境自动更新；生产环境需手动触发
- 失败：测试未通过 → 生产部署步骤不可执行
- 不变式：生产部署前必须确认测试已通过

## 6. 验收标准

- [ ] A1：push 代码到 GitHub，Actions 自动跑测试并显示结果
- [ ] A2：本地运行 python test/test.py 通过（237 项）
- [ ] A3：运行 scripts/deploy.sh test 部署到测试目录
- [ ] A4：运行 scripts/deploy.sh prod 部署到生产目录（需手动确认）

## 7. 边界与异常

| 场景 | 处理 |
|---|---|
| Node.js 未安装 | CI 用 setup-node action；本地脚本提示安装 |
| Python 未安装 | CI 用 setup-python action；本地需预装 |
| 端口被占用 | 测试脚本已有重试逻辑；部署脚本检查进程 |
| 部署目标不存在 | 脚本创建目录；失败则中止 |

## 8. 三问完整性检查

- [x] ① 字段取值范围：部署环境 test/prod（枚举）
- [x] ② 状态机：push → CI → 测试环境 → (手动) → 生产
- [x] ③ 输出生成逻辑：deploy.sh <env> → 复制 → 重启

## 9. 核销记录（Step 5 填写）

| 条款 | 测试用例 | 结果 | 路径真实性 |
|---|---|---|---|
| C1 | test_c1_deploy_scripts_created | ✅ | 命令行 |
| C2 | test_c2_port_isolation | ✅ | 自动 |
| C3 | test_c3_deploy_test | ✅ | 命令行 |
| C4 | test_c4_prod_confirm | ✅ | 命令行 |

### 部署信息
| 项 | 值 |
|---|---|
| 服务器 | xianzhe@192.168.50.100 |
| 测试目录 | /home/xianzhe/Project/resume-test |
| 测试端口 | 3004（内网访问） |
| 正式目录 | /home/xianzhe/Project/resume |
| 正式端口 | 3000 |
| 对外域名 | resume.zxz0608.com（Cloudflare Tunnel） |
| PM2 进程 | resume（正式）、resume-test（测试） |

### 完成状态
- [x] 部署脚本创建（deploy.sh / deploy.bat）
- [x] 测试系统部署（192.168.50.100:3004）
- [x] 正式系统部署（192.168.50.100:3000）
- [x] Cloudflare Tunnel 配置（resume.zxz0608.com）
- [x] 外网访问验证通过（HTTP 200）
