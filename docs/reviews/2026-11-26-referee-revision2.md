# 裁判员契约互审报告（修订 2：C20 打印边距修订）

- **角色**: 裁判员
- **审查者**: referee
- **会话标识**: referee@2026-11-26T09:50:58+08:00
- **未参与编码声明**: 是（未参与编码）
- **未参与 spec 编写声明**: 是（未参与 spec 编写）
- **结论**: PASS（修订 2 共 8 处改动与声明一致无遗漏；C20 新取值与 style.css 实际打印 padding 自洽；页数 14/17 经原型 PDF 独立复核；3 项 P2 措辞/流程观察，均不阻塞）
- **spec_revision**: 2
- **spec_hash**: 2eac50a63424f7c18a104ac434d960fe5a2db85432b353175c10e86e19eababd
- **2026-11-26 收尾**: P2 措辞修正后复确认 PASS
- **2026-11-26 最终收尾**: C20 前置条件收窄后复确认 PASS
- **审查对象**: docs/specs/2026-11-25-print-fix.md（status: paused，spec_revision 2；相对暂停前快照 tmp/spec-before-1.md（修订 1）共 8 处改动）
- **汇总来源**: 无子代理报告（叶子会话）

## 汇总来源明细（备查）

1. docs/specs/2026-11-25-print-fix.md（受审 spec，修订 2，205 行，全文读取）
2. tmp/spec-before-1.md（暂停前 spec 快照，修订 1，20582B；git diff --no-index 核对改动集）
3. docs/reviews/2026-11-26-pause.md（监察员暂停记录，30 行，全文读取）
4. docs/reviews/2026-11-25-auditor.md（格式参照，55 行）
5. public/style.css（工作区，417 行；打印 padding L315-318/L351/L356/L382/L386/L394 与 #app 内缩 L409-410 逐行核对）
6. tmp/margin-prototype/public/style.css（原型补丁；与工作区 diff 恰为 2 行 margin 变更）
7. tmp/margin-prototype/out-portrait.pdf / out-landscape.pdf（原型 CDP printToPDF 产物，页数独立计数）
8. 命令取证（各节内联，均含退出码）

## 审查范围

本报告为 spec 修订 2（C20 打印边距修订，用户 2026-11-26 验收反馈触发）的契约互审：只读核验修订后条款的一致性/歧义/可测试性，聚焦 4 个复核点——① C20 新取值与 style.css 实际打印 padding 是否自洽；② C19 页数 14/17 与原型复测证据是否一致；③ §1 新条目与 §3/C20 表述是否一致；④ 白名单是否覆盖本次将改文件。不审代码（修订 2 编码尚未开始，status: paused）。

## 证据

1. `public/style.css:315-316` 打印模式 `.hero { padding: 24px 0 }` / 六 section 基础 `padding: 40px 0`（C20「12–40px」范围的上/下界来源）
2. `public/style.css:382` 横版 `.experience { padding: 12px 0 }`（范围下界 12px = 3.175mm → 上下纸边到内容 ≈29.2mm）
3. `public/style.css:409-410` 工作区 `#app` 仍为 `margin: 0 10mm`（修订 1 实现；修订 2 编码未开始，暂停态属预期）
4. `tmp/margin-prototype/public/style.css:409-410` 原型补丁 `margin: 10mm`（四边，恰 2 处；与工作区 diff 仅这 2 行）
5. 命令取证：`python D:/project/ship-it/ship-it/scripts/check_spec.py docs/specs/2026-11-25-print-fix.md --print-sign-hash` 退出码 0 → `483917736984125e96d950e87a76cd2023e07fae743e93e26c2b4d28d0ab7a4a`（与 lead 提供值一致）
6. 命令取证：`git diff --no-index tmp/spec-before-1.md docs/specs/2026-11-25-print-fix.md`（exit=1，即文件有差异）：改动集恰为 8 个 hunk，全部落在声明改动内
7. 命令取证：原型 PDF 页数（node 原始字节扫描 `/Type /Page`，排除 /Pages）：out-portrait.pdf = 14、out-landscape.pdf = 17（与 C19 的 14/17 一致）

## 1. 改动集核验（对暂停前快照 diff）— PASS

`git diff --no-index tmp/spec-before-1.md docs/specs/2026-11-25-print-fix.md`（exit=1）显示共 8 个 hunk 改动，与声明逐一对应：

