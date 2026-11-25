# 2026-11-24 技能栈补齐 + CodeBuddy 移除 + 占位文案精简 — spec 契约

> spec-first：编码前签约，编码后任何需求变更先改 spec 再改代码与测试。
> 签约/验收分别只认只含「签约」「验收」两个字的用户消息。
> 基线分支：feature/interest-images-ai-tools @ 16c6a53（v1.8.2）。

## 1. 背景与需求澄清记录

### 1.1 背景
用户 2026-11-24 提出 7 条简历内容调整需求。经核查，其中 5 条（兴趣改写、配图、AI 工具/LLM 两组、项目重组）已在 feature 分支 v1.8.0–1.8.2 完成；本次是在该成果上继续补齐与精简。CodeBuddy 存在于该分支的 6 处（resume.json 中英、app.js 图标、test_interest_images.py 断言、spec、CHANGELOG），用户明确要求移除该单项标签，但保留 AI Agent 工具组本身（剩余 6 项）。

### 1.2 需求澄清记录（7 条原话 + 处理）

| # | 用户原话 | 处理 | 状态 |
|---|---------|------|------|
| 1 | 后端缺少 python，还有 C++ | 后端开发组补 Python、C++ | 待做 |
| 2 | 前端是不是还是好一些内容比如豹豹文档的前端的 tiptip | 前端开发组补 TipTap（Deskshare 项目实证） | 待做 |
| 3 | 数据库/自动化 加上 Mysql，还有 Python 自动化 | 数据库/自动化组补 MySQL、Python 自动化 | 待做 |
| 4 | ERP 中加上 SAP GUI ERP WEB GUI 还有关于结构的 Json 内容不知道放哪里。算是一种接口API | ERP/报表组补 SAP GUI、ERP WEB GUI；JSON 并入后端开发组（与 REST API、JWT 同列） | 待做 |
| 5 | CodeBuddy 这个去掉 | AI Agent 工具组移除 CodeBuddy 单项（组保留，剩 6 项）；同步移除 app.js 图标定义与测试断言 | 待做 |
| 6 | 占位内容，后续可替换。这个部分取消掉，「工作之外，也在认真生活。」就好了 | secOffDutyNote 去掉占位后缀，只留前半句（中英双语） | 待做 |
| 7 | 后续可替换 / 增加图片 这些个文字也取消掉 | interests 卡片 hint 字段移除 + 渲染改条件判断（中英双语） | 待做 |

### 1.3 已确认决策

- AI Agent 工具组保留：用户 2026-11-24 明确「AI Agent 工具当然要留着，我只是想消除掉一个 CodeBuddy 这个标签罢了」。移除后该组剩 6 项：DSH / Claude Code / Codex / 灵光 / WorkBuddy / Trae。
- LLM 模型组保留：用户未提及移除，维持 4 项（GLM/DeepSeek/QWEN/GPT）。
- JSON 归类：用户称「算是一种接口/API」。并入后端开发组（与 REST API、JWT 同列，作为接口/数据交换格式），不新增分组。
- 技能组数维持 7：不新增不删除分组，仅在各组内增删单项。既有 C22「技能组数 = 7」断言保持 PASS。

## 2. 方案自审

- 复用/扩展/新建：B 扩展——不改系统形态（纯 Node + vanilla JS + JSON 文件存储），只扩展现有数据字段（resume.json skills 数组增删项）与现有 UI 字典（app.js 文案精简 + 图标删除）。不新增文件、不新增分组、不新增依赖。
- 影响面：
  - data/resume.json：base.skills 4 组追加技能项 + AI Agent 工具组删 CodeBuddy；en.base.skills 镜像同步
  - public/app.js：UI 字典 zh/en 的 secOffDutyNote 精简 + interests[].hint 字段移除 + off-duty 渲染第 655 行改条件判断 + ICONS 删除 CodeBuddy 图标定义
  - test/test_interest_images.py：C8 断言由 7 项改 6 项 + 列表去掉 CodeBuddy
  - CHANGELOG.md：新增 1.8.3 条目
  - 不动：server.js、style.css、index.html、admin.*、CI/CD、打印/导出、配图、test.py、test_resume_content.py
