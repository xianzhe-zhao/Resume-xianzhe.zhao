# 更新日志 (CHANGELOG)

本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范。

## [1.7.1] - 2026-11-16

### 手机端适配修复（spec：`docs/specs/2026-11-13-mobile-projects-fix.md`）

- **C1 featured 项目塌缩**：个人作品主打项目（豹豹助手）因 CSS 特异性 bug 在 ≤1000px 未塌缩单列，内容挤在 106px 宽、卡片高 2126px、SVG 严重变形——补 `.proj-item.featured { grid-template-columns: 1fr; }` 修复
- **C2 苹果官网式汉堡菜单**：手机端（≤760px）7 项锚点菜单改为 2 条杠汉堡按钮 + 点击展开面板跳转；面板展开时导航栏常驻不隐藏；面板与导航栏留 18px 间距；背景 `backdrop-filter: blur(6px)` 虚化
- **C3 滚动隐藏/停止显示**：手机端导航栏下滑隐藏、停止 600ms 后恢复、上滑立即显示、顶部常驻、面板展开时不隐藏（iOS Safari 式）
- **C4 触摸目标 ≥44px**：lang-btn/nav-print/nav-burger/fc-links a/proj-link 在 ≤760px 加大到 ≥44px
- **C5 数据压图字号**：≤560px proj-metric/exp-metric 字号降至 32px
- **C6 中小视口禁用入场动画**：≤1024px（手机+平板）禁用 GSAP `gsap.from()` 入场动画（ScrollTrigger 在中小视口不可靠触发导致 14~28 个元素 opacity:0 大片空白）；改用 `gsap.fromTo()` + `immediateRender:false`，元素默认可见、滚动到触发点才播放动画；resize 跨断点切换无残留空白；桌面端 ≥1025px 动画不变

### 测试
- `test/cdp-mobile-verify.mjs`（30 项）：C1-C5 坐标断言 + 桌面端不变性 + 768px 断点边界
- `test/cdp-mobile-c5.mjs`（12 项）：C3 滚动隐藏/停止/上滑 + 背景虚化 + 面板展开锁定
- `test/cdp-resize-blank.mjs`：resize 三端切换无空白（9 次切换全 0 隐藏）
- `test/cdp-mobile-opacity.mjs` + `test/cdp-tablet-opacity.mjs`：手机/平板无 opacity:0 元素
- `test/cdp-anim-play.mjs`：桌面端滚动时动画正常播放（opacity 0→1）
- `test/cdp-desktop-anim.mjs`：桌面端动画初始态 + 滚动恢复
- `test/cdp-print.mjs`（31 项）：P1 断言更新（C6 修复后无 opacity:0）+ 打印横竖版
- `test/test.py`（276 项）：修复 f-string 反斜杠语法错误（main 既有 bug）
- check_spec.py 机器校验 PASS（0 错误）

## [1.7.0] - 2026-11-15

### 安全修复（代码层全面审查，spec：`docs/specs/2026-11-15-security-fixes.md`，审查记录：`docs/security-review-log.md`）

- **P0 修复**：
  - **畸形 URL 崩溃（DoS）**：`/%ZZ` 等非法 percent-encoding 使 `safeStatic` 抛 URIError 导致进程退出（任何匿名访客可单请求打崩服务，实测复现）——safeStatic 整体 try/catch + 请求处理器兜底 catch，任何未捕获异常不再终止进程
  - **管理后台保存损坏手机号**：admin.js 误用脱敏接口 `/api/data` 加载编辑器，保存时把 `176****6834` 写回文件覆盖真实号码（实测复现）——改用鉴权接口 `/api/data/full`
- **P1 修复**：
  - readBody 改 Buffer 收集再统一解码（原字符串拼接跨 TCP 分块损坏多字节中文，实测复现）
  - 登录限流防绕过：客户端 IP 取 `cf-connecting-ip` / XFF **末段**（原取 XFF 首段可伪造，无限爆破）；loginAttempts 过期清理 + 10000 条硬上限
  - 项目链接 scheme 白名单（`^https?://`），`javascript:` 链接不再渲染为可点击
