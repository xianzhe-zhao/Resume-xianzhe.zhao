# 2026-11-13 手机端适配修复 · 个人作品 featured 塌缩 + 全面优化 — spec 契约

> 本文件是需求的唯一事实来源。用户确认 = 签约，之后编码/测试/验收/PR 全部从本文件派生。
> 需求来源：用户 2026-11-13 原话——"你看一下手机端适配的情况，情况很不好。个人作品部分很糟糕。"
> 诊断方式：headless Chrome CDP 实测 390px 视口，对所有 8 区做 `getBoundingClientRect` + `computed style` 度量扫描。

---

## 1. 背景与目标（what & why）

v1.3.0 简历桌面端（1440px）与打印版式完善，但手机端（390px）存在一个严重破版 bug 和若干体验缺陷：

- **个人作品第 1 个项目（豹豹助手，featured）在手机端严重破版**：CSS 特异性 bug 导致它在 ≤1000px 没有塌缩成单列，仍是双列（cover 178px + info 146px），标题/描述/5 条功能/7 个技术栈全挤在 106px 宽，卡片高度 2126px（正常项目约 900px），cover 的 SVG 插画被 stretch 拉到 178×2126 严重变形。整个 projects 区因此高达 4298px。
- **导航栏菜单在手机端横向滚动**：7 项菜单在 366px navbar 里放不下（scrollWidth 557 > 可视 187），靠 `overflow-x:auto` 横向滚动，后面的"联系我"等项需滑动才能看到。手机端应改为苹果官网式汉堡菜单（2 条杠按钮 + 点击展开跳转面板）。
- **触摸目标过小**：lang-btn 30px、nav-print 34px、fc-links a 26px、proj-link 43px，均低于 Apple HIG/WCAG 建议的 44px 最小触摸目标。
- **proj-metric 字号偏大**：clamp(40px,5vw,64px) 在 390px 下取下限 40px，"2150+" 占 cover 宽度 38%。

目标：修复 featured 塌缩 bug（P0）+ 全面优化手机端体验（导航栏/触摸目标/字号），**只改 `public/style.css` 一个文件**，不动 app.js 交互逻辑、不动接口/数据/权限。版本 v1.3.1（patch）。

> 技术约束（不变）：零依赖、零外部图片请求、resume.json 不动、API 不动、打印版式逻辑不动、4 版本 + 中英双语 + GSAP 动效全部保持。

### 需求澄清记录（Step 1）

- **原始需求**：用户原话——"你看一下手机端适配的情况，情况很不好。个人作品部分很糟糕。"
- **优化后需求**：修复个人作品区 featured 项目在手机端因 CSS 特异性 bug 未塌缩单列导致的严重破版（P0），并全面优化手机端体验——导航栏菜单横向滚动、触摸目标过小、数据压图字号偏大（P1/P2）。
- **优化说明**：用 headless Chrome CDP 实测 390px 视口，对所有 8 区做布局度量扫描，精确定位根因（CSS 特异性）和量化所有体验缺陷（触摸目标高度、菜单溢出量、字号占比），避免凭印象下结论。
- **用户问答**：
  - 问：修复范围？→ 答："修 bug + 全面优化手机端"（不只修 featured bug，顺带优化导航栏/触摸目标/字号等次要体验点）。
  - 问：手机端导航栏方案？→ 答："能做成像苹果官网（apple.com.cn）一样。右侧做成汉堡按钮，但不要三条杠，做成 2 条杠，然后点击之后显示跳转。"（参照苹果官网窄屏导航：2 条杠图标 + 点击展开跳转菜单）
  - 导航栏位置不变（仍在顶部悬浮），手机端把 7 项锚点菜单收进汉堡按钮，点击展开面板跳转。

## 2. 方案自审（怎么做）

