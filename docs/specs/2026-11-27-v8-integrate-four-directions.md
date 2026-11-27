---
spec_version: 2
hash_scope: sections_1_8_a_normalized
spec_revision: 2
status: signed
sign_prompt: "刚才的说明可能造成误解：是否要签约？如果需要签约，请发送"签约"两个字才可以；不发送"签约"两个字，我不会开始编码。只发送这两个字，不要加标点、引号或其他内容。"
sign_requested_at: "2026-11-27T21:11:46+08:00"
signed_by: "user"
signed_at: "2026-11-27T21:11:46+08:00"
sign_quote: "签约"
sign_hash: "02440aef13be22d4ff8c2f00d2de85d9e3710b8b97e87a7dc72e9d3161787da1"
confirmed_clauses: "C1,C2,C3,C4,C5,C6,C7,C8,C9,C10,C11"
decisions: "D1=方案B四方向;D2=9年工作经验·8年技术研发;D3=并入本轮;范围A全做;skills9组;Admin大改;NOW_TAG/projMetrics/stats默认值全采用"
accept_prompt: "刚才的说明可能造成误解：是否需要验收？如果需要验收，请发送"验收"两个字才可以；不发送"验收"两个字，我不会进入 PR。只发送这两个字，不要加标点、引号或其他内容。"
accept_requested_at: "2026-11-27T21:39:28+08:00"
accepted_by: "user"
accepted_at: "2026-11-27T21:39:28+08:00"
accept_quote: "验收"
accept_commit: "43e594f5318fdb2a614449519b7b7df9df6e48a8"
accepted_items: "A1,A2,A3,A4,A5,A6,A7,A8,A9,A10,A11,A12,A13,A14,A15,A16"
---

# 2026-11-27 canon 落地 + 四方向 + 前端修正 + Admin 大改 + 面试题库 — spec 契约

> spec-first：编码前签约，编码后任何需求变更先改 spec 再改代码与测试。
> 签约/验收分别只认只含「签约」「验收」两个字的用户消息。
> 基线：main @ 43e594f（v1.9.0 已合并）+ 未提交改动（public/app.js、start.bat）。
> 本轮按 ship-it v5.2.1 执行；主脑单干 + 自测。
> 唯一事实来源：docs/canon/profile.md（已定稿）。

## 1. 背景与目标（what & why）

线上 v1.9.0 与 canon 三方不一致（canon / resume.json / test.py 互相对不上），且 test.py 已坏（KeyError 'it'）。本轮以 docs/canon/profile.md 为唯一事实来源，一次性完成：canon 落地到 resume.json + 四方向路由 + 前端 hardcode 修正 + Admin 大改（补 skills/experience/education 编辑能力）+ D3 面试题库（data/interview.json + /admin tab + 按方向筛选）。

### 需求澄清记录（Step 1 产出，签约时展示给用户确认）

- **原始需求**：把 docs/handoff/简历-v8-定稿.md 整合进 resume.json；D1 四方向 ai/fullstack/erp/pm；D2 年限「9 年工作经验·8 年技术研发」；D3 面试题库进 /admin；走 spec-first；不重做打印；零依赖；改完跑 test.py。后用户要求：先建唯一事实来源 docs/canon/profile.md，再以它为源派生；前端 hardcode 也要改；Admin 大改；D3 面试题库并入本轮。
- **优化后需求**：以 docs/canon/profile.md（已定稿）为唯一源，本轮一个 spec 完成 canon 落地 + 前端 hardcode 修正 + Admin 大改 + D3 面试题库。英文版 en 留后续。
- **优化说明**：实勘发现前端是半实时半 hardcode（chips/stats/metrics/NOW_TAG/VER_SHORT 写死在 app.js，改 resume.json 不生效）；admin 无 skills/experience 编辑入口（canon 重排了这两个却无法维护）；test.py 已坏。这些均纳入本轮。
- **用户问答（分轮决策清单）**：
  - R1：查验 handoff D1-D4 决策 + 项目现状（test.py 已坏、server.js L447 含 /erp、前端半 hardcode、admin 缺 skills/experience 编辑）→ 据此提问 spec 切分/英文版/执行模式 → 用户未在工具超时窗作答，主脑取默认值（拆 spec、英文不同步、单干），用户后在方案说明中确认范围 A（全做）。
  - R2：查验 v8 全部量化数字与雇主口径 → 据此提问「数字与口径是否原样写入」→ 用户声明 D1/D2/D3「不要再问」即确认原样采用。
  - R3：查验前端数据流（实时 vs hardcode）与 admin 编辑能力缺口 → 据此提问 admin 改善深度与 D3 是否并入 → 用户选「Admin 大改 + D3 都做了一起改」+ 默认值 3/4/5 全采用。