- 成本预算：无（无 LLM/付费 API/新依赖；纯静态内容编辑）
- 安全增量：无新增依赖、无新外部输入面——自上次审查无新增攻击面。P0 清零。

## 3. 技术蓝图

- 前端：public/app.js（vanilla JS）——UI 字典 zh/en 文案精简 + off-duty 渲染 if (it.hint) 条件判断 + ICONS 删 CodeBuddy 键；public/style.css 不动（.od-hint 样式保留，空时不渲染）
- 后端：server.js 不动（API 契约不变）
- 数据库：data/resume.json（JSON 文件存储）——base.skills / en.base.skills 4 组追加项 + AI Agent 工具组删 1 项，结构不变（仍 7 组）
- 环境依赖：无新增（零依赖约束成立）

## 4. 非目标

- 不做：新增/删除技能分组（保持 7 组）
- 不做：移除 AI Agent 工具组或 LLM 模型组（用户明确保留）
- 不做：把兴趣爱好做成 resume.json 数据字段（仍留在 app.js UI 字典）
- 不做：修改配图、SVG 主题插画、数据压图、打印/导出逻辑
- 不做：触碰 admin 后台、CI/CD、server.js、test.py、test_resume_content.py
- 不做：删除 .od-hint CSS 类（保留以备未来复用，仅运行时不渲染空 hint）

## 5. 编号条款

### C1 后端开发组补 Python、C++、JSON（中英双语）
- 前置条件：resume.json base.skills["后端开发"] 现为 ["Java","ASP.Net","ABAP","REST API","JWT"]（5 项）
- 后置条件：改为 ["Java","ASP.Net","ABAP","Python","C++","REST API","JSON","JWT"]（8 项，编程语言在前、接口/数据格式居中、鉴权在后）；en.base.skills["Backend"] 同步改为相同 8 项
- 不变式：组名不变（后端开发 / Backend）；仍为 7 组之一

### C2 前端开发组补 TipTap（中英双语）
- 前置条件：base.skills["前端开发"] 现为 ["Vue.js","JavaScript","小程序"]（3 项）
- 后置条件：改为 ["Vue.js","JavaScript","小程序","TipTap"]（4 项）；en.base.skills["Frontend"] 改为 ["Vue.js","JavaScript","Mini Programs","TipTap"]
- 不变式：组名不变（前端开发 / Frontend）

### C3 数据库/自动化组补 MySQL、Python 自动化（中英双语）
- 前置条件：base.skills["数据库 / 自动化"] 现为 ["PostgreSQL","Brity Works RPA"]（2 项）
- 后置条件：改为 ["PostgreSQL","MySQL","Brity Works RPA","Python 自动化"]（4 项）；en.base.skills["Database / Automation"] 改为 ["PostgreSQL","MySQL","Brity Works RPA","Python Automation"]
- 不变式：组名不变（数据库 / 自动化 / Database / Automation）

### C4 ERP/报表组补 SAP GUI、ERP WEB GUI（中英双语）
- 前置条件：base.skills["ERP / 报表"] 现为 ["SAP Hybris","Next ERP","Crystal Reports"]（3 项）
- 后置条件：改为 ["SAP Hybris","SAP GUI","ERP WEB GUI","Next ERP","Crystal Reports"]（5 项）；en.base.skills["ERP / Reporting"] 同步（均为专有名词，中英一致）
- 不变式：组名不变（ERP / 报表 / ERP / Reporting）

