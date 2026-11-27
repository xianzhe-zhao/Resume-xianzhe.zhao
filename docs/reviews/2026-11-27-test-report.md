# 修订 4 测试报告（2026-11-27）

## 运行信息

- run_started_at: 2026-11-27T06:33:04.355Z
- run_finished_at: 2026-11-27T06:33:10.873Z
- 测试环境：worktree rev-4 代码（端口 3999 test.py）
- 备注：C10b C6 补充 style.css.gz 后重跑，335/335 全绿

## 测试证据

### test/test.py

- path: test/test.py
- pre_sha256: 9a37e7c125ea438b149ceed5edd5594e2205c6d952712659048ba298cdecc288
- post_sha256: 9a37e7c125ea438b149ceed5edd5594e2205c6d952712659048ba298cdecc288
- run_started_at: 2026-11-27T06:33:04.355Z
- run_finished_at: 2026-11-27T06:33:10.873Z

### test/cdp-print.mjs

- path: test/cdp-print.mjs
- pre_sha256: 6b9ff5080afc7f52204301e58a6a253879659fd009813094ba46f9b54abf9298
- post_sha256: 6b9ff5080afc7f52204301e58a6a253879659fd009813094ba46f9b54abf9298
- run_started_at: 2026-11-27T06:33:04.355Z
- run_finished_at: 2026-11-27T06:33:10.873Z

### test/test.py.gz

- path: test/test.py.gz
- pre_sha256: b71bbadd31cd325f4a4eb5968f5d470e6ab00d0f5c89150beeb0a7f754788e3e
- post_sha256: b71bbadd31cd325f4a4eb5968f5d470e6ab00d0f5c89150beeb0a7f754788e3e
- run_started_at: 2026-11-27T06:33:04.355Z
- run_finished_at: 2026-11-27T06:33:10.873Z

## 结果汇总

- test.py: 335/335 通过 — PASS
- cdp-print.mjs: 61/61 通过 — PASS
- 合计: 396/396 通过
- 核销率: 10/10 = 100%（C17–C26 全部 PASS）

## test.py 详细输出

========================================================
简历系统 v1.3.0 自动化测试（临时目录隔离 · 端口 3999）
========================================================

[1] 核心 · 单版本页面 + 旧版本重定向

[2] 核心 · 数据 API

[3] 核心 · 静态资源

[4] 核心 · 鉴权 / 保存 / 头像上传

[C1] 暖色配色（无红色）

[C2] 卡通人像 + PC 满宽处理

[C3] 8 区编号式结构（Hero/About/Experience/Projects/Skills/Edu/Honors/OffDuty/Footer）

[C4] 个人履历（时间线 + 量化成果）

[C5] 技能展示（5 组分组卡片 + 图标悬浮物）

[C6] 豹豹助手（zxz0608.com 已验证功能）

[C7] 结尾页脚

[C8] 管理后台（碎片化修复回归）

[C9] 核心功能回归汇总

[C10] GSAP 动效层

[C10b] 防火墙大文件对策（app.js/test.py .gz 中转）

[C11] 三端适配（1440/768/390）+ 打印

[C12] 中英双语（默认中文 + 一键切换）

[C13] 打印版式选择对话框（横版/竖版）

[C14] 多页打印修复（动画残留覆盖）

[C15] 打印版式模板（@page A4 + 横竖版布局 + 分页规则 + 暖色底）

[C16] 核心功能回归（不修坏）

[C17*] 双打印按钮统一绑定（2026-11-25 spec）

[C18*] 打印前图片完整加载 + 失败回退（2026-11-25 spec）

[C19*] 分页完整不变式（2026-11-25 spec）

[C20*] 不分页长页导出（2026-11-25 spec rev 4）

[C21*] 总高测量 + 20mm 缓冲（2026-11-25 spec rev 4）

[C22*] 长页模式规则覆盖（2026-11-25 spec rev 4）

[C23*] 直接 Ctrl+P 一致性（2026-11-25 spec rev 4）

[C24*] 预览关闭与状态清理（2026-11-25 spec rev 4）

[C25*] 零依赖 + 大文件提交模式（2026-11-25 spec rev 4）

[C26*] 核心功能回归（2026-11-25 spec rev 4）

[C17] 8 区编号式板块结构 + 统一头部公式

[C18] Hero 增强（问候徽章 + 荧光笔划线职位 + 状态标签 + 拱形人像）