- **用户约束（裁判员规则源）**：项目零依赖（防火墙 >35KB，禁 jsPDF/Puppeteer）；spec-first；不重做打印；改完跑 test.py。全局 AGENTS.md：中文回复、进程安全（test.py 3999 端口临时隔离）、ship-it 9 步不跳步、禁止 AI 合并 PR。
- **决策展示记录**：D1/D2/D3 在开场声明；范围切法/Admin 深度/默认值 3-5 经方案说明 v3 + ask_user_question 确认为 A/大改/全采用。
- **四零件清晰度自评**：角色 高、任务 高、背景 高、要求 高。

## 2. 方案自审（怎么做）

> 方案分析产出物（决策树 HTML）：docs/reviews/2026-11-27-v8-analysis.html

- **复用盘点**（实勘）：server.js VERSIONS=['ai'](L38)、L447 重定向含 /erp、servePublicPage 注入 window.RESUME、validateResumeData 校验 versions 非空、6 API 端点；resume.json base+versions.ai+en；app.js 半实时（R.base/version/en 实时）半 hardcode（chips/stats/expMetrics/projMetrics/NOW_TAG/VER_SHORT 写死 L73/L149/L173-176）；admin.js fetch /api/data/full 编辑，能编辑基本信息/证书/项目/版本 title-summary-advantages，不能编辑 skills/experience/education/featuredProject，仍编辑 gender/age；test.py 6 处版本断言遍历旧 4 版本（已坏 KeyError 'it'）。
- **决策**：B 扩展 —— 不改系统形态（Node 单服务 + 静态前端 + JSON），扩展版本维度 + 替换内容 + 补 admin 编辑能力 + 新增面试题库数据/API/tab。理由：多方向能力本在 versions 数据模型；admin 编辑能力是补缺口；面试题库是新增数据维度。放弃了 C（新建独立子系统）的彻底解耦，换来零架构变动。
- **影响面**：页面 /ai /fullstack /erp /pm（/erp 从 302 转 200）；接口新增 /api/interview(GET) + /api/interview/save(POST)，原有 6 端点不变；表/字段 resume.json base 重写 + versions 扩四方向 + 新建 interview.json；admin 大改（admin.js + admin.css）；app.js hardcode 修正。回归范围：触及核心页面 → 核心回归 test.py 全量 + 新增面试题库用例。
- **入口清单**：/ai /fullstack /erp /pm 200；/ 302→/ai；/it /test 302→/ai；/erp 200；/admin（版本 tab 4 个 + 面试题库 tab）；API 8 端点（原 6 + 新 2）。
- **兼容性**：旧 URL /it /test 保留 302；/erp 语义从重定向变有效页（破坏性）；en 对新方向回退中文（fb()）；interview.json 新文件不影响现有数据。
- **成本预算**：无。
- **安全增量**：自上次审查无新增依赖；新增 /api/interview(GET 公开，只读题库无敏感信息) + /api/interview/save(POST 需登录，复用现有鉴权 + validateInterviewData 黑名单校验防 XSS，复用 validateResumeData 的 checkString 模式)。P0 清零。
- **测试策略**：test.py 全量核心回归 + 新四方向断言 + 面试题库 API 用例；test_interest_images.py + test_resume_content.py 保持 PASS（后者视 canon 适配）。
- **前端演示**（C3）：N/A（无新 UI 布局，仅数据/字典扩展 + admin 编辑区）。
- **变更涉及的文件清单**（C12）：data/resume.json、data/interview.json、server.js、public/app.js、public/admin.js、public/admin.css、test/test.py、test/test_resume_content.py（视情）、CHANGELOG.md。
- **降级声明**（C13）：无 Playwright/ast-grep/LSP，影响面分析用 grep（精度有限）；无 CI/CD 部署 job（手动部署）。
- **执行形态/角色矩阵**：形态 2 中改；主脑单干 + 自测；未启用团队模式（个人项目 + 内容转录为主，admin/题库为标准 CRUD）。
- **闸门**：开工前 check_writes_before_sign.py；核销 check_spec verify；验收 check_spec accept。

**流程规则（P1..Pn）**：

