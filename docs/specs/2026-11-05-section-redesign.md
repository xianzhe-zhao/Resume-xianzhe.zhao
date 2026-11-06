# 2026-11-05 板块重构 · 8 区编号式 + 功能区划分 + SVG 占位 — spec 契约

> 本文件是需求的唯一事实来源。用户确认 = 签约，之后编码/测试/验收/PR 全部从本文件派生。
> 需求来源：用户 2026-11-05 原话——"整体颜色感觉不变，但是从上到下的核心板块儿做调整；你看看照片之后做一个核心内容的功能区划分，从上到下开始按照照片内容去设计；照片内容你可以自己先按照模块儿的内容进行画出来。我先替换后续图片，你就当成占位也可以。"
> 参考素材：`tmp/` 下 14 张视频截图（经 4 个 Qwen 子智能体读图分析，11 张属同一暖色作品集站、3 张为噪声已剔除）。
> 用户决策（2026-11-05 AskQuestion 确认）：板块结构 = **8 区全量参考**；占位图与数据 = **SVG 主题插画 + 数据压图**。

---

## 1. 背景与目标（what & why）

v1.2.0 简历是暖色五段式（Hero → 个人履历 → 技能 → 项目 → 页脚），配色与基础功能完善，但板块组织偏"传统简历"：

- 板块**无编号**、无统一头部公式，扫读时缺乏序列节奏；
- Hero 只有姓名+职位+胶囊，缺记忆点（无问候徽章、无职位划线强调、无状态标签）；
- 量化数据（9 年/1400h/4.5 年/3 个）是**纯文字统计卡**，没有"数据视觉锤"；
- 项目是"主打卡 + 2 小卡"静态布局，无交替节奏、无封面数据；
- 技能是 16 个扁平徽章网格，缺分组层次；
- 教育/荣誉挤在履历末尾，无独立地位；
- 无"关于我"（特质表达）与"兴趣爱好"（人格面）板块。

参考站（暖色作品集）的设计语言——**编号板块系统 + 统一头部公式 + 镜像交错卡片 + 数据压图 + 卡片化技能 + 占位友好**——与现有暖奶油底 `#faf5ec` + 暖琥珀 `#e08a3c` 配色完全兼容。

目标：**保持整体配色与全部既有功能不变**，把"从上到下的核心板块"重构为 **8 区编号式结构**，按参考站照片内容做功能区划分，每个模块用**暖色 SVG 主题插画占位**（用户后续替换），关键数据用**大号字压在占位图上**做视觉锤。版本 v1.3.0。

> 技术约束（不变）：公司防火墙拦截 >35KB 上传，**零依赖**约束成立——不引入任何新前端库；占位图全部用**内联 SVG**（app.js 生成），不下载外部图片；resume.json **结构不变**（新增的"兴趣爱好"占位内容放 app.js UI 字典，与现有 stats/chips 同层，保持数据模型稳定）。

### 需求澄清记录（Step 1）

**初始需求（C17–C26，2026-11-05）**：用户原话——"整体颜色感觉不变，但是从上到下的核心板块儿做调整；你看看照片之后做一个核心内容的功能区划分，从上到下开始按照照片内容去设计；照片内容你可以自己先按照模块儿的内容进行画出来。我先替换后续图片，你就当成占位也可以。" 经 4 个 Qwen 子智能体读 14 张参考图（11 张有效）+ AskQuestion 两轮确认：板块结构=8 区全量参考、占位图=SVG 主题插画+数据压图。

**追加需求（C27，2026-11-06）**：用户原话——"页面最上方做一个鼠标在附近很近的时候自动出来导航栏，内容是下方所有的分类（参考 tmp/2026-11-05_152206.png），点击可以转跳，鼠标不在附近的时候 2 秒后自动隐藏，做丝滑的上下隐藏的动画。" 经 nav-reader 子智能体读参考图确认：胶囊形悬浮条 + 暖白底 + 三段式 + 7 项导航。澄清要点：①"鼠标在附近很近"= 鼠标进入顶部感应区（y≤80px）；②"2 秒后自动隐藏"= mouseleave 后 setTimeout 2000ms；③"丝滑上下动画"= translateY + opacity + CSS transition 300–400ms easeOutQuint；④"下方所有分类"= 8 区中的 7 个（Hero 作为首页，由 Logo 承担）；⑤首屏滚动在顶部时常驻可见（否则用户打开页面看不到导航）。

## 2. 方案自审（怎么做）

- **复用盘点**（实际查过）：
  - `public/app.js`：渲染器 531 行，含 UI 字典（zh/en，stats/chips 在此）、`hero/history/skills/projects/footer/printDialog` 六个渲染函数、`ICONS`（16 项内联 SVG）、`initAnims()`（GSAP，选择器 `.hero-card/.skill-badge/.history/.skills/.projects`）→ **整体重构渲染函数与动画选择器**；UI 字典增补新板块文案 + 兴趣爱好占位内容 + 数据压图 metric 映射
  - `public/style.css`：274 行，含 `:root` 暖色 token（**不变**）、hero/history/skills/projects/footer 样式、响应式 1000/760/560、`@media print`（C15 横竖版 + 分页）→ **重写板块样式**（新增 about/experience/projects/skills/edu-honors/off-duty 样式 + 交替卡片 + 数据压图 + 编号头部），`@media print` 同步新结构（C15 修订）
  - `test/test.py`：138 项断言，含 C3（五段式结构 7 断言）/C5（技能悬浮）/C6（豹豹助手）/C10（GSAP 选择器）/C11（三端+打印）/C15（打印版式）→ **更新 C3 断言为 8 区**、C5/C6/C10/C11/C15 选择器与结构同步、新增 C17–C26 用例组
  - `test/cdp-print.mjs`：31 项 CDP 打印断言，引用 hero/stats/skill-grid/proj-feature/proj-grid 选择器 → **同步新结构选择器**（交替卡片、新区块）
  - `data/resume.json`：base + 4 版本 + en，结构完整 → **不动**（兴趣爱好占位内容入 app.js UI 字典，特质气泡复用 advantages）
  - `server.js` / `public/admin*` / API 6 端点 → **不动**
  - 版本：package.json 1.2.0 + CHANGELOG.md → 1.3.0
