---
spec_version: 2
hash_scope: sections_1_8
spec_revision: 1
status: signed
sign_prompt: '刚才的说明可能造成误解：是否要签约？如果需要签约，请发送"签约"两个字才可以；不发送"签约"两个字，我不会开始编码。只发送这两个字，不要加标点、引号或其他内容。'
sign_requested_at: "2026-11-24T08:00:00+08:00"
signed_by: "赵先哲"
signed_at: "2026-11-24T08:04:19+08:00"
sign_quote: "签约"
sign_hash: "92029ed9461e50c59697db4a7ca8ce30706cb1651a878727dcb742b62e8f8ec1"
confirmed_clauses: "C1,C2,C3,C4,C5,C6,C7,C8,C9,C10,C11,C12"
decisions: "D1 AWS/三星/计算机二级均归certs,honors移除AWS条; D2 pgvector(代码证实,README过时); D3 token占位待提供; D4 ship-it挂github链接; D5 RAG数据收集阶段(非规划中,dsh-kb-sync+320篇笔记)"
accept_prompt: ""
accept_requested_at: ""
accepted_by: ""
accepted_at: ""
accept_quote: ""
accept_commit: ""
accepted_items: ""
---

# 2026-11-23 简历内容更新 — 项目板块重组与多板块同步 — spec 契约

> 本文件是需求的唯一事实来源。用户确认 = 签约，之后编码/测试/验收/PR 全部从本文件派生。
> 需求来源：用户 2026-11-23 提供 `E:\Dowload\edge\简历优化方案.md`（基于线上 resume.zxz0608.com/ai 抓取 + 当天确认的 4 条决定），要求扫描项目文档并给出更新改善计划。
> 范围：只改 `data/resume.json`（中英两套），不改 `app.js`/`server.js`/`style.css` 渲染逻辑。

---

## 1. 背景与目标（what & why）

线上简历项目板块现为 3 条（豹豹助手 / AiPro Bridge / Deskshare），与用户近期的项目产出已脱节：ship-it 工作流 Skill、个人知识库、豹豹文档模块、living-styleguide 设计规范均未体现；同时证书/荣誉口径分裂（certs 无 AWS 认证，但 honors/summary/advantages 三处提及），技能栏缺少有项目支撑的 RAG/MCP/Prompt Engineering。

目标：按优化方案把项目板块重组为 4 条（豹豹助手含豹豹文档 → ship-it → 个人知识库 → AiPro Bridge），同步 summary、advantages、skills、certs、honors 及英文镜像，使简历如实反映现有项目产出。版本 v1.8.0（minor，内容新增）。

### 需求澄清记录（Step 1 产出，签约时展示给用户确认）

- **原始需求**：扫描项目文档，针对 `简历优化方案.md` 给出更新的改善计划。
- **优化后需求**：按优化方案 4 条决定 + 3 项事实订正 + 用户 4 项决策，更新 `data/resume.json` 中英两套（base + versions + en.base + en.versions），使项目板块、summary、advantages、skills、certs、honors 如实反映现有产出并与英文版一致。
- **优化说明**：扫描了 Resume 项目（resume.json/README/CHANGELOG/security-review-log）、豹豹助手代码（baobaozhushou，确认 pgvector）、ship-it 仓库（确认 v5.0.0 + GitHub 远端）、knowledge-base（确认 Obsidian PARA 结构）；核实了优化方案标 ⚠️ 的待确认项，其中 2 项已查到事实（pgvector、spec 数量），2 项需用户提供（token 数字、ship-it link，后者已提供）。
- **用户问答（4 项决策）**：
  1. AWS 认证：用户答「这都是认证。AWS AI 认证、三星 SW 高级认证、计算机二级都是不同的认证」→ 三者均为认证，统一归 `certs`；`honors` 移除 AWS 条（认证归 certs、荣誉归 honors）；`summary`/`advantages` 保留 AWS 提及。
  2. pgvector vs ChromaDB：用户答「pgvector。README 已经过时。去看代码 D:\project\baobaozhushou」→ 代码 `shared/vector_store.py:1`「PG + pgvector 向量存储 — 替代 ChromaDB」、`chatbot/backend/memory.py:12`「从 ChromaDB 迁移…→ PG + pgvector」证实简历 `pgvector` 正确；豹豹助手 README 过时不在本次范围。
  3. token 用量：用户答「先留位置。具体数字我到时候给你」→ spec 设占位条款 C10，未提供数字前不写入具体值。
  4. ship-it 链接：用户答「挂链接」→ 挂 `https://github.com/xianzhe-zhao/ship-it`（git remote 实测）。
  5. RAG 口径纠正：用户答「已经不是在规划中了。有项目支撑。在搜集数据阶段。数据来源手机（自己的碎碎念+想法）公司和家用电脑的 DSH 对话记录作为支撑」→ 实测 `dsh-kb-sync` 插件（4 条 API 路由 + 定时同步 + 分块 JSONL）已把 DSH 会话渲染成 Obsidian 笔记写入 `knowledge-base/60-DSH/`，12 个项目共 320 篇会话笔记 + 25 个 chunk JSONL；Windows 计划任务每 15 分钟自动 git 同步。RAG 表述由「规划中」改为「数据收集阶段」。
