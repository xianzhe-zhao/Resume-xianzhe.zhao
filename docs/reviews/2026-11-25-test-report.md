# 测试报告：打印/PDF 三问题修复 v1.9.1（Step 4 两支柱测试）

- **日期**: 2026-11-25
- **测试对象**: 分支 `dsh-893abfbb-187c`，HEAD `0e5544a51c1624df9abb89adef26a28ed29701ab`（0e5544a）
- **spec 路径**: `docs/specs/2026-11-25-print-fix.md`
- **sign_hash**: `599c06b779534e8efdcb607570b990977a23800a550a915cf8db29e2ea138856`
- **run_started_at**: 2026-11-25T17:04:20+08:00
- **run_finished_at**: 2026-11-25T17:14:20+08:00
- **执行者**: tester（测试员，未参与编码 / 未参与 spec 编写）；**裁定者**: 主脑 + 机器校验

## 1. 被测文件哈希证据（测试未改动文件）

| path | pre_sha256 | post_sha256 | 一致 |
| --- | --- | --- | --- |
| `public/app.js.gz` | `2247F834117470FAD6F863DF9CFA9968C8EE6D31CDE25F3E8205A8449FCDFE0D` | `2247F834117470FAD6F863DF9CFA9968C8EE6D31CDE25F3E8205A8449FCDFE0D` | ✓ |
| `public/style.css` | `BFB77FEFBFA5C6598C1C2B835B6939E390F9E7DD8F8D293334D4565942A2400D` | `BFB77FEFBFA5C6598C1C2B835B6939E390F9E7DD8F8D293334D4565942A2400D` | ✓ |
| `test/test.py.gz` | `BD1234164FEE250CC90BCD215C8E104886C73E328068E4B852B0864088740CD3` | `BD1234164FEE250CC90BCD215C8E104886C73E328068E4B852B0864088740CD3` | ✓ |
| `test/cdp-print.mjs` | `BDF3F944502302ABF36F2CA64F53598F1439627B7997E469900AD7EE354583E8` | `BDF3F944502302ABF36F2CA64F53598F1439627B7997E469900AD7EE354583E8` | ✓ |

pre 于测试运行前计算（17:04:20），post 于全部测试与 PDF 生成完成后计算（17:14:20），4/4 一致，证明测试过程未改动任何被测文件。

### 1.1 用例文件证据块（供 `check_spec.py --stage verify` 机器校验）

以下证据块供机器校验（`check_test_evidence`）：pre/post 为用例文件在工作区测试运行前后（= 当前文件）的 SHA-256，与当前文件一致即证明用例文件在测试期间未被改动；运行窗口为该文件实际执行的起止时间。

- path: test/test.py
- pre_sha256: CD81767B090C8AD7892BF7148D5F96117DAA6D20439EC299835F9F0ED184809B
- post_sha256: CD81767B090C8AD7892BF7148D5F96117DAA6D20439EC299835F9F0ED184809B
- run_started_at: 2026-11-25T17:04:20+08:00
- run_finished_at: 2026-11-25T17:05:07+08:00

- path: test/cdp-print.mjs
- pre_sha256: BDF3F944502302ABF36F2CA64F53598F1439627B7997E469900AD7EE354583E8
- post_sha256: BDF3F944502302ABF36F2CA64F53598F1439627B7997E469900AD7EE354583E8
- run_started_at: 2026-11-25T17:04:20+08:00
- run_finished_at: 2026-11-25T17:07:22+08:00

## 2. 支柱 1：核心功能回归（C1–C16 + SF1–SF12 旧条款）

### 2.1 `test/test.py` 全量（端口 3999，自启服务器 + 自清理）

- 命令：`C:\Users\xianzhe.zhao\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe test\test.py`
- 结果：**通过 307 / 失败 0 / 总计 307，EXIT=0**（结束时间 2026-11-25T17:05:07+08:00）
- 补充：为核对分节内容，`test/test.py` 另复跑 2 次（17:15 前后、17:23 前后），结果均 307/307、EXIT=0（复跑仅用于分节取证，不影响证据表）。

输出摘要（尾部 15 行）：