### C5 AI Agent 工具组移除 CodeBuddy（中英双语）
- 前置条件：base.skills["AI Agent 工具"] 现为 ["DSH","Claude Code","Codex","灵光","WorkBuddy","CodeBuddy","Trae"]（7 项）；en.base.skills["AI Agent Tools"] 现为 ["DSH","Claude Code","Codex","LingGuang","WorkBuddy","CodeBuddy","Trae"]（7 项）
- 后置条件：zh 改为 ["DSH","Claude Code","Codex","灵光","WorkBuddy","Trae"]（6 项）；en 改为 ["DSH","Claude Code","Codex","LingGuang","WorkBuddy","Trae"]（6 项）
- 不变式：组名不变（AI Agent 工具 / AI Agent Tools）；组保留；其余 6 项顺序不变

### C6 AI/云/系统组与 LLM 模型组不变 + 技能组数仍为 7
- 后置条件：base.skills["AI / 云 / 系统"] 维持 6 项不变；base.skills["LLM 模型"] 维持 4 项不变；两组 skills 对象长度仍为 7
- 不变式：既有 test.py C22「技能组数 = 7」、test_interest_images.py C8「技能组数=7」、C9「en 技能组数=7」全部保持 PASS

### C7 secOffDutyNote 去掉占位后缀（中英双语）
- 前置条件：app.js UI 字典 zh secOffDutyNote 现为 "工作之外，也在认真生活。占位内容，后续可替换。"；en 为 "Life beyond work. Placeholder content — replaceable later."
- 后置条件：zh 改为 "工作之外，也在认真生活。"；en 改为 "Life beyond work."
- 不变式：secHead() 渲染调用不变（第 644 行）；副标题仍传入 secHead

### C8 interests 卡片 hint 文案移除 + 渲染条件判断（中英双语）
- 前置条件：app.js UI 字典 zh interests[0..2].hint 现为 "后续可替换 / 增加图片 /"；en 为 "replaceable / add images later /"；第 655 行无条件渲染 <span class="od-hint">
- 后置条件：zh/en 的 3 条 interests 对象移除 hint 字段（仅保留 tag/title/desc）；第 655 行改为 if (it.hint) s += '<span class="od-hint">' + esc(it.hint) + '</span>';
- 不变式：interests 数组仍在 UI 字典（不入 resume.json）；.od-hint CSS 类保留；tag/title/desc 渲染不变；interests 内容（技术折腾/运动生活/摄影爱好）不变

### C9 app.js ICONS 删除 CodeBuddy 图标定义
- 前置条件：app.js 第 233 行 'CodeBuddy': '<rect x="4" y="6" .../>'
- 后置条件：删除该行；ICONS 对象不再含 CodeBuddy 键
- 不变式：WorkBuddy（第 232 行）及其它图标不变；图标渲染对缺失键既有兜底（不会因删键报错）

### C10 测试同步 + 核心回归不修坏
- 后置条件：
  - test/test_interest_images.py 第 88 行断言由「7 项」改「6 项」：check("C8 AI Agent 工具 6 项", len(ai_tools) == 6, ...)
  - 第 89 行列表去掉 "CodeBuddy"：for t in ["DSH", "Claude Code", "Codex", "灵光", "WorkBuddy", "Trae"]:
  - 既有 test.py C22「技能组数=7」、test_interest_images.py C8「技能组数=7」/C9「en 技能组数=7」保持 PASS
  - 既有 test_resume_content.py C8「AI/云/系统 6 项」保持 PASS（本次不动该组）
  - test.py / test_resume_content.py / cdp-* 测试全部保持 PASS（本次不改其断言）
- 不变式：测试从契约派生（非从代码派生）；核销表每条 ✅ 须有用例名 + 路径真实性

## 6. 验收清单