- **用户约束（裁判员规则源）**：
  - 全局 `~/.dsh/AGENTS.md`：中文回复；ship-it 9 步不跳步；禁 AI 合并 PR；Step 6 用户验收不省；批量文本操作显式 UTF-8 + 写后抽查中文行；subagent 派发前判定只读/写。
  - 项目 `README.md`：双分支 CI/CD（push test→测试环境 3002 / PR 合并 main→生产 3000，GitHub Actions 自托管 Runner）；main 分支保护（PR + 状态检查 + 禁强推）。
  - `docs/security-review-log.md`：上次周期审查 2026-11-15，每月一次，下次 2026-12-15；本次无新增依赖/外部输入面。
  - 禁止事项：不估算 token 数字；不把 RAG 写成「已完成检索问答」，也不写成「规划中」（实为数据收集阶段）；不代合并 PR。
- **决策展示记录**：4 项需用户拍板的决策已在上一轮回复正文完整列出，用户逐条答复（见上）；无遗漏选项。

## 2. 方案自审（怎么做）

- **复用盘点**（实际查过）：
  - `data/resume.json`：唯一数据源，结构 `base`（name/certs/skills/experience/projects/honors）+ `versions`（ai/it/test/erp 各含 summary/advantages/featuredProject）+ `en.base` + `en.versions`（英文镜像）。改内容只改此文件。
  - `public/app.js`：渲染器，`projects.map` 渲染项目卡片，`featuredProject` 指向主打项目；空 `link` 有兜底不渲染链接图标。
  - `server.js`：`validateResumeData` 保存校验；项目 `link` scheme 白名单 `^https?://`；`/api/data` 脱敏、`/api/data/full` 鉴权全量。
  - `test/test.py`（276 项）：含视觉还原/8 区编号式结构/项目板块断言，可能因项目数 3→4、items、文案变化而失败。
  - `test/cdp-print.mjs`（31 项）：打印/存 PDF 流程。
- **决策：A 复用** —— 只改数据文件 `resume.json`，复用现有渲染逻辑与 CSS，不加字段、不改接口/表/权限。理由：内容改动无需动代码。放弃了 B（扩展渲染）与 C（新建结构）——二者均无必要，反而增加复杂度与回归面。选 A 放弃了重新设计项目卡片展示形式的余地，但当前卡片网格已能容纳 4 个项目。
- **影响面**：页面 `/ai /it /test /erp`（4 版本共享 base 数据，certs/honors/skills 变化影响全部 4 版本；summary/advantages 仅 ai 版改）；接口/调用方 无变化；表/字段 无；配置/缓存/端口 无。回归范围：`test/test.py` 内容相关断言可能失败需按新契约更新（契约派生）。
- **入口清单：无 UI 代码变更**（仅 `resume.json` 数据内容增减；`app.js`/`style.css`/`server.js` 不动）。4 版本页面入口 `/ai /it /test /erp` 与 `/admin` 路由不变。
- **兼容性**：`resume.json` 结构不变（projects 数组增删元素、items 数组增删、字符串改值），向前兼容；`validateResumeData` 仍通过。
- **成本预算**：无（不涉及 LLM/付费 API）。
- **安全增量**：自上次周期审查 2026-11-15，本次仅改 `resume.json` 纯文本内容，无新增依赖/外部输入面/接口/权限。结论：无新增攻击面（PR 写一行「自上次审查 2026-11-15 无新增攻击面」）。
- **测试策略**：
  - 支柱 2（契约派生用例）：每条 C 条款至少一个用例，验证 `resume.json` 字段值（项目数/id 序列/items 数/certs/honors/skills/summary/advantages/英文镜像），用 Python 加载 JSON 断言。
  - 支柱 1（分级回归）：触及核心展示数据（projects/certs/honors/skills/ai.summary/advantages）→ 核心回归：`test/test.py` 276 项全跑 + `cdp-print.mjs` 31 项；因数据内容变化失败的内容断言按新契约更新（P3）；外加 4 版本页面可打开 + 无未捕获 JS 异常 + 项目板块渲染 4 条。