[C19] 关于我区（特质气泡，复用 advantages）

[C20] 工作经历区（镜像交错时间线卡 + 数据压图）

[C21] 个人作品区（镜像交错卡 + 数据压图）

[C22] 技能档案区（5 组分组卡片化）

[C23] 教育与荣誉区（独立卡片 + 占位照 + 校徽）

[C24] 兴趣爱好区（占位交替卡）

[C25] SVG 主题插画占位 + 数据压图渲染

[C26] 核心功能回归（C1–C16 保留 + 新结构同步）

[C27] 自动隐藏悬浮导航栏（胶囊形 + 7 项锚点 + 自动隐藏）

[C28] 移除公开页版本切换入口（版本管理仅限后台）

[C29] 安全加固

[SF] 安全修复 v1.7.0（spec C1–C12）

========================================================
  ✅ /ai 返回200
  ✅ /ai 含数据注入
  ✅ /ai versionKey 正确
  ✅ /ai 含正确职位
  ✅ /ai 不泄露后台入口
  ✅ /it 302 重定向到 /ai
  ✅ /test 302 重定向到 /ai
  ✅ /erp 302 重定向到 /ai
  ✅ / 重定向到 /ai
  ✅ /api/data 返回200
  ✅ /api/data 含 base
  ✅ /api/data 含1个版本(ai)
  ✅ /api/data 含 en（双语）
  ✅ /style.css 返回200
  ✅ /app.js 返回200
  ✅ /admin.css 返回200
  ✅ /admin.js 返回200
  ✅ /gsap.min.js 返回200
  ✅ /ScrollTrigger.min.js 返回200
  ✅ /fonts/jost-latin.woff2 返回200
  ✅ /img/portrait-cartoon.jpg 返回200
  ✅ 未知路径返回404
  ✅ /api/check 未登录 authed=false
  ✅ /api/save 未登录拒绝(401)
  ✅ /api/login 错误密码拒绝(401)
  ✅ /api/login 正确密码成功(200)
  ✅ /api/login 返回会话cookie
  ✅ /api/save 登录后成功(200)
  ✅ /api/save 数据已更新
  ✅ /api/save 恢复原数据
  ✅ /api/upload 未登录拒绝(401)
  ✅ /api/upload 非图片拒绝(400)
  ✅ /api/upload 登录后成功(200)
  ✅ 上传文件可访问 /uploads/avatar.png
  ✅ /api/logout 成功(200)
  ✅ 登出后会话失效
  ✅ C1 暖色 token 齐全
  ✅ C1 style.css 无红色系色值
  ✅ C1 favicon 为琥珀色
  ✅ C2 卡通人像 JPEG 存在
  ✅ C2 app.js 引用卡通人像
  ✅ C2 hero-bg 模糊处理
  ✅ C2 hero-bg 边缘外溢(-40px)
  ✅ C2 hero-veil 奶油色遮罩
  ✅ C3 app.js 含①Hero头图渲染器
  ✅ C3 app.js 含②00关于我渲染器
  ✅ C3 app.js 含③01工作经历渲染器
  ✅ C3 app.js 含④02个人作品渲染器
  ✅ C3 app.js 含⑤03技能档案渲染器
  ✅ C3 app.js 含⑥04教育荣誉渲染器
  ✅ C3 app.js 含⑦05兴趣爱好渲染器
  ✅ C3 app.js 含⑧结尾页脚渲染器
  ✅ C3 index.html 加载 app.js
  ✅ C3 第⑤段标题为「技能档案」/Skill Archive
  ✅ C4 履历数据非空
  ✅ C4 每段履历含 role/company/period/projects
  ✅ C4 app.js 渲染时间线（exp-item/exp-info）
  ✅ C4 app.js 含量化成果 1400h
  ✅ C4 资格证书与荣誉无重复
  ✅ C4 ai 版职位存在
  ✅ C5 技能数 >=12
  ✅ C5 每个技能均有专属图标
  ✅ C5 GSAP 悬浮动效(yoyo+sine.inOut)
  ✅ C5 悬浮作用于 skill-badge
  ✅ C5 浮动幅度 3–5px
  ✅ C5 分组卡片化（skill-card + skill-group）
  ✅ C5 网格间距 22px > 浮动幅度（动画不重合）
  ✅ C6 主打项目为豹豹助手
  ✅ C6 中文 7 项功能
  ✅ C6 中文功能覆盖 对话/新闻/项目/日历/智能家居
  ✅ C6 链接为 zxz0608.com
  ✅ C6 app.js 渲染项目（proj-item/proj-info）
  ✅ C6 英文 7 项功能
  ✅ C6 英文功能覆盖 Chat/News/Kanban/Calendar/Smart Home
  ✅ C7 页脚含联系方式(tel/mailto)
  ✅ C7 页脚含头像与收尾语
  ✅ C7 无「联系我」按钮
  ✅ C8 /admin 返回200
  ✅ C8 /admin 引用 admin.js + admin.css
  ✅ C8 /admin 不引用简历 style.css
  ✅ C8 admin.css 含登录卡片+表单网格
  ✅ C9 核心回归全部通过
  ✅ C10 index.html 引用 gsap + ScrollTrigger
  ✅ C10 gsap.min.js.gz 在库中(防火墙对策)
  ✅ C10 ScrollTrigger.min.js.gz 在库中(防火墙对策)
  ✅ C10 gsap.min.js 解压后正常服务
  ✅ C10 app.js 用 gsap.matchMedia
  ✅ C10 app.js 尊重 prefers-reduced-motion
  ✅ C10 重渲染前清理动画
  ✅ C10 动效选择器同步 8 区（about/experience/projects/skills/edu-honors/off-duty）
  ✅ C10b app.js.gz 在库中(防火墙对策)
  ✅ C10b test.py.gz 在库中(防火墙对策)
  ✅ C10b app.js.gz 解压后含图片映射(PROJ_IMGS)
  ✅ C10b app.js.gz 解压后含 cover-img
  ✅ C10b app.js.gz 解压后与磁盘 app.js 一致
  ✅ C10b test.py.gz 解压后断言技能组=7
  ✅ C10b test.py.gz 解压后断言功能=7
  ✅ C10b C1 server.js unpackVendored 含 mtimeMs 覆盖判断
  ✅ C10b C4 deploy-test.yml 含 gunzip 解压步骤
  ✅ C10b C5 deploy-prod.yml 含 gunzip 解压步骤
  ✅ C10b C7 .gitignore 含 public/app.js
  ✅ C10b C6 无废弃旧 gz 残留
  ✅ C10b C8 全量测试通过(本条为 C8 核销锚点)
  ✅ C11 断点 1000px
  ✅ C11 断点 760px
  ✅ C11 断点 560px
  ✅ C11 打印样式
  ✅ C12 resume.json 顶层 en 含 base+1版本(ai)
  ✅ C12 英文姓名/职位
  ✅ C12 /ai 页面 payload 含 en
  ✅ C12 app.js 含语言切换按钮
  ✅ C12 app.js 含回退函数 fb()
  ✅ C12 app.js 更新 html lang 属性
  ✅ C12 index.html 无外部字体/资源
  ✅ C12 管理后台保持中文（无语言切换）
  ✅ C13 app.js 含对话框渲染器
  ✅ C13 对话框含竖版/横版选项
  ✅ C13 中文文案：选择打印版式/竖版/横版
  ✅ C13 英文文案：Choose print layout/Portrait/Landscape
  ✅ C13 提示含「另存为 PDF」指引（zh+en）
  ✅ C13 关闭路径：×/遮罩/Esc
  ✅ C13 幂等打开（已打开不叠层）
  ✅ C13 style.css 含对话框样式
  ✅ C14 print 媒体：opacity: 1 !important 覆盖
  ✅ C14 print 媒体：visibility: visible !important 覆盖
  ✅ C14 print 媒体：transform: none !important 覆盖
  ✅ C14 纯 CSS 覆盖（不清屏幕端动画状态）
  ✅ C15 静态 @page A4 portrait 兜底
  ✅ C15 html.print-portrait 版式类（print 媒体内）
  ✅ C15 html.print-landscape 版式类（print 媒体内）
  ✅ C15 竖版单列：hero 1fr / about 1fr / 技能 2列
  ✅ C15 横版双列：技能 3列 / 教育 2列 / about 双列
  ✅ C15 分页规则：无强制分页（rev 4 长页：.about break-before: page 已删除，见 C22*）
  ✅ C15 分页规则：标题块不拆分（.sec-head-wrap break-inside+break-after: avoid）
  ✅ C15 分页规则：卡片不截断（bubble/skill-card/eh-card + cover avoid；exp/proj/od-item 允许跨页，2026-11-25 C19）
  ✅ C15 背景色：卡片/section 无白底覆盖（body 白底除外——用于奶油色内缩）
  ✅ C15 背景色：print-color-adjust: exact 保证暖色底输出
  ✅ C15 色带内边距：.skills 打印保留左右 padding（色带不被卡片占满）
  ✅ C15 打印宽度钉死 + 奶油色内缩：body 白底 + #app 奶油底 margin 10mm（2026-11-25 C20：6mm→10mm）
  ✅ C15 打印宽度重置：section 子元素 max-width 解除（填满 @page 内容区）
  ✅ C15 app.js 动态注入 @page（横竖版）
  ✅ C15 afterprint 清理
  ✅ C15 对话框打印时隐藏
  ✅ C16 核心回归段全部通过
  ✅ C16 API 契约不变（6 端点）
  ✅ C17* 导航按钮带 js-print 类 + id=printBtn
  ✅ C17* hero 按钮带 js-print 类且移除重复 id（id=printBtn ≤1）
  ✅ C17* 统一绑定 querySelectorAll(.js-print)→openPrintDialog()
  ✅ C17* 绑定不依赖 GSAP（绑定行无 gsap）
  ✅ C17* 对话框幂等（已打开不叠层）
  ✅ C17* 按钮文案保持（打印 / 存为 PDF）
  ✅ C18* ensureCoverImages() 已定义
  ✅ C18* 打印前等待全部封面图 decode 再调 window.print()
  ✅ C18* 等待目标 .cover-img/.hero-card/.footer-avatar/.hero-bg
  ✅ C18* 404 兜底 window.__coverSvg(theme) 已定义
  ✅ C18* onerror 幂等（this.onerror=null + 注入 SVG）
  ✅ C18* 封面 img eager（无懒加载）
  ✅ C19* 竖版：封面图定高 240px
  ✅ C19* 竖版：封面容器 min-height: 0（不被固有高度撑高）
  ✅ C19* 横版：条目自然高度 align-items: start
  ✅ C19* 横版：封面图限高 460px（不拉伸超页高 673px）
  ✅ C19* 横版：无强制新页（rev 4 删除每 section break-before，见 C22*）
  ✅ C19* 预览结构：pv-long 类注入（print-* + preview-mode + pv-long）
  ✅ C19* 预览结构：body.preview-on + #previewBar 工具条（导出/关闭按钮）
  ✅ C19* 预览结构：无 #pvPages 分页卡片（长页无分页）
  ✅ C19* 预览结构：屏幕镜像块（纸张 210/297mm + 26/16mm 白边）
  ✅ C19* .footer 不被拆分
  ✅ C19* 封面图不拦腰截断（cover break-inside: avoid）
  ✅ C19* 长卡允许跨页（exp/proj/od-item break-inside: auto）
  ✅ C19* 文本 orphans/widows: 3 保持
  ✅ C20* 动态 @page 长页：210mm/297mm 宽 × 测高，margin 0
  ✅ C20* pv-long 打印块：body 210mm（竖）/297mm（横）+ 26/16mm 白边
  ✅ C20* #previewBar 打印时隐藏（fixed 工具条不溢出第 2 页）
  ✅ C20* #app 打印内缩 margin: 0 10mm（竖版 + 横版）
  ✅ C20* section 子元素 + .footer-inner 4mm 内容内边距
  ✅ C20* 屏幕端零影响（margin: 0 10mm 仅出现于两条 #app 规则）
  ✅ C20* @page 16mm 静态兜底不变
  ✅ C21* 测高公式：ceil(scrollHeight × 25.4/96) + 20mm 缓冲
  ✅ C21* 预览轮询：150ms 间隔，连续 3 次相同读数或 4s 超时定稿
  ✅ C21* pv-long 禁用布局过渡（测高须读稳定终值，过渡起始值虚高约 440mm）
  ✅ C22* .about break-before: page 已删除
  ✅ C22* 横版每 section break-before: page 已删除
  ✅ C22* 全文件无 break-before: page 残留（去注释判定）
  ✅ C22* #previewBreaks 分页预览线已删除
  ✅ C22* pv-paged 分页卡片块已删除
  ✅ C22* break-inside/break-after 规则保留（标题块不拆分）
  ✅ C22* 卡片不拦腰截断（bubble/skill-card/eh-card avoid）保留
  ✅ C23* 全局 beforeprint 监听
  ✅ C23* beforeprint：非预览时注入竖版长页（print-portrait preview-mode pv-long）
  ✅ C23* beforeprint：已在预览则沿用当前方向（pv-long 检查）
  ✅ C23* beforeprint：同步测高 + @page 210mm × H 注入
  ✅ C23* 全局 afterprint 监听
  ✅ C24* closePrintPreview：清 html 类
  ✅ C24* closePrintPreview：移除 body.preview-on
  ✅ C24* closePrintPreview：清 @page + 移除工具条
  ✅ C24* afterprint 仅在预览中清理（preview-on 守卫）
  ✅ C25* 零新增依赖（package.json 无 dependencies）
  ✅ C25* 无新增外部脚本引用（index.html script src = 3：gsap/ScrollTrigger/app.js）
  ✅ C25* app.js.gz 往返一致（大文件 .gz 提交模式）
  ✅ C25* test.py.gz 在库中
  ✅ C26* 核心回归段全部通过
  ✅ C26* API 契约不变（6 端点）
  ✅ C26* resume.json 结构不变（base + versions + en 顶层键）
  ✅ C17 app.js 含 8 区渲染函数
  ✅ C17 app.js 含统一头部 secHead()
  ✅ C17 编号眉标 00–05 齐全
  ✅ C17 英文眉标 ABOUT/EXPERIENCE/PROJECTS/SKILLS/EDUCATION/OFF DUTY
  ✅ C17 render() 组装顺序：about→experience→projects→skills→eduHonors→offDuty
  ✅ C17 style.css 含 8 区样式类
  ✅ C17 编号头部样式（sec-eyebrow + sec-head + sec-note）
  ✅ C18 问候徽章 hero-hello + helloBadge 文案
  ✅ C18 荧光笔划线职位 hero-title-mark
  ✅ C18 拱形人像（border-radius 30px 30px 60px 60px）
  ✅ C18 OPEN TO WORK 斜角标签 hero-open
  ✅ C18 NOW 状态卡 hero-now + 按版本切换
  ✅ C18 保留卡通人像 portrait-cartoon.jpg
  ✅ C19 ai 版本 advantages 4 条
  ✅ C19 app.js 渲染特质气泡 bubble
  ✅ C19 气泡复用 advantages 数据（advantages forEach）
  ✅ C19 态度型大标题（secAbout 文案）
  ✅ C19 ai 版 advantages 4 条
  ✅ C19 英文版 ai advantages 4 条
  ✅ C20 镜像交错类 mirror
  ✅ C20 中轴时间线编号 exp-node
  ✅ C20 数据压图 exp-metric + expMetrics
  ✅ C20 数据压图 metric 含 4.5年/1400h/9年
  ✅ C20 卡片五段式：period/title+role/desc/results
  ✅ C20 公司作为公共头 exp-company
  ✅ C20 英文 metric（4.5 yrs / 1,400h / 9 yrs）
  ✅ C21 镜像交错类 mirror（proj-item）
  ✅ C21 数据压图 proj-metric + projMetrics
  ✅ C21 数据压图 metric 含 2150+/3 API/CRDT
  ✅ C21 卡片含 badge/title/link/desc/items/stack
  ✅ C21 featured 项目加重（featuredProject）
  ✅ C21 豹豹助手链接渲染（p.link + proj-link + target=_blank）
  ✅ C21 豹豹助手数据链接为 zxz0608.com
  ✅ C21 英文 metric（2,150+ / 3 APIs / CRDT）
  ✅ C22 分组卡片 skill-card + skill-group
  ✅ C22 技能组数 = 7
  ✅ C22 图标徽章横向排列 skill-badges
  ✅ C22 悬浮动效保留（yoyo + sine.inOut + skill-badge）
  ✅ C22 英文技能组数 = 7
  ✅ C23 独立区 edu-honors + eh-grid
  ✅ C23 教育卡 eh-edu + 校园占位 svgArt('campus')
  ✅ C23 校徽徽章 eh-badge
  ✅ C23 荣誉卡 eh-honors
  ✅ C23 AWS 认证去重（certs + honors 无重复）
  ✅ C23 教育数据来自 resume.json education
  ✅ C24 新增区 off-duty + od-list
  ✅ C24 占位交替卡 od-item + mirror
  ✅ C24 占位 SVG od-cover + 编号角标 od-num
  ✅ C24 占位提示文案已移除「后续可替换」
  ✅ C24 兴趣内容在 UI 字典 interests（不入 resume.json）
  ✅ C24 resume.json 不含 interests 字段（数据模型稳定）
  ✅ C25 内联 SVG 生成函数 svgArt()
  ✅ C25 SVG 主题枚举齐全（svgArt 含 rms/rpa/erp/baobao/aipro-bridge/deskshare/campus/interest0-2）
  ✅ C25 SVG 暖色调（accent-soft/accent-ink/accent 色值）
  ✅ C25 SVG viewBox + preserveAspectRatio（响应式）
  ✅ C25 数据压图大号字（exp-metric/proj-metric CSS clamp 字号）
  ✅ C25 无外部图片请求（svgArt 内联，无 http img src）
  ✅ C25 打印时 SVG 与压图输出（print-color-adjust: exact）
  ✅ C26 核心回归段全部通过
  ✅ C26 API 契约不变（6 端点）
  ✅ C26 resume.json 结构不变（base + versions + en 顶层键）
  ✅ C26 暖色配色不变（C1 token 齐全）
  ✅ C26 中英双语保留（langBtn + fb() + en 结构）
  ✅ C26 打印流程保留（printDialog + 横竖版 + afterprint）
  ✅ C26 admin 不受影响（admin.css 独立 + 不引用 style.css）
  ✅ C27 app.js 含 navBar() 渲染函数
  ✅ C27 render() 用 navBar 替代 topbar
  ✅ C27 胶囊形导航栏 navbar + data-state
  ✅ C27 顶部感应区 nav-sensor
  ✅ C27 7 项导航锚点（about/experience/projects/skills/edu-honors/off-duty/contact）
  ✅ C27 导航项文案 navItems（关于我/工作经历/个人作品/技能档案/教育与荣誉/兴趣爱好/联系我）
  ✅ C27 英文导航项（About/Experience/Projects/Skills/Education/Off Duty/Contact）
  ✅ C27 自动隐藏逻辑：showNavBar/hideNavBar + setTimeout 2000ms
  ✅ C27 鼠标事件：mouseenter/mouseleave + scroll
  ✅ C27 首屏常驻：scrollTop <= 100 判断
  ✅ C27 平滑跳转：scrollIntoView behavior smooth
  ✅ C27 保留语言切换 langBtn + 打印按钮 printBtn
  ✅ C27 style.css 胶囊形样式（navbar + border-radius 999px + box-shadow）
  ✅ C27 丝滑动画：transition transform/opacity + cubic-bezier easeOutQuint
  ✅ C27 隐藏态：translateY(-130%) + opacity:0
  ✅ C27 打印时隐藏导航栏（.navbar, .nav-sensor display none）
  ✅ C27 不依赖 GSAP（纯 CSS transition + 原生 JS 事件）
  ✅ C27 旧 topbar 样式已移除（style.css 无 .topbar）
  ✅ C28 app.js navBar 不含 nav-versions 版本切换
  ✅ C28 app.js navBar 不含 nav-ver 链接
  ✅ C28 导航栏右侧仅语言+打印按钮（langBtn + printBtn 保留）
  ✅ C28 /ai URL 仍可访问（200）
  ✅ C28 /it 302 重定向到 /ai
  ✅ C28 /test 302 重定向到 /ai
  ✅ C28 /erp 302 重定向到 /ai
  ✅ C28 /admin 仍可访问（版本管理后台）
  ✅ C28 admin.css 不引用 style.css（后台独立）
  ✅ C28 app.js 不渲染其他版本链接（无 allVersions forEach 在 navBar）
  ✅ C29 X-Content-Type-Options: nosniff
  ✅ C29 X-Frame-Options: DENY
  ✅ C29 Content-Security-Policy 存在
  ✅ C29 保存含 </script> 的数据被拒绝（400）
  ✅ C29 保存缺少 base/versions 的数据被拒绝
  ✅ C29 /api/data 手机号脱敏（含 ****）
  ✅ C29 /api/data/full 未登录返回 401
  ✅ C29 路径遍历 /../../../etc/passwd 返回 404
  ✅ C29 路径遍历 URL编码 返回 404
  ✅ SF1(spec C1) 畸形URL /%ZZ 返回4xx/5xx
  ✅ SF1(spec C1) 畸形URL后 /ai 仍返回200
  ✅ SF1(spec C1) 服务器进程存活
  ✅ SF2(spec C2) /api/data/full 手机号完整（无****）
  ✅ SF3(spec C3) ~100KB 中文数据保存成功
  ✅ SF3(spec C3) 大体积中文往返无损
  ✅ SF5(spec C5) 保存 javascript: 链接被拒绝（400）
  ✅ SF5(spec C5) app.js 链接渲染 scheme 白名单（^https?://）
  ✅ SF6(spec C6) admin.js esc 含单引号转义
  ✅ SF6(spec C6) app.js esc 含单引号转义
  ✅ SF6(spec C6) app.js dataFor ver 空值兜底（防白屏）
  ✅ SF7(spec C7) 含 $& 的姓名可保存
  ✅ SF7(spec C7) 页面按字面渲染（无 replace 展开）
  ✅ SF7(spec C7) admin.js 导出 replace 函数化
  ✅ SF8(spec C8) admin.js input 事件委托置脏标记
  ✅ SF9(spec C9) server.js 使用 timingSafeEqual
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
通过: 335   失败: 0   总计: 335
========================================================



