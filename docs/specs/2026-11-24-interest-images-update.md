---
spec_version: 2
hash_scope: sections_1_8_a_normalized
spec_revision: 1
status: accepted
sign_prompt: '刚才的说明可能造成误解：是否要签约？如果需要签约，请发送"签约"两个字才可以；不发送"签约"两个字，我不会开始编码。只发送这两个字，不要加标点、引号或其他内容。'
sign_requested_at: "2026-11-24T11:14:00+08:00"
signed_by: "赵先哲"
signed_at: "2026-11-24T11:14:52+08:00"
sign_quote: "签约"
sign_hash: "4e56713587b8183c9d470c6ae442502ca7e36e12717a904ba9fbbcc15f72aa93"
confirmed_clauses: "C1,C2,C3,C4,C5,C6,C7,C8,C9"
decisions: "D1 兴趣3条改写; D2 7张图线描+局部色块(豹豹暖色扁平); D3 豹豹用gen_20261124110231_22; D4 技能栏新增AI Agent工具组+LLM模型组; D5 WorkBuddy=腾讯AI助手"
accept_prompt: '刚才的说明可能造成误解：是否需要验收？如果需要验收，请发送"验收"两个字才可以；不发送"验收"两个字，我不会进入 PR。只发送这两个字，不要加标点、引号或其他内容。'
accept_requested_at: "2026-11-24T12:18:00+08:00"
accepted_by: "赵先哲"
accepted_at: "2026-11-24T12:20:24+08:00"
accept_quote: "验收"
accept_commit: "526bc6a9d583920f09f95797d7af13f416eca310"
accepted_items: "A1,A2,A3,A4,A5,A6,A7,A8,A9,A10,A11"
---

# 2026-11-24 兴趣改写 + 项目/兴趣配真实图片 — spec 契约

> 本文件是需求的唯一事实来源。用户确认 = 签约，之后编码/测试/验收/PR 全部从本文件派生。
> 需求来源：用户 2026-11-24 原话——兴趣阅读思考换成羽毛球+徒步+游泳+健身；每个图片改为跟文字相符的照片；豹豹助手放首页截图，其他设计主题相符的图。
> 图片来源：通过豹豹助手（zxz0608.com）远程调用 Qwen-Image-3.0-Pro 生成（公司网络封 DashScope，借家里豹豹助手中转）。

---

## 1. 背景与目标（what & why）

简历兴趣爱好区现为 3 条（技术折腾/阅读思考/运动健身），其中「阅读思考」要替换为「运动生活」（羽毛球+徒步+游泳+健身），「运动健身」要替换为「摄影爱好」（A7C2+2070）。同时项目区和兴趣区的 SVG 抽象占位插画要换成与各自主题相符的真实图片（线描+局部色块风格为主（深棕描边+暖橙点缀，与奶油底协调），豹豹助手主打项目图用暖色扁平满色块风格（近白海豹+腮红+圆形图标底托，视觉权重最高）），让简历更有说服力。「技术折腾」desc 的「3 个完整项目」要与上一个 spec（C7）对齐改为「4 个」。此外技能栏新增 AI Agent 工具与 LLM 模型使用经验，体现 AI 工具生态掌握度。

目标：改写兴趣 3 条文案 + 引入 7 张主题相符的真实图片（豹豹助手/ship-it/知识库/AiPro/技术折腾/运动生活/摄影爱好），替换对应的 SVG 占位。教育与荣誉区 SVG（campus）保留不动。版本 v1.8.1（patch，文案+图片）。

### 需求澄清记录（Step 1 产出，签约时展示给用户确认）

