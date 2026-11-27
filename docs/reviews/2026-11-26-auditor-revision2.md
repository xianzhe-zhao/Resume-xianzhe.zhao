# 监察员契约互审报告（修订 2：C20 上下边距四边 10mm）

- **角色**: 监察员
- **审查者**: auditor
- **会话标识**: auditor@2026-11-26T09:50:32+08:00
- **未参与编码声明**: 是（未参与编码）
- **未参与 spec 编写声明**: 是（未参与 spec 编写）
- **结论**: PASS（修订 2 数值四处自洽（§1/§3/C19/C20 一致）、白名单全覆盖待改文件、暂停工件与哈希链齐备、全部取值机器可测；frontmatter sign_hash 保留旧值属暂停期预期）
- **spec_revision**: 2
- **spec_hash**: 2eac50a63424f7c18a104ac434d960fe5a2db85432b353175c10e86e19eababd
- **汇总来源**: docs/specs/2026-11-25-print-fix.md、docs/reviews/2026-11-26-pause.md、tmp/spec-before-1.md

- 2026-11-26 收尾：P2 措辞修正后复确认 PASS
- 2026-11-26 最终收尾：C20 前置条件收窄后复确认 PASS

## 审查范围

契约互审·修订 2（只读 spec 与证据文件，未修改 spec）：用户验收反馈「横版的左右的宽松度是够的。但是在pdf每一页的上下还是很贴边。尤其是上边。竖版也一样。在优化一下」+ 裁定「跟左右一样吧」触发 C20 条款变更。复核点：① 暂停流程工件齐备；② 哈希链（修订 1 sign_hash ↔ 快照、当前正文哈希）；③ git diff baf9b2f..工作区 中 spec 改动仅限修订 2 条目；④ C20 新取值与 C19 页数自洽性、§1 记录与 §3/C20 一致性、白名单覆盖、可测性。

## 证据

1. python D:/project/ship-it/ship-it/scripts/check_spec.py docs/specs/2026-11-25-print-fix.md --print-sign-hash → 483917736984125e96d950e87a76cd2023e07fae743e93e26c2b4d28d0ab7a4a EXIT=0（与 lead 提供的当前正文哈希一致）
2. python D:/project/ship-it/ship-it/scripts/check_spec.py tmp/spec-before-1.md --print-sign-hash → 599c06b779534e8efdcb607570b990977a23800a550a915cf8db29e2ea138856 EXIT=0（= 修订 1 sign_hash，哈希链闭合）
3. python D:/project/ship-it/ship-it/scripts/check_roles.py --date 2026-11-26 --stage pause --spec docs/specs/2026-11-25-print-fix.md → PASS（0 错误 / 0 警告）EXIT=0
4. git diff baf9b2f --stat -- docs/specs/2026-11-25-print-fix.md → 9 insertions(+), 7 deletions(-)（16 行，逐 hunk 核对全部为修订 2 条目，无越界改动）
5. docs/specs/2026-11-25-print-fix.md:143 — C20 后置条件：margin: 10mm（横竖版同，四边）+ 上下白色过渡带 26mm（与左右完全一致）+ 上下纸边到内容 ≈29.2–36.6mm（hero 页 24px ≈32.4mm）+ 四边均可见 26mm 白色过渡带
6. docs/specs/2026-11-25-print-fix.md:136 — C19 后置条件「竖版 14 页、横版 17 页（2026-11-26 C20 边距修订后复测不变）」；docs/specs/2026-11-25-print-fix.md:145 — C20 不变式「修订后页数复测（2026-11-26 原型 CDP printToPDF）：竖版 14 / 横版 17 不变」
7. docs/specs/2026-11-25-print-fix.md:47 — §1「验收反馈与契约修订（2026-11-26）」：用户原话 + 根因（margin: 0 10mm 上下 0 → 上下仅 16mm vs 左右 30mm）+ 裁定「跟左右一样吧」+ 修订值 + 原型复测 14/17 不变
8. docs/specs/2026-11-25-print-fix.md:87 — §2 白名单新增 docs/reviews/2026-11-26-*.md（暂停记录 + C20 修订 2 审查/测试报告）
9. public/style.css:315,316,351,356,382,386,394 — section 顶 padding 实测：hero 24px / 基础 40px / 竖版 about 24px / 竖版 skills 24px / 横版 experience 12px / 横版 skills 24px / 横版 about 24px → 范围 12–40px（≈3.2–10.6mm）成立
10. docs/reviews/2026-11-26-pause.md:13-29 — 8 标签（暂停时间/触发原话/活跃成员/结束指令清单/旧契约停止/产出保留/未停住项/恢复条件）+ 结束指令清单表 + 新派发=0 + C7 字段（spec_before_revision=1 / spec_before_hash=599c06b7… / spec_before_snapshot=tmp/spec-before-1.md）
11. git diff baf9b2f --ignore-all-space --stat → start.bat 不出现（工作区 start.bat 为纯 CRLF 行尾变化：wt_crlf=51 vs 提交版 cm_crlf=0，无内容变化，未入提交）；public/app.js 与 test/test.py 的 raw 文件 diff 为运行时解包产物（P2 大文件提交模式：raw 为陈旧跟踪文件，仅 .gz 入 git）
12. 2026-11-26 收尾复验：python D:/project/ship-it/ship-it/scripts/check_spec.py docs/specs/2026-11-25-print-fix.md --print-sign-hash → 6adf2385f8b4a9c71bd303da429f7523e68ce704e096bd600f156e45aae9c897 EXIT=0；两处 P2 措辞修正对照 public/style.css:409-412（#app margin 与 4mm 内容内边距均受 html.print-* 类限定，@media print 外）与 :305（静态 @page 16mm 兜底）、:328-334（C19 基础分页规则不依赖版式类）逐项核实，措辞与实现一致
13. 2026-11-26 最终收尾复验：check_spec.py --print-sign-hash → 2eac50a63424f7c18a104ac434d960fe5a2db85432b353175c10e86e19eababd EXIT=0；C20 前置条件（docs/specs/2026-11-25-print-fix.md:142）收窄为「用户经 C13 对话框选择竖版或横版（app.js 注入 html.print-* 类与动态 @page）；直接 Ctrl+P 不适用本条（§7：仅 16mm 兜底边距生效）」，与 §7:170、C20 不变式静态 @page 兜底、style.css:401-404 注入机制一致