| # | 位置 | 改动 |
| --- | --- | --- |
| 1 | frontmatter L4 | `spec_revision: 1→2` |
| 2 | frontmatter L5 | `status: signed→paused`（暂停流程字段，lead 背景已声明） |
| 3 | frontmatter L13 | `decisions` 追加 C20 修订记录（2026-11-26 用户裁定「跟左右一样吧」：四边 10mm、上下 26mm 过渡带、≈29.2–36.6mm） |
| 4 | §1 L47 | 新增「验收反馈与契约修订（2026-11-26）」条目（用户原话 + 根因 + 裁定 + 复测结论） |
| 5 | §2 L87 | 文件边界白名单 + `docs/reviews/2026-11-26-*.md` |
| 6 | §3 L98 | 前端①：`#app` 打印内缩 `margin: 0 10mm`→`margin: 10mm`（横竖版，四边 10mm，2026-11-26 C20 修订） |
| 7 | C19 L136 | 后置条件页数 14/17 标注「2026-11-26 C20 边距修订后复测不变」 |
| 8 | C20 L143/L145 | 后置条件改写（四边 10mm + 上下 26mm 白色过渡带 + 到内容 ≈29.2–36.6mm）+ 不变式追加「修订后页数复测 14/17 不变」 |

无未声明改动。frontmatter `sign_hash` 仍为旧值 599c06b7…（L11）、`signed_at/signed_by` 仍为 2026-11-25 值——暂停周期内属预期；重签时 sign_hash 将更新为 48391773…（当前正文哈希，本审查已独立复核）。

## 2. 复核点①：C20 新取值 vs style.css 实际打印 padding — PASS

C20 后置条件（L143）取值与工作区 style.css 各 section 打印顶 padding 逐一对照：

| 页型 | 顶 padding（style.css 行号） | px | mm | 上下纸边到内容 = 26mm + 顶 padding |
| --- | --- | --- | --- | --- |
| 横版 experience 页 | L382 `html.print-landscape .experience { padding: 12px 0 }` | 12px | 3.175mm | ≈29.2mm（范围下界） |
| hero 页（竖/横 p1） | L315 `.hero { padding: 24px 0 }` | 24px | 6.35mm | ≈32.4mm |
| about/skills 页 | L351/L356（竖版）、L386/L394（横版）`padding: 24px …` | 24px | 6.35mm | ≈32.4mm |
| projects/edu-honors/off-duty 页 | L316 基础 `padding: 40px 0`（无打印覆盖） | 40px | 10.583mm | ≈36.6mm（范围上界） |

- spec「section 顶 padding（12–40px，≈3.2–10.6mm）」与实际 CSS 范围**精确一致**（下界 12px = 横版 experience，上界 40px = 基础值；竖版 skills/about、横版 skills/about 均覆盖为 24px，落在范围内）。px→mm 换算（96px=25.4mm）与 26mm 基准（16mm @page + 10mm #app）计算全部正确。
- 「上下白色过渡带（纸边到 #app 背景）= 16mm + 10mm = 26mm，与左右 26mm 完全一致」：左右纸边到 #app 背景同为 16+10=26mm（左右到内容 = 26+4mm = 30mm，与后置条件左右 30mm 一致）；白色过渡带（纸边→奶油背景边界）四边均 26mm，自洽。
- 「与左右 30mm 视觉等效」：上下到内容 29.2–36.6mm vs 左右 30mm，最小差 0.8mm（29.2 vs 30，横版 experience 页），低于视觉分辨；且主导视觉边界（26mm 处白/奶油边界）四边完全一致——表述准确、可测试（测试员可断言 CSS 规则 `margin: 10mm` + 各 section 顶 padding 值，或 CDP 实测渲染偏移落在 29.2–36.6mm 区间）。
- 原型交叉验证：`tmp/margin-prototype/public/style.css` L409-410 为 `margin: 10mm`（四边，恰 2 处，`margin: 0 10mm` 计数 = 0），与工作区 style.css 的 diff **仅这 2 行**——原型即「工作区 + C20 修订补丁」，无其他改动。

## 3. 复核点②：C19 页数 14/17 vs 原型复测 — PASS

- C19 后置条件（L136）：「竖版 14 页、横版 17 页（2026-11-26 C20 边距修订后复测不变）」；C20 不变式（L145）：「修订后页数复测（2026-11-26 原型 CDP printToPDF）：竖版 14 / 横版 17 不变」——两条款互相一致。
- **独立复核**：对原型产物 `tmp/margin-prototype/out-portrait.pdf`（1135816B）/`out-landscape.pdf`（1151593B）原始字节扫描 `/Type /Page`（排除 /Pages）：竖版 **14**、横版 **17**，与 C19/C20 声明一致。
- 机制自洽性：上下 margin 0→10mm 使每页内容高度减少 20mm（竖版 265mm→245mm），理论上可能改变分页；原型 CDP printToPDF 实测页数不变，且 C19 失败行为已有「±1 页、以三条硬指标为准」的兜底——声明与证据自洽。
- 复测环境保真：原型 app.js 与工作区**字节一致**（sha256 前缀 52aab4e46da4fffd，63103B）、data/resume.json 字节一致（sha256 前缀 333779496f9bee42），另有逐页渲染 PNG（out-portrait.png/out-landscape.png）——复测所用代码/数据与受审实现一致。

## 4. 复核点③：§1 新条目 vs §3/C20 表述 — PASS