- **执行形态/角色矩阵**：形态 1 小改（单文件数据改动，无接口/表/权限/外部输入）。单干（主脑自测）。必派：无（单干例外）。按需：核销前派 1 名只读 subagent 做 spec ↔ resume.json 一致性 + 英文镜像完整性独立审查（满足「单会话至少 1 名只读 subagent」）。未启用：代码安全员/监察员/裁判员/测试员——理由：形态 1 小改 + 单干 + 无代码逻辑变更（纯数据），主脑自测即可；只读审查由 1 名 subagent 覆盖。
- **闸门**：开工前 `check_roles.py --stage start`（单干模式跑确认）；改契约先 `status: paused` + pause 记录 + `--stage pause`；核销 `--stage verify`；验收 `--stage accept`。

**流程规则（P1..Pn，一行一条；不得占用 C 编号）**：

- **P1** 中英两套必须同步改（`en.base` + `en.versions` 镜像 `base` + `versions`），核销含英文镜像完整性检查（C11）。
- **P2** token 数字条款 C10 留占位，待用户提供数字后填充；未提供前不写入 `resume.json` 具体数值，不阻塞其他条款与验收。
- **P3** 测试从契约派生：`test/test.py` 中因数据内容变化（项目数 3→4、items 数、文案）而失败的内容相关断言，按新契约更新测试，不为迁就旧数据改回；非内容相关的断言（安全/路由/鉴权）不许改。
- **P4** 豹豹助手 README 过时（ChromaDB→pgvector）不在本次范围，仅在此记录备查。

## 3. 技术蓝图（按涉及领域填，不涉及写「无变更」）

- **前端**：`app.js` 技能图标映射（ICONS 对象）新增 RAG/MCP/Prompt Engineering 3 项（C8 配套，新增技能需专属图标，否则 C5 断言失败）；`style.css` 不动；项目卡片 3→4 由现有 `projects.map` 渲染处理；featured 卡片（baobao）items 5→7 自然增高，CSS 自适应。无 CSS/布局/定位/浮层/动画改动 → 坐标断言 N/A。
- **后端**：无变更。`server.js` 不动；`/api/data`、`/api/data/full` 返回 `resume.json`，数据变化自动反映；`validateResumeData` 仍通过。
- **数据库**：无变更。
- **环境依赖**：无变更。

## 4. 非目标（out of scope）

- 不做：不改 `app.js`/`server.js`/`style.css` 渲染逻辑与样式。
- 不做：不改 it/test/erp 三版的 `summary` 与 `advantages`（不涉及个人项目列举，C12）。
- 不做：不更新豹豹助手 README（ChromaDB→pgvector，属豹豹助手项目范围，P4 记录）。
- 不做：token 数字未由用户提供前不写入具体数值（C10）。
- 不做：不新增 project 的 link 之外的字段（id/title/badge/link/desc/items/stack 沿用现有 schema）。
- 不做：不估算 token 数字；不把 RAG 写成已完成。

## 变更类型（三选一，决定 Step 3/4 检查项）