## 审查发现

### ① C20 新取值与 C19 页数自洽（三处互证，无矛盾）

- §1:47「原型复测页数不变：竖版 14 / 横版 17（C19 不变）」↔ C19:136「14 页、17 页（C20 边距修订后复测不变）」↔ C20 不变式:145「修订后页数复测：竖版 14 / 横版 17 不变」——三处一致；C19 失败行为 ±1 容差（:137）与 A4 验收「允许 ±1 页」（:161）口径一致
- 边距数学复核：左右 = @page 16mm + #app 10mm + 内容 4mm = 30mm（不变）；上下白色过渡带（纸边到 #app 背景）= 16+10 = 26mm，与左右过渡带 26mm 完全一致（「跟左右一样吧」的最强形式满足）；上下纸边到内容 = 26mm + section 顶 padding 3.175–10.583mm = 29.2–36.6mm（hero 页 24px = 32.35 ≈ 32.4mm）——与 style.css 实测 padding（12–40px）逐项吻合，无算术错误

### ② §1 记录与 §3/C20 一致（四处数值同一口径）

- §1:47、§3 前端①:98（margin: 0 10mm→margin: 10mm，横竖版，四边 10mm，2026-11-26 C20 修订）、C20:143、frontmatter decisions:13（#app margin 0 10mm → 10mm 四边，上下白色过渡带与左右一致 26mm，上下纸边到内容 ≈29.2–36.6mm）——四处数值与措辞一致，无互相矛盾

### ③ 白名单覆盖修订 2 全部待改文件

- 修订 2 周期待改：public/style.css（:81）、test/test.py + test.py.gz（:82-83）、test/cdp-print.mjs（:84）、本 spec（:85）、docs/reviews/2026-11-26-*.md（:87，覆盖暂停记录与本轮审查/测试报告）、CHANGELOG.md（:88）、package.json（:89）——全部在白名单内；public/app.js(.gz)（:79-80）为超集允许（修订 2 预期不改 app.js，白名单允许≠要求）

