# 赵先哲 · 可管理的网页简历系统

数据驱动的多版本简历系统：内容与展示分离，4 个求职意向版本，密码保护的管理后台，一键分享/导出。

**在线预览**：https://resume.zxz0608.com/ai

---

## 快速开始

```bash
# 启动服务器（需 Node.js）
node server.js
# 或指定端口和管理密码
PORT=3000 ADMIN_PASSWORD=你的密码 node server.js
```

打开浏览器访问：
- **简历页面**：http://localhost:3000/ai （默认 AI 开发版）
- **管理后台**：http://localhost:3000/admin （密码：通过环境变量设置）

---

## 4 个版本（按求职优先级）

| 路径 | 求职意向 | 适用场景 |
|------|---------|---------|
| `/ai` | AI 应用开发工程师 | 投 AI 相关开发岗（默认，最高优先级） |
| `/it` | IT 技术支持工程师 | 投 IT 技术支持岗 |
| `/test` | 测试开发工程师 | 投测试岗 |
| `/erp` | ERP 实施顾问 | 投 ERP 相关岗位 |

每个版本共享同一份基础数据（经历/教育/技能/证书），仅调整求职意向、个人简介、核心优势排序——同底稿换视角，方便维护。

---

## 项目结构

```
resume/
├── server.js                 # Node 服务端（零依赖，页面路由 + API + 鉴权 + 安全加固）
├── data/resume.json          # 简历数据（所有版本，改内容只改这里）
├── public/
│   ├── index.html            # 公共简历页模板（服务端注入数据，无后台入口）
│   ├── app.js                # 简历渲染器
│   ├── admin.html            # 管理后台页面
│   ├── admin.js              # 后台逻辑（登录/编辑/分享/导出）
│   ├── style.css             # 共享样式
│   └── fonts/                # 本地字体（Jost）
├── test/
│   ├── test.py               # Python 自动化测试（246 项）
│   └── cdp-print.mjs         # 打印/存为 PDF 流程 CDP 实测（31 项）
├── scripts/
│   ├── deploy.sh             # Linux/macOS 部署脚本
│   └── deploy.bat            # Windows 部署脚本
├── .github/workflows/
│   └── deploy.yml            # GitHub Actions CI/CD 配置
├── docs/specs/               # 契约 spec 文档
├── package.json
└── CHANGELOG.md
```

---

## 管理后台功能

- **密码登录**：防止他人篡改简历
- **编辑内容**：基础信息（所有版本共享）+ 各版本专属简介/优势
- **一键分享**：复制对应版本页面链接，发给不同的人
- **导出 HTML**：将指定版本导出为零依赖单文件 HTML，离线分享

---

## 安全设计（v1.5.0 加固）

### 应用层安全
- ✅ **存储型 XSS 防护**：数据中的 `</script>` 等危险内容被转义
- ✅ **数据校验**：保存时验证 JSON 结构，拒绝畸形数据
- ✅ **隐私脱敏**：公开 API 自动隐藏手机号/微信（显示为 `****`）
- ✅ **文件上传校验**：魔数（magic bytes）验证，禁止 SVG，白名单扩展名
- ✅ **路径遍历防护**：严格的路径校验，防止 `../../etc/passwd` 攻击
- ✅ **安全响应头**：CSP、X-Frame-Options、X-Content-Type-Options 等

### 认证安全
- ✅ **强制强密码**：启动时检查 `ADMIN_PASSWORD`，禁用默认密码 `admin123`
- ✅ **登录限流**：5 次失败锁定 15 分钟
- ✅ **会话过期**：24 小时 TTL，每小时自动清理
- ✅ **HttpOnly Cookie**：防止 XSS 窃取会话

### 架构安全
- ✅ **默认监听 127.0.0.1**：不直接对外暴露，通过反向代理（Cloudflare Tunnel）访问
- ✅ **公共页面无后台入口**：查看者看不到管理后台
- ✅ **数据原子写入**：先写临时文件再 rename，防止写入中断

---

## 测试

```bash
python test/test.py      # 246 项自动化测试（含 9 项安全测试）
node test/cdp-print.mjs  # 31 项打印/存为 PDF 流程 CDP 实测（需本机 Chrome/Edge）
```

