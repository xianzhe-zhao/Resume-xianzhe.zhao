# 2026-11-24 单版本化（仅留 /ai）+ HR 视角内容打磨 — spec 契约

> spec-first：编码前签约，编码后任何需求变更先改 spec 再改代码与测试。
> 签约/验收分别只认只含「签约」「验收」两个字的用户消息。
> 基线：feature/interest-images-ai-tools @ 16c6a53（v1.8.2）+ 上一轮 v1.8.3 未提交改动。

## 1. 背景与需求澄清记录

### 1.1 背景
用户 2026-11-24 提出两项需求：①只保留 /ai 版本，砍掉 it/test/erp 三个版本；②以 HR 视角对 /ai 页面做内容补充优化。经 HR 视角通读 /ai 全页，发现 3 处数据打架硬伤 + 4 处文案优化点。

### 1.2 需求澄清记录

| # | 需求 | 处理 |
|---|------|------|
| 1 | 只保留 /ai，砍掉 it/test/erp | server.js VERSIONS 改为 ['ai']；旧 URL /it /test /erp 302 重定向到 /ai；resume.json 删 versions.it/test/erp + en.versions.it/test/erp |
| 2 | /admin 后面再优化 | 本轮不动 admin（保留现状） |
| 3 | HR：stats 项目数 3→4 | stats 第 4 项「3 个」改「4 个」 |
| 4 | HR：summary 与 advantage 功能数不一致 | summary 写 6 功能（含实时协作文档），advantage 第一条也对齐 6 功能 |
| 5 | HR：荣誉重复 | experience ERP 项目的「荣誉」item 改为别的业绩；honors 区保留 SDSC 奖 |
| 6 | HR：summary 太长 | 拆短，突出「AI Native + 9 年 + AWS 认证 + 4 个独立项目」主干 |
| 7 | HR：「在家开发」措辞 | summary 与豹豹助手 desc 的「在家」改为「独立开发并部署上线」 |
| 8 | HR：缺求职目标感 | summary 开场加一句点明「希望以 AI 应用开发为目标」 |
| 9 | HR：AiPro Bridge/知识库 link 空 | AiPro Bridge 填 GitHub；知识库注明「私有项目，可演示」 |

### 1.3 已确认决策

- 旧版本 URL (/it /test /erp)：**302 重定向到 /ai**（用户选）
- 旧版本数据：**删掉，只留 ai**（用户选）
- admin：本轮不动（用户明确「后面再优化」）
- 技能组「AI Agent 工具」改名「AI 编程工具」：HR 建议但用户未明确要求，本轮**不改**（避免超范围）

## 2. 方案自审

- 复用/扩展/新建：**B 扩展**——不改系统形态，收缩版本范围 + 打磨内容。server.js 收缩路由，resume.json 删数据，app.js 简化版本字典，test.py 收缩断言。
- 影响面：
  - server.js：VERSIONS 数组、路由判断（旧 URL 重定向）、validateResumeData 版本校验
  - data/resume.json：删 versions.it/test/erp + en.versions.it/test/erp；改 ai 版 summary/advantages/experience/projects/stats
  - public/app.js：VER_SHORT/VER_SHORT_EN 简化；chips/NOW_TAG 删 it/test/erp 键；stats 项目数 3→4
  - test/test.py：6 处版本断言收缩为单版本（详见 C 条款）
  - CHANGELOG.md：新增 1.9.0 条目
  - 不动：admin.*、style.css、index.html、CI/CD、配图、打印/导出、test_interest_images.py、test_resume_content.py
- 成本预算：无
- 安全增量：无新增依赖/外部输入面。旧 URL 重定向不引入新攻击面。P0 清零。

## 3. 技术蓝图

- 前端：public/app.js——版本字典简化为单 ai；stats 项目数修正
- 后端：server.js——VERSIONS=['ai']；/it /test /erp 302→/ai；validateResumeData 仍校验 versions 非空
- 数据库：data/resume.json——删 6 个版本块（zh+en 各 3）；ai 版内容打磨
- 环境依赖：无新增

## 4. 非目标

- 不做：改 admin 后台（用户明确延后）
- 不做：改技能组名「AI Agent 工具」→「AI 编程工具」（超范围）
- 不做：改教育背景（用户未要求）
- 不做：改工作经历「至今」时间线（用户未要求）
- 不做：改 test_interest_images.py / test_resume_content.py（不涉及版本断言）

## 5. 编号条款

### C1 server.js 单版本路由 + 旧 URL 重定向
- 前置条件：VERSIONS = ['ai','it','test','erp']；路由 if (VERSIONS.includes(p.slice(1))) servePublicPage
- 后置条件：VERSIONS = ['ai']；/it /test /erp 请求 302 重定向到 /ai（Location: /ai）
- 实现要点：路由处增加——若 p.slice(1) in ['it','test','erp'] 则 302；VERSIONS.includes 判断只认 ai
- 不变式：/ai 仍 200；/ 仍 302→/ai；/admin 不变；/api/data 不变

### C2 resume.json 删除 it/test/erp 版本数据（中英）
- 前置条件：versions 含 ai/it/test/erp 四键；en.versions 同
- 后置条件：versions 仅含 ai 一键；en.versions 仅含 ai 一键；其余数据不变
- 不变式：base/en.base 不变；versions.ai 不变（内容打磨在 C3-C9）

### C3 stats 项目数 3→4（中英）
- 前置条件：app.js stats 第 4 项 {num:'3 个', fact:'独立完整项目'}；en {num:'3', fact:'complete solo projects'}
- 后置条件：zh 改 {num:'4 个', fact:'独立完整项目'}；en 改 {num:'4', fact:'complete solo projects'}
- 不变式：stats 仍 4 项；与 chips/secProjectsNote 一致