### ④ 可测性（机器锚点明确，≈ 值为文档性经验值）

- 静态锚点：test.py C20* 断言 margin: 10mm（当前断言仍为 0 10mm，修订 2 周期内随契约更新——属预期测试变更，非 spec 缺陷）
- CDP 锚点：cdp-print.mjs C20* appMargin=37.7953px（=10mm）四边相等 + C19*/C20* 页数 14/17（lead 原型复测 tmp/margin-prototype 已验证）
- ≈29.2–36.6mm / ≈32.4mm 为 26mm + section 顶 padding 的经验文档值（已对照 style.css 实测 padding 复核），机器可测锚点为静态 margin / CDP appMargin / 页数三项，表述无歧义

### ⑤ 暂停流程工件与哈希链

- pause.md 齐备（证据 10）、spec status=paused（:5）、check_roles --stage pause EXIT=0（证据 3）
- 哈希链闭合：快照 tmp/spec-before-1.md 哈希 = 修订 1 sign_hash 599c06b7…（证据 2）；当前正文哈希 = 48391773…（证据 1）；frontmatter sign_hash 仍为旧值 599c06b7…（:11）——暂停周期内属预期，重签时更新为 48391773…

### ⑥ 工作区观察（非阻塞，不构成越界契约改动）

- start.bat：纯 CRLF 行尾变化（无内容变化），不在白名单但按 P2 显式 git add 不会入提交
- public/app.js / test/test.py raw 文件 diff：运行时解包产物（P2 大文件提交模式，raw 为陈旧跟踪文件，仅 .gz 提交）
- 两者均非 spec 改动，不影响本审查结论

## 结论

PASS — 修订 2 契约自洽可测：C20 四边 10mm 新取值与 C19 页数（14/17 不变）、§1 验收反馈记录、§3 蓝图、decisions 四处一致；白名单全覆盖待改文件；暂停工件（pause.md + status=paused + check_roles pause EXIT=0）与哈希链（599c06b7… → 48391773…）齐备；全部取值有静态/CDP 机器锚点。可进入重签流程（用户发送「签约」后 frontmatter sign_hash 更新为 6adf2385… 并恢复执行）。

**2026-11-26 收尾复确认**：lead 已按 P2 建议逐字落入两处措辞修正——§1:47 根因句「上下纸边到 #app 背景仅 @page 16mm（到内容 ≈19.2–26.6mm，再加 section 顶 padding）」（16+3.175≈19.2 / 16+10.583≈26.6，算术正确）与 §7:170 Ctrl+P 行「C20 `#app` 内缩与 4mm 内容内边距受 `html.print-*` 类限定不生效（仅 16mm 兜底边距）」（对照 style.css:409-412 作用域属实，且消除了旧行「C19/C20 打印规则仍生效」对 C20 内缩的不准确表述）。正文哈希 48391773… → 6adf2385…（复算一致）。无新歧义；P3 观察（非阻塞）：C20 前置条件「打印模式（对话框选择或 Ctrl+P）」与 §7 澄清（Ctrl+P 下 #app 内缩不生效）存在既有措辞张力，属修订 1 遗留，不影响机器锚点（静态 CSS 断言 + CDP 走对话框路径），可在重签时顺手收窄为「对话框选择；Ctrl+P 见 §7」。复确认 PASS。

**2026-11-26 最终收尾复确认**：lead 已落入 P3 收窄——C20 前置条件（:142）改为「用户经 C13 对话框选择竖版或横版（app.js 注入 `html.print-*` 类与动态 `@page`）；直接 Ctrl+P 不适用本条（§7：仅 16mm 兜底边距生效）」。核对：注入机制属实（style.css:401-404 注释：html.print-* 类由 app.js 在 window.print() 前注入、afterprint 后清除；动态 @page 见 :304 C15 注释）；与 §7:170 Ctrl+P 行、C20 不变式「@page 16mm 静态兜底不变」互洽，C20 后置条件自此明确仅适用于对话框路径，张力消除，无新歧义。正文哈希 6adf2385… → 2eac50a6…（复算 EXIT=0 一致）。复确认 PASS。