- **P2 修复**：esc() 补单引号转义；`D.ver`/`p.link` 空值兜底防白屏；replace 特殊模式（`$&`/`$'`）注入防护（函数形式替换）；admin 未保存提醒脏标记生效；密码常量时间比较（sha256+timingSafeEqual）；MIME 补 `.woff2`；404/logout 补安全头；上传魔数校验收紧（超短 buffer 拒绝、webp 验 RIFF+WEBP）；数据校验黑名单扩展（iframe/object/embed/javascript:）
- **start.bat 修复**：UTF-8 代码页 65001；移除硬编码他人用户路径与密码明文回显；无 .env 时提示输入（v1.5.0 起拒绝 admin123，旧脚本实际已无法启动）
- **垃圾清理**：删除废弃脚本 `scripts/{deploy.sh, deploy.bat, deploy-remote.sh, generate-pr.sh, fix-readme.py}`（前两个含 admin123 默认回退隐患）；package.json 移除对应 npm scripts
- **测试**：新增 30 项 SF 用例（spec C1-C12 核销），总计 276 项全部通过

## [1.6.0] - 2026-11-15

### 变更
- **CI/CD 部署加固**（spec：`docs/specs/2026-11-15-cicd-hardening.md`）：
  - `scripts/ci-deploy.sh` 启用 `set -euo pipefail`，rsync / `.env` 写入 / `pm2 start` 失败立即非零退出，workflow 正确标红（不再"服务没起来还 ✅ 部署完成"）
  - **部署失败自动回滚**：恢复最近备份（代码 + `.env`）并重启旧版本（兑现 dual-branch spec C2/C4 承诺）
  - **真实密码出库（豹豹模式）**：`ADMIN_PASSWORD` 只从服务器 `~/.secrets/resume.env` 读取（600 权限），缺失即失败、禁止默认值回退；两个 workflow 删除明文密码 env；测试环境 Verify 失败时不再 `cat .env`（防密码进 workflow 日志）
  - **密码轮换**：旧密码（原以明文提交进公网 git 历史的值）两环境均已作废，新密码见服务器 secrets 文件；记录见 `docs/security-review-log.md`
  - **PM2 解析健壮化**：PATH → `~/.npm-global` → npx 缓存三级解析，不再写死 npx hash 路径；服务器已全局安装 pm2 7.1.2 并 `pm2 update` 对齐 daemon（版本警告消除）；脚本只操作 `resume` / `resume-test` 两个进程名
  - 删除无引用死脚本 `scripts/deploy-security.sh`（含明文密码、逻辑过时）
  - `.gitignore` 补 `.tmp/`（临时运维脚本可能含敏感值）；编码转 UTF-8

## [1.5.0] - 2026-11-14

### 新增
- **双分支隔离 CI/CD**（spec：`docs/specs/2026-11-14-dual-branch-deploy.md`，后续演进为 test→测试 / main→生产）：
  - `test` 分支推送 → 自动部署测试环境（`/home/xianzhe/Project/resume-test`，端口 3002，PM2 进程 `resume-test`）
  - `main` 分支合并 → 自动部署生产环境（`/home/xianzhe/Project/resume`，端口 3000，进程 `resume`）
  - GitHub Actions 自托管 Runner（homeserver）；`scripts/ci-deploy.sh` 统一部署入口；部署前自动备份（保留 5 个）
  - main 分支保护：PR 合并 + 必需状态检查 + 禁止强推

## [1.4.0] - 2026-11-12

