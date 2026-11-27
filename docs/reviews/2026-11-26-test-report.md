# 测试报告 · 打印/PDF 三问题修复 v1.9.1 · C20 修订 3 重测（Step 4）

- 角色：测试员
- 审查者：tester
- 会话标识：tester@2026-11-26T12:25:02+08:00
- 日期：2026-11-26
- 测试对象：简历系统 v1.9.1（C20 修订 3：动态 @page margin 26mm 16mm + #app margin 0 10mm）
- 分支：`dsh-893abfbb-187c`
- HEAD：`73e6166ff178ce7f324f0b99d9369604d56d8900`（73e6166 fix(print): C20 修订 3 — 动态 @page margin 26mm 16mm + #app margin 0 10mm（中间页上下白条 = @page 上下边距，所有页四边 26mm）+ 测试断言更新（test.py 307/307、cdp 43/43 PASS，页数 15/22））
- spec 路径：`docs/specs/2026-11-25-print-fix.md`（spec_revision=3，status=signed）
- spec_revision: 3
- spec_hash: `cb3388bf2168e30fdc8ac2b1fbd26493ae5fcd654c091788adb5f682f85d1260`
- sign_hash: `cb3388bf2168e30fdc8ac2b1fbd26493ae5fcd654c091788adb5f682f85d1260`（同 spec_hash；sign_quote=签约，signed_at=2026-11-26T12:08:15+08:00，signed_by=用户 xianzhe-zhao，sign_requested_at=2026-11-26T11:57:00+08:00，confirmed_clauses=C17,C18,C19,C20,C21）
- run_started_at: 2026-11-26T12:20:11+08:00
- run_finished_at: 2026-11-26T12:20:33+08:00
- 执行者：tester（测试员）
- 未参与编码声明：tester 未参与本次修复（提交 73e6166）的编码
- 未参与 spec 编写声明：tester 未参与 spec（含修订 3）的编写
- 结论：PASS
- 汇总来源：`tmp/test-out-r3c.txt`（test.py 307 条实跑输出）、`tmp/cdp-out-r3c.txt`（cdp-print.mjs 43 条实跑输出，UTF-16LE 带 BOM）、`docs/specs/2026-11-25-print-fix.md`（spec §9 核销表）

## 1. 被测文件哈希证据表（pre/post SHA-256）

pre = 测试运行（2026-11-26T12:20:11+08:00 启动）前实测值；post = tester 于 2026-11-26T12:25:02+08:00 用 `Get-FileHash -Algorithm SHA256` 复算，与 pre 一致：

| 文件 | pre SHA-256 | post SHA-256 | 一致 |
| --- | --- | --- | --- |
| `public/app.js.gz` | `951376C71E7C707B371222FFEC9FF085A07E4EE9F1F13C22A0A9195D5EE13472` | `951376C71E7C707B371222FFEC9FF085A07E4EE9F1F13C22A0A9195D5EE13472` | ✅ |
| `public/style.css` | `CB33C3B397A235C8C85F0EF6266CDCDA6A4E72B6BA005510DE0ED8614B21F245` | `CB33C3B397A235C8C85F0EF6266CDCDA6A4E72B6BA005510DE0ED8614B21F245` | ✅ |
| `test/test.py.gz` | `D783AA7CA6723F79FF23D7B71505D4E0CA76E92F58C45D2A3D305B49003BA22E` | `D783AA7CA6723F79FF23D7B71505D4E0CA76E92F58C45D2A3D305B49003BA22E` | ✅ |
| `test/cdp-print.mjs` | `FB0F4FC0E3CB4548A6CA69321D60848E08F36378402ED40ED3E769486C10A42E` | `FB0F4FC0E3CB4548A6CA69321D60848E08F36378402ED40ED3E769486C10A42E` | ✅ |

结论：4 文件 pre/post 完全一致，测试运行未改动任何被测文件。

### 1.1 用例文件证据块（机器校验用）

```
path: test/test.py
pre_sha256: 3D66D09C24E81A6F03220A690F0D71C02FC691C490372BEEBB31CB9B186A8F55
post_sha256: 3D66D09C24E81A6F03220A690F0D71C02FC691C490372BEEBB31CB9B186A8F55
run_started_at: 2026-11-26T12:20:11+08:00
run_finished_at: 2026-11-26T12:20:14+08:00
```

```
path: test/cdp-print.mjs
pre_sha256: FB0F4FC0E3CB4548A6CA69321D60848E08F36378402ED40ED3E769486C10A42E
post_sha256: FB0F4FC0E3CB4548A6CA69321D60848E08F36378402ED40ED3E769486C10A42E
run_started_at: 2026-11-26T12:20:11+08:00
run_finished_at: 2026-11-26T12:20:33+08:00
```

## 2. 支柱 1：核心回归（test/test.py 全量）