- **决策：B 扩展**——不改系统形态（纯 Node + vanilla JS + JSON），只重构设计层（app.js 渲染 + style.css 样式）与测试断言。理由：架构/接口/数据模型均满足，重建成本远高于重做渲染层；占位图用内联 SVG 不引入依赖。
- **影响面**：
  - 页面：`/ai /it /test /erp`（整页板块重构 + 新增 about/off-duty 两区 + 编号头部 + 交替卡片 + 数据压图）；`/admin` **不受影响**（admin 引用独立 admin.css，不引用 style.css 板块样式）
  - 接口/调用方：**无变化**（6 端点不动）
  - 表/字段：`resume.json` **不动**（兴趣爱好占位内容在 app.js UI 字典，与 stats/chips 同层；特质气泡复用 advantages；数据压图 metric 在 UI 字典按 project id / experience index 映射）
  - 配置/缓存/端口：无新端口、无新依赖、无新外部图片
  - 回归范围：触及核心页面（同页面/共用数据/共用打印 CSS）→ **核心功能回归**：test/test.py 全量 + cdp-print.mjs 全量
- **兼容性**：API 契约不变；resume.json 不变（向前兼容）；导出 HTML 功能保持（模板内联逻辑随 app.js 同步）；打印 PDF 保持（C15 横竖版逻辑不变，仅版式类内选择器同步新结构）；4 版本 + 中英双语 + GSAP + 三端适配全部保持
- **成本预算**：无（无 LLM/付费 API/新依赖；占位图为内联 SVG，零外部请求）
- **安全增量**：无新增依赖、无新外部输入面（占位 SVG 为前端硬编码枚举，无网络请求；resume.json 不动，API 不动）——自上次审查（2026-10-31）无新增攻击面
- **测试策略**：
  - `test/test.py` 静态断言（C17–C26 各条，3999 端口自启自停，不碰 3000）；更新 C3/C5/C6/C10/C11/C15 既有断言以匹配新结构
  - CDP 真实 Chrome（cdp-print.mjs）：打印版式在新 8 区结构下横竖版正常、分页合理、无空白页
  - UI 坐标断言：用 Playwright/CDP 量交替卡片左右镜像偏移、数据压图字号、编号头部层级；三宽（1440/768/390）截图人工判读
  - 视觉终审：用户按验收清单逐区检查（自动化验证机制，板块视觉以用户验收为准）

## 3. 技术蓝图（前端/后端/数据库/环境依赖）

- **前端**：
  - 渲染层：`public/app.js`（vanilla JS，~780 行）——8 区渲染函数 + 统一编号头部 `secHead()` + 内联 SVG 主题插画 `svgArt()` + 数据压图 metric 映射 + 镜像交替卡 + Hero 增强 + 兴趣爱好占位 + **C27 自动隐藏导航栏 `navBar()`**（纯 CSS transition + 原生 JS 事件，不依赖 GSAP）
  - 样式层：`public/style.css`（~330 行）——`:root` 暖色 token（不变）+ 8 区板块样式 + 编号头部 + 镜像交替卡 + 数据压图 + 分组技能卡 + 教育荣誉 + 兴趣爱好 + **C27 胶囊形悬浮导航栏样式 + 上下动画 transition** + 响应式 1000/760/560 + `@media print`（C15 横竖版同步新结构）
  - 动效层：本地 GSAP 3.12.5 + ScrollTrigger 3.12.5（`.gz` 入库 + 启动解压，零依赖仅用内置 zlib）——入场动画 + 技能悬浮 + 控件反馈；`prefers-reduced-motion` 关闭；**C27 导航栏动画不依赖 GSAP**（CSS transition 兜底）
  - 字体：本地 Jost（`public/fonts/jost-latin.woff2`，无外部字体请求）
  - 头图：本地 JPEG（`public/img/portrait-cartoon.jpg`，保留）
  - 占位图：全部内联 SVG（`svgArt()` 按模块主题枚举，零外部图片请求）
- **后端**：`server.js`（纯 Node.js http，零依赖，**不动**）——6 个 API 端点（`/api/data /api/login /api/logout /api/check /api/save /api/upload`）+ 静态文件 + 公共页数据注入 + admin 路由
- **数据库**：`data/resume.json`（JSON 文件存储，**结构不变**）——base + 4 版本（ai/it/test/erp）+ en（中英双语）；新增内容（interests 占位、metric 映射、导航项文案、各区副标题）全部在 app.js UI 字典，不入 resume.json
- **环境依赖**：Node.js（任意版本，零第三方依赖）；Python 标准库（test.py）；本机 Chrome/Edge（cdp-print.mjs）；无新依赖、无新端口、无新外部输入面
- **构建/部署**：`node server.js`（默认 3000，PORT 可配）；`python test/test.py`（209 项，3999 端口自启自停）；`node test/cdp-print.mjs`（31 项，3998 端口）；无构建步骤（vanilla JS + CSS 直接服务）

## 4. 非目标（out of scope）