- **复用盘点**（实际查过）：
  - `public/style.css`（320 行）：含 `:root` 暖色 token（**不变**）、hero/about/experience/projects/skills/edu-honors/off-duty/footer/navbar 样式、响应式断点 1000/760/560、`@media print`（C15 横竖版）→ **修改响应式媒体查询段 + projects 样式段 + 新增汉堡菜单面板样式**
  - `public/app.js`（867 行）：渲染器 + GSAP 动效 + 导航栏交互逻辑（C27 `initNavBar()` 含 mouseenter/mouseleave/scroll/平滑滚动跳转）→ **新增手机端汉堡菜单点击展开/收起逻辑**（在 `bind()`/`initNavBar()` 内扩展，复用现有平滑滚动跳转；不改桌面端 hover 逻辑）
  - `data/resume.json` / `server.js` / `public/admin*` / API 6 端点 → **不动**
  - `test/test.py`（237 项）/ `test/cdp-print.mjs`（31 项）→ **不破坏既有断言**；本次用 CDP 坐标断言验证（新增诊断脚本，Step 9 清理）
  - 版本：package.json 1.3.0 + CHANGELOG.md → 1.3.1
- **决策：A 复用 + B 扩展**——不改系统形态，featured 塌缩用 CSS 复用现有断点；导航栏汉堡菜单在现有 `initNavBar()` 交互基础上扩展（复用平滑滚动跳转逻辑），新增点击展开/收起状态。理由：根因是 CSS 特异性覆盖失败（1 条规则即可修），汉堡菜单是现有导航栏的移动端形态扩展，无需新建模块。
- **影响面**：
  - 页面：`/ai /it /test /erp`（4 版本共用同一 style.css + app.js，手机端 ≤760px 布局 + 导航交互变化）；`/admin` **不受影响**（admin 引用独立 admin.css + admin.js）
  - 接口/调用方：**无变化**（6 端点不动）
  - 表/字段：**无变化**（resume.json 不动）
  - 配置/缓存/端口：无
  - 回归范围：触及核心页面（同页面/共用 style.css+app.js/共用打印 CSS）→ **核心功能回归**：test/test.py 全量 + cdp-print.mjs 全量 + 新增手机端 CDP 坐标断言
- **兼容性**：API 契约不变；resume.json 不变；打印 PDF 不受影响（`@media print` 段不动，仅屏幕端 `@media (max-width)` 段改动）；桌面端 ≥1000px 布局完全不变（所有改动在 ≤1000px 媒体查询内）
- **成本预算**：无（无 LLM/付费 API/新依赖）
- **安全增量**：自上次周期审查（2026-10-31）无新增依赖、无新外部输入面（本次仅改 CSS，无网络请求、无新端点、无新外部输入）——无新增攻击面
- **测试策略**：
  - CDP 真实 Chrome 坐标断言（390px 手机 + 768px 平板 + 1440px 桌面对照）：featured 列数/info 宽度/触摸目标高度/导航栏 display/metric 字号
  - 既有回归：test/test.py 237 项 + cdp-print.mjs 31 项不破坏
  - 桌面端 ≥1000px 不变性断言：featured 仍双列、nav-menu 仍可见（确保改动只在移动端生效）

## 3. 技术蓝图（按涉及领域填，不涉及写"无变更"）

- **前端**：
  - 改动文件：`public/style.css` + `public/app.js`（两个）
  - C1（style.css）：`@media(max-width:1000px)` 内补 `.proj-item.featured { grid-template-columns: 1fr; }`（特异性 0,2,0 覆盖基线 0,2,0）
  - C2（style.css + app.js）：手机端汉堡菜单——参照苹果官网窄屏导航
    - style.css：`@media(max-width:760px)` 内隐藏 `.nav-menu`；nav-right 新增 `.nav-burger` 按钮（2 条杠图标，≤760px 显示，>760px 隐藏）；新增 `.nav-panel` 展开面板样式（全宽、暖白底、从导航栏下方下滑展开、7 项纵向列表、点击遮罩或菜单项收起）；`.nav-panel-overlay` 展开时 `backdrop-filter: blur(6px)` 背景虚化
    - app.js：`navBar()` 渲染加 `.nav-burger` 按钮 + `.nav-panel` 面板 + `.nav-panel-overlay` 遮罩（复用 `ui.navItems`）；`initNavBar()` 加 burger 点击 toggle 展开/收起、菜单项点击复用现有平滑滚动跳转后收起、遮罩点击收起、Esc 收起；`hideNavBar()` 面板展开时 return 不隐藏
  - C3（app.js）：手机端导航栏滚动隐藏/停止显示——`initNavBar()` 的 `syncNavState` 加滚动方向检测（`isMobile()` 时）：下滑 `delta>6` 立即隐藏 + `scrollHideActive` 锁 + 600ms 兜底恢复计时；上滑 `delta<-6` 立即显示；停止（delta 极小）且已隐藏时 600ms 后恢复；面板展开时不隐藏（C2 优先）；桌面端 `!isMobile()` 仍用原 hover/2 秒隐藏
  - C4（style.css）：`@media(max-width:760px)` 内加大触摸目标——`.lang-btn`/`.nav-print`/`.nav-burger` min-height 44px；`.fc-links a` padding 增至 ≥44px 高；`.proj-link` padding 增至 ≥44px 高；`.nav-panel a` 每项 ≥48px 高
  - C5（style.css）：`@media(max-width:560px)` 内 `.proj-metric` font-size 降至 32px（cover 342px 上占比降至 ~25%）
  - UI 坐标断言点：390px 下 `.proj-item.featured` gridTemplateColumns 列数=1、`.proj-info` 宽≥300px、`.nav-menu` display=none、`.nav-burger` display≠none 且 height≥44px、burger 点击后 `.nav-panel` 可见、菜单项点击后平滑滚动+面板收起、`.lang-btn`/`.nav-print`/`.fc-links a`/`.proj-link` height≥44px、`.proj-metric` fontSize≤36px、下滑后 navbar hidden、停止后恢复 visible、overlay backdropFilter 含 blur
  - 设计规范遵循：暖色 token 不变、断点框架沿用 1000/760/560、无新依赖、2 条杠图标用内联 SVG（与现有 ICONS 风格一致）