### 测试覆盖
- **核心功能**：多版本页面、数据 API、静态资源、鉴权/保存/头像上传
- **视觉还原**：暖色配色、8 区编号式结构、Hero 增强、镜像交错时间线卡
- **打印版式**：横竖版选择对话框、多页打印修复、A4 横竖版模板
- **安全加固**：XSS 防护、数据校验、隐私脱敏、路径遍历防护、登录限流

---

## CI/CD 自动部署

### 双分支隔离部署方案

本项目采用 **GitHub Actions 自托管 Runner** + **双分支隔离部署**：

```
┌─────────────────────────────────────────────────────────────┐
│  开发 → PR 合并到 test → 自动部署测试环境                      │
│                        ↓                                     │
│                   测试通过后                                  │
│                        ↓                                     │
│              PR 合并到 main → 自动部署生产环境                  │
└─────────────────────────────────────────────────────────────┘
```

### 环境配置

| 环境 | 分支 | 目录 | 端口 | PM2 进程 | 访问地址 |
|---|---|---|---|---|---|
| **测试** | `test` | `/home/xianzhe/Project/resume-test` | 3002 | `resume-test` | http://192.168.50.100:3002/ai |
| **生产** | `main` | `/home/xianzhe/Project/resume` | 3000 | `resume` | https://resume.zxz0608.com/ai |

### 工作流程

#### 1. 开发新功能

```bash
# 创建功能分支
git checkout -b feature/xxx

# 开发完成后，合并到 test 分支
git checkout test
git merge feature/xxx
git push origin test
# → 自动部署到测试环境
```

#### 2. 测试通过后部署生产

**方式 A：命令行**
```bash
git checkout main
git merge test
git push origin main
# → 自动部署到生产环境
```

**方式 B：GitHub 网页**
1. 创建 PR：`test` → `main`
2. 等待 CI 检查通过
3. 点击 "Merge pull request"

#### 3. 部署流程

- 备份当前版本（保留最近 5 个）
- 同步新文件到目标目录
- 写入 `.env` 文件（ADMIN_PASSWORD + PORT）
- 停止旧进程（pm2 delete + kill）
- 启动新进程（pm2 start）
- 验证服务可访问

### 分支保护规则

**main 分支保护**：
- ✅ 必须通过 PR 合并
- ✅ 必须通过状态检查：
  - `Test & Deploy to Test Env`
  - `Deploy to Production`
- ✅ 分支必须是最新的
- ✅ 禁止强制推送

**test 分支**：可直接推送，快速迭代

### 故障排查

#### Git 连接失败

如果 CI 运行时 `git clone` 失败（国内网络问题），配置代理：

```bash
# 方案 A：配置 Git 使用 SSH
git config --global url."git@github.com:".insteadOf https://github.com/

# 方案 B：使用 mihomo 代理
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890
```

详见：[docs/ci-cd-guide.md](docs/ci-cd-guide.md)

#### PM2 版本警告

PM2 版本不匹配会导致退出码非零，workflow 中已用 `|| true` 处理。

#### 端口被占用

使用 `lsof -ti :PORT` 查找并 `kill -9` 杀掉占用进程。
第 5 次尝试 → 成功 ✅ / 失败 ❌
```

### 手动部署

```bash
# Linux/macOS
bash scripts/deploy.sh test    # 部署到测试环境
bash scripts/deploy.sh prod    # 部署到生产环境（需确认）

# Windows
scripts\deploy.bat test
scripts\deploy.bat prod
```

---

## 部署架构

| 环境 | 地址 | 端口 | 访问方式 |
|---|---|---|---|
| **正式系统** | https://resume.zxz0608.com | 3000 | Cloudflare Tunnel（公网） |
| **测试系统** | http://192.168.50.100:3004 | 3004 | 内网访问 |
| **管理后台** | https://resume.zxz0608.com/admin | 3000 | 密码保护 |

### 服务器配置
- **服务器**：Linux (Ubuntu) @ 192.168.50.100
- **进程管理**：pm2（自托管 Runner 同一台机器）
- **内网穿透**：Cloudflare Tunnel（resume.zxz0608.com）
- **Git 配置**：使用 SSH 认证（`git@github.com:` insteadOf `https://github.com/`）

---

## 环境变量

| 变量 | 说明 | 默认值 |
|---|---|---|
| `PORT` | 服务端口 | `3000` |
| `HOST` | 监听地址 | `127.0.0.1` |
| `ADMIN_PASSWORD` | 管理后台密码 | **必须设置，禁止默认值** |