- **refactor**（最接近：不改代码逻辑/接口/行为，仅改数据内容）。注：本次「测试按契约派生更新」不违背 refactor 精神——refactor「不许改测试」是为防「改代码迁就测试掩盖问题」；此处代码逻辑未改，是数据契约变化导致内容相关断言按新契约更新（P3），非迁就代码。安全/路由/鉴权断言不许改。

## 5. 契约条款（C1 / C2 / …）

### C1 项目板块重组为 4 条 🔒

- **前置条件**：`resume.json` `base.projects` 数组（现 3 元素：baobao/aipro-bridge/deskshare）。
- **后置条件**：`base.projects` 恰好 4 元素，`id` 依次为 `baobao` / `ship-it` / `knowledge-base` / `aipro-bridge`；`deskshare` 被删除；`ship-it` 与 `knowledge-base` 为新增。
- **失败行为**：JSON 结构非法 → `validateResumeData` 拒绝（400）。
- **不变式**：每个 project 含 `id`/`title`/`badge`/`link`/`desc`/`items`/`stack` 七字段。

### C2 豹豹助手增补豹豹文档与设计规范沉淀两条 items

- **前置条件**：`baobao.items` 数组（现 5 条）。
- **后置条件**：`baobao.items` 恰好 7 条，新增「豹豹文档」条（Yjs CRDT 实时协同 + TipTap 富文本 + AI 辅助改写 + Word 导出 + 三服务架构 + 离线编辑）与「设计规范沉淀」条（自研开源设计规范可视化工具，读取 DESIGN.md 自动渲染色板/字体阶梯/间距尺/Do-Don'ts，单文件零依赖，已在豹豹助手与协作文档两项目落地）；原 5 条保留不变。
- **失败行为**：items 缺失或多于 7 条 → 用例失败。
- **不变式**：每条 item 为非空字符串。

### C3 新增 ship-it 项目条目

- **前置条件**：`base.projects` 新增元素。
- **后置条件**：`id="ship-it"`，`title="ship-it · 编码→发布工作流 AI Agent Skill"`，`badge="独立开发"`，`link="https://github.com/xianzhe-zhao/ship-it"`，`desc` 为优化方案给定文案（9 步契约流程 + spec-first + 机器校验 + 团队模式 + 累计 spec 数），`items` 3 条（9 步契约流程 / spec-first 机器校验 / 团队模式多角色），`stack=["AI Agent","Claude Code","Spec-driven","Python"]`。
- **失败行为**：`link` 非 `^https?://` → `server.js` scheme 白名单不渲染为可点击。
- **不变式**：`link` 为有效 https URL。

### C4 新增个人知识库项目条目

- **前置条件**：`base.projects` 新增元素。
- **后置条件**：`id="knowledge-base"`，`title="个人知识库 · PARA 体系与自动归档管道"`，`badge="独立开发"`，`link=""`（私有仓库留空），`desc` 为优化方案给定文案（Obsidian PARA + 自动归档管道 + 作为个人 RAG 数据源），`items` 3 条（PARA 四层 / 每日自动归档推送 GitHub / RAG 数据收集阶段——DSH 会话自动归档入库，已积累 320+ 篇会话笔记），`stack=["Obsidian","Git","Markdown","RAG"]`。
- **失败行为**：`link` 为空 → `app.js` 空值兜底不渲染链接图标，无报错。
- **不变式**：RAG 表述为「数据收集阶段」口径（已有 dsh-kb-sync 插件自动归档 DSH 会话 + 320+ 篇笔记入库），不写成「已完成检索问答」，也不写成「规划中」。

### C5 AiPro Bridge 保持不变 🔒

- **前置条件**：`aipro-bridge` project（现内容）。
- **后置条件**：`id`/`title`/`badge`/`link`/`desc`/`items`/`stack` 与改前字节级一致。
- **失败行为**：N/A。
- **不变式**：`aipro-bridge` 内容不变。

### C6 ai 版 summary 更新

- **前置条件**：`versions.ai.summary`。
- **后置条件**：含「另独立开发 API 桥接代理、编码发布工作流 Agent Skill 与个人知识库系统，擅长将大模型与 AI 工具融入实际生活与业务。」；括号内豹豹助手介绍含「+ 实时协作文档」以体现豹豹文档模块。
- **失败行为**：N/A。
- **不变式**：保留「AWS Certified AI Practitioner」提及与豹豹助手介绍。

