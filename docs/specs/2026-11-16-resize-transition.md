# 2026-11-16 宽度变化过渡动画 · CSS transition + View Transitions — spec 契约

> 本文件是需求的唯一事实来源。用户确认 = 签约，之后编码/测试/验收/PR 全部从本文件派生。
> 需求来源：用户 2026-11-16 原话——"在宽度变化的时候，页面的变化有些不够丝滑。有没有行业的解决方法是针对这种不同的应用端的宽度变化的时候有一个很好的过渡动画。"
> 方案选择：A+B 结合（用户 AskQuestion 确认）——CSS transition 用于 resize，View Transitions API 用于语言切换。

---

## 1. 背景与目标（what & why）

v1.7.1 手机端适配修复已完成，但拖动浏览器窗口改变宽度时，布局"突变"（双列↔单列、padding/gap/font-size 变化）没有过渡动画，体验不够丝滑。

目标：为宽度变化添加平滑过渡动画，分两个场景：
- **resize 宽度变化**：用 CSS `transition` 给布局属性（grid-template-columns/padding/gap/font-size）加过渡，宽度变化时平滑过渡而非突变
- **语言切换**：用 View Transitions API 做整页交叉淡变（93% 浏览器支持，不支持的降级为瞬间切换）

版本 v1.7.2（patch，纯前端视觉增强）。

### 需求澄清记录（Step 1）

- **原始需求**：宽度变化时页面变化不够丝滑，希望有过渡动画
- **优化后需求**：resize 用 CSS transition 平滑过渡布局属性；语言切换用 View Transitions API 整页淡变
- **优化说明**：联网查 Can I Use 确认 View Transitions API 全球 93.17% 支持（Chrome 111+/Safari 18+/Firefox 144+），不支持的浏览器 graceful degrade；View Transitions 不适用于连续 resize（需离散 DOM 变化），故 resize 用 CSS transition
- **用户问答**：方案选择 → "A+B 结合"

## 2. 方案自审（怎么做）

- **复用盘点**（实际查过）：
  - `public/style.css`：响应式断点 1000/760/560，布局属性在媒体查询里变化 → 给关键布局属性加 `transition`
  - `public/app.js`：`bind()` 里 `langBtn` 点击切换语言调 `render()` → 用 `document.startViewTransition` 包裹 `render()`
- **决策：A 复用 + B 扩展**——CSS transition 复用现有样式（只加 transition 声明）；View Transitions 在现有 `render()` 调用处扩展
- **影响面**：页面 `/ai /it /test /erp`（4 版本共用）；接口/数据/权限无变化；`/admin` 不受影响（独立 admin.css/js）
- **兼容性**：CSS transition 对 `grid-template-columns` Chrome 111+ 支持，旧浏览器降级为瞬间切换；View Transitions 93% 支持，7% 降级
- **安全增量**：无新增依赖/外部输入面
- **测试策略**：CDP 坐标断言（transition 生效 + View Transitions 调用）+ 既有回归

## 3. 技术蓝图

- **前端**：
  - `public/style.css`：给 `.proj-item`/`.exp-item`/`.od-item`/`.hero-inner`/`.about-wrap`/`.skill-cards`/`.eh-grid`/`.footer-main` 的 `grid-template-columns` 加 `transition: grid-template-columns 0.4s ease`；给 section `padding` 加 `transition: padding 0.4s ease`；给 `.proj-metric`/`.exp-metric` `font-size` 加 `transition: font-size 0.4s ease`；给 `.nav-menu`/`.nav-burger` `opacity` 加过渡（display 不能 transition，用 opacity + visibility 替代）
  - `public/app.js`：`bind()` 里 `langBtn` 点击用 `document.startViewTransition` 包裹 `render()`（不支持时直接 `render()`）
- **后端/数据库/环境依赖**：无变更

## 4. 非目标

- 不做：不引入新依赖；不改接口/数据/权限；不改打印版式；不为旧浏览器做 polyfill（graceful degrade 即可）

## 5. 契约条款

### C1 resize 宽度变化时布局属性平滑过渡

- **前置条件**：浏览器支持 CSS transition on grid-template-columns（Chrome 111+）或 View Transitions API
- **后置条件**：拖动窗口宽度跨越断点（1000/760/560）时，用 View Transitions API 做整页交叉淡变（CSS transition 对数值属性如 padding/gap/font-size 平滑过渡；grid-template-columns 列数变化由 View Transitions 交叉淡变覆盖）；同断点内移动不触发
- **失败行为**：旧浏览器不支持 → 降级为瞬间切换（与当前一致，不会更差）
- **不变式**：过渡不影响最终布局结果（过渡完成后布局与无 transition 时一致）

### C2 语言切换时整页交叉淡变

- **前置条件**：浏览器支持 View Transitions API（93%）
- **后置条件**：点击语言按钮切换语言时，整页内容交叉淡变过渡（默认 ~0.25s），而非瞬间替换
- **失败行为**：不支持 View Transitions → 直接 render() 瞬间切换（与当前一致）
- **不变式**：语言切换功能不变（中英切换正确）；过渡不影响内容

## 6. 验收标准

- [ ] A1 拖动浏览器窗口改变宽度时，布局**平滑过渡**而非突变（双列↔单列、padding 变化有动画）
- [ ] A2 点击语言按钮（EN/中文）切换时，页面**交叉淡变**过渡
- [ ] A3 过渡完成后布局与之前一致（无错位/残留）
- [ ] A4 桌面端/手机端/平板端布局不受影响

## 7. 边界与异常

| 场景 | 期望表现 |
|---|---|
| 快速来回拖动窗口 | transition 平滑跟随，无卡顿/闪烁 |
| 不支持 transition 的浏览器 | 瞬间切换，无报错 |
| 不支持 View Transitions 的浏览器 | 语言切换瞬间完成，无报错 |
| 打印 | transition 不影响打印（@media print 不触发 transition） |

## 8. 三问完整性检查 + DoR

- [x] ① 取值范围：transition duration 0.4s、ease；View Transitions 默认时长
- [x] ② 状态流转：无状态流程（CSS transition 由媒体查询触发，View Transitions 由点击触发）
- [x] ③ 生成逻辑：CSS transition 声明在样式里；View Transitions 包裹 render()

**DoR**：需求无歧义 ☑、技术可行 ☑、影响面已盘 ☑

---

## 9. 核销记录（Step 5 填写）

| 条款 | 测试用例 | 结果 | 路径真实性 |
|---|---|---|---|
| C1 | `test_c1_resize_transition`（cdp-transition-verify.mjs） | ✅ | CDP |
| C2 | `test_c2_lang_view_transition`（cdp-transition-verify.mjs） | ✅ | CDP |

- 分级回归：test/test.py 276/276 + cdp-print.mjs 31/31 + cdp-mobile-verify.mjs 30/30（报告：stdout）
- 影响面：页面 `/ai /it /test /erp`；接口/数据/权限 无；配置/缓存 无