- 不做：改 API 契约、改数据模型结构（resume.json 不动）、改管理后台（admin 不动）、改 server.js 路由
- 不做：改整体配色（暖奶油底 + 暖琥珀强调 + 深色页脚全部不变，C1 仍成立）
- 不做：替换 Hero 真实卡通人像（保留 `portrait-cartoon.jpg`，仅加拱形遮罩 + 状态标签）
- 不做：下载外部图片/引入图片库（占位图全部内联 SVG）
- 不做：新增简历版本（保持 ai/it/test/erp 四版本）
- 不做：把"兴趣爱好"做成可后台编辑的数据字段（占位内容硬编码在 app.js UI 字典，用户后续替换时直接改 app.js 或另起需求做数据化）
- 不做：技能雷达图/轮播交互（参考站的雷达图与轮播为 JS 交互，本次用静态卡片化呈现，保持零依赖与打印友好）

## 5. 契约条款（C17 / C18 / …）

> 编号承接 `docs/specs/2026-10-31-tech-redesign.md`（C1–C12）与 `docs/specs/2026-11-02-print-pdf.md`（C13–C16）的项目级序列。本次 C3（五段式结构）由 C17 修订为 8 区；C5/C10/C11/C15 的选择器与结构同步更新，其余 C1/C2/C4/C6/C7/C8/C9/C12/C13/C14/C16 仍成立。

### C17 8 区编号式板块结构 + 统一头部公式

- **前置条件**：`/ai` 页面（默认版本）1440px 视口渲染完成
- **后置条件**：页面按顺序包含 **8 个区**（取代 v1.2.0 的 5 段）：① Hero 头图 ② `00 / ABOUT` 关于我 ③ `01 / EXPERIENCE` 工作经历 ④ `02 / PROJECTS` 个人作品 ⑤ `03 / SKILLS` 技能档案 ⑥ `04 / EDUCATION & HONORS` 教育与荣誉 ⑦ `05 / OFF DUTY` 兴趣爱好 ⑧ Footer 联系页脚；除 Hero 与 Footer 外，每个区有**统一头部公式**：英文编号眉标（`NN / ENGLISH_LABEL`，暖琥珀小字）→ 中文大标题（粗体）→ 一句副标题说明（muted 小字）；4 个版本（ai/it/test/erp）共用同一 8 区骨架，仅文案随版本切换；中英双语（英文版眉标不变、大标题与副标题切英文）
- **失败行为**：N/A（结构断言）
- **不变式**：8 个区在 DOM 中按序排列；区编号 00–05 连续；Hero 与 Footer 无编号眉标（它们是封面与封底，不纳入编号序列）；数据来自 resume.json（experience/projects/skills/education/honors）+ app.js UI 字典（about 特质复用 advantages、off-duty 占位内容、各区副标题）

### C18 Hero 头图增强（问候徽章 + 职位划线 + 状态标签 + 拱形人像）

- **前置条件**：Hero 区渲染（保留 `portrait-cartoon.jpg` 真实卡通人像 + 模糊背景层 + 暖奶油 veil，C2 仍成立）
- **后置条件**：Hero 在现有基础上**增强 4 个记忆点**：① 顶部小徽章 `HELLO / 你好`（带暖琥珀圆点的胶囊标签，英文版 `HELLO`）② 职位标题加**荧光笔划线效果**（暖琥珀 `#e08a3c` 半透明色块衬底，模拟荧光笔涂抹，仅作用于职位一行）③ 人像卡片改为**拱形/椭圆顶部裁切**（圆角顶部弧度大于底部，区别于普通圆角矩形）④ 人像左上角挂 `OPEN TO WORK / 开放求职` 斜角深色标签，右下角悬浮 `NOW / AI × 内容增长` 风格的状态卡片（中文版 `NOW / AI 落地`，按版本切换状态文案）；保留现有姓名/职位/lead/chips/打印按钮；PC 左文右图两栏，平板/手机单列人像居上
- **失败行为**：`portrait-cartoon.jpg` 404 时人像退化为纯色块 + 状态标签仍显示（不破版）；GSAP 失败时增强元素静止可见
- **不变式**：不引入新人像图片文件（复用 portrait-cartoon.jpg）；荧光笔划线只用 CSS（`background` 渐变/`box-shadow` 内联），不引入新依赖；状态标签文案在 UI 字典（按版本/语言切换）

### C19 关于我区（00 / ABOUT · 特质气泡）

- **前置条件**：`data/resume.json` 的 4 版本 `advantages`（每版本 4 条：AI 落地/全栈开发/RPA 自动化/技术热情，文案随版本侧重不同）
- **后置条件**：`00 / ABOUT` 区含**态度型大标题**（一句观点，如"从核心系统到 AI 落地，每一步都有据可查"，中文版）+ **4 个特质气泡**围绕人像/图标呈放射状排布（每个气泡 = advantage.title 的短词 + 一句 advantage.text 摘要）；气泡为暖色圆角胶囊（`--surface` 底 + `--accent-soft` 描边），hover 轻微放大；PC 端人像/图标居中、气泡环绕，平板/手机退化为单列气泡列表
- **失败行为**：某版本 advantages 为空时该区隐藏（不渲染空壳）；GSAP 失败时气泡静止可见
- **不变式**：特质数据来自 resume.json advantages（不硬编码）；4 个版本各有 4 条特质（版本间文案不同）；中英双语（en.versions.*.advantages）

### C20 工作经历区（01 / EXPERIENCE · 镜像交错时间线卡 + 数据压图）

