# 简历唯一事实来源（Canon Profile）

> **本文件是简历的唯一权威源（Single Source of Truth）。**
> 后续 resume.json（网页数据）、PDF、面试题库全部以此为准派生；任何不一致以本文件为准。
> 改任何下游产物前先改本文件；本文件改了，下游才跟着改。
> 文件名唯一：`docs/canon/profile.md`。
>
> 确认记录：2026-11-27 本人逐项确认（见 docs/canon/info-form.html 答卷）。

---

## 0. 个人基本信息

| 项 | 值 |
|---|---|
| 姓名 | 赵先哲 |
| 城市 | 北京 |
| 电话 / 微信 | 17614336834 |
| 邮箱 | 971554652@qq.com |
| 个人站 | zxz0608.com（豹豹助手） |
| 简历站 | resume.zxz0608.com |
| GitHub | github.com/xianzhe-zhao |
| 雇主 | 三星数据系统（中国）有限公司（Samsung SDS） |
| 入职 | 2019.01（在职至今） |
| 工作年限 | 9 年工作经验 · 8 年技术研发 |
| 学历 | 大连民族大学 · 电子信息工程 · 本科 · 2013–2017 |
| 2017.07–2018.01 | 翻译工作 |
| 2018 | 系统学习 Java / JavaScript，转型软件开发 |

---

## 1. 个人优势（顶部摘要，4 条）

**近 8 年企业级系统开发经验（三星集团 Samsung SDS，2019.01 至今）**

1. **AI 应用工程**：自研 Agent 编排层（工具注册框架、ReAct 多轮循环、pgvector 语义记忆、SSE 流式输出），支撑个人全栈产品豹豹助手（28 个工具、双模型路由与故障降级）；在企业内网落地 RAG 问答机器人，以意图分析层与权限控制解决幻觉与越权问题。
2. **系统重构与全栈开发**：主导 RMS 系统 .NET → Java 全量重构，8 人团队、6 个月交付 40+ 页面与全部服务端逻辑，完成 Windows → Linux 环境迁移；任项目负责人，负责前后端接口设计、开发与全量功能验收。
3. **高可用架构与自动化**：设计 LB → Nginx ×2 → WAS ×2 的四层高可用部署架构；以 Python + JavaScript 交付 RPA 机器人，服务 50+ 名业务用户、间接覆盖 100+ 名报表使用者，日均满负荷运行 8 小时以上。
4. **安全合规与项目交付**：主导个人信息隐私数据加密整改与季度代码安全审查；任 Next ERP 项目经理、SD / MM 模块负责人，支援中国大陆 / 台湾 / 香港三地业务。

---

## 2. 核心技能（8 组）

- **语言**：Java、Python、JavaScript / TypeScript、C#、SQL、ABAP
- **后端**：Spring Boot、FastAPI、ASP.NET、RESTful 接口设计、前后端分离架构
- **前端**：Vue3 + TypeScript、Vite、微信小程序
- **数据**：PostgreSQL（pgvector 向量检索、索引与慢查询调优）、MySQL、SQL Server、SQL
- **AI 工程**：Agent 编排、工具调用框架、ReAct 多轮循环、语义记忆、SSE 流式输出、RAG 知识库构建、业务感知切分、意图路由、Prompt 工程
- **模型**：DeepSeek、通义千问（DashScope）、GLM、Qwen、BGE（ONNX Runtime 推理）
- **架构与运维**：LB + Nginx + WAS 高可用架构、三星 SCP、AWS、阿里云、Linux、Windows Server、Jenkins Pipeline、GitHub Actions、PM2、Cloudflare Tunnel
- **企业系统**：SAP SD、SAP MM、SAP ABAP、Crystal Reports、Brity Works RPA、SAP Hybris
- **AI 编程工具**：DSH、Claude Code、Codex、灵光、WorkBuddy、Trae

---

## 3. 工作经历

**三星数据系统（中国）有限公司（Samsung SDS）** ｜ 系统开发与运维工程师 ｜ **2019.01 – 至今**

北京 ｜ 服务范围：中国大陆 · 台湾 · 香港

*并行负责 4 条业务线，长期同时承担。*

### 3.1 RMS 系统开发与运维 ｜ 2019.07 – 至今

技术栈：Java · Spring Boot · Vue3 + TypeScript · ASP.NET · PostgreSQL · pgvector · Linux · SCP