- 命令：`C:\Users\xianzhe.zhao\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe test\test.py`（自启服务器端口 3999，自清理）
- 运行窗口：2026-11-26T12:20:11+08:00 → 2026-11-26T12:20:14+08:00
- 结果：**通过 307 / 失败 0 / 总计 307，EXIT=0**
- 输出文件：`tmp/test-out-r3c.txt`（307 条 ✅，tester 逐行清点）

分节统计（按输出结果行条款前缀逐行清点，合计 307）：

| 分节 | 执行用例数 | 结果 |
| --- | --- | --- |
| 核心 [1]–[4]（单版本页面 + 旧版本重定向 / 数据 API / 静态资源 / 鉴权·保存·头像上传） | 36 | ✅ 全过 |
| C1–C12（v1.3.0 spec，含 C10b 防火墙大文件对策） | 79 | ✅ 全过 |
| C13–C16（打印版式对话框 / 多页打印修复 / 打印版式模板 / 核心回归） | 30 | ✅ 全过 |
| C17*–C21*（2026-11-25 新条款静态断言，含 C20 修订 3 更新断言） | 30 | ✅ 全过 |
| C17–C29（v1.8.x spec 旧条款） | 102 | ✅ 全过 |
| SF1–SF12（安全修复 v1.7.0，标注 spec C1–C12） | 30 | ✅ 全过 |
| **总计** | **307** | **✅ 全过** |

输出摘要（尾部）：

```
  ✅ SF9(spec C9) 常量时间比较下正确密码登录 200
  ✅ SF9(spec C9) 错误密码登录 401
  ✅ SF10(spec C10) .woff2 返回 font/woff2
  ✅ SF10(spec C10) 404 响应含安全头
  ✅ SF10(spec C10) 保存含 <iframe> 被拒绝（400）
  ✅ SF10(spec C10) 超短图片 buffer 被拒绝（400）
  ✅ SF10(spec C10) RIFF 非 WEBP 容器被拒绝（400）
  ✅ SF11(spec C11) start.bat 使用 UTF-8 代码页 65001
  ✅ SF11(spec C11) start.bat 无硬编码他人用户路径
  ✅ SF11(spec C11) start.bat 不回显明文密码
  ✅ SF12(spec C12) 废弃部署脚本已删除
  ✅ SF12(spec C12) ci-deploy.sh 保留
  ✅ SF4(spec C4) 伪造XFF前段5次失败后第6次429（按末段真实IP锁定）
  ✅ SF4(spec C4) CF-Connecting-IP 优先且锁定生效
========================================================
通过: 307   失败: 0   总计: 307
========================================================
```

## 3. 支柱 2：新功能达标（C17*–C21*，spec 修订 3）

`test/test.py` 含 30 条 C17*–C21* 静态断言（全过，含于 307）；CDP 实测断言位于 `test/cdp-print.mjs`。

### 3.1 spec §9 核销表 9 用例逐条结果（本次实跑输出中逐字命中，均 ✅）

| # | 用例名（逐字） | 用例文件 | 本次结果 |
| --- | --- | --- | --- |
| 1 | C17* 导航按钮带 js-print 类 + id=printBtn | test/test.py | ✅（EXIT=0） |
| 2 | C17* .js-print 按钮数量 = 2（导航 + hero） | test/cdp-print.mjs | ✅（CDP 实测，EXIT=0） |
| 3 | C18* ensureCoverImages() 已定义 | test/test.py | ✅（EXIT=0） |
| 4 | C18* window.print() 调用时 11 张封面图全部 complete | test/cdp-print.mjs | ✅（CDP 实测，EXIT=0） |
| 5 | C19* 竖版：封面图定高 240px | test/test.py | ✅（EXIT=0） |
| 6 | C19* 竖版 PDF 页数 15（±1，修订 3） | test/cdp-print.mjs | ✅（CDP 实测，EXIT=0；实测 15 页） |
| 7 | C20* #app 打印内缩 margin: 0 10mm（竖版，修订 3） | test/test.py | ✅（EXIT=0） |
| 8 | C20* #app 打印内缩 margin: 0 10mm（上下 0、左右 ≈37.8px，修订 3） | test/cdp-print.mjs | ✅（CDP 实测，EXIT=0） |
| 9 | C21* API 契约不变（6 端点） | test/test.py | ✅（EXIT=0） |

### 3.2 C20 修订 3 断言明细（实跑输出逐字）

test/test.py 侧（5 条，均 ✅）：

```
  ✅ C20* #app 打印内缩 margin: 0 10mm（竖版，修订 3）
  ✅ C20* #app 打印内缩 margin: 0 10mm（横版，修订 3）
  ✅ C20* section 子元素 + .footer-inner 4mm 内容内边距
  ✅ C20* 屏幕端零影响（margin: 0 10mm 仅出现于两条 #app 规则）
  ✅ C20* @page 16mm 静态兜底不变
```

test/cdp-print.mjs 侧（1 条，✅）：