### 新增
- **部署基础设施**：新增 Linux/macOS 部署脚本 `scripts/deploy.sh` 和 Windows 部署脚本 `scripts/deploy.bat`，支持测试/生产双环境部署
- **测试系统**：部署到 `192.168.50.100:3004`（内网访问），PM2 进程名 `resume-test`
- **正式系统**：部署到 `192.168.50.100:3000`，通过 Cloudflare Tunnel 对外暴露为 `resume.zxz0608.com`
- **契约 spec**：`docs/specs/2026-11-10-cicd-setup.md`（部署基础设施搭建）

### 部署架构
- **域名**：`resume.zxz0608.com`（Cloudflare Tunnel 代理）
- **正式端口**：3000（PM2 进程 `resume`）
- **测试端口**：3004（PM2 进程 `resume-test`，仅内网）
- **服务器**：`xianzhe@192.168.50.100`（Linux）

### 技术栈
- 后端：Node.js（内置 http 模块，零依赖，不变）
- 进程管理：pm2（通过 npx 安装）
- 内网穿透：Cloudflare Tunnel（cloudflared）

## [1.3.0] - 2026-11-05

### 新增
- **8 区编号式板块重构**：由 v1.2.0 暖色五段式（Hero/履历/技能/项目/页脚）重构为 **8 区编号式**——Hero → `00 / ABOUT` 关于我 → `01 / EXPERIENCE` 工作经历 → `02 / PROJECTS` 个人作品 → `03 / SKILLS` 技能档案 → `04 / EDUCATION & HONORS` 教育与荣誉 → `05 / OFF DUTY` 兴趣爱好 → Footer；每区统一头部公式（英文编号眉标 `NN / LABEL` → 中文大标题 → 一句副标题）
- **Hero 增强**：问候徽章 `HELLO/你好` + 荧光笔划线职位（暖琥珀半透明衬底）+ 拱形人像（顶部圆角大于底部）+ `OPEN TO WORK` 斜角深色标签 + `NOW` 状态卡（按版本切换：AI 落地/系统稳定/质量保障/ERP 交付）
- **关于我区（新增）**：态度型大标题 + 4 个特质气泡（复用各版本 advantages 数据，AI 落地/全栈开发/RPA 自动化/技术热情），hover 轻微放大
- **工作经历区重构**：3 个工作项目（RMS/RPA/ERP）做成**镜像交错时间线卡**（相邻左右镜像 + 中轴竖线编号节点）；封面为暖色 SVG 主题插画 + **大号数据压图**（4.5年/1400h/9年）；卡片五段式（日期→标题+角色→描述→量化成果→技能标签）
- **个人作品区重构**：3 个独立项目（豹豹助手/AiPro Bridge/Deskshare）镜像交错卡；封面 SVG 主题插画 + 数据压图（2150+/3 API/CRDT）；豹豹助手为主打（featured 加重）
- **技能档案区重构**：由 16 个扁平徽章网格改为 **5 张分组卡片**（后端/前端/数据库自动化/ERP报表/AI云系统），每组图标徽章横向排列，悬浮动效保留
- **教育与荣誉区独立**：从履历末尾独立为专区，教育卡含校园 SVG 占位插画 + 圆形校徽徽章，荣誉卡 AWS 认证去重只出现一次
- **兴趣爱好区（新增）**：3 张镜像交替占位图文卡（技术折腾/阅读思考/运动健身），暖色 SVG 主题插画 + 编号角标 + `后续可替换 / 增加图片` 提示；占位内容在 app.js UI 字典（不入 resume.json，保持数据模型稳定）
- **自动隐藏悬浮导航栏（C27）**：取代 v1.2.0 固定通栏顶栏，改为**胶囊形悬浮导航条**（大圆角 + 暖白底 + 柔和投影 + 距顶 18px + 居中）；三段式（Logo+字标 / 7 项锚点菜单 / 语言+打印按钮）；**鼠标靠近顶部感应区（y≤80px）立即出现**，**鼠标离开后 2 秒自动隐藏**，**首屏（scrollTop≤100px）常驻可见**；丝滑上下动画（translateY + opacity + CSS transition 380ms easeOutQuint）；点击导航项平滑滚动跳转；纯 CSS transition + 原生 JS 事件（不依赖 GSAP）；打印时隐藏；中英双语
- **移除公开页版本切换入口（C28）**：导航栏右侧不再显示 AI/IT/测试/ERP 版本切换链接，仅保留语言+打印按钮；4 个版本仍可通过直接访问 URL（`/ai /it /test /erp`）打开，版本管理完全在 `/admin` 后台进行；公开页不暴露多版本入口
- **SVG 主题插画占位系统**：所有模块封面/占位图均为**内联 SVG**（零外部请求、零新依赖），按模块主题绘制暖色图标化插画（服务器/机器人/网格/海豹/插头/文档/校园/运动等）；关键数据用暖琥珀超大号粗体压在 SVG 上做视觉锤
- **契约 spec**：`docs/specs/2026-11-05-section-redesign.md`（C17–C28 条款 + 验收清单 + 核销表）