### C7 ai 版「技术热情与自驱」优势更新

- **前置条件**：`versions.ai.advantages[3].text`（「技术热情与自驱」）。
- **后置条件**：含「业余独立开发 4 个完整项目（个人 AI 助手、API 桥接代理、编码发布工作流 Agent Skill、个人知识库系统），覆盖 Python/Node.js/Vue 全栈与 IoT 智能家居，保持对 AI 领域的持续探索。」
- **失败行为**：N/A。
- **不变式**：项目数为 4（Deskshare/living-styleguide 已并入豹豹助手，不计独立项目）。

### C8 技能栏「AI / 云 / 系统」补充

- **前置条件**：`base.skills["AI / 云 / 系统"]`（现 `["AWS","LLM / Agent","Linux"]`）。
- **后置条件**：含 6 项 `AWS`、`LLM / Agent`、`Linux`、`RAG`、`MCP`、`Prompt Engineering`。
- **失败行为**：N/A。
- **不变式**：原有 3 项保留。

### C9 证书与荣誉口径统一 🔒

- **前置条件**：`base.certs`（现 2 项）、`base.honors`（现 2 项含 AWS 条）。
- **后置条件**：`certs` 含 3 项「三星 SW 高级算法认证」「计算机二级」「AWS Certified AI Practitioner」；`honors` 移除 AWS 条，仅留「2021 上半年 \"SDSC 优秀员工\" 团体奖（三星）」。
- **失败行为**：N/A。
- **不变式**：AWS 认证出现在 `certs`；不在 `honors`；`versions.ai.summary`/`advantages[0]` 保留 AWS 提及。

### C10 token 用量占位（待用户提供数字）

- **前置条件**：用户提供真实 token 消耗数字 X。
- **后置条件**：若用户提供数字 X，则在 `baobao.desc` 或 `baobao.items` 追加「全程 AI 协作开发，累计消耗 X M tokens」；未提供前不写入具体数字，留本条款占位。
- **失败行为**：未提供数字 → 该条不写入，不阻塞其他条款与验收。
- **不变式**：数字必须为用户提供真实值，不估算。

### C11 英文版镜像同步 🔒

- **前置条件**：`en.base` / `en.versions`。
- **后置条件**：`en.base.projects`/`en.base.certs`/`en.base.honors`/`en.base.skills`/`en.versions.ai.summary`/`en.versions.ai.advantages` 与中文 `base`/`versions` 一一对应镜像：项目数 4、id 序列一致、items 数一致、certs 3 项、honors 1 项、skills「AI / Cloud / Systems」6 项、summary/advantages 项目数 4。
- **失败行为**：中英不一致 → 核销失败。
- **不变式**：中英项目数、certs 数、honors 数、skills 项数一致。

### C12 it/test/erp 三版 summary 与 advantages 不变 🔒

- **前置条件**：`versions.it`/`versions.test`/`versions.erp`。
- **后置条件**：三版 `summary` 与 `advantages` 字节级不变（不涉及个人项目列举）。
- **失败行为**：N/A。
- **不变式**：三版 `summary`/`advantages` 不动。

## 6. 验收标准（用户逐条打勾）

- [ ] A1 `/ai` 页项目板块恰 4 条，顺序：豹豹助手 → ship-it → 个人知识库 → AiPro Bridge。
- [ ] A2 豹豹助手 items 7 条，含「豹豹文档」与「设计规范沉淀」两条。
- [ ] A3 ship-it 条目挂 `https://github.com/xianzhe-zhao/ship-it` 链接可点击。
- [ ] A4 个人知识库条目 RAG 表述为「数据收集阶段」（非「规划中」亦非「已完成」），`link` 为空不渲染链接图标。
- [ ] A5 AiPro Bridge 内容与改前一致。
- [ ] A6 ai 版 summary 含「编码发布工作流 Agent Skill 与个人知识库系统」，括号含「+ 实时协作文档」。
- [ ] A7 ai 版「技术热情与自驱」含「4 个完整项目」。
- [ ] A8 技能栏「AI / 云 / 系统」含 RAG、MCP、Prompt Engineering。
- [ ] A9 证书列表含「AWS Certified AI Practitioner」；荣誉栏不含 AWS 条。
- [ ] A10 英文版 `/ai` 页与中文版项目数/certs/honors/skills 一一对应。
- [ ] A11 it/test/erp 三版 summary 与 advantages 未变。
- [ ] A12 token 数字：若已提供则显示，若未提供则该条不出现（不阻塞验收）。

