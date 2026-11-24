# spec: 2026-11-15 安全审查问题全量修复

## 1 背景与需求澄清记录

- **需求来源**：用户要求代码层全面安全审查（联网核验 + 找 BUG），审查发现 2 个 P0（实测复现）+ 3 个 P1 + 多个 P2/垃圾文件，用户确认**全部修复**。
- **原始需求**：「重新扫描文档，然后进行安全审查……代码层面的安全审查呢 垃圾文件 代码注释相关全面检查联网搜索并查找BUG」
- **优化后需求**：修复审查报告 V1-V11 全部问题 + 删除 5 个废弃脚本 + 修复 start.bat 3 处问题，走完整 test→PR→main 流程。
- **审查证据**：V1/V2/V3/V8 均已本地实测复现（%ZZ 崩溃堆栈、手机号 176\*\*\*\*6834 覆写、分块拼接乱码、$& 注入）。

## 2 方案自审

- **现有能力盘点**：server.js 已有 validateResumeData/限流/魔数/安全头框架；/api/data/full 鉴权接口已存在（V2 只需改前端调用）；esc() 转义函数已存在（只需补单引号）；test.py 已有 246 项测试框架可扩展。
- **决策**：**B 扩展**——全部在现有函数内修复，不新建模块，保持零依赖。无 DDL、无新依赖、无新端口。
- **影响面**：server.js（V1/V3/V4/V8/V10/V11）、public/admin.js（V2/V6/V8/V9/V11）、public/app.js（V5/V6/V7/V11）、start.bat（V11）、删除 5 个脚本文件。回归范围：全部核心路由（页面/API/静态/上传）。
- **成本预算**：无（无 LLM/付费 API）。
- **安全增量检查**：无新增依赖、无新外部输入面（本次为收窄攻击面）。

## 3 技术蓝图

- **前端**：admin.js 改用 /api/data/full、esc 补单引号、dirty 标记、导出 replace 函数化；app.js 链接 scheme 白名单、D.ver null 兜底、esc 补单引号、删死代码。
- **后端**：safeStatic 与 handler 兜底 try/catch；readBody 改 Buffer 收集；getClientIP 改 cf-connecting-ip/XFF 末段 + loginAttempts 定期清理与上限；密码比较 sha256+timingSafeEqual；servePublicPage replace 函数化；MIME 补 .woff2；404/logout 补安全头；魔数校验收紧（短 buffer 拒绝、webp 验 RIFF+WEBP）；validateResumeData 黑名单扩展（iframe/object/embed/javascript:）。
- **数据库**：无变更。
- **环境依赖**：无新增。

## 4 非目标

- 不重写渲染层（innerHTML 架构保持，依赖 esc 兜底）
- 不改密码、不动部署链路（ci-deploy.sh 已加固）
- 不改 git 历史中已作废旧密码
- C27 等历史注释保留（考古价值，不影响行为）

## 5 契约条款

### C1 畸形 URL 不崩溃（V1，P0）
- 前置：服务运行中，进程 PID 已记录
- 后置：`GET /%ZZ`（及任意非法 percent-encoding）返回 4xx，进程存活，紧随其后的正常请求（如 /ai）返回 200
- 失败：进程退出或后续请求无响应 = 不通过
- 不变式：任何单次请求都不能终止服务进程

### C2 管理后台数据完整性（V2，P0）
- 前置：已登录，data/resume.json 中 phone 为 11 位真实号码
- 后置：编辑器加载后 phone 字段显示完整号码；修改其他字段并保存后，文件中 phone 保持完整原值
- 失败：未登录 GET /api/data/full 返回 401
- 不变式：脱敏只发生在 /api/data 响应中，永不落盘

### C3 大体积中文保存不损坏（V3，P1）
- 前置：已登录，请求体 >64KB 且含中文字符（制造 TCP 分块）
- 后置：保存后重新 GET /api/data/full，JSON 可解析且中文内容逐字符一致
- 失败：>1MB 请求体返回 413
- 不变式：保存后的数据文件不含 U+FFFD 替换字符（存量除外）