```
  ✓ SF10(spec C10) 404 响应含安全头
  ✓ SF10(spec C10) 保存含 <iframe> 被拒绝（400）
  ✓ SF10(spec C10) 超短图片 buffer 被拒绝（400）
  ✓ SF10(spec C10) RIFF 非 WEBP 容器被拒绝（400）
  ✓ SF11(spec C11) start.bat 使用 UTF-8 代码页 65001
  ✓ SF11(spec C11) start.bat 无硬编码他人用户路径
  ✓ SF11(spec C11) start.bat 不回显明文密码
  ✓ SF12(spec C12) 废弃部署脚本已删除
  ✓ SF12(spec C12) ci-deploy.sh 保留
  ✓ SF4(spec C4) 伪造XFF前段5次失败后第6次429（按末段真实IP锁定）
  ✓ SF4(spec C4) CF-Connecting-IP 优先且锁定生效
========================================================
通过: 307   失败: 0   总计: 307
========================================================
```

分节统计（307 条用例全部 ✓；按实际输出结果行的条款前缀逐行清点）：

| 分节 | 执行用例数 | 结果 |
| --- | --- | --- |
| 核心 [1]–[4]（单版本页面 + 旧版本重定向 / 数据 API / 静态资源 / 鉴权·保存·头像上传） | 36 | ✓ 全过 |
| C1–C12（v1.3.0 spec：暖色配色 / 卡通人像 / 8 区结构 / 履历 / 技能 / 豹豹助手 / 页脚 / 管理后台 / 回归汇总 / GSAP 动效 / 三端适配 / 中英双语，含 C10b 防火墙大文件对策） | 79 | ✓ 全过 |
| C13–C16（打印版式对话框 / 多页打印修复 / 打印版式模板 / 核心回归） | 30 | ✓ 全过 |
| C17*–C21*（2026-11-25 新条款静态断言） | 30 | ✓ 全过 |
| C17–C29（v1.8.x spec：8 区板块结构 / Hero 增强 / 关于我 / 工作经历 / 个人作品 / 技能档案 / 教育荣誉 / 兴趣爱好 / SVG 占位 / 核心回归 / 悬浮导航 / 版本入口移除 / 安全加固） | 102 | ✓ 全过 |
| SF1–SF12（安全修复 v1.7.0，标注 spec C1–C12） | 30 | ✓ 全过 |
| **总计** | **307** | **✓ 全过** |

### 2.2 `test/cdp-print.mjs` 回归部分（端口 3998 + headless Chrome）

旧条款回归用例（均 ✓）：C6 ×1（未滚动时下方元素无内联 opacity:0）、C13 ×9（版式对话框出现/居中/选项/Esc/触发 print 等）、C14 ×3（print 媒体 opacity/visibility/transform 覆盖）、C15 ×17（横竖版类注入、@page 注入、列数、hero 布局、PDF 生成/页数/纸张）、`全程无未捕获 JS 异常` ×1。

## 3. 支柱 2：新条款结果（C17*–C21*，2026-11-25 spec）

`test/test.py` 含 30 条 C17*–C21* 静态断言（全过，含于 307）；CDP 实测断言位于 `test/cdp-print.mjs`。`test/cdp-print.mjs` 结果：**通过 43 / 失败 0 / 总计 43，EXIT=0**（结束时间 2026-11-25T17:07:22+08:00）。

逐条核销（test.py 侧 = 静态断言，用例名与 test.py 中 check() 字符串逐字一致；cdp-print.mjs 侧 = CDP 实测）：