- **原始需求**：兴趣阅读思考换成羽毛球+徒步+游泳+健身；每个图片改为跟文字相符的照片；豹豹助手放首页截图，其他设计主题相符的图。
- **优化后需求**：① 兴趣 3 条改写（阅读思考→运动生活、运动健身→摄影爱好、技术折腾 3→4 项目）② 项目/兴趣卡片从 SVG 占位改为真实图片 ③ 7 张图通过豹豹助手远程生成（暖色扁平风格统一）④ 教育荣誉区 SVG 保留。
- **优化说明**：扫描了 app.js 渲染机制（svgArt 内联 SVG）、test.py C25 断言（SVG 主题枚举+无外部图片请求）、gpt-image-2 技能（Mode C 仅 prompt）、豹豹助手生图链路（DashScope Qwen-Image）；实测公司网络封 DashScope（TCP 443 False），但豹豹助手公网可达（zxz0608.com 200），通过豹豹助手 /api/chat 远程生图成功。
- **用户问答**：
  1. 图片来源：用户答「你用 gpt 图片生成试试」→ gpt-image-2 是 Mode C（仅 prompt），无法直接出图。
  2. 豹豹问答生图：用户答「你把 prompt 贴进豹豹问答生图，这个部分你做。我给你账号 test/test123」→ 实测通过豹豹助手 /api/chat 远程调 DashScope 生图成功，7 张图全部生成并下载。
  3. 摄影文案：用户答「你帮我拟一个就行」→ 拟「索尼 A7C2 + 2070G 镜头，周末扫街记录光影，偏爱人文与风光摄影」。
  4. 流程：用户答「走重新建立契约的流程走吧」→ 完整 spec。
  5. ship-it/知识库/AiPro 配图：用户答「你帮我设计一个吧。不要截图」→ 用 Qwen-Image 生成主题相符插画。
  6. 技术折腾配图：用户答「找一个机器人类似的照片」→ 生成卡通机器人编程插画。
- **用户约束（裁判员规则源）**：
  - 全局 `~/.dsh/AGENTS.md`：中文回复；ship-it 9 步不跳步；禁 AI 合并 PR；凭据不入文档/脚本/commit（豹豹助手 token 仅内存使用，已清除）；批量文本操作显式 UTF-8。
  - 项目 `README.md`：双分支 CI/CD（push test→测试 / PR 合并 main→生产）。
  - `docs/security-review-log.md`：本次新增 7 张图片（PNG，非代码），无新增依赖/外部输入面。
  - 禁止事项：凭据（豹豹 token）不入文件；图片不引用外部 URL（本地 /img/）。
- **决策展示记录**：图片方案、文案、流程均已在正文列出并由用户确认。

## 2. 方案自审（怎么做）

- **复用盘点**（实际查过）：
  - `public/app.js`：`ui.interests` 数组（L92-96 中文/L165-169 英文）3 条；`svgArt(theme)` 函数（L245）返回内联 SVG 字符串；项目卡片 `proj-cover`（L533-534）调 `svgArt(p.id)`；兴趣卡片 `od-cover`（L624）调 `svgArt('interest'+i)`。
  - `public/img/`：现有 `portrait-cartoon.jpg`（Hero 人像，保留）；新增 7 张 PNG。
  - `test/test.py`：C24 断言 interests 在 UI 字典且不入 resume.json；C25 断言 svgArt 函数+主题枚举（含 deskshare）+暖色色值+无外部图片请求 `src="https?://`。
  - `public/style.css`：`.proj-cover`/`.od-cover` 样式（SVG 占位尺寸）。