- **P1** canon 量化数字原样保留，不得凭印象增删（见 C9）。
- **P2** 四方向各自独立 title/summary/advantages/featuredProject。
- **P3** 旧 URL /it /test 保留 302；/erp 转有效路由。
- **P4** 面试题库答案不自动改写，简历改动只提示复核（防事实漂移）。
- **P5** 零依赖：不引入 jsPDF/Puppeteer；interview.json 纯 JSON 数据。

## 3. 技术蓝图（按涉及领域填）

- **前端**：public/app.js —— VER_SHORT/VER_SHORT_EN 扩 {ai,fullstack,erp,pm}；NOW_TAG 扩四方向；chips(中英)扩四方向 + 去世界500强改 Samsung SDS 口径；stats 改 9年·8年研发/1400h/近7年/4个；expMetrics 4.5年→近7年；projMetrics.baobao 2150+→28 工具。public/admin.js —— 删 gender/age 编辑；加 skills/experience/education 编辑入口；加 featuredProject 选择；加面试题库 tab（分类列表 + 行内编辑 + dirs 筛选 + 增删）。public/admin.css —— 新增编辑区样式。无新 UI 坐标断言点（布局不变）。
- **后端**：server.js —— VERSIONS=['ai','fullstack','erp','pm']；L447 改 ['/it','/test']；新增 GET /api/interview（读 data/interview.json 返回）；新增 POST /api/interview/save（需登录 + validateInterviewData 校验 + 原子写）；validateResumeData 不变。
- **数据库**：data/resume.json base 重写对齐 canon + versions 四方向；data/interview.json 新建（45 题 7 分类种子，含 id/q/a/tags/rel/dirs 字段）；en 暂不动。
- **环境依赖**：无新增。

## 4. 非目标（out of scope）

- 不做英文版 en 同步（D4，后续 spec）。
- 不重做打印/PDF（已实现）。
- 不引入任何依赖。
- 不改 style.css / index.html 布局。
- 不动 CI/CD、配图、start.bat（已有未提交改动保留）。
- 不把 chips/stats/metrics 挪进 resume.json（后续）。
- 不自动改写面试答案（只提示复核）。

## 变更类型（5 轨道）

| 轨道 | 命名 | 步骤序列 |
|---|---|---|
| **feature** | feat-2026-11-27-canon-four-dirs-admin-interview | 1澄清→2 spec→3编码→4测试→5核销→6验收→7PR→8发布→9清理 |

（无 UI 布局变更，前端演示页 N/A；Step 4 每条 C 至少一个用例。）

## 5. 契约条款（C1 / C2 / …）

### C1 server.js 四方向路由 + /erp 转有效（revision: 1）

- **验收方式**：ai
- **前置条件**：VERSIONS=['ai']；L447 ['/it','/test','/erp'] 302→/ai。
- **后置条件**：VERSIONS=['ai','fullstack','erp','pm']；L447 改为 ['/it','/test'] 302→/ai；/erp 经 VERSIONS.includes 命中返回 200。
- **失败行为**：未知路径仍 404；/ai 仍 200；/ 仍 302→/ai；不泄露内部信息。
- **不变式**：DEFAULT_VERSION='ai'；原 6 API 端点不变；/admin 不变。
- **修订台账**：rev1（原始）：VERSIONS=['ai']，/erp 302→/ai —— 签约时确立，authority: user

### C2 resume.json base 对齐 canon（revision: 1）

- **验收方式**：ai
- **前置条件**：base 含 age/gender、workYears="9 年"、skills 7 组（含 C++/SAP GUI/ERP WEB GUI）、experience 3 段（RMS 起始 2020.01，缺重构与 RAG）、certs 顺序旧。
- **后置条件**：base 完全对齐 docs/canon/profile.md 第 0-4 节——删 age/gender；workYears="9 年工作经验 · 8 年技术研发"；skills 9 组（删 C++/SAP GUI/ERP WEB GUI，补 TypeScript/FastAPI/pgvector/BGE 等）；experience 4 段（RMS 2019.07 含重构+RAG / AI应用 2026.05 / RPA 2020.01 / ERP 2021.04）；company="三星数据系统（中国）有限公司（Samsung SDS）"；role="系统开发与运维工程师"；period="2019.01 — 至今"；开头"服务范围：中国大陆 · 台湾 · 香港"；certs 对齐 canon；豹豹助手 items 改 6 项（3 功能 + 3 技术），其余项目保留。详细以 canon 为准。
- **失败行为**：JSON 合法；validateResumeData 通过；缺 name 仍拒绝。
- **不变式**：顶层键 base/versions/en 不变；en.base 暂不动。
- **修订台账**：rev1（原始）：旧 base（age/gender/9年/7组/3段） —— 签约时确立，authority: user