- **主导 .NET → Java 全量重构（项目负责人）**：8 人团队、历时 6 个月，完成 40+ 页面与全部服务端逻辑重构及 Windows → Linux 环境迁移；负责前后端接口设计、开发与重构后全量功能验收。
- **设计高可用部署架构**：LB → Nginx ×2（Web 层）→ WAS ×2（应用层）四层架构，基于三星自建 VM 承载，实现双机热备与负载均衡。
- **开发 RMS 智能问答机器人（RAG）**：基于 pgvector + 自研 Qwen embedding 构建知识库，接入企业自建 AI 平台的 GLM 大模型；采用业务感知的两级切分（先按产品线「家电 / 手机」隔离，再按流程环节「入库 / 出库 / 验收 / 登记判定」切分），替代固定长度切分。
- **构建问答护栏**：增加意图分析层判断提问是否属于 RMS 业务域，拦截无关问题与跨意图幻觉（自测准确率约 90%，含手册外负样本）；按用户职级过滤可检索知识范围，越权提问直接拦截；「查数据」类请求转 SQL 查询直接导出，不交给模型编造。
- **主导个人信息隐私数据加密整改与季度代码安全审查**：完成敏感字段级加密与脱敏改造，建立覆盖注入、越权、敏感信息泄露的检查规则清单。
- 负责 PostgreSQL 索引与慢查询优化，通过复合索引重建与 SQL 重写解决复杂报表的慢查询问题。

### 3.2 AI 应用与研发效能 ｜ 2026.05 – 至今

- 以 AI Agent 驱动 RMS 迭代、RPA 开发与个人项目，覆盖需求澄清、spec 编写、编码、测试到 PR 发布。
- 自研 9 步契约式开发工作流 ship-it（开源）：以 spec 契约 + 机器核销解决 AI 生成代码「能跑但不可交付」的痛点，已在 RMS 迭代与个人项目中持续使用并迭代。

### 3.3 RPA 自动化开发 ｜ 2020.01 – 至今

技术栈：Python · JavaScript · Brity Works · SQL

- 以 Python + JavaScript 开发企业级自动化工作流，交付覆盖数据录入、跨系统核对、报表生成等场景的 RPA 机器人。
- 服务 50+ 名业务用户、间接覆盖 100+ 名报表使用者；机器人日均满负荷运行 8 小时以上，承担高频重复性作业。
- 针对标准组件无法处理的复杂逻辑编写自定义脚本，扩展平台能力边界。

### 3.4 ERP 项目 · 项目经理 / SD·MM 模块负责人 ｜ 2021.04 – 至今

- 任 Next ERP 项目经理，负责 SD（销售与分销）与 MM（物料管理）双模块，与 6 人 ERP 团队分工协作，支援中国大陆 / 台湾 / 香港三地，处理多币种、多税制、多语言场景。
- 2023.05 起主导三星全商品直营化系统切换：从接口设计、功能开发到项目推进全流程支援，覆盖全品类商品的接口改造与数据迁移。
- 使用 SAP ABAP 完成客制化开发与接口调整；使用 Crystal Reports 交付管理层决策报表，覆盖销售、库存等业务口径。

---

## 4. 个人项目

### 4.1 豹豹助手 · 全栈自研 AI 助理平台（已上线）

主页：zxz0608.com ｜ 简历：resume.zxz0608.com（中英切换）｜ 演示：zxz0608.com/demo

**功能覆盖（3 条）**：
1. AI 对话 + AI 新闻聚合（多源 RSS 采集科技资讯，自动分类 + 高亮摘要）+ 项目看板与甘特 + 日历日程 + 智能家居控制 + 多人协同 Word 文档，覆盖日常生活全场景。
2. 三服务拆分（FastAPI 网关 + AI 服务 + 智能硬件服务），Vue3 + Vite 前端，MySQL 存业务数据、PostgreSQL + pgvector 存向量索引，PM2 进程管理，Cloudflare Tunnel 对外暴露，GitHub Actions 持续集成。
3. 零 CDN 依赖，纯离线可运行；自研开源设计规范可视化工具（读取 DESIGN.md 自动渲染色板/字体阶梯/间距尺/Do-Don'ts 对照卡），已在豹豹助手与协作文档两个真实项目落地。

**技术决策（3 条）**：
4. 自研 Agent 编排层（不依赖 LangChain 等框架）：ToolRegistry 统一注册 28 个工具，JSON Schema 描述参数，新增工具无需改动编排层。
5. ReAct 多轮工具循环（思考 → 调用 → 观察，最大 5 轮；末轮强制不带工具逼出结论）+ 伪工具调用兼容（Markdown / XML / DSML 三种非标准格式统一为标准 tool_call）+ 多模型路由与降级（DeepSeek 主 + 阿里云百炼 qwen3.8-flash 故障降级，多 API Key 轮询）。
6. 语义记忆：PostgreSQL + pgvector 存储对话向量，BGE-large-zh-v1.5（1024 维）ONNX Runtime 推理（免 torch 依赖）；写入拼接截断、读取 Top-3 召回并按 user_id 隔离；由 ChromaDB 迁移而来（embedding 768 → 1024 维）。