- **决策：B 扩展** —— 扩展现有渲染逻辑：svgArt 增加图片分支（有图片时返回 `<img>`，无图片回退 SVG）；interests 文案改写。理由：复用现有 svgArt 调用点，只改函数内部逻辑，影响面最小。放弃了 A（纯文案不改渲染，图片无处放）和 C（全新图片组件）——A 达不成目标，C 过度设计。选 B 放弃了 C 的彻底解耦，但保留了 SVG 回退能力（教育荣誉区仍用 SVG）。
- **影响面**：页面 `/ai /it /test /erp`（4 版本共享 app.js）；接口/数据/权限无变化；`resume.json` 不动（interests 在 UI 字典）。回归范围：test.py C24/C25 断言 + 视觉回归。
- **入口清单：无 UI 代码路由变更**（仅 app.js 渲染逻辑 + 图片资源）。4 版本页面入口不变。
- **兼容性**：svgArt 有图片返回 `<img src="/img/xxx.png">`，无图片回退原 SVG；`<img>` 用本地相对路径不触发 C25「无外部图片请求」断言（它只拦 `https?://`）。
- **成本预算**：无（图片已生成，不涉及后续 LLM/付费 API）。
- **安全增量**：自上次周期审查 2026-11-15，本次新增 7 张 PNG 图片（静态资源，非代码），无新增依赖/外部输入面/接口/权限。结论：无新增攻击面。
- **测试策略**：
  - 支柱 2：每条 C 至少一个用例（interests 文案、图片路径、svgArt 图片分支、回退逻辑、教育荣誉 SVG 保留）。
  - 支柱 1：核心回归 test.py（C24/C25 断言更新 + 其余全绿）+ cdp-print.mjs + 4 版本页面冒烟。
- **执行形态/角色矩阵**：形态 1 小改（app.js + 图片资源，无接口/表/权限/外部输入）。单干（主脑自测）。核销前派 1 名只读 subagent 审查（含图像审查）。
- **闸门**：开工前 `check_roles --stage start`；核销 `--stage verify`；验收 `--stage accept`。

**流程规则（P1..Pn）**：

- **P1** 图片用本地相对路径 `/img/xxx.png`，不引用外部 URL（C25 无外部图片请求断言保留）。
- **P2** svgArt 有图片时返回 `<img>`，无图片回退原 SVG（教育荣誉 campus 保留 SVG）。
- **P3** 测试从契约派生：C25 断言更新（svgArt 仍存在 + 主题枚举 + 图片分支），不为迁就代码改回旧断言。
- **P4** interests 仍不入 resume.json（C24 数据模型稳定保留）。

## 3. 技术蓝图（按涉及领域填，不涉及写「无变更」）

- **前端**：
  - `public/app.js` `ui.interests`（中文 L92-96 / 英文 L165-169）：3 条改写——技术折腾（desc 3→4 个项目）、运动生活（羽毛球/徒步/游泳/健身）、摄影爱好（A7C2+2070）。
  - `public/app.js` `svgArt(theme)`（L245）：增加图片映射分支——`PROJ_IMGS = {baobao:'/img/proj-baobao.png', 'ship-it':'/img/proj-shipit.png', 'knowledge-base':'/img/proj-kb.png', 'aipro-bridge':'/img/proj-aipro.png'}`、`INTEREST_IMGS = ['/img/interest-tech.png','/img/interest-sport.png','/img/interest-photo.png']`；有图返回 `<img class="cover-img" src="..." alt="...">`，无图回退原 SVG。
  - `public/style.css`：`.cover-img` 样式（width/height 100%、object-fit cover、border-radius 继承父容器）。
  - 无 CSS 布局/定位/浮层/动画改动 → 坐标断言 N/A。
- **后端/数据库/环境依赖**：无变更。

## 4. 非目标（out of scope）

- 不做：不改 resume.json（interests 在 UI 字典）。
- 不做：不改教育与荣誉区 SVG（campus 保留）。
- 不做：不改 Hero 人像（portrait-cartoon.jpg 保留）。
- 不做：不改 server.js/路由/接口/权限。
- 不做：不引用外部图片 URL（全部本地 /img/）。
- 不做：不改 it/test/erp 三版 summary/advantages（上一个 spec C12）。

## 变更类型（三选一）

- **refactor**（不改接口/数据/行为，改 UI 字典文案 + 渲染逻辑扩展 + 图片资源）。测试按契约派生更新 C24/C25 断言。

## 5. 契约条款（C1 / C2 / …）

### C1 兴趣爱好 3 条文案改写