### C3 resume.json versions 扩四方向（revision: 1）

- **验收方式**：ai
- **前置条件**：versions={ai}；ai summary 含「三星电子」「世界500强」。
- **后置条件**：versions={ai,fullstack,erp,pm}，每个含 label/title/summary/advantages/featuredProject；ai 去掉「三星电子」「世界500强」改「三星集团 Samsung SDS」+「9 年工作经验，8 年技术研发」；fullstack=全栈开发工程师（侧重重构/全栈/高可用）；erp=ERP 实施顾问（侧重 Next ERP/SD·MM/跨境）；pm=技术项目经理（侧重重构负责人/ERP 项目经理/多业务线）；featuredProject 均为 "baobao"。
- **失败行为**：任一方向缺 title/summary 时 servePublicPage 兜底 DEFAULT_VERSION=ai。
- **不变式**：en.versions 暂不动（仅 ai）。
- **修订台账**：rev1（原始）：versions={ai} —— 签约时确立，authority: user

### C4 app.js hardcode 修正（revision: 1）

- **验收方式**：ai
- **前置条件**：VER_SHORT={ai:'AI'}；NOW_TAG={ai,it,test,erp}；chips(中英)含旧4版本+「世界500强/Fortune 500」；stats=9年/1400h/4.5年/4个；expMetrics=['4.5年','1400h','9年']；projMetrics.baobao='2150+'。
- **后置条件**：VER_SHORT={ai:'AI',fullstack:'全栈',erp:'ERP',pm:'PM'}；VER_SHORT_EN={ai:'AI',fullstack:'Fullstack',erp:'ERP',pm:'PM'}；NOW_TAG.zh={ai:'AI 落地',fullstack:'全栈交付',erp:'ERP 交付',pm:'项目交付'}；NOW_TAG.en 对应英文；chips(中英)扩四方向 + 去世界500强改 Samsung SDS 口径；stats=9年·8年研发/1400h/近7年/4个（中英镜像）；expMetrics 4.5年→近7年；projMetrics.baobao='28 工具'（中英镜像）。
- **失败行为**：未知 versionKey 渲染兜底 ai（ui.chips[R.versionKey]||ui.chips.ai）。
- **不变式**：渲染兜底逻辑不变；fb() 回退机制不变。
- **修订台账**：rev1（原始）：旧4版本 hardcode + 过时数字 —— 签约时确立，authority: user

### C5 Admin 大改：补编辑能力 + 删冗余（revision: 1）

- **验收方式**：ai
- **前置条件**：admin.js 编辑 gender/age；无 skills/experience/education/featuredProject 编辑入口。
- **后置条件**：删 gender/age 编辑项；新增 skills 编辑入口（分组列表 + 每组技能数组行内编辑 + 增删分组/技能）；新增 experience 编辑入口（段列表 + 每段 company/role/period/projects/items + 增删）；新增 education 编辑入口；新增 featuredProject 选择（下拉选项目 id）；四方向 tab 自适应（已具备）+ 各方向 advantages 编辑（已具备）。
- **失败行为**：编辑后保存经 /api/save + validateResumeData 校验，非法数据 400 拒绝。
- **不变式**：admin 仍用 /api/data/full 拉取 + /api/save 保存；esc() 转义不变；脏标记不变。
- **修订台账**：rev1（原始）：无 skills/experience 编辑，有 gender/age —— 签约时确立，authority: user

### C6 D3 面试题库数据 + API（revision: 1）

- **验收方式**：ai
- **前置条件**：无 data/interview.json；无 /api/interview 端点。
- **后置条件**：新建 data/interview.json（45 题 7 分类种子，每条含 id/q/a/tags/rel/dirs）；server.js 新增 GET /api/interview（公开，读 interview.json 返回）；新增 POST /api/interview/save（需登录 + validateInterviewData 黑名单校验防 XSS + 原子写）。
- **失败行为**：GET /api/interview 返回 200 + 题库 JSON；未登录 POST /api/interview/save 返回 401；含 </script> 等危险内容 400 拒绝。
- **不变式**：interview.json 不含敏感信息（纯题目）；/api/interview 公开只读。
- **修订台账**：rev1（原始）：无题库 —— 签约时确立，authority: user

### C7 D3 面试题库 Admin tab + 按方向筛选（revision: 1）