- **前置条件**：`data/resume.json` base.experience（1 公司 3 项目：RMS / RPA / ERP）
- **后置条件**：`01 / EXPERIENCE` 区把 3 个工作项目做成**镜像交错封面卡 + 中轴时间线**：相邻卡片左右镜像（第 1 张左图右文、第 2 张左文右图、第 3 张左图右文），中轴竖线 + 编号节点（01/02/03）串联；每张卡片 = **封面（暖色 SVG 主题插画 + 大号数据压图）** + **信息卡（日期 → 项目标题 + 角色标签 → 一句描述 → 量化成果列表 → 技能标签胶囊）**；封面 SVG 按项目主题（RMS→服务器/代码、RPA→机器人/齿轮、ERP→网格/报表），大号数据（RMS→`4.5年`、RPA→`1400h`、ERP→`9年`）用暖琥珀超大字压在 SVG 上；公司名（三星）作为区副标题或卡片公共头展示一次
- **失败行为**：experience 为空时该区隐藏；SVG 渲染失败时封面退化为暖色色块 + 数据文字（不破版）
- **不变式**：经历数据来自 resume.json experience（不硬编码）；数据压图 metric 在 app.js UI 字典按项目索引映射（与 stats 同层，非数据模型字段）；中英双语

### C21 个人作品区（02 / PROJECTS · 镜像交错卡 + 数据压图）

- **前置条件**：`data/resume.json` base.projects（3 个独立项目：豹豹助手 / AiPro Bridge / Deskshare）+ 各版本 featuredProject
- **后置条件**：`02 / PROJECTS` 区把 3 个独立项目做成**镜像交错封面卡**（无中轴时间线，区别于工作经历的"时间线感"，呈作品集画廊感）：相邻卡片左右镜像；每张卡片 = **封面（暖色 SVG 主题插画 + 大号数据压图）** + **信息卡（badge 独立开发 → 项目标题 → 链接（若有）→ 一句描述 → 功能要点列表 → 技术栈标签）**；封面 SVG 按项目主题（豹豹助手→海豹/对话气泡、AiPro Bridge→API 桥接/插头、Deskshare→协作文档/光标），大号数据（豹豹助手→`2150+`、AiPro Bridge→`3 API`、Deskshare→`CRDT`）压在 SVG 上；主打项目（featuredProject=baobao）可视觉加重（更大封面或首位）但结构同形
- **失败行为**：projects 为空时该区隐藏；项目无 link 时不渲染链接元素；SVG 渲染失败时封面退化为暖色色块 + 数据
- **不变式**：项目数据来自 resume.json projects（不硬编码）；豹豹助手链接指向 https://zxz0608.com/（C6 不变）；数据压图 metric 在 UI 字典按 project id 映射；中英双语

### C22 技能档案区（03 / SKILLS · 分组卡片化）

- **前置条件**：`data/resume.json` base.skills（5 组 16 项）
- **后置条件**：`03 / SKILLS` 区把 5 个技能组做成**5 张分组卡片**（取代 v1.2.0 的 16 个扁平徽章网格）：每张卡片 = 组名标题 + 该组技能以图标徽章横向排列（复用现有 `ICONS` 16 项内联 SVG）；卡片暖色底（`--surface`）+ 暖琥珀组名；图标保留悬浮动效（C5 幅度约束不变：3–5px < 网格间距，不重合）；PC 5 卡片多列网格（如 3+2 或 5 列），平板/手机单列堆叠
- **失败行为**：GSAP 失败时图标静止可见（C5 不变式保留）；某组无技能时该卡片隐藏
- **不变式**：技能数据来自 resume.json skills（不硬编码）；图标为内联 SVG（复用 ICONS）；悬浮动效幅度约束（C5）不变；中英双语

### C23 教育与荣誉区（04 / EDUCATION & HONORS · 独立卡片 + 占位照 + 校徽）

- **前置条件**：`data/resume.json` base.education + base.honors + base.certs
- **后置条件**：`04 / EDUCATION & HONORS` 区从 v1.2.0 履历末尾**独立出来**，做成左右两栏卡片：左栏教育卡（学校 + 时间 + 专业 + **暖色 SVG 校园占位插画** + 圆形校徽徽章），右栏荣誉卡（荣誉列表 + 认证列表，AWS 认证去重只出现一次，C4 不变式保留）；PC 两栏，平板/手机单列
- **失败行为**：education/honors 为空时对应卡片隐藏；SVG 渲染失败时占位退化为暖色色块
- **不变式**：教育/荣誉数据来自 resume.json（不硬编码）；AWS Certified AI Practitioner 只出现一次（C4 去重不变式）；中英双语

### C24 兴趣爱好区（05 / OFF DUTY · 占位交替卡）

- **前置条件**：app.js UI 字典的 `interests` 占位数组（版本无关，中英双语各 3–4 条占位兴趣，每条 = 英文小标签 + 中文标题 + 一句描述 + `后续可替换 / 增加图片` 提示）
- **后置条件**：`05 / OFF DUTY` 区为**新增板块**，含 3–4 张**镜像交替图文卡**（左图右文 ↔ 左文右图）：每张卡片 = **暖色 SVG 主题插画占位**（按兴趣主题：运动健身/阅读思考/技术折腾/旅行，带编号角标 01–04）+ **文字卡（英文小标签 → 中文大标题 → 一句描述 → 底部 `后续可替换 / 增加图片` 小字提示）**；占位内容为示例（用户后续替换为真实兴趣与图片）
- **失败行为**：interests 占位数组为空时该区隐藏；SVG 渲染失败时占位退化为暖色色块 + 编号
- **不变式**：兴趣爱好占位内容在 app.js UI 字典（与 stats/chips 同层，**不入 resume.json**，保持数据模型稳定）；版本无关（4 版本共用同一占位内容）；中英双语；占位提示文案明确标注"后续可替换"以管理用户预期

### C25 SVG 主题插画占位 + 数据压图渲染