| 条款 | test.py 静态断言 | cdp-print.mjs CDP 实测 | 结果 |
| --- | --- | --- | --- |
| C17* 双打印按钮统一绑定 | 6 条：C17* 导航按钮带 js-print 类 + id=printBtn / C17* hero 按钮带 js-print 类且移除重复 id（id=printBtn ≤1）/ C17* 统一绑定 querySelectorAll(.js-print)→openPrintDialog() / C17* 绑定不依赖 GSAP（绑定行无 gsap）/ C17* 对话框幂等（已打开不叠层）/ C17* 按钮文案保持（打印 / 存为 PDF） | 2 条：`.js-print` 按钮数量 = 2（导航 + hero）；hero 按钮点击打开版式对话框 | ✅ |
| C18* 打印前图片完整加载 + 失败回退 | 6 条：C18* ensureCoverImages() 已定义 / C18* 打印前等待全部封面图 decode 再调 window.print() / C18* 等待目标 .cover-img/.hero-card/.footer-avatar/.hero-bg / C18* 404 兜底 window.__coverSvg(theme) 已定义 / C18* onerror 幂等（this.onerror=null + 注入 SVG）/ C18* 封面 img eager（无懒加载） | 3 条：`window.__coverSvg` 模块加载后即可用（返回 SVG）；`window.print()` 调用时 11 张封面图全部 complete；封面图 404 → onerror 注入 `__coverSvg` SVG 占位（无空白封面） | ✅ |
| C19* 分页完整不变式 | 10 条：C19* 竖版：封面图定高 240px / C19* 竖版：封面容器 min-height: 0（不被固有高度撑高）/ C19* 横版：条目自然高度 align-items: start / C19* 横版：封面图限高 460px（不拉伸超页高 673px）/ C19* 横版：experience/projects/skills/edu-honors 强制新页 / C19* 横版：off-duty 不强制新页 / C19* .footer 不被拆分 / C19* 封面图不拦腰截断（cover break-inside: avoid）/ C19* 长卡允许跨页（exp/proj/od-item break-inside: auto）/ C19* 文本 orphans/widows: 3 保持 | 6 条：竖版 11 张封面图定高 240px；`.footer` break-inside: avoid（不被拆分）；`.sec-head-wrap` break-after: avoid（无滞留标题）；竖版 PDF 页数 14（±1）；横版 11 张封面图高度 ≤ 页高 673px（无截断）；横版 PDF 页数 17（±1） | ✅ |
| C20* 打印边距优化 | 5 条：C20* #app 打印内缩 margin: 0 10mm（竖版）/ C20* #app 打印内缩 margin: 0 10mm（横版）/ C20* section 子元素 + .footer-inner 4mm 内容内边距 / C20* 屏幕端零影响（10mm 仅出现于两条 #app 规则）/ C20* @page 16mm 静态兜底不变 | 1 条：`#app` 打印内缩 10mm（≈37.8px） | ✅ |
| C21* 核心功能回归 | 3 条：C21* API 契约不变（6 端点）/ C21* 零新增依赖（package.json 无 dependencies）/ C21* 核心回归段全部通过（v1.9.0 全量） | 无独立 C21* 用例行；回归由全量套件达成（test.py 307/307 + cdp-print.mjs 43/43 + 全程无未捕获 JS 异常） | ✅ |

cdp-print.mjs 输出摘要（尾部 15 行）：

```
  ✓ C15 html.print-landscape 类注入
  ✓ C15 动态 @page A4 landscape 注入
  ✓ C15 横版：技能卡片 3 列
  ✓ C15 横版：hero 双列
  ✓ C15 横版：body 白底 + #app 奶油底内缩
  ✅ C19* 横版：11 张封面图高度 ≤ 页高 673px（无截断）
  ✓ C15 横版 PDF 页数 ≥2（多页）
  ✅ C19* 横版 PDF 页数 17（±1）
  ✓ C15 横版 PDF 纸张 A4 landscape（842×595pt）
  ✅ C18* 封面图 404 → onerror 注入 __coverSvg SVG 占位（无空白封面）
  ✓ 全程无未捕获 JS 异常
========================================================
CDP 打印实测：通过 43   失败 0   总计 43
========================================================
```

## 4. C19 渲染逐页对照（机器生成 + 人工逐页检查）

PDF 生成（`node tmp\gen-print-pdf.mjs`，EXIT=0）：

```
portrait: cls=print-portrait pages=14 size=1135816 -> D:\project\Resume\.agents\worktrees\dsh-893abfbb-187c\tmp\print-portrait.pdf
landscape: cls=print-landscape pages=17 size=1143348 -> D:\project\Resume\.agents\worktrees\dsh-893abfbb-187c\tmp\print-landscape.pdf
OK: 两个 PDF 已落盘
```

页数与期望一致（竖版 14 / 横版 17）。逐页用 office_render（dpi=100）渲染后人工检查三项：① 无滞留标题（section 标题在页底而内容全在下一页）② 页面填充率 ≥30%（仅 footer 尾页豁免）③ 封面图 `.cover-img` 不拦腰截断。