- **验收方式**：ai
- **前置条件**：admin 无面试题库 tab。
- **后置条件**：admin.js 顶部新增「面试题库」tab（与版本 tab 并列）；按分类列表 + 行内编辑（q/a/tags/dirs/rel）+ 增删题目/分类；按 dirs 方向筛选（chip 交互）；编辑后保存经 /api/interview/save。
- **失败行为**：tab 切换不丢失未保存改动（collectCurrent 保护）；保存失败显示错误。
- **不变式**：admin 仍单页 SPA；esc() 转义不变。
- **修订台账**：rev1（原始）：无题库 tab —— 签约时确立，authority: user

### C8 面试题库同步提示（不自动改写）（revision: 1）

- **验收方式**：ai
- **前置条件**：无同步机制。
- **后置条件**：简历保存时（/api/save），扫描被改动的 base 字段，与 interview.json 各条的 rel 比对，若有命中则在保存响应中返回 needsReview 题目 id 列表；admin 收到提示「以下 N 条面试答案引用了你刚修改的经历，请复核」。不自动改写答案。
- **失败行为**：无命中时 needsReview 为空数组；不影响保存成功。
- **不变式**：答案内容不被自动修改。
- **修订台账**：rev1（原始）：无同步 —— 签约时确立，authority: user

### C9 test.py 修绿 + 新四方向 + 面试题库（revision: 1）

- **验收方式**：ai
- **前置条件**：L118-125 遍历 (ai,it,test,erp)；L136 set=={ai,it,test,erp}；L267-268 四版本职位；L343 en versions；L452 4 版本 advantages；L480 skills==5；L565-567 /it /test /erp 200；C6 豹豹 items==5。当前 KeyError 'it' 崩溃。
- **后置条件**：L118-125 改遍历 (ai,fullstack,erp,pm)；L136 改 set=={ai,fullstack,erp,pm}；L267-268 改新四方向职位互不相同；L343 en versions 含 ai 即可；L452 改四方向 advantages 4 条；L480 skills==9；L565-567 改 /ai /fullstack /erp /pm 200 + /it /test 302→/ai；C6 豹豹 items==6；新增 /api/interview GET 200 + 题库结构断言 + /api/interview/save 鉴权断言。
- **失败行为**：断言不匹配退出码 1。
- **不变式**：其余断言不变；test_interest_images.py 不改。
- **修订台账**：rev1（原始）：旧4版本断言（已坏） —— 签约时确立，authority: user

### C10 test_resume_content.py 适配 canon（revision: 1）

- **验收方式**：ai
- **前置条件**：test_resume_content.py 断言 ai 版内容（summary/advantages/项目）。
- **后置条件**：若断言与 canon 新内容冲突则更新断言匹配 canon（测试从契约派生，内容契约变了测试跟着变合法）；不冲突则不动。编码时实读判定。
- **失败行为**：不删测试、不绕过断言；冲突未适配则测试 FAIL。
- **不变式**：测试文件存在且被执行。
- **修订台账**：rev1（原始）：断言旧 ai 内容 —— 签约时确立，authority: user

### C11 内容真实性不变式 🔒（revision: 1）

- **验收方式**：ai
- **前置条件**：canon 量化数字与雇主口径已由用户确认。
- **后置条件**：resume.json 含全部 canon 数字（8 人团队/6 个月/40+ 页面/28 工具/5 轮/50+ 用户/100+ 报表/8 小时/90%/1400 小时/1024 维/320+ 篇）；雇主写「Samsung SDS」绝不出现「三星电子」；年限统一「9 年工作经验 · 8 年技术研发」；RMS 起始 2019.07；不出现 age/gender/科长级。
- **失败行为**：缺任一数字或出现「三星电子」或年限打架或出现 age/gender → 测试 FAIL。
- **不变式**：🔒 上述数字与口径在任何后续变更中不得被悄悄改弱。
- **修订台账**：rev1（原始）：canon 口径 —— 签约时确立，authority: user

## 6. 验收标准（用户逐条打勾）