技术栈：Python、FastAPI、MySQL、PostgreSQL、pgvector、Agent、IoT、Vue3、Yjs、TipTap、WebSocket

### 4.2 ship-it · AI 辅助开发工作流（开源）

地址：github.com/xianzhe-zhao/ship-it

- 将「需求澄清 → spec 签约 → 编码 → 测试 → 契约核销 → 用户验收 → PR → 发布 → 清理」固化为 9 步可执行流程。
- 引入机器可校验的契约核销表（spec 条款 ↔ 用例 ↔ 证据路径），由脚本校验通过率，避免 AI 自证合规。

技术栈：AI Agent、Claude Code、Spec-driven、Python

### 4.3 个人知识库 · PARA 体系与自动归档管道

- 基于 Obsidian PARA 方法论搭建个人知识库：按 Projects / Areas / Resources / Archives 四层组织笔记与资料，配套自动归档管道——每天对话中产生的想法、决定和记录按日期自动整理，推送至 GitHub 私有仓库持久化，作为后续个人 RAG（检索增强问答）的数据源。
- PARA 四层结构 + 每日自动归档（零手工成本）+ RAG 数据收集阶段（DSH 会话经自研 dsh-kb-sync 插件自动归档入库，已积累 320+ 篇会话笔记）。
- 私有项目，面试可演示。

技术栈：Obsidian、Git、Markdown、RAG

### 4.4 AiPro Bridge · API 桥接代理

- 零依赖 Node.js 代理，将 OpenAI Responses API、Anthropic Messages API 和 OpenAI Chat Completions API 桥接到 Aipro Chat Completions API，让 Codex 桌面端、Claude Code 和 DSH 使用 Aipro 托管的模型。
- 三种 API 格式互转（流式实时逐字输出）+ Web 搜索本地拦截（多引擎回退：360→百度→Bing→Yahoo，零上游 LLM 调用）+ Knox SSO JWT 认证 + MCP 配置同步 + Windows 计划任务开机自启。

技术栈：Node.js、零依赖、API 桥接、MCP、SSE

---

## 5. 教育与职业转型

**大连民族大学** ｜ 电子信息工程 ｜ 本科 ｜ 2013 – 2017

2017.07 – 2018.01 翻译工作 ｜ 2018 年系统学习 Java / JavaScript，转型软件开发

---

## 6. 证书与语言

- AWS Certified AI Practitioner（Foundational）
- 三星 SW 高级算法认证
- 全国计算机等级考试二级（NCRE）

语言：中文（母语）

---

## 7. 荣誉

- 2021 上半年「SDSC 优秀员工」团体奖（三星）

---

## 附录 A：量化数字清单

| 数字 | 含义 |
|---|---|
| 8 人团队 | .NET → Java 重构团队规模 |
| 6 个月 | 重构历时 |
| 40+ 页面 | 重构页面数 |
| 28 个工具 | 豹豹助手 Agent 工具数 |
| 5 轮 | ReAct 最大循环轮数 |
| 50+ 名业务用户 | RPA 服务规模 |
| 100+ 名报表使用者 | RPA 间接覆盖 |
| 8 小时 | RPA 日均满负荷运行 |
| 90% | RAG 自测准确率（含手册外负样本） |
| 1400 小时 | RPA 年替代人工 |
| 1024 维 | BGE embedding 维度 |
| 320+ 篇 | 知识库会话笔记数 |

## 附录 B：四方向定位

| 方向 | key | 职位定位 | 侧重 |
|---|---|---|---|
| AI | ai | AI 应用开发工程师 | AI 落地、Agent、RAG |
| 全栈 | fullstack | 全栈开发工程师 | .NET→Java 重构、全栈、高可用 |
| ERP | erp | ERP 实施顾问 | Next ERP、SD/MM、跨境三地 |
| 项目管理 | pm | 技术项目经理 | 重构项目负责人、ERP 项目经理、多业务线并行 |

> 四方向各自的 title / summary / advantages / featuredProject 在下游 resume.json.versions 中细化；本文件只定方向定位，不定每方向的具体文案（文案派生时可调整，但事实与数字必须与本文件一致）。