- **后端**：无变更
- **数据库**：无变更
- **环境依赖**：无变更

## 4. 非目标（out of scope）

- 不做：不改 app.js 桌面端导航栏 hover 交互逻辑（C27 mouseenter/mouseleave/scroll/首屏常驻 不动）；手机端汉堡菜单为新增交互，不替换桌面端逻辑
- 不做：不改 resume.json 数据模型
- 不做：不改任何 API 端点
- 不做：不改 `@media print` 打印版式（C15 横竖版逻辑不动；打印时汉堡按钮与面板隐藏）
- 不做：不改桌面端 ≥1000px 布局（汉堡按钮 >760px 不显示，面板 >760px 不渲染可见）
- 不做：不引入任何新前端依赖/新字体/新外部图片
- 不做：不重构板块结构（8 区结构保持 v1.3.0）

## 5. 契约条款（C1 / C2 / …）

### C1 featured 个人作品项目在 ≤1000px 塌缩单列 🔒

- **前置条件**：视口宽度 ≤1000px；projects 区存在 `.proj-item.featured`（豹豹助手）
- **后置条件**：`.proj-item.featured` 的 `grid-template-columns` 列数 = 1；`.proj-info` 宽度 ≥300px（390px 视口下）；projects 区总高度 < 3000px
- **失败行为**：若仍为双列 → info 宽 <160px、内容挤压、SVG 变形（当前 bug 状态）
- **不变式**：≥1000px 桌面端 `.proj-item.featured` 仍为 `1.1fr 0.9fr` 双列（桌面端不变）

### C2 手机端汉堡菜单（2 条杠按钮 + 点击展开跳转 + 背景虚化）🔒

- **前置条件**：视口宽度 ≤760px；导航栏已渲染（`.navbar` 存在）
- **后置条件**：
  - `.nav-menu`（7 项横向菜单）`display` = `none`（不再横向滚动）
  - `.nav-burger`（2 条杠按钮）`display` ≠ `none` 且 `height` ≥ 44px，位于 nav-right
  - 点击 `.nav-burger` → `.nav-panel` 展开（可见、从导航栏下方下滑出现），含 7 项锚点纵向列表，每项 `height` ≥ 48px
  - **面板展开期间导航栏必须保持常驻可见**（`data-state=visible`，不因 mouseleave/2 秒计时隐藏）——面板与导航栏视觉一体，导航栏隐藏而面板留着会割裂
  - **面板与导航栏之间留有舒适间距**（面板 `top` 距导航栏底部 ≥ 16px，不紧贴）
  - **面板展开时页面背景虚化**：`.nav-panel-overlay` 覆盖全屏，背景 `backdrop-filter: blur()` 使后方内容模糊；点击遮罩收起面板并解除虚化
  - 点击 `.nav-panel` 内菜单项 → 平滑滚动到对应板块 + 面板收起 + 解除虚化
  - 点击面板遮罩 / 再点 burger / 按 Esc → 面板收起 + 解除虚化