---

## 故障排查：Git 连接失败

### 问题现象

CI/CD 运行时 `actions/checkout` 反复失败，报错：
```
Failed to connect to github.com:443 after 21000 ms: Could not connect to server
```

### 原因分析

服务器位于中国大陆，访问 GitHub 可能不稳定。

### 解决方案：配置代理（备用方案）

> ⚠️ 此方案仅在 CI/CD 重试机制（5 次 × 60 秒）仍然失败时使用。

#### 方案 A：mihomo 命令行代理（推荐）

mihomo（原 Clash Meta 内核）是纯命令行代理工具，无需桌面环境。

**1. 安装 mihomo**

```bash
# 下载（amd64）
curl -L https://github.com/MetaCubeX/mihomo/releases/latest/download/mihomo-linux-amd64-compatible.gz -o /tmp/mihomo.gz
gunzip /tmp/mihomo.gz
chmod +x /tmp/mihomo
sudo mv /tmp/mihomo /usr/local/bin/mihomo

# 验证
mihomo -v
```

**2. 配置订阅**

```bash
mkdir -p ~/.config/mihomo
# 将你的 Clash 订阅内容保存到：
# ~/.config/mihomo/config.yaml
```

**3. 启动代理**

```bash
# 前台运行（测试）
mihomo -d ~/.config/mihomo

# 后台运行
nohup mihomo -d ~/.config/mihomo > /dev/null 2>&1 &
```

**4. 配置 Git 使用代理**

```bash
# 假设 mihomo 监听 7890 端口
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890
```

**5. 验证**

```bash
git ls-remote https://github.com/xianzhe-zhao/Resume-xianzhe.zhao.git HEAD
```

**6. 取消代理（恢复直连）**

```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```

#### 方案 B：Clash Verge Rev GUI（需要桌面环境）

> ⚠️ 仅适用于有桌面环境的 Linux 系统。

- 下载地址：https://github.com/clash-verge-rev/clash-verge-rev/releases
- 服务器架构：`x86_64`，下载 `amd64.deb`
- 安装：`sudo dpkg -i clash-verge-rev_*.deb`

---


## 双分支部署流程

本项目采用**双分支隔离部署**策略：

| 分支 | 环境 | 地址 | 触发方式 |
|---|---|---|---|
| **test** | 测试环境 | http://192.168.50.100:3002/ai | 推送到 test 自动部署 |
| **main** | 生产环境 | https://resume.zxz0608.com/ai | PR 合并到 main 自动部署 |

### 工作流程

```
开发 → PR 合并到 test → 自动部署测试环境
                        ↓
                   测试通过后
                        ↓
              PR 合并到 main → 自动部署生产环境
```

### 日常开发

```bash
# 1. 创建功能分支
git checkout -b feature/xxx

# 2. 开发完成后，合并到 test 分支
git checkout test
git merge feature/xxx
git push origin test
# → 自动部署到测试环境

# 3. 测试通过后，创建 PR 合并到 main
gh pr create --base main --head test --title "deploy: 合并 test 到 main"
# 或在 GitHub 网页上创建 PR
# → 自动部署到生产环境
```

### 分支保护

- **main 分支**：必须通过 PR 合并，禁止直接推送
- **test 分支**：可直接推送，快速迭代


## 版本管理

见 [CHANGELOG.md](CHANGELOG.md)。遵循语义化版本规范。

### 最新版本：v1.5.0（2026-11-12）

**安全加固 + CI/CD 自动部署**
- 修复存储型 XSS 漏洞
- 添加数据校验和隐私脱敏
- 文件上传魔数校验
- 登录限流和会话过期
- GitHub Actions 自托管 Runner 自动部署

---

## 技术栈

- **后端**：Node.js（内置 http 模块，零第三方依赖）
- **前端**：原生 HTML/CSS/JS + GSAP 3.12.5 + ScrollTrigger 3.12.5
- **字体**：本地 Jost（`public/fonts/jost-latin.woff2`）
- **测试**：Python 标准库 + Playwright（CDP 实测）
- **部署**：pm2 + Cloudflare Tunnel + GitHub Actions

---

## License

MIT

#   C I / C D   ����KmՋ
 
 
 
 ,g!k�c�N(u�N�����SR/e�rAmz/f&Tck8^�]\O0
 
 