### 4.1 竖版 `tmp/print-portrait.pdf`（14 页）

| 页 | ① 滞留标题 | ② 填充率 | ③ 封面图截断 | 结论 |
| --- | --- | --- | --- | --- |
| 1 | 无（hero 完整，无 section 标题） | 约 67% | 无（拱形人像完整） | 通过 |
| 2 | 无（关于我标题在页顶，内容同页） | 约 78% | 无（区插画完整） | 通过 |
| 3 | 无（工作经历标题在页顶，内容同页） | 约 78% | 无（4.5年 RMS 封面图完整） | 通过 |
| 4 | 无（ERP 卡片标题在页底但卡片已起始，非 section 标题） | 满页 | 无（1400h RPA、9年 ERP 封面图完整） | 通过 |
| 5 | 无（个人作品标题在页中，内容同页） | 满页 | 无（2150+ 豹豹封面图完整） | 通过 |
| 6 | 无（ship-it 卡片标题在页底但卡片已起始） | 满页 | 无（工作流插画完整） | 通过 |
| 7 | 无 | 满页 | 无（文件夹图谱插画完整） | 通过 |
| 8 | 无 | 满页 | 无（3 API 桥接封面图完整） | 通过 |
| 9 | 无（技能档案标题在页顶，内容同页） | 约 87% | 无 | 通过 |
| 10 | 无 | 约 53% | 无 | 通过 |
| 11 | 无（教育与荣誉标题在页顶，内容同页） | 约 63% | 无（校徽占位完整，非 .cover-img） | 通过 |
| 12 | 无（兴趣爱好标题在页中，内容同页） | 约 88% | 无（机器人插画完整） | 通过 |
| 13 | 无 | 约 78% | 无（运动/相机插画完整） | 通过 |
| 14 | 无 | footer 尾页豁免（footer 块约 37%） | 无（头像完整） | 通过 |

### 4.2 横版 `tmp/print-landscape.pdf`（17 页）

| 页 | ① 滞留标题 | ② 填充率 | ③ 封面图截断 | 结论 |
| --- | --- | --- | --- | --- |
| 1 | 无（hero 双列完整） | 约 53% | 无（拱形人像完整） | 通过 |
| 2 | 无（关于我标题在页顶，内容同页） | 约 71% | 无（区插画完整） | 通过 |
| 3 | 无（工作经历标题在页顶，内容同页） | 约 77% | 无（4.5年 RMS 封面图完整） | 通过 |
| 4 | 无 | 约 56% | 无（1400h RPA 封面图完整） | 通过 |
| 5 | 无 | 约 56% | 无（9年 ERP 封面图完整） | 通过 |
| 6 | 无（个人作品标题在页顶，内容同页） | 约 85% | 无（2150+ 豹豹封面图完整） | 通过 |
| 7 | 无 | 约 62%（右栏内容） | 无 | 通过 |
| 8 | 无 | 约 75% | 无（工作流插画完整） | 通过 |
| 9 | 无 | 约 75% | 无（文件夹图谱插画完整） | 通过 |
| 10 | 无 | 约 73% | 无（3 API 桥接封面图完整） | 通过 |
| 11 | 无（技能档案标题在页顶，内容同页） | 约 60% | 无 | 通过 |
| 12 | 无 | 约 75% | 无 | 通过 |
| 13 | 无（教育与荣誉标题在页顶，内容同页） | 约 53% | 无（校徽占位完整） | 通过 |
| 14 | 无（兴趣爱好标题在页顶，内容同页） | 约 75% | 无（机器人插画完整） | 通过 |
| 15 | 无 | 约 56% | 无（运动插画完整） | 通过 |
| 16 | 无 | 约 56% | 无（相机插画完整） | 通过 |
| 17 | 无 | footer 尾页豁免（footer 块约 46%） | 无（头像完整） | 通过 |

31/31 页三项检查全部通过；无滞留标题、无低于 30% 填充率的非尾页、无拦腰截断的封面图。

## 5. 总体结论

**PASS**