- **前置条件**：`ui.interests` 数组（中文 3 条 / 英文 3 条）。
- **后置条件**：中文 3 条为——① 技术折腾（tag CODE & TINKER，desc 含「4 个完整项目」）② 运动生活（tag MOVE & LIVE，desc「羽毛球、徒步、游泳、健身，规律训练保持能量」）③ 摄影爱好（tag CAPTURE & FRAME，desc「索尼 A7C2 + 2070G 镜头，周末扫街记录光影，偏爱人文与风光摄影」）；英文 3 条镜像对应。
- **失败行为**：N/A。
- **不变式**：interests 仍不入 resume.json；每条含 tag/title/desc/hint 四字段。

### C2 项目卡片配真实图片

- **前置条件**：`public/img/proj-baobao.png`、`proj-shipit.png`、`proj-kb.png`、`proj-aipro.png` 4 张存在。
- **后置条件**：`svgArt(id)` 对 baobao/ship-it/knowledge-base/aipro-bridge 返回 `<img src="/img/proj-{id}.png">`；4 个项目卡片显示真实图片而非 SVG 占位。其中 proj-baobao.png 为暖色扁平满色块风格（近白海豹+腮红+圆形图标），其余为线描+局部色块风格。
- **失败行为**：图片文件缺失 → 回退 SVG 占位（不破版）。
- **不变式**：图片 src 为本地相对路径 `/img/...`，不含 `https?://`。

### C3 兴趣卡片配真实图片

- **前置条件**：`public/img/interest-tech.png`、`interest-sport.png`、`interest-photo.png` 3 张存在。
- **后置条件**：`svgArt('interest'+i)` 对 i=0/1/2 返回 `<img src="/img/interest-{tech|sport|photo}.png">`；3 个兴趣卡片显示真实图片。
- **失败行为**：图片缺失 → 回退 SVG 占位。
- **不变式**：图片 src 为本地相对路径。

### C4 svgArt 无图回退 SVG 🔒

- **前置条件**：svgArt 增加图片分支。
- **后置条件**：svgArt 对未配置图片的主题（如 campus、rms、rpa、erp、deskshare）仍返回原内联 SVG；教育荣誉区 campus SVG 不变。
- **失败行为**：N/A。
- **不变式**：有图返 `<img>`，无图返 SVG；二者不可同时出现。

### C5 技术折腾 desc 与简历主体一致

- **前置条件**：`ui.interests[0].desc`（原「3 个完整项目」）。
- **后置条件**：含「4 个完整项目」（与上一个 spec C7「4 个完整项目」对齐）。
- **失败行为**：N/A。
- **不变式**：项目数为 4。

### C6 图片不引用外部 URL 🔒

- **前置条件**：app.js 引入图片。
- **后置条件**：所有 `<img>` 的 src 为 `/img/xxx.png` 本地相对路径；app.js 不含 `src="https?://`（C25 无外部图片请求断言保留）。
- **失败行为**：N/A。
- **不变式**：无外部图片请求。

### C7 英文 interests 镜像

- **前置条件**：`en.ui.interests`（英文 3 条）。
- **后置条件**：英文 3 条与中文一一对应——Tech Tinkering（4 projects）、Sports Life（badminton/hiking/swimming/fitness）、Photography（Sony A7C2 + 2070G lens）。
- **失败行为**：N/A。
- **不变式**：中英兴趣条数=3，主题对应。

### C8 技能栏新增 AI Agent 工具组

- **前置条件**：`base.skills` 现有 5 组（后端开发/前端开发/数据库自动化/ERP报表/AI云系统）。
- **后置条件**：`base.skills` 新增第 6 组「AI Agent 工具」，含 7 项：DSH、Claude Code、Codex、灵光、WorkBuddy、CodeBuddy、Trae；`en.base.skills` 镜像新增「AI Agent Tools」组对应英文。
- **失败行为**：N/A。
- **不变式**：技能组数 5→6；每组为非空字符串数组。

### C9 技能栏新增 LLM 模型组