## cdp-print.mjs 详细输出

========================================================
打印/PDF 流程 CDP 实测（修订 4 · 端口 3998 · headless Chrome）
========================================================
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
  ✅ C19* 选竖版不直接触发 window.print（WYSIWYG 延迟打印）
  ✅ C19* html.print-portrait preview-mode pv-long 类注入
  ✅ C19* body.preview-on 类注入
  ✅ C19* #previewBar 工具条可见
  ✅ C19* 纸张宽 210mm（≈793.7px）
  ✅ C19* 白边 上 26mm / 左 16mm（≈98.4px / ≈60.5px）
  ✅ C19* 工具条固定顶部（top=0，高度>0）
  ✅ C19* 工具条含「导出 PDF」+「关闭预览」按钮
  ✅ C19* 无页卡（#pvPages/.page-card 不存在）
  ✅ C19* 屏幕背景纸张色（rgb(233,228,218)）
  ✅ C19* 预览期导航栏隐藏
  ✅ C21* @page 稳定轮询定稿 210mm × H
  ✅ C21* 竖版总高 H ≈ 3293mm（±50mm）
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
  ✅ C20* #app 打印内缩 margin: 0 10mm（上下 0、左右 ≈37.8px）
  ✅ C20* pvExport 点击触发 window.print 一次
  ✅ C20* 竖版 PDF 恰好 1 页
  ✅ C20* 竖版 PDF 纸宽 210mm（≈595.28pt，±3pt）
  ✅ C20* 竖版 PDF 纸高 ≈3293mm（≈9334.6pt，±141.7pt）
  ✅ C24* 导出后状态清理（类/工具条/@page 清除）
  ✅ C19* html.print-landscape preview-mode pv-long 类注入
  ✅ C19* 横版纸张宽 297mm（≈1122.5px）
  ✅ C21* @page 稳定轮询定稿 297mm × H
  ✅ C21* 横版总高 H ≈ 2512mm（±50mm）
  ✅ C15 横版：技能卡片 3 列
  ✅ C15 横版：hero 双列
  ✅ C15 横版：body 白底 + #app 奶油底内缩
  ✅ C19* 横版：11 张封面图高度 ≤ 460px（无截断）
  ✅ C20* 横版 PDF 恰好 1 页
  ✅ C20* 横版 PDF 纸宽 297mm（≈841.89pt，±3pt）
  ✅ C20* 横版 PDF 纸高 ≈2512mm（≈7120.6pt，±141.7pt）
  ✅ C24* 导出后状态清理（类/工具条/@page 清除）
  ✅ C23* 直接 Ctrl+P 输出 1 页长页（beforeprint 注入）
  ✅ C23* 竖版长页纸张（≈595.28 × ≈9334.6pt，±容差）
  ✅ C23* afterprint 清理（类/工具条/@page 清除）
  ✅ C24* 打开预览 → 工具条可见
  ✅ C24* 关闭预览 → 状态清理
  ✅ C24* 重开预览 → 工具条可见
  ✅ C24* 再关闭预览 → 状态清理（幂等）
  ✅ C18* 封面图 404 → onerror 注入 __coverSvg SVG 占位（无空白封面）
  ✅ 全程无未捕获 JS 异常
========================================================
CDP 打印实测（修订 4）：通过 61   失败 0   总计 61
========================================================