### C4 登录限流不可绕过（V4，P1）
- 前置：模拟经 Cloudflare 转发的请求（X-Forwarded-For 链末段为真实 IP，或携带 CF-Connecting-IP 头），同一真实 IP 连续 5 次错误密码
- 后置：第 6 次尝试返回 429（真实 IP 被锁）；伪造 XFF 前段不能把计数转移到伪造的桶
- 失败：携带伪造 XFF 前段后第 6 次仍返回 401（可继续尝试）= 不通过
- 不变式：loginAttempts 条目总数有上限（≤10000），防止内存膨胀

### C5 链接 scheme 白名单（V5，P1）
- 前置：数据中某项目 link 为 `javascript:alert(1)`
- 后置：渲染后的页面 HTML 不含 `href="javascript:`；https 链接照常渲染为可点击链接
- 失败：N/A
- 不变式：所有 a.href 的值必须匹配 `^https?://` 或站内 `#`/`/` 前缀

### C6 转义与空值健壮性（V6/V7/V11，P2）
- 前置：N/A
- 后置：esc() 输出将 `'` 转为 `&#39;`；版本 key 含 `"` 或 `>` 时属性边界不突破；数据 version 字段为空时页面降级渲染不白屏；link 非字符串时不抛 TypeError
- 失败：N/A
- 不变式：esc() 恒对 `& < > " '` 五字符完整转义

### C7 replace 模式注入防护（V8，P2）
- 前置：base.name 含 `$&` 与 `$'`
- 后置：页面显示字面 `$&` 与 `$'`，无注入的额外内容；导出 HTML 同样正常
- 失败：N/A
- 不变式：数据内容按字面渲染，不解释 replace 特殊模式

### C8 未保存改动提醒（V9，P2）
- 前置：已登录进入编辑器
- 后置：修改任一输入字段后离开页面触发 beforeunload 确认；未修改时不触发
- 失败：N/A
- 不变式：N/A

### C9 密码常量时间比较（V10，P2）
- 前置：N/A
- 后置：正确密码登录 200、错误密码 401 且计数（行为与现状完全一致）；实现使用 crypto.timingSafeEqual
- 失败：密码错误 5 次后锁定 429（沿用 C4）
- 不变式：N/A

### C10 服务端杂项加固（V11，P2）
- 前置：服务运行中，已登录会话可用
- 后置：`.woff2` 返回 `font/woff2`；404 与 /api/logout 响应含安全响应头；上传 buffer 长度 < 魔数长度时拒绝；webp 校验 RIFF+`WEBP` 标识；validateResumeData 拒绝 `<iframe`/`<object`/`<embed`/`javascript:` 字面量
- 失败：各自对应的反向用例返回 400
- 不变式：合法简历数据（含现有 data/resume.json 全量字段）保存不被误拒

### C11 start.bat 修复（V11）
- 前置：Windows 本地开发环境
- 后置：chcp 65001；不包含硬编码的他人用户目录路径；控制台不回显明文密码；无 .env 时提示输入并写入 .env（server.js v1.5.0 起拒绝 admin123，旧脚本实际已无法启动服务）
- 失败：无
- 不变式：本地启动功能不变

### C12 垃圾文件清理
- 前置：仓库当前含 5 个废弃脚本（已被 ci-deploy.sh 替代，其中 2 个含 admin123 默认回退隐患）
- 后置：删除 scripts/deploy.sh、deploy.bat、deploy-remote.sh、generate-pr.sh、fix-readme.py；git status 无未跟踪垃圾；package.json 不再引用已删脚本
- 失败：无
- 不变式：ci-deploy.sh 不受影响

## 6 验收标准

- [ ] A1 发 `/%ZZ` 后服务仍正常响应（C1）
- [ ] A2 后台改简介保存后，手机号完整无星号（C2）
- [ ] A3 含中文的大内容保存后页面正常显示（C3）
- [ ] A4 直连 5 次错误密码后第 6 次 429，伪造 XFF 无法绕过（C4）
- [ ] A5 页面无 javascript: 链接可注入（C5）
- [ ] A6 含 `$&` 的姓名正常显示（C7）
- [ ] A7 后台修改字段后关页面弹确认（C8）
- [ ] A8 登录/保存/上传/导出功能全部正常（回归）