- 支柱 1 核心功能回归：`test/test.py` 307/307（EXIT=0）+ `test/cdp-print.mjs` 回归部分全过，核心功能未被修坏。
- 支柱 2 新功能达标：test.py 30 条 C17*–C21* 静态断言全过（含于 307/307）+ cdp-print.mjs 43/43（EXIT=0）；C17* ✓、C18* ✓、C19* ✓、C20* ✓、C21* ✓。
- C19 渲染逐页对照：竖版 14 页 + 横版 17 页，31/31 页通过三项人工检查。
- 被测文件哈希 pre/post 4/4 一致，测试过程未改动任何文件。

**失败项清单**：无。

备注：本报告不含任何凭据/密码；测试脚本均为自包含（自启服务器 + 自清理），测试期间未停止任何常驻进程。


## 6. 核销用例清单（与 check() 标签逐字一致，供 Step 5 核销表引用）

以下用例名与 `test/test.py`、`test/cdp-print.mjs` 中 `check()` 第一参数字符串逐字一致；2026-11-25 实跑全部通过（test.py 307/307 EXIT=0；cdp-print.mjs 43/43 EXIT=0）。

### 6.1 `test/test.py` 静态断言（30 条）

- ✅ C17* 导航按钮带 js-print 类 + id=printBtn
- ✅ C17* hero 按钮带 js-print 类且移除重复 id（id=printBtn ≤1）
- ✅ C17* 统一绑定 querySelectorAll(.js-print)→openPrintDialog()
- ✅ C17* 绑定不依赖 GSAP（绑定行无 gsap）
- ✅ C17* 对话框幂等（已打开不叠层）
- ✅ C17* 按钮文案保持（打印 / 存为 PDF）
- ✅ C18* ensureCoverImages() 已定义
- ✅ C18* 打印前等待全部封面图 decode 再调 window.print()
- ✅ C18* 等待目标 .cover-img/.hero-card/.footer-avatar/.hero-bg
- ✅ C18* 404 兜底 window.__coverSvg(theme) 已定义
- ✅ C18* onerror 幂等（this.onerror=null + 注入 SVG）
- ✅ C18* 封面 img eager（无懒加载）
- ✅ C19* 竖版：封面图定高 240px
- ✅ C19* 竖版：封面容器 min-height: 0（不被固有高度撑高）
- ✅ C19* 横版：条目自然高度 align-items: start
- ✅ C19* 横版：封面图限高 460px（不拉伸超页高 673px）
- ✅ C19* 横版：experience/projects/skills/edu-honors 强制新页
- ✅ C19* 横版：off-duty 不强制新页
- ✅ C19* .footer 不被拆分
- ✅ C19* 封面图不拦腰截断（cover break-inside: avoid）
- ✅ C19* 长卡允许跨页（exp/proj/od-item break-inside: auto）
- ✅ C19* 文本 orphans/widows: 3 保持
- ✅ C20* #app 打印内缩 margin: 0 10mm（竖版）
- ✅ C20* #app 打印内缩 margin: 0 10mm（横版）
- ✅ C20* section 子元素 + .footer-inner 4mm 内容内边距
- ✅ C20* 屏幕端零影响（10mm 仅出现于两条 #app 规则）
- ✅ C20* @page 16mm 静态兜底不变
- ✅ C21* API 契约不变（6 端点）
- ✅ C21* 零新增依赖（package.json 无 dependencies）
- ✅ C21* 核心回归段全部通过（v1.9.0 全量）

### 6.2 `test/cdp-print.mjs` CDP 实测（12 条）

- ✅ C17* .js-print 按钮数量 = 2（导航 + hero）
- ✅ C17* hero 按钮点击打开版式对话框
- ✅ C18* window.__coverSvg 模块加载后即可用（返回 SVG）
- ✅ C18* window.print() 调用时 11 张封面图全部 complete
- ✅ C18* 封面图 404 → onerror 注入 __coverSvg SVG 占位（无空白封面）
- ✅ C19* 竖版：11 张封面图定高 240px
- ✅ C19* .footer break-inside: avoid（不被拆分）
- ✅ C19* .sec-head-wrap break-after: avoid（无滞留标题）
- ✅ C19* 竖版 PDF 页数 14（±1）
- ✅ C19* 横版：11 张封面图高度 ≤ 页高 673px（无截断）
- ✅ C19* 横版 PDF 页数 17（±1）
- ✅ C20* #app 打印内缩 10mm（≈37.8px）