```
  ✅ C20* #app 打印内缩 margin: 0 10mm（上下 0、左右 ≈37.8px，修订 3）
```

### 3.3 test/cdp-print.mjs 全量 43 条结果

- 命令：`node test\cdp-print.mjs`（自启服务器端口 3998 + headless Chrome，自停）
- 运行窗口：2026-11-26T12:20:11+08:00 → 2026-11-26T12:20:33+08:00
- 结果：**通过 43 / 失败 0 / 总计 43，EXIT=0**
- 输出文件：`tmp/cdp-out-r3c.txt`（UTF-16LE 带 BOM；tester 以 utf-16 读取、BOM 剥离后 43 条 ✅ 行逐字转录）
- 页数实测值：竖版 PDF **15 页**（±1 达标）、横版 PDF **22 页**（±1 达标）

43 条明细（均 ✅）：

```
  ✅ P1 C6 修复：未滚动时下方元素无内联 opacity:0
  ✅ C17* .js-print 按钮数量 = 2（导航 + hero）
  ✅ C17* hero 按钮点击打开版式对话框
  ✅ C18* window.__coverSvg 模块加载后即可用（返回 SVG）
  ✅ C13 对话框出现（非 hidden）
  ✅ C13 对话框卡片水平居中（偏差≤20px）
  ✅ C13 竖版/横版选项并排（同 y）
  ✅ C13 选项顺序 portrait/landscape
  ✅ C13 提示含「另存为 PDF」指引
  ✅ C13 标题为「选择打印版式」
  ✅ C13 Esc 关闭对话框
  ✅ C13 选竖版触发 window.print 一次
  ✅ C15 html.print-portrait 类注入
  ✅ C15 动态 @page A4 portrait 注入
  ✅ C13 选择后对话框关闭
  ✅ C18* window.print() 调用时 11 张封面图全部 complete
  ✅ C14 print 媒体：opacity 覆盖为 1
  ✅ C14 print 媒体：visibility=visible
  ✅ C14 print 媒体：transform=none
  ✅ C15 竖版：技能卡片 2 列
  ✅ C15 竖版：hero 单列
  ✅ C15 print：导航栏隐藏
  ✅ C15 竖版：body 白底 + #app 奶油底内缩
  ✅ C19* 竖版：11 张封面图定高 240px
  ✅ C19* .footer break-inside: avoid（不被拆分）
  ✅ C19* .sec-head-wrap break-after: avoid（无滞留标题）
  ✅ C20* #app 打印内缩 margin: 0 10mm（上下 0、左右 ≈37.8px，修订 3）
  ✅ C15 竖版 PDF 生成（>10KB）
  ✅ C15 竖版 PDF 页数 ≥2（多页）
  ✅ C19* 竖版 PDF 页数 15（±1，修订 3）
  ✅ C15 竖版 PDF 纸张 A4 portrait（595×842pt）
  ✅ C15 选横版触发 window.print 一次
  ✅ C15 html.print-landscape 类注入
  ✅ C15 动态 @page A4 landscape 注入
  ✅ C15 横版：技能卡片 3 列
  ✅ C15 横版：hero 双列
  ✅ C15 横版：body 白底 + #app 奶油底内缩
  ✅ C19* 横版：11 张封面图高度 ≤ 页高 673px（无截断）
  ✅ C15 横版 PDF 页数 ≥2（多页）
  ✅ C19* 横版 PDF 页数 22（±1，修订 3）
  ✅ C15 横版 PDF 纸张 A4 landscape（842×595pt）
  ✅ C18* 封面图 404 → onerror 注入 __coverSvg SVG 占位（无空白封面）
  ✅ 全程无未捕获 JS 异常
```

## 4. 总体结论

- **PASS**
- 支柱 1 核心回归：test/test.py 307/307（EXIT=0），核心功能未被修坏。
- 支柱 2 新功能达标：test.py 30 条 C17*–C21* 静态断言全过（含于 307/307）+ cdp-print.mjs 43/43（EXIT=0）；spec §9 核销表 9 用例本次实跑输出逐字命中均 ✅；C20 修订 3（动态 @page margin 26mm 16mm + #app margin 0 10mm，所有页四边 26mm 白色过渡带）静态 + CDP 双端断言均过；页数实测竖版 15 / 横版 22（用户签约时已接受）。
- 哈希证据：4 文件 pre/post 一致，测试未改动被测文件。
- 失败项：无。
- 本报告不含任何密钥/凭据；测试脚本自启自停（端口 3999/3998），未触碰用户 3000 端口生产服务，未停止任何常驻进程。

## 证据（机器校验用）

- public/style.css:411-412
- public/app.js:744
- test/cdp-print.mjs:274
- test/cdp-print.mjs:284
- test/cdp-print.mjs:321
- test/test.py:515-523
- command: python test\test.py → EXIT=0
- command: node test\cdp-print.mjs → EXIT=0