### 变更
- **整体配色不变**：暖奶油底 `#faf5ec` + 暖琥珀强调 `#e08a3c` + 深色页脚 `#3d3529`（C1 仍成立，无红色）
- **页面结构**：头图封面 → 00 关于我 → 01 工作经历 → 02 个人作品 → 03 技能档案 → 04 教育与荣誉 → 05 兴趣爱好 → 页脚
- **数据模型不变**：resume.json 结构不动（兴趣爱好占位内容入 app.js UI 字典，与 stats/chips 同层；数据压图 metric 在 UI 字典按 project id / experience index 映射）
- **打印版式同步**：`@media print` 横竖版选择器同步新 8 区结构（.about 替代 .history 强制新页、.skill-cards 替代 .skill-grid、.exp-item/.proj-item/.od-item 替代旧卡片类）；分页规则同步（封面独占第 1 页、标题块不拆分、卡片不截断）

### 测试
- `test/test.py` 由 138 项扩充至 **237 项**：C3 由"五段式"修订为"8 区"、C4/C5/C6/C10/C15 选择器同步新结构、新增 C17–C28（8 区结构/Hero 增强/关于我/工作经历/个人作品/技能档案/教育荣誉/兴趣爱好/SVG 占位/核心回归/自动隐藏导航栏/移除版本切换入口）
- `test/cdp-print.mjs` **31 项**：打印版式选择器同步新结构（.skill-cards 替代 .stats，.navbar 替代 .topbar），真实 Chrome 横竖版 PDF 方向/页数/无 JS 异常
- `check_spec.py` 机器校验 PASS（0 错误 / 0 警告）
- 三宽视觉自检（1440/768/390）：8 区齐全、镜像交替正确、数据压图清晰、无水平溢出、无 JS 异常

### 技术栈
- 后端：Node.js（内置 http 模块，零依赖，不变）
- 前端：原生 HTML/CSS/JS + 本地 GSAP 3.12.5 / ScrollTrigger 3.12.5 + 内联 SVG 占位（零外部图片请求）
- 字体：本地 Jost（`public/fonts/jost-latin.woff2`）
- 头图：本地 JPEG（`public/img/portrait-cartoon.jpg`，保留）

## [1.2.0] - 2026-11-05

### 新增
- **打印版式选择对话框**：点击「打印 / 存为 PDF」弹出居中对话框，可选竖版（A4 竖版 · 单列紧凑）或横版（A4 横版 · 双列宽版），各带方向示意图标；显著提示「在目标打印机中选择另存为 PDF 即可下载」；×/Esc/点遮罩关闭；中英双语文案
- **打印版式模板**：`@page` A4 + 横竖版布局类（`html.print-portrait` / `html.print-landscape`），竖版单列（hero 单列人像居上、stats 2 列、技能 2 列、项目单列）、横版双列（hero 左文右图、stats 4 列、技能 4 列、项目 2 列）；版式类仅在 `@media print` 内生效，屏幕端零影响
- **契约 spec**：`docs/specs/2026-11-02-print-pdf.md`（C13–C16 条款 + 验收清单 + 核销表）
- **CDP 打印实测**：`test/cdp-print.mjs`（零依赖，Node 22+ 内置 WebSocket + 本机 Chrome/Edge），31 项断言覆盖对话框交互 + 打印媒体布局 + PDF 方向/页数

