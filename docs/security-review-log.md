# 安全审查日志

## 2026-10-31 首次完整审查（接入 dev-release-workflow）

- **范围**：server.js（零依赖 Node http）、public/*（vanilla JS）、test/test.py（Python 标准库）、vendored 前端库 gsap.min.js / ScrollTrigger.min.js（3.12.5）
- **联网核验状态**：已联网
  - npm audit：无 package.json 依赖（server.js 仅用 Node 内置模块 http/fs/path/crypto），不适用
  - OSV（Python）：test.py 仅用标准库（urllib/subprocess/json/os），无第三方包，不适用
  - GSAP 3.12.5 / ScrollTrigger 3.12.5：web 检索 GHSA/NVD/CVE，无 GSAP 相关安全公告（GSAP 为纯动画库，无网络/文件/DOM 注入面，官方定位 low risk）
- **信任边界**：
  - 外部输入面 1：`/api/login` 密码比对（等值比较，无注入面）
  - 外部输入面 2：`/api/save` 整包 JSON 落盘（仅登录会话可写；JSON.parse 失败返回 400，不泄露堆栈）
  - 外部输入面 3：`/api/upload` base64 图片（限 2MB、白名单扩展名、固定文件名 avatar.*，无路径穿越）
  - 静态文件：safeStatic 防 `../` 穿越
- **P0 清单**：无
- **P1 清单**：无
- **P2 清单**：
  - P2-1 管理密码默认 admin123（start.bat 明文展示）——本地单机简历系统，风险可接受；已记录，不阻塞
  - P2-2 会话 token 存内存，重启失效——符合设计预期，非缺陷
- **结论**：无 P0/P1，可开工。审查周期：每月一次（本地单机项目，非高危）。

## 2026-10-31 增量检查（本次变更）

- 距上次周期审查：0 天（首次审查）
- 新增依赖：无（gsap/ScrollTrigger 为上次会话已引入的本地 vendored 文件，本次不新增）
- 新外部输入面：无（API 契约不变，不新增端点）
- 结论：无新增攻击面。