- §1 L47 新条目：「上下白色过渡带（纸边到 #app 背景）= 16+10 = 26mm，与左右 26mm 完全一致；上下纸边到内容 = 26mm + section 顶 padding（12–40px，≈3.2–10.6mm，见 §3 压缩规则）≈ 29.2–36.6mm（hero 页 24px ≈32.4mm），与左右 30mm 视觉等效」——数值与 C20 后置条件（L143）逐字一致；「见 §3 压缩规则」指针准确（§3 L98 ②③ 压缩参数与 style.css 行号一致，见 §2 表）。
- §3 L98 前端①「margin: 0 10mm→margin: 10mm（横竖版，四边 10mm，2026-11-26 C20 修订）」与 C20 后置条件一致。
- decisions（L13）「上下白色过渡带与左右一致（26mm），上下纸边到内容 ≈29.2–36.6mm」与上述一致。
- 用户原话与裁定逐字记录，与暂停记录 docs/reviews/2026-11-26-pause.md L14 触发原话一致。
- 措辞小偏差（P2-1，见 §6）：§1 根因句「上下纸边到内容仅 @page 16mm」严格而言是「纸边到 #app 背景 = 16mm」（到内容 = 16mm + section 顶 padding ≈19.2–26.6mm）；结论方向正确，不影响 C20 条款可测试性。

## 5. 复核点④：白名单覆盖 — PASS

修订 2 编码周期将改文件与白名单（spec §2 L79-89）覆盖：

| 将改文件 | 用途 | 白名单行 |
| --- | --- | --- |
| `public/style.css` | L409-410 `margin: 0 10mm`→`margin: 10mm`（2 行） | L81 ✓ |
| `test/test.py` / `test/test.py.gz` | C20 静态断言更新（margin: 0 10mm → margin: 10mm） | L82-83 ✓ |
| `test/cdp-print.mjs` | C20 CDP 断言更新（appMargin 四边 ≈37.8px） | L84 ✓ |
| `public/app.js` / `public/app.js.gz` | 本次预计不改（纯 CSS 修复），白名单保留 | L79-80 ✓ |
| `docs/specs/2026-11-25-print-fix.md` | 重签更新 sign_hash（frontmatter 在哈希范围外） | L85 ✓ |
| `docs/reviews/2026-11-26-*.md` | 暂停记录 + 修订 2 审查/测试报告 | L87 ✓（本次新增） |
| `CHANGELOG.md` / `package.json` | Step 7 版本管理（1.9.0→1.9.1） | L88-89 ✓ |

全部将改文件均被白名单覆盖；新增的 `docs/reviews/2026-11-26-*.md` 条目恰好覆盖暂停记录与本报告。

## 6. 问题清单

### P0（阻塞）

无。

### P1（PR 前应修复）

无。

### P2（观察项，不阻塞）

1. **§1 根因句措辞偏差**：L47「上下纸边到内容仅 @page 16mm」严格而言是「纸边到 #app 背景 = 16mm」（到内容 = 16mm + section 顶 padding ≈19.2–26.6mm）。结论方向（上下无 #app 内缩）正确，不影响 C20 条款可测试性；建议下次 spec 编辑时微调措辞（可选）。
2. **§9 核销记录引用修订 1 值**：L197 C20 用例名「C20* #app 打印内缩 margin: 0 10mm（竖版）」仍为修订 1 值。§9 为 Step 5 产物（在哈希范围外，不影响当前哈希）；重签后 Step 5 须将该行（及 CDP 用例）更新为 `margin: 10mm`，保持核销表与条款一致——流程提醒，非缺陷。
3. **§7 直接 Ctrl+P 措辞（修订 1 既有）**：L170「C19/C20 打印规则仍生效（纯 CSS）」——`#app` 内缩规则受 `html.print-*` 类限定（style.css L409-410），直接 Ctrl+P（无类注入）时 C20 内缩与 4mm 内边距不生效，仅 `@page 16mm` 兜底生效。属修订 1 既有行为，非本次修订引入；建议修正 §7 措辞（可选，不阻塞）。

## 7. 结论

**PASS**。

- 改动集：8 处改动与声明一致无遗漏、无未声明改动；正文哈希 48391773… 独立复核通过（check_spec.py 退出码 0）。
- 复核点①：C20 新取值（26mm 过渡带 / 29.2–36.6mm 到内容 / 12–40px padding 范围）与 style.css 实际打印 padding 自洽，计算全部正确，原型补丁恰为 2 行变更。
- 复核点②：C19 页数 14/17 与原型复测一致（原型 PDF 独立计数 14/17），C19 后置条件与 C20 不变式互相一致。
- 复核点③：§1 新条目、§3 蓝图、decisions 与 C20 条款表述一致，用户原话逐字记录。
- 复核点④：白名单覆盖全部将改文件（style.css/test.py(.gz)/cdp-print.mjs/spec/2026-11-26 报告/CHANGELOG/package.json）。
- 3 项 P2 观察（§1 措辞偏差、§9 核销记录流程提醒、§7 Ctrl+P 措辞）均不阻塞；建议 lead 在下次 spec 编辑或 Step 5 时处理。

（报告完）