- **失败行为**：若菜单仍横向滚动或 burger 不可点 → 手机端无法跳转（当前 bug 状态）；若展开后导航栏隐藏而面板留着 → 视觉割裂；若展开后背景未虚化 → 层次不清
- **不变式**：>760px `.nav-menu` 仍 `display:flex` 可见、`.nav-burger` `display:none`、`.nav-panel` 不渲染可见（桌面端完全不变）；打印时 burger 与面板均隐藏

### C3 手机端导航栏滚动隐藏/停止显示 🔒

- **前置条件**：视口宽度 ≤760px；导航栏已渲染
- **后置条件**：
  - 用户向下滚动 → 导航栏向上滑出隐藏（`data-state=hidden`），不遮挡内容
  - 用户停止滚动或向上滚动 → 导航栏滑回显示（`data-state=visible`）
  - 页面在顶部（`scrollTop ≤ 100px`）→ 导航栏常驻显示
  - 汉堡面板展开时 → 导航栏不隐藏（C2 优先，不受滚动隐藏影响）
- **失败行为**：若滚动时导航栏不隐藏 → 遮挡内容；若停止/上滑不恢复 → 无法访问导航
- **不变式**：>760px 桌面端仍用原 hover/2 秒隐藏机制（C27 不变）；面板展开时滚动隐藏不生效（C2 锁定优先）

### C4 手机端触摸目标 ≥44px

- **前置条件**：视口宽度 ≤760px；元素可见（display≠none）
- **后置条件**：`.lang-btn`、`.nav-print`、`.fc-links a`、`.proj-link` 的 `getBoundingClientRect().height` ≥ 44px
- **失败行为**：触摸目标 <44px → 手指点不准、误触（当前 lang-btn 30px / nav-print 34px / fc-links a 26px / proj-link 43px）
- **不变式**：加大触摸目标不改变元素文本内容与功能；桌面端尺寸不受影响（改动仅在 ≤760px 媒体查询内）

### C5 个人作品数据压图字号在 ≤560px 缩小

- **前置条件**：视口宽度 ≤560px；projects 区 `.proj-metric` 可见
- **后置条件**：`.proj-metric` 的 `font-size` ≤ 36px（390px 视口下）
- **失败行为**：字号 40px → "2150+" 占 cover 宽度 38%，偏大压迫感（当前状态）
- **不变式**：>560px `.proj-metric` 仍为 `clamp(40px,5vw,64px)`（平板/桌面不变）；metric 文本内容不变

### C6 中小视口禁用 GSAP 入场动画（内容直接可见）🔒

- **前置条件**：视口宽度 ≤1024px；GSAP 已加载
- **后置条件**：≤1024px（手机+平板，含 iPad Pro）不执行 `gsap.from()` 入场动画（section 标题/卡片/气泡的 opacity:0 初始态不设置）；所有 section 内容在页面加载后立即可见（`opacity:1 / visibility:visible`），无大片透明占位空白
- **失败行为**：若仍执行入场动画 → 首屏下方 14~28 个元素 opacity:0，用户看到大片空白（当前 bug 状态，手机 14 个 / 平板 28 个 / 1024px 16 个且滚动后仍 5 个隐藏）
- **不变式**：>1024px 大屏（笔记本/桌面）GSAP 入场动画正常执行（C10 不变）；`prefers-reduced-motion` 仍优先禁用所有动画；控件按压反馈所有视口保留

## 6. 验收标准（用户逐条打勾）

> 用手机浏览器（或 Chrome DevTools 设备模拟 390px）打开 `http://127.0.0.1:3999/ai`，强刷后逐条检查。