- **前置条件**：app.js 内联 SVG 生成函数（按模块主题生成暖色 SVG）+ UI 字典 metric 映射
- **后置条件**：所有模块封面/占位图均为**内联 SVG**（无外部图片请求），统一暖色调（`--accent-soft` 底 + `--accent-ink` 描边/线条 + `--accent` 点缀），按模块主题绘制简约图标化插画（服务器/机器人/网格/海豹/插头/文档/校园/运动等）；**数据压图**：关键 metric（4.5年/1400h/9年/2150+/3 API/CRDT 等）以暖琥珀超大号粗体字压在 SVG 封面上（白字 + 轻微阴影保证 SVG 底上可读），位置不遮挡插画主体；SVG 尺寸响应式（铺满封面容器，`viewBox` + `preserveAspectRatio`）；打印时 SVG 与压图数据正常输出（`print-color-adjust: exact`，C15 不变式保留）
- **失败行为**：SVG 生成异常时封面退化为暖色纯色块 + 数据文字（降级不破版）
- **不变式**：占位图全部内联 SVG（零外部请求、零新依赖）；数据压图 metric 来自 UI 字典映射（非 resume.json 新字段）；暖色调与 C1 一致（无红色）；中英双语（metric 文本随语言切换，如 `4.5年`/`4.5 yrs`）

### C26 核心功能回归（不修坏 · C1–C16 保留 + 新结构同步）

- **前置条件**：`test/test.py` 在 3999 端口自启服务器 + `test/cdp-print.mjs` 真实 Chrome
- **后置条件**：v1.2.0 全部 138 项断言保持 PASS（**除 C3 由"5 段"修订为"8 区"、C5/C6/C10/C11/C15 选择器同步新结构**），具体：C1 暖色配色不变、C2 卡通人像保留、C4 履历数据完整（结构变体由 C20 覆盖）、C6 豹豹助手 5 功能 + zxz0608.com 链接不变、C7 页脚联系方式不变、C8 admin 不受影响、C9 API 6 端点契约不变、C10 GSAP 动效层（选择器同步新结构）、C11 三端适配（新结构无水平溢出）、C12 中英双语（新板块文案双语）、C13–C16 打印流程（横竖版对话框 + 多页修复 + 版式模板，选择器同步新 8 区结构，分页规则同步）；导出 HTML 功能保持（产物含新结构与 SVG 占位，离线打开同样可用）
- **失败行为**：任一断言 FAIL = 本条不通过，修复后重跑
- **不变式**：API 契约（端点/参数/返回/错误码）与 v1.2.0 完全一致；resume.json 结构不变；admin 功能零回归；打印 PDF 横竖版可用且多页完整

### C27 自动隐藏悬浮导航栏（鼠标靠近顶部出现 · 离开 2 秒隐藏 · 丝滑上下动画）

> 需求来源：用户 2026-11-06 验收阶段追加需求——"页面最上方做一个鼠标在附近很近的时候自动出来导航栏，内容是下方所有的分类（参考 tmp/2026-11-05_152206.png），点击可以转跳，鼠标不在附近的时候 2 秒后自动隐藏，做丝滑的上下隐藏的动画。" 经 nav-reader 子智能体读参考图确认：胶囊形悬浮条 + 暖白底 + 三段式（Logo/菜单/CTA）+ 7 项导航。

- **前置条件**：页面渲染完成（8 区 + Footer 已挂载，各 section 有 `id` 锚点：`#hero #about #experience #projects #skills #edu-honors #off-duty #contact`）
- **后置条件**：
  - **形态**：取代 v1.2.0 固定通栏顶栏（`.topbar` `position:fixed` 常驻），改为**胶囊形悬浮导航条**——大圆角（≥20px）、暖白底（`--surface` `#fffdf8`）、柔和投影、距页面顶部约 16–24px、左右留白（max-width 容器居中，不贴边）；三段式：左侧 Logo（深色圆 + 姓名首字母"赵"/"Z"）+ 字标（姓名或"简历"/"Resume"）、中部导航菜单、右侧语言切换按钮（保留 C12 语言切换功能）+ 打印按钮入口
  - **导航项**：中部菜单为**下方所有分类**的锚点链接，按页面顺序：关于我（`#about`）/ 工作经历（`#experience`）/ 个人作品（`#projects`）/ 技能档案（`#skills`）/ 教育与荣誉（`#edu-honors`）/ 兴趣爱好（`#off-duty`）/ 联系我（`#contact`）；点击任一项**平滑滚动**到对应区（`scroll-behavior: smooth` 已有，点击用 `scrollIntoView({behavior:'smooth'})` 或 `location.hash` 跳转）；当前可视区高亮（可选，scroll spy）
  - **自动出现/隐藏逻辑**：
    - **出现触发**：鼠标移入"顶部感应区"（页面顶部 0–80px 高度的隐形监听条，或鼠标 y 坐标 ≤80px）→ 导航栏**立即出现**（取消任何隐藏计时器）
    - **隐藏触发**：鼠标离开导航栏 + 离开顶部感应区后，**延迟 2 秒**自动隐藏（`setTimeout` 2000ms）；隐藏计时期间鼠标再次进入感应区或导航栏 → 取消计时器、保持显示
    - **常驻例外**：页面滚动位置在顶部（scrollTop ≤ 100px）时，导航栏**保持显示**不隐藏（首屏即可见，用户无需先移鼠标到顶部）；滚动离开顶部后恢复自动隐藏逻辑
    - **交互锁定**：导航栏 hover 期间保持显示（不触发隐藏）；点击导航项跳转后，跳转完成不强制隐藏（让用户看清跳转位置，2 秒后若无交互再隐藏）
  - **丝滑上下动画**：出现 = `translateY(0) + opacity:1`，隐藏 = `translateY(-130%) + opacity:0`（完全移出视口顶部）；duration 300–400ms，easing `cubic-bezier(0.22, 1, 0.36, 1)`（easeOutQuint 类，丝滑减速）；用 CSS `transition` 实现（不依赖 GSAP，保证 GSAP 失败时导航仍可用）；`will-change: transform, opacity`
  - **响应式**：PC 1440 显示完整三段式；平板 768/手机 390 中部菜单项过多时——菜单可横向滚动（`overflow-x:auto`）或收起为汉堡菜单（本次取横向滚动，保持零依赖与简单）；窄屏下 Logo 字标可省略、仅留圆形 Logo
  - **打印**：导航栏在 `@media print` 隐藏（C15 已隐藏顶栏，同步新导航栏类名）
  - **中英双语**：导航项文案随语言切换（关于我/About、工作经历/Experience 等）；Logo 字标随语言（"简历"/"Resume"）