### 修复
- **多页打印动画残留**：GSAP 入场动画未触发时 DOM 残留内联 `opacity:0/visibility:hidden/transform`，打印预览第 2 页起内容不可见——`@media print` 内 `* { opacity:1 !important; visibility:visible !important; transform:none !important }` 纯 CSS 覆盖，不杀屏幕端动画
- **打印暖色底丢失**：废除 v1.1.0 白底规则，打印保留屏幕暖色底（body 白底 + #app 奶油底 `#faf5ec` + 技能带 `#f1e7d3` + 卡片 `#fffdf8` + 深色页脚 `#3d3529`）；`print-color-adjust: exact` 保证未勾选「背景图形」时背景仍输出
- **横版空白页**：RMS 履历块高 771px > A4 横版页高 718px，`break-inside: avoid` 把整块挤到下一页——改为 `.tl-item` 允许跨页（`.tl-proj` 子块不截断），`.sec-head-wrap` 不可拆分
- **打印内容裁切**：打印引擎排版视口 = 屏幕窗口（1440px）而非 @page 内容区，内容按 1440px 排版远超 A4 宽度——钉死 body 宽度（竖版 178mm / 横版 265mm）+ section 子元素 `max-width: none`
- **打印奶油色贴边**：body 背景传播到 canvas 填满 @page 无法内缩——body 改白底，奶油色移到 `#app`（非传播元素）+ `margin: 0 6mm`，纸边到奶油色 = 16mm @page + 6mm = 22mm 白色过渡带
- **静态文件缓存**：server.js 静态文件加 `Cache-Control: no-cache` 头，避免打印 CSS 改动不生效

### 测试
- `test/test.py` 由 108 项扩充至 **138 项**：C13 对话框（8 断言）+ C14 动画覆盖（4 断言）+ C15 版式模板（17 断言）+ C16 核心回归（2 断言）
- `test/cdp-print.mjs` **31 项**：真实 Chrome 对话框交互 + print 媒体布局 + printToPDF 方向/页数 + 无 JS 异常
- `check_spec.py` 机器校验 PASS（0 错误 / 0 警告）

## [1.1.0] - 2026-11-01

### 新增
- **中英双语**：默认中文，顶栏一键切换英文（姓名 Zhao Xianzhe、职位、履历、技能、项目、页脚全英文），再点切回；`/it` `/test` `/erp` 同样双语；缺失英文字段自动回退中文，后台保持中文
- **卡通人像头图**：AI 生成的卡通头像（浅蓝衬衫、圆框眼镜、暖色背景），PC 下满宽模糊背景 + 右侧清晰圆角人像卡片，边缘自然融入底色（因公司防火墙拦截 >35KB 上传，以 640×640 JPEG 入库，显示尺寸约 360px 下依然锐利）
- **技能展示区**：16 个技能以悬浮图标徽章罗列（GSAP 上下悬浮动效，相邻徽章不重合），hover 放大显示技能组
- **项目展示区**：豹豹助手（zxz0608.com）为主打卡，展示 5 大功能（AI 对话 / 豹豹新闻 2150+ / 看板项目管理 / 日历 + AI 每日问候 / 小米智能家居），另 2 个项目卡片
- **GSAP 动效体系**：本地托管 gsap + ScrollTrigger（无外部 CDN），滚动入场、悬浮、按压反馈；`prefers-reduced-motion` 下全部关闭且内容完整可见（因防火墙 >35KB 限制，gsap/ScrollTrigger 以 `.gz` 形式入库，服务器启动时自动解压为 `.js`，零依赖仅用内置 zlib）
- **契约 spec**：`docs/specs/2026-10-31-tech-redesign.md`（C1–C12 条款 + 验收清单 + 核销表）