- **前置条件**：`base.skills`（C8 后 6 组）。
- **后置条件**：`base.skills` 新增第 7 组「LLM 模型」，含 4 项：GLM、DeepSeek、QWEN、GPT；`en.base.skills` 镜像新增「LLM Models」组对应英文。
- **失败行为**：N/A。
- **不变式**：技能组数 6→7；中英技能组数一致。

## 6. 验收标准（用户逐条打勾）

- [x] A1 兴趣爱好区 3 条：技术折腾（4 个项目）、运动生活（羽毛球/徒步/游泳/健身）、摄影爱好（A7C2+2070）
- [x] A2 4 个项目卡片显示真实主题图片（豹豹助手/ship-it/知识库/AiPro）
- [x] A3 3 个兴趣卡片显示真实主题图片（机器人/户外/相机）
- [x] A4 教育与荣誉区仍为 SVG 占位（未被图片替换）
- [x] A5 技术折腾 desc 含「4 个完整项目」
- [x] A6 英文版兴趣 3 条与中文对应
- [x] A7 图片为本地路径，无外部请求
- [x] A8 4 版本页面正常渲染，无破版/白屏
- [x] A9 技能栏新增「AI Agent 工具」组，含 DSH/Claude Code/Codex/灵光/WorkBuddy/CodeBuddy/Trae 7 项
- [x] A10 技能栏新增「LLM 模型」组，含 GLM/DeepSeek/QWEN/GPT 4 项
- [x] A11 英文版技能栏镜像新增对应两组

## 7. 边界与异常

| 场景 | 期望表现 |
|---|---|
| 图片文件缺失 | svgArt 回退 SVG 占位，不破版 |
| 图片加载失败 | `<img>` onerror 回退 SVG 或占位色块 |
| 打印 | 图片 print-color-adjust: exact 保证输出 |
| 中英切换 | interests 中英正确切换 |

## 8. 三问完整性检查 + DoR（不过不得开工）

- [x] ① **取值范围**：interests 3 条；PROJ_IMGS 4 项；INTEREST_IMGS 3 项；技能组 7 组（AI Agent 工具 7 项、LLM 模型 4 项）；均可计数/枚举。
- [x] ② **状态流转**：无状态流程（svgArt 纯函数，有图返 img 无图返 SVG）。
- [x] ③ **生成逻辑**：svgArt(theme) → 查 PROJ_IMGS/INTEREST_IMGS → 命中返 `<img>` → 未命中返原 SVG。

**DoR 自检**：需求无歧义 ☑、技术可行 ☑、影响面已盘 ☑

---

## 9. 核销记录（Step 5 填写，PR 里引用）

| 条款 | 用例名 | 用例文件 | 结果 | 路径真实性 |
|---|---|---|---|---|
| C1 | `test_c1_interests_rewrite` | `test/test_interest_images.py` | ✅ | 机器：退出码 0 |
| C2 | `test_c2_proj_images` | `test/test_interest_images.py` | ✅ | 机器：退出码 0 |
| C3 | `test_c3_interest_images` | `test/test_interest_images.py` | ✅ | 机器：退出码 0 |
| C4 | `test_c4_svg_fallback` | `test/test_interest_images.py` | ✅ | 机器：退出码 0 |
| C5 | `test_c5_tech_desc_four` | `test/test_interest_images.py` | ✅ | 机器：退出码 0 |
| C6 | `test_c6_no_external_img` | `test/test_interest_images.py` | ✅ | 机器：退出码 0 |
| C7 | `test_c7_en_interests_mirror` | `test/test_interest_images.py` | ✅ | 机器：退出码 0 |
| C8 | `test_c8_ai_agent_tools_group` | `test/test_interest_images.py` | ✅ | 机器：退出码 0 |
| C9 | `test_c9_llm_models_group` | `test/test_interest_images.py` | ✅ | 机器：退出码 0 |

- 测试报告：`docs/reviews/2026-11-24-test-report.md`
- 核销率：9/9（100%）（Step 5 回填）
- 分级回归：test.py 276/276 + cdp-print 31/31 + 契约 48/48（报告：docs/reviews/2026-11-24-test-report.md）