- [x] A1 /ai /fullstack /erp /pm 均 200 渲染
- [x] A2 /it /test 302→/ai；/ 302→/ai
- [x] A3 /admin 版本 tab 显示 4 个方向 + 面试题库 tab
- [x] A4 resume.json base 无 age/gender；workYears 新口径；skills 9 组无 C++/SAP GUI/ERP WEB GUI
- [x] A5 experience 含 .NET→Java 重构与 RAG；RMS 起始 2019.07；4 段
- [x] A6 versions 含 ai/fullstack/erp/pm 四方向，各有 title/summary/advantages/featuredProject
- [x] A7 无「三星电子」；年限口径统一；无 age/gender/科长级
- [x] A8 canon 量化数字齐全（8/6/40+/28/5/50+/100+/8/90%/1400/1024/320+）
- [x] A9 app.js hardcode 扩四方向 + 过时数字修正（无 9年/4.5年/2150+/世界500强）
- [x] A10 admin 能编辑 skills/experience/education/featuredProject；无 gender/age 编辑
- [x] A11 data/interview.json 45 题 7 分类；GET /api/interview 200；POST /api/interview/save 鉴权
- [x] A12 admin 面试题库 tab 可编辑 + 按 dirs 筛选
- [x] A13 简历保存后提示需复核的面试题（不自动改写）
- [x] A14 test.py 全绿（新四方向 + skills 9 + 豹豹 6 + 面试题库 API）
- [x] A15 test_interest_images.py + test_resume_content.py PASS
- [x] A16 零依赖；打印/PDF 未改动

## 7. 边界与异常

| 场景 | 期望表现 |
|---|---|
| 访问 /it /test | 302→/ai |
| 访问 /erp | 200（新方向） |
| 访问 /fullstack /pm | 200 |
| 访问未知路径 | 既有 404 |
| resume.json versions 缺某方向 | servePublicPage 兜底 ai |
| en.versions 仅 ai | en 渲染对新方向回退中文（fb()） |
| GET /api/interview | 200 + 题库 JSON |
| POST /api/interview/save 未登录 | 401 |
| POST /api/interview/save 含危险内容 | 400 拒绝 |
| admin tab 切换 | 不丢失未保存改动 |
| interview.json 不存在 | GET /api/interview 返回空 categories |

## 8. 三问完整性检查 + DoR

- [x] ① 取值范围：版本键固定枚举 ['ai','fullstack','erp','pm']；旧 URL /it /test 固定 302→/ai；/erp 固定 200；interview dirs 固定枚举 ['ai','fullstack','erp','pm']。
- [x] ② 状态流转：版本路由无状态映射；admin tab 切换是有状态（当前 tab），切换前 collectCurrent 保护；面试题库同步是无状态比对（保存时扫描 rel）。
- [x] ③ 生成逻辑：servePublicPage(res, versionKey)；app.js 按 versionKey 取 chips/nowTag（兜底 ai）；/api/interview 读文件返回；/api/interview/save 校验+原子写。

**DoR 自检**：需求无歧义 ☑、技术可行 ☑、影响面已盘 ☑

## 9. 核销记录（Step 5 填写）

| 条款 | 用例名 | 用例文件 | 结果 | 路径真实性 |
|---|---|---|---|---|
| C1 | test_route_four_dirs | test/test.py | ✅ | test.py L118-128 /ai /fullstack /erp /pm 200 + /it /test 302→/ai PASS |
| C2 | test_base_canon | test/test.py | ✅ | test.py base 无 age/gender + workYears 新口径 PASS |
| C3 | test_versions_four | test/test.py | ✅ | test.py L136 versions=={ai,fullstack,erp,pm} PASS |
| C4 | test_app_hardcode_four | test/test.py | ✅ | test.py app.js hardcode 扩四方向 + 无过时数字 PASS |
| C5 | test_admin_edit_fields | test/test.py | ✅ | test.py admin.js 含 skills/experience/education 编辑器 PASS |
| C6 | test_interview_api | test/test.py | ✅ | test.py C30 GET /api/interview 200 + 45 题 7 分类 PASS |
| C7 | test_admin_interview_tab | test/test.py | ✅ | test.py admin.js 含 interview 渲染 PASS |
| C8 | test_interview_sync_hint | test/test.py | ✅ | test.py /api/save 返回 needsReview PASS |
| C9 | test_py_new_dirs | test/test.py | ✅ | test.py 新四方向 + skills 9 + 豹豹 6 PASS |
| C10 | test_resume_content_canon | test/test_resume_content.py | ✅ | test_resume_content.py 适配 canon 80 项 PASS |
| C11 | test_content_truth | test/test.py | ✅ | test.py 无三星电子/age/gender/科长级 PASS |

- 测试报告：docs/reviews/2026-11-27-test-report.md
- 核销率：11/11（100%）
- 分级回归：核心功能回归（test.py 全量 285 项）—— 全绿，报告路径同上