- [x] A1 后端开发：含 Java/ASP.Net/ABAP/Python/C++/REST API/JSON/JWT（中英双语，8 项）
- [x] A2 前端开发：含 Vue.js/JavaScript/小程序/TipTap（中英双语，4 项）
- [x] A3 数据库/自动化：含 PostgreSQL/MySQL/Brity Works RPA/Python 自动化（中英双语，4 项）
- [x] A4 ERP/报表：含 SAP Hybris/SAP GUI/ERP WEB GUI/Next ERP/Crystal Reports（中英双语，5 项）
- [x] A5 AI Agent 工具：含 DSH/Claude Code/Codex/灵光/WorkBuddy/Trae（6 项，无 CodeBuddy，中英双语）
- [x] A6 AI/云/系统 + LLM 模型：不变（6 项 + 4 项）；技能组数仍为 7
- [x] A7 兴趣爱好区副标题：「工作之外，也在认真生活。」/「Life beyond work.」（无占位后缀）
- [x] A8 兴趣爱好卡片：无「后续可替换 / 增加图片」提示文字（中英双语）
- [x] A9 app.js 图标：无 CodeBuddy 图标定义
- [x] A10 页面渲染：4 个版本（ai/it/test/erp）× 中英双语均正常显示新技能栈，无布局错乱、无 JS 报错
- [x] A11 测试全绿：test.py + test_interest_images.py + test_resume_content.py + cdp-print 全部 PASS

## 7. 边界与异常

| 场景 | 行为 |
|------|------|
| skills 数组某项为空字符串 | 该技能徽章不渲染（既有行为，本次不引入） |
| interests 对象无 hint 字段 | <span class="od-hint"> 不渲染（C8 条件判断） |
| ICONS 缺某技能键 | 既有兜底渲染默认图标（本次删 CodeBuddy 不影响） |
| resume.json 解析失败 | 既有兜底（页面提示加载失败），本次不改变 |
| 打印/导出 HTML | 新技能栈与精简文案随产物正常输出 |

## 8. 三问完整性检查

- [x] ① 取值范围：技能项为前端硬编码枚举数组（无网络传输）；中英双语；7 组固定；文案为 UI 字典枚举
- [x] ② 存储/传输：resume.json 文件存储（结构不变，仅数组增删项）；app.js UI 字典前端枚举；无新 API、无新外部输入
- [x] ③ 生成逻辑：skills 由 app.js 渲染函数遍历 base.skills 对象生成徽章（既有逻辑，数组项增删不影响渲染）；off-duty 由 renderOffDuty() 遍历 ui.interests 生成卡片（hint 改条件判断）；ICONS 按 key 取图标（删键走兜底）；secHead 副标题直传

## 9. 版本管理

- 当前 v1.8.2 → 目标 v1.8.3（patch：已有内容微调——技能项增删 + 文案精简 + 单标签移除，非新功能板块）
- CHANGELOG.md 新增 [1.8.3] - 2026-11-24 条目

## 10. 核销表

| 条款 | 测试用例 | 路径 | 状态 |
|------|---------|------|------|
| C1 | test_resume_content.py 后端技能断言（新增 Python/C++/JSON 校验） | test/test_resume_content.py | ✅ |
| C2 | test_resume_content.py 前端技能断言（新增 TipTap 校验） | test/test_resume_content.py | ✅ |
| C3 | test_resume_content.py 数据库技能断言（新增 MySQL/Python 自动化） | test/test_resume_content.py | ✅ |
| C4 | test_resume_content.py ERP 技能断言（新增 SAP GUI/ERP WEB GUI） | test/test_resume_content.py | ✅ |
| C5 | test_interest_images.py C8（6 项 + 无 CodeBuddy） | test/test_interest_images.py L87-90 | ✅ |
| C6 | test.py C22 + test_interest_images.py C8/C9（组数=7） | test/test.py L522; test/test_interest_images.py L85,100 | ✅ |
| C7 | test.py secOffDutyNote 断言（无占位后缀） | test/test.py | ✅ |
| C8 | test.py interests hint 断言（无「后续可替换」） | test/test.py | ✅ |
| C9 | grep app.js 无 CodeBuddy 图标 | 手动/grep | ✅ |
| C10 | 全套测试 PASS | test/test.py + test/test_interest_images.py + test/test_resume_content.py + cdp-print.mjs | ✅ |