- **失败行为**：GSAP 加载失败时导航栏仍可用（纯 CSS transition + 原生 JS 事件，不依赖 GSAP）；鼠标 API 不可用时（极端）导航栏保持显示不隐藏（降级可见）；点击导航项跳转失败时（锚点不存在）无操作
- **不变式**：导航栏为纯前端本地状态（无网络请求）；不依赖 GSAP（CSS transition + 原生 mousemove/mouseenter/mouseleave + setTimeout）；保留 C12 语言切换功能（语言按钮移入导航栏右侧）；保留打印按钮入口（C13）；隐藏/出现不影响页面内容布局（导航栏 `position:fixed` 脱离文档流）；4 版本共用同一导航栏（导航项锚点版本无关）

### C28 移除公开页版本切换入口（版本管理仅限后台）

> 需求来源：用户 2026-11-06 验收阶段追加需求——"AI 测试 ERP 这些都不要了，只是在管理员页面进行管理就行，不要展示出来。" 经 AskQuestion 确认：移除导航栏版本切换链接，4 个版本 URL 仍可直接访问，管理后台保持版本管理。

- **前置条件**：`public/app.js` 的 `navBar()` 渲染函数（C27 导航栏右侧含 `.nav-versions` 版本切换链接）
- **后置条件**：
  - **移除公开页版本切换入口**：导航栏右侧**不再渲染** `.nav-versions` 版本切换链接（AI/IT/测试/ERP）；导航栏右侧仅保留语言切换按钮 + 打印按钮
  - **URL 仍可访问**：4 个版本（`/ai /it /test /erp`）仍可通过**直接输入 URL** 访问（server.js 路由不变，`servePublicPage` 对 4 个 versionKey 均响应）；公开页只是不提供切换入口，不限制访问
  - **管理后台保持版本管理**：`/admin` 后台的版本切换、编辑、保存、导出功能**零变化**（admin.js 不动，admin 仍有 4 版本管理能力）
  - **当前版本标识**：导航栏不显示当前版本名（移除后无版本信息暴露）；用户通过 URL 知道当前版本
- **失败行为**：N/A（纯移除，无新逻辑）
- **不变式**：server.js 路由不变（4 版本 URL 均可访问）；admin 功能零回归；resume.json 不变；导航栏右侧仅语言+打印按钮；导出 HTML 功能保持（产物无版本切换链接）

## 6. 验收标准（用户逐条打勾）

> 测试环境：http://localhost:3002（独立端口，不影响用户 3000 的服务）

- [ ] A1 打开 `http://localhost:3002/ai`：**Hero 头图**看到卡通人像（保留）+ `HELLO/你好` 徽章 + 姓名 + 荧光笔划线职位 + 拱形人像 + `OPEN TO WORK` 斜角标 + `NOW` 状态卡；整体**暖色不变**（暖奶油底 + 暖琥珀，无红色）
- [ ] A2 滚动到 **`00 / ABOUT` 关于我**：态度型大标题 + 4 个特质气泡（AI 落地/全栈/RPA/热情）环绕，hover 轻微放大
- [ ] A3 **`01 / EXPERIENCE` 工作经历**：3 个工作项目（RMS/RPA/ERP）镜像交错卡片 + 中轴时间线编号；每卡封面是暖色 SVG 插画 + 大号数据（4.5年/1400h/9年）压图；信息卡含日期/标题/角色/成果/标签
- [ ] A4 **`02 / PROJECTS` 个人作品**：3 个独立项目（豹豹助手/AiPro Bridge/Deskshare）镜像交错卡；封面 SVG + 数据（2150+/3 API/CRDT）压图；豹豹助手有 zxz0608.com 链接
- [ ] A5 **`03 / SKILLS` 技能档案**：5 张分组卡片（后端/前端/数据库自动化/ERP报表/AI云系统），每组图标徽章横向排列，图标悬浮动效且**相邻不重合**
- [ ] A6 **`04 / EDUCATION & HONORS` 教育与荣誉**：独立两栏卡（教育 + 校园 SVG 占位 + 校徽 / 荣誉认证），AWS 认证只出现一次
- [ ] A7 **`05 / OFF DUTY` 兴趣爱好**：3–4 张镜像交替占位图文卡，每卡有 SVG 插画 + 编号角标 + `后续可替换` 提示
- [ ] A8 **页脚**：联系方式（电话/微信/邮箱）+ 收尾语，无「联系我」按钮（C7 不变）
- [ ] A9 **三端适配**：PC 1440 / 平板 768 / 手机 390 均无横向滚动，8 区布局自适应，交替卡片在窄屏退化为单列
- [ ] A10 依次打开 `/it` `/test` `/erp`：三版本 8 区骨架一致，文案贴合各自岗位（it/test/erp 不出现"AI 应用开发工程师"）
- [ ] A11 **中英双语**：点语言切换 → 全页切英文（8 区编号眉标不变、标题/副标题/特质/经历/项目/技能/兴趣/页脚全英文），布局不破版；再点切回中文
- [ ] A12 **打印 / 存为 PDF**：点按钮 → 版式对话框（竖版/横版）→ 打印预览 8 区完整、分页合理、无空白页、底色与网页一致；横竖版均正常
- [ ] A13 **占位图**：所有 SVG 占位为暖色主题插画，关键数据压图清晰可读，无外部图片加载失败
- [ ] A14 **自动隐藏导航栏**：页面顶部鼠标移近时导航栏丝滑下滑出现（胶囊形 + 暖白底 + 7 项分类菜单 + 语言/打印按钮）；鼠标移开后约 2 秒丝滑上滑隐藏；点击菜单项平滑跳转到对应区；首屏（滚动在顶部）时导航栏保持可见；打印时隐藏
- [ ] A15 **版本切换入口移除**：导航栏右侧**无** AI/IT/测试/ERP 版本切换链接，仅语言+打印按钮；直接访问 `http://localhost:3002/it` `/test` `/erp` 仍可打开对应版本；`/admin` 后台版本管理功能正常