### 变更
- **整体视觉重设计**：由冷色科技风改为**暖色风格**（暖奶油底 `#faf5ec` + 暖琥珀强调 `#e08a3c`），全站无红色；本地 Jost 字体（无外部字体请求）
- **页面结构**：头图封面 → 个人履历（统计条 + 时间线 + 教育/荣誉）→ 技能展示 → 项目展示 → 页脚（收尾语 + 头像 + 联系方式）
- **移除全部「联系我」CTA 按钮**（头图/顶栏/页脚），联系方式仅保留在页脚（电话/邮箱/微信）
- **数据修正**：AWS Certified AI Practitioner 认证去重，只保留荣誉与认证一处
- **对比度修复**：`--muted` 加深至 `#6b5d49`（暖底上 ≥4.5:1）

### 测试
- `test/test.py` 由 34 项扩充至 **108 项断言**：核心功能回归（多版本页面/鉴权/保存/头像上传）+ C1–C12 条款逐条断言（暖色无红、卡通图、双语结构、技能悬浮参数、页脚无按钮、认证去重、`.gz` 解压对策等）
- 三端适配（1440/768/390px）+ 打印样式 + 双语 CDP 实测（22/22）

### 技术栈
- 后端：Node.js（内置 http 模块，零依赖，不变）
- 前端：原生 HTML/CSS/JS + 本地 GSAP 3.12.5 / ScrollTrigger 3.12.5（`.gz` 入库 + 启动自动解压）
- 字体：本地 Jost（`public/fonts/jost-latin.woff2`）
- 头图：本地 JPEG（`public/img/portrait-cartoon.jpg`，640×640）

## [1.0.0] - 2026-10-23

### 新增
- **数据驱动的多版本简历系统**：内容与展示分离，所有简历数据集中在 `data/resume.json`
- **4 个求职意向版本**（按优先级）：
  - `/ai` — AI 应用开发工程师（默认，最高优先级）
  - `/it` — IT 技术支持工程师
  - `/test` — 测试开发工程师
  - `/erp` — ERP 实施顾问
- **管理后台** `/admin`：密码登录，可视化编辑各版本内容（基础信息 + 版本专属简介/优势）
- **一键分享**：后台生成各版本页面链接，可复制
- **导出独立 HTML**：后台可将指定版本导出为零依赖的单文件 HTML，离线分享
- **Node 服务端** `server.js`：纯 Node.js 无第三方依赖，提供页面路由 + 数据 API + 鉴权
- **安全隔离**：公共页面无任何跳转后台的入口；后台需密码登录；保存接口需会话鉴权
- **原子写入**：保存数据时先写临时文件再 rename，防止数据损坏
- **Python 自动化测试** `test/test.py`：34 项测试覆盖多版本页面、数据 API、鉴权安全、保存功能、404

### 技术栈
- 后端：Node.js（内置 http 模块，零依赖）
- 前端：原生 HTML/CSS/JS，无框架
- 数据：JSON 文件存储
- 测试：Python 标准库（urllib）

### 简历内容
- 真实简历内容（赵先哲，9 年三星 IT 研发经验）
- 含豹豹助手 AI 知识助手项目（zxz0608.com）
- 量化成果：RPA 每年替代约 1400 小时人工操作（约 0.7 个全职人力）

---

## [0.1.0] - 2026-10-23（初始版本，已被 1.0.0 取代）

- 单文件静态 HTML 简历模板（示例数据）
- 响应式 + 可打印导出 PDF
- 后用真实简历内容替换示例数据