### C4 ai 版 summary 重写（中英）
- 前置条件：summary 长，含「在家」「6 功能列举」「无求职目标开场」
- 后置条件：zh summary 拆短，结构为「求职目标开场 + AI Native + 9 年 + AWS 认证 + 4 个独立项目」主干，去掉「在家」，功能列举精简；en 镜像
- 不变式：仍含 AWS Certified AI Practitioner、豹豹助手、4 个项目等关键事实

### C5 advantage 第一条「AI 落地能力」功能数对齐（中英）
- 前置条件：summary 提 6 功能（含实时协作文档），advantage 第一条只列 5 功能
- 后置条件：advantage 第一条与 summary 功能数一致（统一为 6 功能：AI 对话/新闻/项目管理/日历/智能家居/实时协作文档）；en 镜像
- 不变式：AI Native 思维保留；AWS 认证保留

### C6 experience ERP 项目「荣誉」item 改为业绩（中英）
- 前置条件：experience 第 3 项目（ERP）第 4 个 item label='荣誉'，text=SDSC 优秀员工
- 后置条件：该 item label 改为「团队赋能」或类似业绩项，text 改为非荣誉的业绩描述；SDSC 奖仅在 honors 区出现一次；en 镜像
- 不变式：honors 区 SDSC 奖保留；experience 3 项目结构不变

### C7 豹豹助手 desc 去「在家」（中英）
- 前置条件：desc 含「独立在家开发并部署在个人电脑」
- 后置条件：改为「独立开发并部署上线」；en 同步去 at home
- 不变式：零 CDN/离线可运行等技术卖点保留

### C8 AiPro Bridge 与知识库 link 补全
- 前置条件：AiPro Bridge link=''；知识库 link=''
- 后置条件：AiPro Bridge link 填 GitHub（若有）；知识库 link 保持''但 desc 注明「私有项目，可演示」
- 不变式：其余项目 link 不变

### C9 app.js 版本字典简化
- 前置条件：VER_SHORT={ai,it,test,erp}；VER_SHORT_EN 同；chips/nowTag 含 it/test/erp 键
- 后置条件：VER_SHORT={ai:'AI'}；VER_SHORT_EN={ai:'AI'}；chips/nowTag 删 it/test/erp 键（仅留 ai）
- 不变式：渲染逻辑 ui.chips[R.versionKey]||ui.chips.ai 兜底不变

### C10 test.py 版本断言收缩为单版本
- 后置条件（6 处）：
  - L120-125 循环 for v in [...] 改为仅 ['ai']
  - L136 「含4个版本」改为「含1个版本(ai)」：set(keys)=={'ai'}
  - L267-268 「四版本职位互不相同」改为「ai 版职位存在」
  - L385 en versions keys 改为 {'ai'}
  - L494-495 「4 版本各有 advantages」改为「ai 版 advantages 4 条」
  - L607-609 循环改为仅 ['ai']；并新增「/it /test /erp 302 重定向到 /ai」断言
- 不变式：其余断言不变；test_interest_images.py / test_resume_content.py 不改

## 6. 验收清单

- [ ] A1 /ai 正常 200 渲染
- [ ] A2 /it /test /erp 302 重定向到 /ai
- [ ] A3 / 302 到 /ai
- [ ] A4 /admin 不受影响
- [ ] A5 resume.json versions 仅含 ai（中英）
- [ ] A6 stats 项目数显示 4 个
- [ ] A7 summary 拆短、含求职目标开场、无「在家」
- [ ] A8 advantage 第一条与 summary 功能数一致
- [ ] A9 experience ERP 项目无「荣誉」item（SDSC 仅 honors 区一次）
- [ ] A10 豹豹助手 desc 无「在家」
- [ ] A11 AiPro Bridge/知识库 link 处理妥当
- [ ] A12 测试全绿：test.py + test_interest_images.py + test_resume_content.py

## 7. 边界与异常

| 场景 | 行为 |
|------|------|
| 访问 /it /test /erp | 302 重定向 /ai |
| 访问未知路径 /xxx | 既有 404 |
| resume.json versions 为空 | validateResumeData 拒绝（既有） |
| en.versions 缺某键 | 既有兜底 |

## 8. 三问完整性检查

- [x] ① 取值范围：版本键固定枚举 ['ai']；旧 URL 固定重定向目标 /ai
- [x] ② 存储/传输：resume.json 删数据；HTTP 302 重定向无 body
- [x] ③ 生成逻辑：server 路由判断；app.js 按 versionKey 取 chips/nowTag（兜底 ai）

## 9. 版本管理

- 当前 v1.8.3（未提交）→ 目标 **v1.9.0**（minor：版本结构收缩 + 内容打磨，非纯 patch）
- CHANGELOG.md 新增 [1.9.0] - 2026-11-24 条目

## 10. 核销表

| 条款 | 测试用例 | 路径 | 状态 |
|------|---------|------|------|
| C1 | test.py /ai 200 + /it /test /erp 302 | test/test.py | ⏳ |
| C2 | test.py versions keys=={'ai'} | test/test.py L136 | ⏳ |
| C3 | test.py stats 项目数 | test/test.py | ⏳ |
| C4-C8 | test_resume_content.py ai 版内容断言 | test/test_resume_content.py | ⏳ |
| C9 | test.py app.js 版本字典 | test/test.py | ⏳ |
| C10 | test.py 全套版本断言 | test/test.py | ⏳ |
| 全套 | test.py + test_interest_images.py + test_resume_content.py PASS | 三个测试文件 | ⏳ |