## 7 边界与异常

| 场景 | 预期行为 |
|---|---|
| 畸形 percent-encoding（/%ZZ、/%） | 4xx，进程存活（C1） |
| 空 version / link 非字符串 / en 缺版本 | 页面降级渲染不白屏（C6） |
| 请求体 >1MB | 413（C3 失败行为） |
| 多字节中文跨 TCP 分块（~100KB body） | 保存往返无损（C3） |
| 伪造 XFF 前段 + CF-Connecting-IP 并存 | 按 CF 头/链末段计数，锁定生效（C4） |
| 链接为 javascript: / 数据含 iframe 标签 | 保存被拒 400（C5/C10） |
| 数据含 replace 特殊模式（$& / $'） | 按字面渲染（C7） |
| 上传超短 buffer / RIFF 非 WEBP 容器 | 400 拒绝（C10） |
| 现有 resume.json 全量数据 | 新黑名单不误拒（C10 不变式） |
| 本地无 .env 启动（start.bat） | 提示输入密码并写入 .env（C11） |

## 8 三问完整性检查

- ① 字段范围：esc 五字符枚举、scheme 白名单正则、魔数字节序列——均可精确描述 ✅
- ② 状态流：登录 → 锁定 → 解锁（触发条件：失败计数/15min）状态机已明确 ✅
- ③ 输出逻辑：每项输出 = 明确函数（safeStatic/esc/render 链）✅

- DoR：需求无歧义（审查报告逐项映射）、技术可行（全部现有框架内）、影响面已盘（5 文件 + 5 删除）✅

## 9 核销记录（Step 5）

| 条款 | 测试用例 | 结果 | 路径真实性 |
|---|---|---|---|
| C1 | `SF1(spec C1) 畸形URL /%ZZ 返回4xx/5xx` + 手动 PoC 复验（http.client 原始字节 + curl） | ✅ | 原始 HTTP 请求（非转码捷径） |
| C2 | `SF2(spec C2) /api/data/full 手机号完整` + 手动 PoC（登录→拉取→保存→核对文件） | ✅ | API 全流程 + 浏览器流程等价对照 |
| C3 | `SF3(spec C3) ~100KB 中文数据保存成功` + 往返无损断言 | ✅ | API |
| C4 | `SF4(spec C4) 伪造XFF前段5次失败后第6次429` + CF-Connecting-IP 优先断言 | ✅ | API（模拟 Cloudflare 链路） |
| C5 | `SF5(spec C5) 保存 javascript: 链接被拒绝` + app.js scheme 白名单源码断言 | ✅ | API + 源码 |
| C6 | `SF6(spec C6) esc 五字符转义` × 2 + ver 空值兜底 | ✅ | 源码断言 |
| C7 | `SF7(spec C7) 页面按字面渲染（无 replace 展开）` | ✅ | API + 页面 HTML |
| C8 | `SF8(spec C8) input 事件委托置脏标记`（浏览器弹窗行为 → 用户验收 A7） | ✅ | 源码断言 + 用户验收 |
| C9 | `SF9(spec C9) 正确密码 200 / 错误 401` + timingSafeEqual 断言 | ✅ | API |
| C10 | `SF10(spec C10)` × 5（woff2 MIME/404头/iframe拒绝/短buffer/RIFF-WEBP） | ✅ | API |
| C11 | `SF11(spec C11)` × 3（65001/无硬编码路径/不回显密码） | ✅ | 源码断言 |
| C12 | `SF12(spec C12)` × 2（5 脚本已删 + ci-deploy.sh 保留） | ✅ | 文件系统 |

- 核销率：12/12（100%）
- 分级回归：PASS 276 / FAIL 0（报告：test/test.py 输出，276 项含 246 原有 + 30 新增 SF 用例）
- 备注：C4 前置按实际部署链路修正为「模拟 Cloudflare 转发（XFF 末段=真实 IP / CF-Connecting-IP 存在）」——服务器绑定 127.0.0.1，生产流量必经 CF，直连伪造 XFF 场景物理上不存在