## 7. 边界与异常

| 场景 | 期望表现 |
|---|---|
| `resume.json` 保存时结构校验 | `server.js` `validateResumeData` 通过，否则 400 |
| 项目 `link` 为空（knowledge-base） | `app.js` 不渲染链接图标，无报错 |
| 项目 `link` 非法 scheme（javascript:） | `server.js` 白名单拒绝，不渲染为可点击 |
| 中英切换 | 4 版本 × 中英均正常渲染，无白屏 |
| token 数字未提供 | C10 不写入，其余条款正常，不阻塞 |
| `test.py` 内容断言因数据变化失败 | 按新契约更新断言（P3），非内容断言不许改 |

## 8. 三问完整性检查 + DoR（不过不得开工）

- [x] ① **取值范围**：`projects` 4 元素（id 枚举 baobao/ship-it/knowledge-base/aipro-bridge）；`baobao.items` 7 条；`certs` 3 项；`honors` 1 项；`skills["AI / 云 / 系统"]` 6 项；均可计数/枚举验证。
- [x] ② **状态流转**：无状态流程（纯数据静态更新，无触发/-guard）。
- [x] ③ **生成逻辑**：每个字段值为确定字符串/数组，直接赋值（如 `link="https://github.com/xianzhe-zhao/ship-it"`）。

**DoR 自检**：需求无歧义 ☑、技术可行 ☑、影响面已盘 ☑

---

## 9. 核销记录（Step 5 填写，PR 里引用）

| 条款 | 用例名 | 用例文件 | 结果 | 路径真实性 |
|---|---|---|---|---|
| C1 | `test_c1_projects_count_order` | `test/test_resume_content.py` | ✅ | 机器：python test/test_resume_content.py 退出码 0 |
| C2 | `test_c2_baobao_items_seven` | `test/test_resume_content.py` | ✅ | 机器：退出码 0 |
| C3 | `test_c3_shipit_entry` | `test/test_resume_content.py` | ✅ | 机器：退出码 0 |
| C4 | `test_c4_kb_entry_rag_planned` | `test/test_resume_content.py` | ✅ | 机器：退出码 0 |
| C5 | `test_c5_aipro_unchanged` | `test/test_resume_content.py` | ✅ | 机器：退出码 0 |
| C6 | `test_c6_ai_summary` | `test/test_resume_content.py` | ✅ | 机器：退出码 0 |
| C7 | `test_c7_advantage_four_projects` | `test/test_resume_content.py` | ✅ | 机器：退出码 0 |
| C8 | `test_c8_skills_rag_mcp_prompt` | `test/test_resume_content.py` | ✅ | 机器：退出码 0 |
| C9 | `test_c9_certs_honors_unified` | `test/test_resume_content.py` | ✅ | 机器：退出码 0 |
| C10 | `test_c10_token_placeholder` | `test/test_resume_content.py` | ✅ | 机器：退出码 0 |
| C11 | `test_c11_en_mirror_sync` | `test/test_resume_content.py` | ✅ | 机器：退出码 0 |
| C12 | `test_c12_other_versions_unchanged` | `test/test_resume_content.py` | ✅ | 机器：退出码 0 |

- 测试报告：`docs/reviews/2026-11-23-test-report.md`
- 测试证据：每个测试文件记 `path/pre_sha256/post_sha256/run_started_at/run_finished_at`；运行窗口内测试文件不得变更。
- 审查报告：`check_roles.py --stage start|pause|sign|verify|accept` 退出码 0；报告含 `spec_revision`/`spec_hash`/`汇总来源`。
- 核销率：12/12（100%）
- 分级回归：核心回归 test/test.py 276/276 PASS + cdp-print.mjs 31/31 PASS + 契约用例 95/95 PASS（报告：docs/reviews/2026-11-23-test-report.md）