## 7. 边界与异常

| 场景 | 期望表现 |
|---|---|
| resume.json 某版本 advantages 为空 | 关于我区隐藏（不渲染空壳） |
| experience/projects/education/honors 为空 | 对应区隐藏 |
| interests 占位数组为空 | 兴趣爱好区隐藏 |
| SVG 生成异常 | 封面退化为暖色色块 + 数据文字，不破版 |
| portrait-cartoon.jpg 404 | 人像退化为纯色块，状态标签仍显示 |
| GSAP 加载失败 | 全部内容可见，无动画，无 JS 报错（C10 不变式） |
| 390px 视口 | 8 区单列堆叠，交替卡片退化为单列，无水平溢出 |
| 打印（横竖版） | 8 区分页合理，SVG 占位与数据压图正常输出，封面独占第 1 页（C15 分页规则同步新结构） |
| 导出 HTML 离线打开 | 新结构 + SVG 占位 + 数据压图随内联产物可用 |
| 英文页面 | 8 区编号眉标不变，其余文案英文；数据压图 metric 随语言切换 |
| 鼠标 API 不可用（极端） | 导航栏保持显示不隐藏（降级可见，C27 失败行为） |
| GSAP 加载失败 | 导航栏仍可用（纯 CSS transition + 原生 JS，不依赖 GSAP，C27 不变式） |
| 导航锚点对应区被隐藏（如 advantages 空致 about 区隐藏） | 点击该导航项无操作或跳转到空位置，不报错 |
| 导航栏隐藏计时器期间快速进出感应区 | 计时器被取消/重置，不出现闪烁或卡在中间态 |

## 8. 三问完整性检查（不过不得开工）

- [x] ① **取值范围**：本次不改 resume.json 数据模型（结构不变），新增内容（interests 占位、metric 映射、各区副标题）在 app.js UI 字典（前端枚举，无网络传输）；8 区编号 00–05 为固定枚举；SVG 为前端硬编码枚举（无外部输入）；CSS 变量沿用 C1 暖色 token（不变）
- [x] ② **状态流转**：页面状态机不变——正常页面 --(点语言按钮)--> 重渲染（lang 切换）--(点打印按钮)--> 版式对话框 --(选横竖版)--> 打印态（C13–C15 不变）--> afterprint 清理 --> 正常页面；guard：对话框幂等、关闭路径不打印；本次新增区不引入新状态（关于我/兴趣爱好的 hover 放大为纯 CSS 过渡，无状态机）；**C27 导航栏状态机**：隐藏态 --(鼠标进入顶部感应区 y≤80px 或 scrollTop≤100px)--> 显示态 --(鼠标离开感应区+导航栏 且 scrollTop>100px)--> 隐藏计时态(2s) --(超时)--> 隐藏态 / --(鼠标再次进入)--> 显示态；guard：导航栏 hover 期间不触发隐藏；点击导航项跳转不强制隐藏
- [x] ③ **生成逻辑**：公共页 HTML = `app.js(render(base, version, lang))` 注入 `#app`（8 区组装）；每区 = 独立渲染函数（hero/about/experience/projects/skills/edu-honors/off-duty/footer）；SVG 占位 = app.js 内联 SVG 生成函数（按模块主题枚举）；数据压图 = UI 字典 metric 映射 + CSS 大号字定位；打印 = style.css `@media print`（C15 版式类选择器同步新结构）+ 动态 `@page`（C13 不变）；导出 HTML = 模板内联（随 app.js 同步）；**C27 导航栏** = app.js `navBar()` 渲染函数（胶囊形 + 三段式 + 7 项锚点菜单）+ CSS `transition: transform/opacity`（丝滑上下动画）+ 原生 JS `mousemove/mouseenter/mouseleave/scroll` 事件 + `setTimeout` 2s 隐藏计时器（不依赖 GSAP）

---

## 9. 核销记录（Step 5 填写，PR 里引用）