- [ ] A1 个人作品区 3 个项目在手机端**全部单列**显示，豹豹助手不再是左右挤压的双列（标题/描述/功能列表/技术栈完整可读，无 106px 窄列）
- [ ] A2 豹豹助手封面 SVG 插画**不再变形**（单列下 cover 宽 342px、高 260px，比例正常）
- [ ] A3 手机端导航栏右侧出现**2 条杠汉堡按钮**（不是 3 条杠），7 项菜单不再横向滚动；点击按钮展开菜单面板，点击"个人作品"等项平滑跳转到对应板块并收起
- [ ] A4 手机端语言按钮、打印按钮、页脚电话/邮箱链接、项目链接**触摸目标高度 ≥44px**，手指可舒适点按（C4）
- [ ] A5 个人作品封面上的大号数字（2150+/3 API/CRDT）字号适中，不再占封面 1/3 宽（C5）
- [ ] A6 桌面端（≥1000px）布局**完全不变**——featured 仍双列、导航菜单仍可见、字号仍原值
- [ ] A7 打印 PDF（横竖版）**不受影响**——版式、分页、内容与 v1.3.0 一致
- [ ] A8 点击汉堡按钮后，**页面背景虚化**（后方内容模糊），层次清晰；收起后解除虚化
- [ ] A9 手机端**向下滚动时导航栏隐藏**，**停止滚动或上滑时导航栏恢复显示**；页面顶部时常驻
- [ ] A10 手机/平板（≤1024px）打开页面后**往下滑不出现大片空白**——所有 section 内容立即可见（无 GSAP 入场动画导致的透明占位）

## 7. 边界与异常

| 场景 | 期望表现 |
|---|---|
| 视口恰好 1000px / 760px / 560px 断点 | 断点边界两侧布局正确切换，无闪烁 |
| 768px 平板竖屏 | featured 单列（≤1000px 生效）；nav-menu 仍可见、burger 隐藏（>760px）；触摸目标按桌面尺寸 |
| 390px iPhone | C1/C2/C3/C4 全部生效；burger 可点展开/收起跳转 |
| 320px 窄屏（iPhone SE） | 单列布局不溢出，无横向滚动条（body scrollWidth ≤ viewportWidth）；汉堡面板全宽可读 |
| 桌面端 1440px | 所有改动不生效，布局与 v1.3.0 完全一致 |
| 打印媒体 | `@media print` 段未改动，横竖版 PDF 与 v1.3.0 一致 |

## 8. 三问完整性检查 + DoR（不过不得开工）

- [x] ① **取值范围**：视口宽度区间 [320, ∞) px，断点 1000/760/560；触摸目标高度 [44, ∞) px；metric 字号 (0, 36] px（≤560px）/ clamp(40,64) px（>560px）——均可精确描述
- [x] ② **状态流转**：无状态流程（纯 CSS 响应式，无会话/任务/订单状态机）
- [x] ③ **生成逻辑**：每个 CSS 规则的生效条件 = `@media(max-width:Xpx)` 媒体查询匹配，一句话可描述

**DoR 自检**：需求无歧义 ☑、技术可行 ☑（纯 CSS，已实测根因）、影响面已盘 ☑（仅 style.css，4 版本共用，admin 不受影响）

---

## 9. 核销记录（Step 5 填写，PR 里引用）

| 条款 | 测试用例 | 结果 | 路径真实性 |
|---|---|---|---|
| C1 | `test_c1_featured_single_col`（cdp-mobile-verify.mjs） | ✅ | CDP 坐标 |
| C2 | `test_c2_burger_menu_expand_jump`（cdp-mobile-verify.mjs + cdp-mobile-fix.mjs） | ✅ | CDP 点击+坐标 |
| C3 | `test_c3_scroll_hide_stop_show`（cdp-mobile-c5.mjs） | ✅ | CDP 滚动+坐标 |
| C4 | `test_c4_tap_targets_44`（cdp-mobile-verify.mjs） | ✅ | CDP 坐标 |
| C5 | `test_c5_metric_font_size`（cdp-mobile-verify.mjs） | ✅ | CDP 坐标 |
| C6 | `test_c6_no_blank_resize`（cdp-mobile-opacity.mjs + cdp-tablet-opacity.mjs + cdp-resize-blank.mjs + cdp-anim-play.mjs） | ✅ | CDP 坐标 |

- 分级回归：核心功能回归 PASS —— test/test.py 237/237（报告：stdout）+ test/cdp-print.mjs 31/31（报告：stdout）+ cdp-mobile-verify.mjs 30/30（含桌面端不变性 + 768px 断点边界）
- 影响面（来自第 2 节）：页面 `/ai /it /test /erp`（≤760px 布局 + 导航交互）；接口/调用方 无；表/字段 无；配置/缓存 无