| 条款 | 测试用例 | 结果 | 路径真实性 |
|---|---|---|---|
| C17 | test/test.py [C17] 8 区编号式结构（7 断言：8 区渲染函数 hero/about/experience/projects/skills/eduHonors/offDuty/footer + secHead 统一头部 + 编号眉标 00–05 + 英文眉标 ABOUT/EXPERIENCE/PROJECTS/SKILLS/EDUCATION & HONORS/OFF DUTY + render 组装顺序 + style.css 8 区样式类 + 编号头部样式 sec-eyebrow/sec-head/sec-note） | ✅ 7/7 | test/test.py L296-303，2026-11-05 实跑全绿 |
| C18 | test/test.py [C18] Hero 增强（6 断言：问候徽章 hero-hello+helloBadge + 荧光笔划线 hero-title-mark + 拱形人像 border-radius 30px 30px 60px 60px + OPEN TO WORK hero-open+openToWork + NOW 状态卡 hero-now+NOW_TAG 按版本切换 + 保留卡通人像 portrait-cartoon.jpg） | ✅ 6/6 | test/test.py L305-311，2026-11-05 实跑全绿 |
| C19 | test/test.py [C19] 关于我区（6 断言：ai 版本 advantages 4 条 + bubble 渲染 + 复用 advantages forEach + 态度型大标题 secAbout + 4 版本各有 advantages + 英文版 advantages） | ✅ 6/6 | test/test.py L313-319，2026-11-05 实跑全绿 |
| C20 | test/test.py [C20] 工作经历区（7 断言：镜像交错 mirror + 中轴时间线编号 exp-node + 数据压图 exp-metric+expMetrics + metric 含 4.5年/1400h/9年 + 卡片五段式 period/title+role/desc/results + 公司公共头 exp-company + 英文 metric 4.5 yrs/1,400h/9 yrs） | ✅ 7/7 | test/test.py L321-328，2026-11-05 实跑全绿 |
| C21 | test/test.py [C21] 个人作品区（7 断言：镜像交错 mirror + 数据压图 proj-metric+projMetrics + metric 含 2150+/3 API/CRDT + 卡片 badge/title/link/desc/items/stack + featured 加重 + 豹豹助手链接渲染 p.link+proj-link+target=_blank + 数据链接 zxz0608.com + 英文 metric 2,150+/3 APIs/CRDT） | ✅ 8/8 | test/test.py L330-337，2026-11-05 实跑全绿 |
| C22 | test/test.py [C22] 技能档案区（5 断言：分组卡片 skill-card+skill-group + 技能组数=5 + 图标徽章横向 skill-badges + 悬浮动效保留 yoyo+skill-badge + 英文技能组名） | ✅ 5/5 | test/test.py L339-344，2026-11-05 实跑全绿 |
| C23 | test/test.py [C23] 教育与荣誉区（6 断言：独立区 edu-honors+eh-grid + 教育卡 eh-edu+校园占位 svgArt('campus') + 校徽 eh-badge + 荣誉卡 eh-honors + AWS 认证去重 + 教育数据来自 resume.json education） | ✅ 6/6 | test/test.py L346-352，2026-11-05 实跑全绿 |
| C24 | test/test.py [C24] 兴趣爱好区（6 断言：新增区 off-duty+od-list + 占位交替卡 od-item+mirror + 占位 SVG od-cover+编号 od-num + 提示文案「后续可替换」+replaceable + 兴趣内容在 UI 字典 interests + resume.json 不含 interests 字段） | ✅ 6/6 | test/test.py L354-360，2026-11-05 实跑全绿 |
| C25 | test/test.py [C25] SVG 占位 + 数据压图（6 断言：svgArt 函数 + 主题枚举 rms/rpa/erp/baobao/aipro-bridge/deskshare/campus/interest0-2 + 暖色调色值 #f7e7cd/#9a5518/#e08a3c + viewBox+preserveAspectRatio 响应式 + 数据压图大号字 exp-metric/proj-metric clamp + 无外部图片请求 + 打印 print-color-adjust: exact） | ✅ 6/6 | test/test.py L362-368，2026-11-05 实跑全绿 |
| C26 | test/test.py [C26] 核心功能回归（6 断言：核心回归段全过 + API 6 端点不变 + resume.json 结构不变 base/versions/en + 暖色配色不变 C1 token + 中英双语保留 langBtn+fb+en + 打印流程保留 printDialog+afterprint + admin 不受影响 admin.css 独立不引用 style.css） | ✅ 6/6 | test/test.py L370-377，2026-11-05 实跑全绿 |
| C27 | test/test.py [C27] 自动隐藏导航栏（18 断言：navBar 渲染函数 + render 替代 topbar + 胶囊形 navbar+data-state + 顶部感应区 nav-sensor + 7 项锚点 about/experience/projects/skills/edu-honors/off-duty/contact + 导航项中文文案 + 英文文案 + showNavBar/hideNavBar+setTimeout 2000ms + 鼠标事件 mouseenter/mouseleave/scroll + 首屏常驻 scrollTop≤100 + 平滑跳转 scrollIntoView smooth + 保留 langBtn/printBtn + style.css 胶囊形 999px+box-shadow + 丝滑动画 cubic-bezier easeOutQuint + 隐藏态 translateY(-130%) + 打印隐藏 .navbar,.nav-sensor + 不依赖 GSAP + 旧 topbar 样式移除） | ✅ 18/18 | test/test.py L415-433，2026-11-06 实跑全绿；CDP 诊断确认状态机：首屏 visible → 滚动 visible → 鼠标离开 2.5s hidden → 鼠标回顶部 visible |
| C28 | test/test.py [C28] 移除版本切换入口（10 断言：navBar 不含 nav-versions + 不含 nav-ver + 保留 langBtn/printBtn + /ai /it /test /erp URL 仍 200 + /admin 仍可访问 + admin.css 独立 + 不渲染版本链接） | ✅ 10/10 | test/test.py L435-444，2026-11-06 实跑全绿 |

- 分级回归：核心功能回归（触及核心页面 /ai /it /test /erp + 共用打印 CSS）——test/test.py 全量 **209/209 通过**（0 失败，含 v1.2.0 既有 138 项核心断言 + C17–C26 新增 71 项）+ test/cdp-print.mjs **31/31 通过**（打印版式选择器同步新 8 区结构，竖版技能 2 列/横版 3 列，横竖版 PDF 方向/页数/无 JS 异常）；CDP 测试服务器临时端口 3998 自启自停，未触碰生产与真实数据
- 影响面（来自第 2 节）：页面 /ai /it /test /erp（板块重构 + 新增 about/off-duty + 编号头部 + 交替卡片 + 数据压图）；接口/调用方 无变化（6 端点不动）；表/字段 resume.json 不动；配置/缓存 无新端口、无新依赖
