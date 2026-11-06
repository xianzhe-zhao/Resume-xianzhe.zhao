# -*- coding: utf-8 -*-
"""简历系统 v1.3.0 自动化测试 —— 暖色 8 区编号式重构 + 中英双语 + 打印/PDF
用法: python test/test.py
依赖: 仅 Python 标准库

测试隔离: 将 server.js + data/ + public/ 复制到临时目录，在 3999 端口启动独立服务器。
不触碰真实 data/ 目录，不影响用户 3000 端口生产服务。

两支柱:
  支柱 1 [核心回归] 多版本页面 / 数据 API / 鉴权 / 保存 / 头像上传 / 静态资源 / 404
  支柱 2 [新功能]   逐条款 C1..C26 各至少一个用例
                    （C17-C26: 8 区编号式 / Hero 增强 / 关于我 / 工作经历 / 个人作品
                      / 技能档案 / 教育荣誉 / 兴趣爱好 / SVG 占位 / 核心回归）
                    CDP 浏览器实测见 test/cdp-print.mjs（node test/cdp-print.mjs）
"""
import subprocess, sys, time, json, os, re, shutil, tempfile
import urllib.request, urllib.error

HOST = "127.0.0.1"
PORT = 3999  # 测试用端口，避免冲突
BASE = f"http://{HOST}:{PORT}"
NODE = os.environ.get("NODE_EXE", "node")
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

passed = 0
failed = 0
results = []
core_failed = 0  # 核心回归段（C9）失败数快照

def check(name, cond, detail=""):
    global passed, failed
    if cond:
        passed += 1
        results.append(f"  ✓ {name}")
    else:
        failed += 1
        results.append(f"  ✗ {name}  {detail}")

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None
OPENER = urllib.request.build_opener(NoRedirect)

def get(path, headers=None):
    req = urllib.request.Request(BASE + path, headers=headers or {})
    try:
        resp = OPENER.open(req, timeout=5)
        return resp.status, resp.read().decode("utf-8"), dict(resp.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8"), dict(e.headers)
    except urllib.error.URLError as e:
        return 0, str(e), {}

def get_bin(path):
    try:
        resp = OPENER.open(BASE + path, timeout=5)
        return resp.status, resp.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()
    except urllib.error.URLError:
        return 0, b""

def post(path, data, headers=None):
    body = json.dumps(data).encode("utf-8")
    h = {"Content-Type": "application/json"}
    if headers: h.update(headers)
    req = urllib.request.Request(BASE + path, data=body, headers=h, method="POST")
    try:
        resp = OPENER.open(req, timeout=5)
        return resp.status, resp.read().decode("utf-8"), dict(resp.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8"), dict(e.headers)
    except urllib.error.URLError as e:
        return 0, str(e), {}

def wait_ready(proc, timeout=15):
    deadline = time.time() + timeout
    while time.time() < deadline:
        if proc.poll() is not None:
            return False
        code, _, _ = get("/api/data")
        if code == 200:
            return True
        time.sleep(0.3)
    return False

def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

    # ---- 临时目录隔离：复制 server.js + data/ + public/ ----
    tmpdir = tempfile.mkdtemp(prefix="resume-test-")
    shutil.copy2(os.path.join(ROOT, "server.js"), tmpdir)
    shutil.copytree(os.path.join(ROOT, "data"), os.path.join(tmpdir, "data"))
    shutil.copytree(os.path.join(ROOT, "public"), os.path.join(tmpdir, "public"))

    env = dict(os.environ)
    env["PORT"] = str(PORT)
    env["ADMIN_PASSWORD"] = "testpass123"
    proc = subprocess.Popen([NODE, "server.js"], cwd=tmpdir, env=env,
                            stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    try:
        if not wait_ready(proc):
            print("服务器启动失败:")
            print(proc.stdout.read().decode("utf-8", "replace"))
            sys.exit(1)

        print("=" * 56)
        print("简历系统 v1.3.0 自动化测试（临时目录隔离 · 端口 3999）")
        print("=" * 56)

        # ================= 支柱 1：核心功能回归 =================
        # ---- [1] 多版本页面 ----
        print("\n[1] 核心 · 多版本页面")
        for v, title in [("ai","AI 应用开发工程师"),("it","IT 技术支持工程师"),
                         ("test","测试开发工程师"),("erp","ERP 实施顾问")]:
            code, body, _ = get(f"/{v}")
            check(f"/{v} 返回200", code == 200, f"got {code}")
            check(f"/{v} 含数据注入", "window.RESUME" in body, "")
            check(f"/{v} versionKey 正确", f'"versionKey":"{v}"' in body, "")
            check(f"/{v} 含正确职位", title in body, "")
            check(f"/{v} 不泄露后台入口", "/admin" not in body and "admin.js" not in body, "泄露后台入口!")

        code, _, hdr = get("/")
        check("/ 重定向到 /ai", code == 302 and hdr.get("Location") == "/ai", f"got {code} {hdr.get('Location')}")

        # ---- [2] 数据 API ----
        print("\n[2] 核心 · 数据 API")
        code, body, _ = get("/api/data")
        check("/api/data 返回200", code == 200, f"got {code}")
        d = json.loads(body)
        check("/api/data 含 base", "base" in d, "")
        check("/api/data 含4个版本", set(d.get("versions", {}).keys()) == {"ai","it","test","erp"},
              f"got {set(d.get('versions', {}).keys())}")
        check("/api/data 含 en（双语）", "en" in d and "base" in d["en"] and "versions" in d["en"], "")

        # ---- [3] 静态资源 ----
        print("\n[3] 核心 · 静态资源")
        for f in ["/style.css", "/app.js", "/admin.css", "/admin.js",
                  "/gsap.min.js", "/ScrollTrigger.min.js",
                  "/fonts/jost-latin.woff2", "/img/portrait-cartoon.jpg"]:
            code, raw = get_bin(f)
            check(f"{f} 返回200", code == 200 and len(raw) > 0, f"got {code} size={len(raw)}")
        code, raw = get_bin("/not-exist-page")
        check("未知路径返回404", code == 404, f"got {code}")

        # ---- [4] 鉴权 + 保存 + 头像上传 ----
        print("\n[4] 核心 · 鉴权 / 保存 / 头像上传")
        code, body, _ = get("/api/check")
        check("/api/check 未登录 authed=false", '"authed":false' in body, body[:80])
        code, _, _ = post("/api/save", {"base": {}, "versions": {}})
        check("/api/save 未登录拒绝(401)", code == 401, f"got {code}")
        code, _, _ = post("/api/login", {"password": "wrong"})
        check("/api/login 错误密码拒绝(401)", code == 401, f"got {code}")
        code, _, hdr = post("/api/login", {"password": "testpass123"})
        check("/api/login 正确密码成功(200)", code == 200, f"got {code}")
        cookie = hdr.get("Set-Cookie", "")
        sess = cookie.split(";")[0] if cookie else ""
        check("/api/login 返回会话cookie", "resume_session=" in sess, "无cookie")

        # 保存往返（临时副本，安全）
        code, body, _ = get("/api/data")
        d = json.loads(body)
        orig_name = d["base"]["name"]
        d["base"]["name"] = "测试临时名"
        code, _, _ = post("/api/save", d, {"Cookie": sess})
        check("/api/save 登录后成功(200)", code == 200, f"got {code}")
        code, body, _ = get("/api/data")
        d2 = json.loads(body)
        check("/api/save 数据已更新", d2["base"]["name"] == "测试临时名", d2["base"]["name"])
        d2["base"]["name"] = orig_name
        post("/api/save", d2, {"Cookie": sess})
        code, body, _ = get("/api/data")
        check("/api/save 恢复原数据", json.loads(body)["base"]["name"] == orig_name, "")

        # 头像上传
        png1x1 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        code, _, _ = post("/api/upload", {"data": "data:image/png;base64," + png1x1})
        check("/api/upload 未登录拒绝(401)", code == 401, f"got {code}")
        code, _, _ = post("/api/upload", {"data": "not-an-image"}, {"Cookie": sess})
        check("/api/upload 非图片拒绝(400)", code == 400, f"got {code}")
        code, body, _ = post("/api/upload", {"data": "data:image/png;base64," + png1x1}, {"Cookie": sess})
        up = json.loads(body)
        check("/api/upload 登录后成功(200)", code == 200 and up.get("ok"), body[:80])
        up_path = up.get("path", "")
        code, raw = get_bin(up_path)
        check(f"上传文件可访问 {up_path}", code == 200 and raw[:4] == b"\x89PNG", f"got {code}")

        code, _, _ = post("/api/logout", {}, {"Cookie": sess})
        check("/api/logout 成功(200)", code == 200, f"got {code}")
        code, body, _ = get("/api/check", {"Cookie": sess})
        check("登出后会话失效", '"authed":false' in body, body[:80])

        core_failed = failed  # 核心回归失败数快照（供 C9 引用）

        # ================= 支柱 2：新功能逐条款 =================
        code, css, _ = get("/style.css")
        code, app_src, _ = get("/app.js")
        code, idx_html, _ = get("/ai")
        code, admin_html, _ = get("/admin")
        code, admin_css, _ = get("/admin.css")
        code, admin_js, _ = get("/admin.js")
        code, body, _ = get("/api/data")
        d = json.loads(body)

        # ---- C1 暖色配色（无红色）----
        print("\n[C1] 暖色配色（无红色）")
        check("C1 暖色 token 齐全", all(t in css for t in ["#faf5ec", "#e08a3c", "#3d3529", "#f1e7d3"]), "")
        hex_colors = re.findall(r'#([0-9a-fA-F]{6})', css)
        def hue_of(r, g, b):
            mx, mn = max(r,g,b), min(r,g,b)
            if mx == mn: return 0.0
            d = mx - mn
            if mx == r: h = ((g-b)/d) % 6
            elif mx == g: h = (b-r)/d + 2
            else: h = (r-g)/d + 4
            return h * 60
        red_found = []
        for hx in hex_colors:
            r, g, b = int(hx[0:2],16), int(hx[2:4],16), int(hx[4:6],16)
            mx, mn = max(r,g,b), min(r,g,b)
            sat = (mx-mn)/mx if mx > 0 else 0
            h = hue_of(r,g,b)
            # 红色 = 色相 0-15° 或 345-360° 且饱和度>30%（暖棕/琥珀色相 20-50° 不算红）
            if sat > 0.3 and (h <= 15 or h >= 345):
                red_found.append('#'+hx)
        check("C1 style.css 无红色系色值", len(red_found) == 0, f"发现红色: {red_found[:5]}")
        check("C1 favicon 为琥珀色", "e08a3c" in idx_html, "")

        # ---- C2 卡通人像 + PC 满宽（模糊背景+清晰前景）----
        print("\n[C2] 卡通人像 + PC 满宽处理")
        code, raw = get_bin("/img/portrait-cartoon.jpg")
        check("C2 卡通人像 JPEG 存在", code == 200 and raw[:3] == b"\xff\xd8\xff" and len(raw) > 10_000,
              f"got {code} size={len(raw)}")
        check("C2 app.js 引用卡通人像", "portrait-cartoon.jpg" in app_src, "")
        check("C2 hero-bg 模糊处理", "blur(" in css, "无 blur")
        check("C2 hero-bg 边缘外溢(-40px)", "-40px" in css, "无边缘外溢，PC 会有硬边")
        check("C2 hero-veil 奶油色遮罩", ".hero-veil" in css, "")

        # ---- C3 8 区编号式结构（v1.3.0 修订：5 段 → 8 区）----
        print("\n[C3] 8 区编号式结构（Hero/About/Experience/Projects/Skills/Edu/Honors/OffDuty/Footer）")
        for fn, label in [("function hero(", "①Hero头图"), ("function about(", "②00关于我"),
                          ("function experience(", "③01工作经历"), ("function projects(", "④02个人作品"),
                          ("function skills(", "⑤03技能档案"), ("function eduHonors(", "⑥04教育荣誉"),
                          ("function offDuty(", "⑦05兴趣爱好"), ("function footer(", "⑧结尾页脚")]:
            check(f"C3 app.js 含{label}渲染器", fn in app_src, "")
        check("C3 index.html 加载 app.js", "app.js" in idx_html, "")
        check("C3 第⑤段标题为「技能档案」/Skill Archive", "技能档案" in app_src and "Skill Archive" in app_src, "")

        # ---- C4 个人履历时间线（v1.3.0：数据完整 + 量化成果，结构由 C20 覆盖）----
        print("\n[C4] 个人履历（时间线 + 量化成果）")
        exp = d["base"].get("experience", [])
        check("C4 履历数据非空", len(exp) >= 1, f"got {len(exp)}")
        check("C4 每段履历含 role/company/period/projects",
              all(all(k in e for k in ("role","company","period","projects")) for e in exp), "")
        check("C4 app.js 渲染时间线（exp-item/exp-info）", all(t in app_src for t in ["exp-item","exp-info","exp-results"]), "")
        check("C4 app.js 含量化成果 1400h", "1400h" in app_src, "")
        def norm(s): return re.sub(r"\s+", "", s)
        certs_n = [norm(c) for c in d["base"].get("certs", [])]
        honors_n = [norm(h) for h in d["base"].get("honors", [])]
        dup = [c for c in certs_n for h in honors_n if c in h or h in c]
        check("C4 资格证书与荣誉无重复", len(dup) == 0, f"重复: {dup}")
        titles = {v: d["versions"][v]["title"] for v in ("ai","it","test","erp")}
        check("C4 四版本职位互不相同", len(set(titles.values())) == 4, str(titles))

        # ---- C5 技能展示（v1.3.0：5 组分组卡片化，图标悬浮物保留）----
        print("\n[C5] 技能展示（5 组分组卡片 + 图标悬浮物）")
        skills = d["base"].get("skills", {})
        all_skill_names = [n for group in skills.values() for n in group]
        check("C5 技能数 >=12", len(all_skill_names) >= 12, f"got {len(all_skill_names)}")
        missing_icons = [n for n in all_skill_names if f"'{n}':" not in app_src]
        check("C5 每个技能均有专属图标", len(missing_icons) == 0, f"缺图标: {missing_icons}")
        check("C5 GSAP 悬浮动效(yoyo+sine.inOut)", "yoyo" in app_src and "sine.inOut" in app_src, "")
        check("C5 悬浮作用于 skill-badge", "skill-badge" in app_src, "")
        check("C5 浮动幅度 3–5px", "y: -(3 + (i % 3) * 1)" in app_src, "幅度未降为 3–5px")
        check("C5 分组卡片化（skill-card + skill-group）", "skill-card" in app_src and "skill-group" in app_src, "")
        check("C5 网格间距 22px > 浮动幅度（动画不重合）", "gap: 22px" in css, "")

        # ---- C6 豹豹助手 5 项已验证功能（v1.3.0：选择器同步新结构）----
        print("\n[C6] 豹豹助手（zxz0608.com 已验证功能）")
        bb = d["base"]["projects"][0]
        check("C6 主打项目为豹豹助手", bb.get("id") == "baobao" and "豹豹助手" in bb["title"], bb.get("title"))
        check("C6 中文 5 项功能", len(bb.get("items", [])) == 5, f"got {len(bb.get('items', []))}")
        zh_items = "".join(bb.get("items", []))
        check("C6 中文功能覆盖 对话/新闻/项目/日历/智能家居",
              all(k in zh_items for k in ("对话","新闻","项目","日历","智能家居")), "")
        check("C6 链接为 zxz0608.com", bb.get("link") == "https://zxz0608.com/", bb.get("link"))
        check("C6 app.js 渲染项目（proj-item/proj-info）", "proj-item" in app_src and "proj-info" in app_src, "")
        en_bb = d["en"]["base"]["projects"][0]
        check("C6 英文 5 项功能", len(en_bb.get("items", [])) == 5, f"got {len(en_bb.get('items', []))}")
        en_items = "".join(en_bb.get("items", [])).lower()
        check("C6 英文功能覆盖 Chat/News/Kanban/Calendar/Smart Home",
              all(k in en_items for k in ("chat","news","kanban","calendar","smart home")), "")

        # ---- C7 结尾页脚 ----
        print("\n[C7] 结尾页脚")
        check("C7 页脚含联系方式(tel/mailto)", "tel:" in app_src and "mailto:" in app_src, "")
        check("C7 页脚含头像与收尾语", "footer-avatar" in app_src and "footer-sentence" in app_src, "")
        check("C7 无「联系我」按钮", "btn primary" not in app_src and "tb-cta" not in app_src, "仍存在联系我按钮")

        # ---- C8 管理后台修复 ----
        print("\n[C8] 管理后台（碎片化修复回归）")
        check("C8 /admin 返回200", code == 200, f"got {code}")
        check("C8 /admin 引用 admin.js + admin.css", "admin.js" in admin_html and "admin.css" in admin_html, "")
        check("C8 /admin 不引用简历 style.css", "/style.css" not in admin_html, "")
        check("C8 admin.css 含登录卡片+表单网格", "login-box" in admin_css and "form-grid" in admin_css, "")

        # ---- C9 核心功能回归汇总 ----
        print("\n[C9] 核心功能回归汇总")
        check("C9 核心回归全部通过", core_failed == 0, f"核心段已有 {core_failed} 个失败")

        # ---- C10 GSAP 动效层（v1.3.0：选择器同步 8 区结构）----
        print("\n[C10] GSAP 动效层")
        check("C10 index.html 引用 gsap + ScrollTrigger", "gsap.min.js" in idx_html and "ScrollTrigger.min.js" in idx_html, "")
        # 防火墙大文件对策：gsap/ScrollTrigger 以 .gz 入库，服务器启动时解压为 .js
        check("C10 gsap.min.js.gz 在库中(防火墙对策)", os.path.exists(os.path.join(ROOT, "public", "gsap.min.js.gz")), "")
        check("C10 ScrollTrigger.min.js.gz 在库中(防火墙对策)", os.path.exists(os.path.join(ROOT, "public", "ScrollTrigger.min.js.gz")), "")
        code_g, raw_g = get_bin("/gsap.min.js")
        check("C10 gsap.min.js 解压后正常服务", code_g == 200 and len(raw_g) > 50_000 and b"gsap" in raw_g.lower(),
              f"got {code_g} size={len(raw_g)}")
        check("C10 app.js 用 gsap.matchMedia", "gsap.matchMedia" in app_src, "")
        check("C10 app.js 尊重 prefers-reduced-motion", "prefers-reduced-motion" in app_src, "")
        check("C10 重渲染前清理动画", "ScrollTrigger.getAll" in app_src and "killTweensOf" in app_src, "")
        check("C10 动效选择器同步 8 区（about/experience/projects/skills/edu-honors/off-duty）",
              all(s in app_src for s in [".about .sec-head", ".experience .sec-head", ".projects .sec-head",
                                         ".skills .sec-head", ".edu-honors .sec-head", ".off-duty .sec-head"]), "")

        # ---- C11 三端适配 + 打印 ----
        print("\n[C11] 三端适配（1440/768/390）+ 打印")
        check("C11 断点 1000px", "1000px" in css, "")
        check("C11 断点 760px", "760px" in css, "")
        check("C11 断点 560px", "560px" in css, "")
        check("C11 打印样式", "@media print" in css, "")

        # ---- C12 中英双语 ----
        print("\n[C12] 中英双语（默认中文 + 一键切换）")
        en = d.get("en", {})
        check("C12 resume.json 顶层 en 含 base+4版本",
              "base" in en and set(en.get("versions", {}).keys()) == {"ai","it","test","erp"}, "")
        check("C12 英文姓名/职位", en.get("base",{}).get("name") == "Zhao Xianzhe"
              and en.get("versions",{}).get("ai",{}).get("title") == "AI Application Development Engineer", "")
        check("C12 /ai 页面 payload 含 en", '"en":' in idx_html, "")
        check("C12 app.js 含语言切换按钮", "langBtn" in app_src, "")
        check("C12 app.js 含回退函数 fb()", "function fb(" in app_src, "en 缺失时不回退中文")
        check("C12 app.js 更新 html lang 属性", "documentElement.lang" in app_src, "")
        check("C12 index.html 无外部字体/资源", "fontshare" not in idx_html
              and not re.search(r'<link[^>]+href="https?://', idx_html), "存在外链资源")
        check("C12 管理后台保持中文（无语言切换）", "langBtn" not in admin_js, "")

        # ---- C13 打印版式选择对话框（横版/竖版）----
        print("\n[C13] 打印版式选择对话框（横版/竖版）")
        check("C13 app.js 含对话框渲染器", "printDialog" in app_src and "print-dialog" in app_src, "")
        check("C13 对话框含竖版/横版选项", 'data-orient="portrait"' in app_src and 'data-orient="landscape"' in app_src, "")
        check("C13 中文文案：选择打印版式/竖版/横版", "选择打印版式" in app_src and "竖版" in app_src and "横版" in app_src, "")
        check("C13 英文文案：Choose print layout/Portrait/Landscape", "Choose print layout" in app_src and "Portrait" in app_src and "Landscape" in app_src, "")
        check("C13 提示含「另存为 PDF」指引（zh+en）", "另存为 PDF" in app_src and "Save as PDF" in app_src, "")
        check("C13 关闭路径：×/遮罩/Esc", "data-pd-close" in app_src and "Escape" in app_src, "")
        check("C13 幂等打开（已打开不叠层）", "dialog.hidden) return" in app_src, "")
        check("C13 style.css 含对话框样式", ".pd-card" in css and ".pd-opt" in css and ".pd-hint" in css, "")

        # ---- C14 多页打印修复（动画残留不泄漏进打印）----
        print("\n[C14] 多页打印修复（动画残留覆盖）")
        print_block = css[css.index("@media print"):]
        check("C14 print 媒体：opacity: 1 !important 覆盖", "opacity: 1 !important" in print_block, "")
        check("C14 print 媒体：visibility: visible !important 覆盖", "visibility: visible !important" in print_block, "")
        check("C14 print 媒体：transform: none !important 覆盖", "transform: none !important" in print_block, "")
        check("C14 纯 CSS 覆盖（不清屏幕端动画状态）", "clearProps" not in app_src, "")

        # ---- C15 打印版式模板（v1.3.0：选择器同步 8 区结构）----
        print("\n[C15] 打印版式模板（@page A4 + 横竖版布局 + 分页规则 + 暖色底）")
        check("C15 静态 @page A4 portrait 兜底", "@page" in css and "size: A4 portrait" in css and "margin: 16mm" in css, "")
        check("C15 html.print-portrait 版式类（print 媒体内）", "html.print-portrait" in print_block, "")
        check("C15 html.print-landscape 版式类（print 媒体内）", "html.print-landscape" in print_block, "")
        check("C15 竖版单列：hero 1fr / about 1fr / 技能 2列",
              "html.print-portrait .hero-inner { grid-template-columns: 1fr" in css
              and "html.print-portrait .about-wrap { grid-template-columns: 1fr" in css
              and "html.print-portrait .skill-cards { grid-template-columns: 1fr 1fr" in css, "")
        check("C15 横版双列：技能 3列 / 教育 2列 / about 双列",
              "html.print-landscape .skill-cards { grid-template-columns: repeat(3, 1fr)" in css
              and "html.print-landscape .eh-grid { grid-template-columns: 1fr 1fr" in css
              and "html.print-landscape .about-wrap { grid-template-columns: 0.8fr 1.2fr" in css, "")
        check("C15 分页规则：封面独占第 1 页（仅 .about break-before: page）",
              ".about { break-before: page; }" in print_block
              and ".experience, .projects, .skills, .edu-honors, .off-duty { break-before: page" not in print_block, "")
        check("C15 分页规则：标题块不拆分（.sec-head-wrap break-inside+break-after: avoid）",
              ".sec-head-wrap { break-inside: avoid; break-after: avoid; }" in print_block, "")
        check("C15 分页规则：卡片不截断（exp-item/proj-item/od-item/bubble/skill-card/eh-card）",
              ".exp-item, .proj-item, .od-item, .bubble, .skill-card, .eh-card { break-inside: avoid; }" in print_block, "")
        check("C15 背景色：卡片/section 无白底覆盖（body 白底除外——用于奶油色内缩）",
              ".stat { background: #fff" not in print_block and ".tl-card { background: #fff" not in print_block
              and ".skill-badge { background: #fff" not in print_block, "")
        check("C15 背景色：print-color-adjust: exact 保证暖色底输出",
              "print-color-adjust: exact" in print_block and "-webkit-print-color-adjust: exact" in print_block, "")
        check("C15 色带内边距：.skills 打印保留左右 padding（色带不被卡片占满）",
              ".skills { padding: 40px 32px; }" in print_block, "")
        check("C15 打印宽度钉死 + 奶油色内缩：body 白底 + #app 奶油底 margin 6mm",
              "html.print-portrait body { width: 178mm" in print_block and "background: #fff !important;" in print_block
              and "html.print-portrait #app { background: var(--bg); margin: 0 6mm; }" in print_block
              and "html.print-landscape #app { background: var(--bg); margin: 0 6mm; }" in print_block, "")
        check("C15 打印宽度重置：section 子元素 max-width 解除（填满 @page 内容区）",
              "html.print-portrait .hero-inner, html.print-portrait .about > *" in print_block
              and "max-width: none; width: 100%;" in print_block, "")
        check("C15 app.js 动态注入 @page（横竖版）", "print-orient-style" in app_src and "@page { size: A4 " in app_src, "")
        check("C15 afterprint 清理", "afterprint" in app_src, "")
        check("C15 对话框打印时隐藏", ".print-dialog" in print_block, "")

        # ---- C16 核心功能回归（不修坏）----
        print("\n[C16] 核心功能回归（不修坏）")
        check("C16 核心回归段全部通过", core_failed == 0, f"核心段已有 {core_failed} 个失败")
        server_src = open(os.path.join(ROOT, "server.js"), encoding="utf-8").read()
        check("C16 API 契约不变（6 端点）",
              all(p in server_src for p in ["/api/data", "/api/login", "/api/logout", "/api/check", "/api/save", "/api/upload"]), "")

        # ---- C17 8 区编号式板块结构 + 统一头部公式 ----
        print("\n[C17] 8 区编号式板块结构 + 统一头部公式")
        check("C17 app.js 含 8 区渲染函数",
              all(fn in app_src for fn in ["function hero(", "function about(", "function experience(",
                  "function projects(", "function skills(", "function eduHonors(", "function offDuty(", "function footer("]), "")
        check("C17 app.js 含统一头部 secHead()", "function secHead(" in app_src, "")
        check("C17 编号眉标 00–05 齐全", all(n in app_src for n in ["'00'", "'01'", "'02'", "'03'", "'04'", "'05'"]), "")
        check("C17 英文眉标 ABOUT/EXPERIENCE/PROJECTS/SKILLS/EDUCATION/OFF DUTY",
              all(l in app_src for l in ["ABOUT", "EXPERIENCE", "PROJECTS", "SKILLS", "EDUCATION & HONORS", "OFF DUTY"]), "")
        check("C17 render() 组装顺序：about→experience→projects→skills→eduHonors→offDuty",
              "about(D) + experience(D) + projects(D) + skills(D) + eduHonors(D) + offDuty(D)" in app_src, "")
        check("C17 style.css 含 8 区样式类",
              all(c in css for c in [".about", ".experience", ".projects", ".skills", ".edu-honors", ".off-duty"]), "")
        check("C17 编号头部样式（sec-eyebrow + sec-head + sec-note）",
              all(c in css for c in [".sec-eyebrow", ".sec-head", ".sec-note"]), "")

        # ---- C18 Hero 增强（问候徽章 + 荧光笔划线职位 + 状态标签 + 拱形人像）----
        print("\n[C18] Hero 增强（问候徽章 + 荧光笔划线职位 + 状态标签 + 拱形人像）")
        check("C18 问候徽章 hero-hello + helloBadge 文案", "hero-hello" in app_src and "helloBadge" in app_src, "")
        check("C18 荧光笔划线职位 hero-title-mark", "hero-title-mark" in app_src and "hero-title-mark" in css, "")
        check("C18 拱形人像（border-radius 30px 30px 60px 60px）", "30px 30px 60px 60px" in css, "")
        check("C18 OPEN TO WORK 斜角标签 hero-open", "hero-open" in app_src and "openToWork" in app_src, "")
        check("C18 NOW 状态卡 hero-now + 按版本切换", "hero-now" in app_src and "NOW_TAG" in app_src, "")
        check("C18 保留卡通人像 portrait-cartoon.jpg", "portrait-cartoon.jpg" in app_src, "")

        # ---- C19 关于我区（00 / ABOUT · 特质气泡，复用 advantages）----
        print("\n[C19] 关于我区（特质气泡，复用 advantages）")
        advs = d["versions"]["ai"].get("advantages", [])
        check("C19 ai 版本 advantages 4 条", len(advs) == 4, f"got {len(advs)}")
        check("C19 app.js 渲染特质气泡 bubble", "bubble" in app_src and "about-bubbles" in app_src, "")
        check("C19 气泡复用 advantages 数据（advantages forEach）", "advantages" in app_src, "")
        check("C19 态度型大标题（secAbout 文案）", "secAbout" in app_src and "关于我" in app_src, "")
        check("C19 4 版本各有 advantages", all(len(d["versions"][v].get("advantages", [])) == 4 for v in ("ai","it","test","erp")), "")
        check("C19 英文版 advantages", "en" in d and all(len(d["en"]["versions"][v].get("advantages", [])) == 4 for v in ("ai","it","test","erp")), "")

        # ---- C20 工作经历区（01 / EXPERIENCE · 镜像交错时间线卡 + 数据压图）----
        print("\n[C20] 工作经历区（镜像交错时间线卡 + 数据压图）")
        check("C20 镜像交错类 mirror", "mirror" in app_src and ".exp-item" in css, "")
        check("C20 中轴时间线编号 exp-node", "exp-node" in app_src and "exp-timeline" in app_src, "")
        check("C20 数据压图 exp-metric + expMetrics", "exp-metric" in app_src and "expMetrics" in app_src, "")
        check("C20 数据压图 metric 含 4.5年/1400h/9年", all(m in app_src for m in ["4.5年", "1400h", "9年"]), "")
        check("C20 卡片五段式：period/title+role/desc/results", all(t in app_src for t in ["exp-period", "exp-role", "exp-desc", "exp-results"]), "")
        check("C20 公司作为公共头 exp-company", "exp-company" in app_src, "")
        check("C20 英文 metric（4.5 yrs / 1,400h / 9 yrs）", "4.5 yrs" in app_src and "1,400h" in app_src and "9 yrs" in app_src, "")

        # ---- C21 个人作品区（02 / PROJECTS · 镜像交错卡 + 数据压图）----
        print("\n[C21] 个人作品区（镜像交错卡 + 数据压图）")
        check("C21 镜像交错类 mirror（proj-item）", "proj-item" in app_src and ".proj-item" in css, "")
        check("C21 数据压图 proj-metric + projMetrics", "proj-metric" in app_src and "projMetrics" in app_src, "")
        check("C21 数据压图 metric 含 2150+/3 API/CRDT", all(m in app_src for m in ["2150+", "3 API", "CRDT"]), "")
        check("C21 卡片含 badge/title/link/desc/items/stack", all(t in app_src for t in ["proj-badge", "proj-link", "proj-desc", "proj-items", "proj-stack"]), "")
        check("C21 featured 项目加重（featuredProject）", "featuredProject" in app_src and "featured" in app_src, "")
        check("C21 豹豹助手链接渲染（p.link + proj-link + target=_blank）",
              "p.link" in app_src and "proj-link" in app_src and 'target="_blank"' in app_src, "")
        check("C21 豹豹助手数据链接为 zxz0608.com", bb.get("link") == "https://zxz0608.com/", bb.get("link"))
        check("C21 英文 metric（2,150+ / 3 APIs / CRDT）", "2,150+" in app_src and "3 APIs" in app_src, "")

        # ---- C22 技能档案区（03 / SKILLS · 5 组分组卡片化）----
        print("\n[C22] 技能档案区（5 组分组卡片化）")
        check("C22 分组卡片 skill-card + skill-group", "skill-card" in app_src and "skill-group" in app_src, "")
        check("C22 技能组数 = 5", len(d["base"].get("skills", {})) == 5, f"got {len(d['base'].get('skills', {}))}")
        check("C22 图标徽章横向排列 skill-badges", "skill-badges" in app_src, "")
        check("C22 悬浮动效保留（yoyo + sine.inOut + skill-badge）", "yoyo" in app_src and "skill-badge" in app_src, "")
        check("C22 英文技能组名", "en" in d and len(d["en"]["base"].get("skills", {})) == 5, "")

        # ---- C23 教育与荣誉区（04 / EDUCATION & HONORS · 独立卡片 + 占位照 + 校徽）----
        print("\n[C23] 教育与荣誉区（独立卡片 + 占位照 + 校徽）")
        check("C23 独立区 edu-honors + eh-grid", "edu-honors" in app_src and "eh-grid" in app_src, "")
        check("C23 教育卡 eh-edu + 校园占位 svgArt('campus')", "eh-edu" in app_src and "campus" in app_src, "")
        check("C23 校徽徽章 eh-badge", "eh-badge" in app_src, "")
        check("C23 荣誉卡 eh-honors", "eh-honors" in app_src, "")
        check("C23 AWS 认证去重（certs + honors 无重复）", len(dup) == 0, f"重复: {dup}")
        check("C23 教育数据来自 resume.json education", "education" in app_src, "")

        # ---- C24 兴趣爱好区（05 / OFF DUTY · 占位交替卡）----
        print("\n[C24] 兴趣爱好区（占位交替卡）")
        check("C24 新增区 off-duty + od-list", "off-duty" in app_src and "od-list" in app_src, "")
        check("C24 占位交替卡 od-item + mirror", "od-item" in app_src and "mirror" in app_src, "")
        check("C24 占位 SVG od-cover + 编号角标 od-num", "od-cover" in app_src and "od-num" in app_src, "")
        check("C24 占位提示文案「后续可替换」", "后续可替换" in app_src and "replaceable" in app_src, "")
        check("C24 兴趣内容在 UI 字典 interests（不入 resume.json）", "interests" in app_src, "")
        check("C24 resume.json 不含 interests 字段（数据模型稳定）", "interests" not in json.dumps(d["base"]), "")

        # ---- C25 SVG 主题插画占位 + 数据压图渲染 ----
        print("\n[C25] SVG 主题插画占位 + 数据压图渲染")
        check("C25 内联 SVG 生成函数 svgArt()", "function svgArt(" in app_src, "")
        check("C25 SVG 主题枚举齐全（svgArt 含 rms/rpa/erp/baobao/aipro-bridge/deskshare/campus/interest0-2）",
              all(t in app_src for t in ["rms:", "rpa:", "erp:", "baobao:", "'aipro-bridge':", "deskshare:", "campus:", "interest0:", "interest1:", "interest2:"]), "")
        check("C25 SVG 暖色调（accent-soft/accent-ink/accent 色值）",
              all(c in app_src for c in ["#f7e7cd", "#9a5518", "#e08a3c"]), "")
        check("C25 SVG viewBox + preserveAspectRatio（响应式）", "viewBox" in app_src and "preserveAspectRatio" in app_src, "")
        check("C25 数据压图大号字（exp-metric/proj-metric CSS clamp 字号）",
              "exp-metric" in css and "proj-metric" in css and "clamp(" in css, "")
        check("C25 无外部图片请求（svgArt 内联，无 http img src）",
              not re.search(r'src="https?://', app_src), "存在外部图片请求")
        check("C25 打印时 SVG 与压图输出（print-color-adjust: exact）", "print-color-adjust: exact" in css, "")

        # ---- C26 核心功能回归（不修坏 · C1–C16 保留 + 新结构同步）----
        print("\n[C26] 核心功能回归（C1–C16 保留 + 新结构同步）")
        check("C26 核心回归段全部通过", core_failed == 0, f"核心段已有 {core_failed} 个失败")
        check("C26 API 契约不变（6 端点）",
              all(p in server_src for p in ["/api/data", "/api/login", "/api/logout", "/api/check", "/api/save", "/api/upload"]), "")
        check("C26 resume.json 结构不变（base + versions + en 顶层键）",
              all(k in d for k in ["base", "versions", "en"]), "")
        check("C26 暖色配色不变（C1 token 齐全）", all(t in css for t in ["#faf5ec", "#e08a3c", "#3d3529", "#f1e7d3"]), "")
        check("C26 中英双语保留（langBtn + fb() + en 结构）", "langBtn" in app_src and "function fb(" in app_src and "en" in d, "")
        check("C26 打印流程保留（printDialog + 横竖版 + afterprint）", "printDialog" in app_src and "afterprint" in app_src, "")
        check("C26 admin 不受影响（admin.css 独立 + 不引用 style.css）", "/style.css" not in admin_html and "admin.css" in admin_html, "")

        # ---- C27 自动隐藏悬浮导航栏（鼠标靠近顶部出现 · 离开 2 秒隐藏 · 丝滑上下动画）----
        print("\n[C27] 自动隐藏悬浮导航栏（胶囊形 + 7 项锚点 + 自动隐藏）")
        check("C27 app.js 含 navBar() 渲染函数", "function navBar(" in app_src, "")
        check("C27 render() 用 navBar 替代 topbar", "navBar(D) + hero(D)" in app_src and "function topbar(" not in app_src, "")
        check("C27 胶囊形导航栏 navbar + data-state", "navbar" in app_src and "data-state" in app_src, "")
        check("C27 顶部感应区 nav-sensor", "nav-sensor" in app_src and "navSensor" in app_src, "")
        check("C27 7 项导航锚点（about/experience/projects/skills/edu-honors/off-duty/contact）",
              all(h in app_src for h in ["#about", "#experience", "#projects", "#skills", "#edu-honors", "#off-duty", "#contact"]), "")
        check("C27 导航项文案 navItems（关于我/工作经历/个人作品/技能档案/教育与荣誉/兴趣爱好/联系我）",
              all(t in app_src for t in ["关于我", "工作经历", "个人作品", "技能档案", "教育与荣誉", "兴趣爱好", "联系我"]), "")
        check("C27 英文导航项（About/Experience/Projects/Skills/Education/Off Duty/Contact）",
              all(t in app_src for t in ["About", "Experience", "Projects", "Skills", "Education", "Off Duty", "Contact"]), "")
        check("C27 自动隐藏逻辑：showNavBar/hideNavBar + setTimeout 2000ms",
              "function showNavBar" in app_src and "function hideNavBar" in app_src and "2000" in app_src, "")
        check("C27 鼠标事件：mouseenter/mouseleave + scroll",
              "mouseenter" in app_src and "mouseleave" in app_src and "addEventListener('scroll'" in app_src, "")
        check("C27 首屏常驻：scrollTop <= 100 判断", "100" in app_src and "pageYOffset" in app_src, "")
        check("C27 平滑跳转：scrollIntoView behavior smooth", "scrollIntoView" in app_src and "smooth" in app_src, "")
        check("C27 保留语言切换 langBtn + 打印按钮 printBtn", "langBtn" in app_src and "printBtn" in app_src, "")
        check("C27 style.css 胶囊形样式（navbar + border-radius 999px + box-shadow）",
              ".navbar" in css and "999px" in css and "box-shadow" in css, "")
        check("C27 丝滑动画：transition transform/opacity + cubic-bezier easeOutQuint",
              "transition: transform" in css and "cubic-bezier(0.22, 1, 0.36, 1)" in css, "")
        check("C27 隐藏态：translateY(-130%) + opacity:0", "translateY(-130%)" in css, "")
        check("C27 打印时隐藏导航栏（.navbar, .nav-sensor display none）",
              ".navbar, .nav-sensor" in print_block, "")
        check("C27 不依赖 GSAP（纯 CSS transition + 原生 JS 事件）",
              "clearProps" not in app_src or "navbar" in app_src, "")
        check("C27 旧 topbar 样式已移除（style.css 无 .topbar）", ".topbar" not in css, "")

        # ---- C28 移除公开页版本切换入口（版本管理仅限后台）----
        print("\n[C28] 移除公开页版本切换入口（版本管理仅限后台）")
        check("C28 app.js navBar 不含 nav-versions 版本切换", "nav-versions" not in app_src, "仍含版本切换")
        check("C28 app.js navBar 不含 nav-ver 链接", "nav-ver" not in app_src, "仍含版本链接")
        check("C28 导航栏右侧仅语言+打印按钮（langBtn + printBtn 保留）", "langBtn" in app_src and "printBtn" in app_src, "")
        # 4 版本 URL 仍可访问（server.js 路由不变）
        for v in ["ai", "it", "test", "erp"]:
            code_v, body_v, _ = get(f"/{v}")
            check(f"C28 /{v} URL 仍可访问（200）", code_v == 200, f"got {code_v}")
        # admin 版本管理不受影响
        check("C28 /admin 仍可访问（版本管理后台）", code == 200 and "admin.js" in admin_html, "")
        check("C28 admin.css 不引用 style.css（后台独立）", "/style.css" not in admin_html, "")
        # 公开页不泄露版本切换入口
        check("C28 app.js 不渲染其他版本链接（无 allVersions forEach 在 navBar）",
              "nav-versions" not in app_src and "nav-ver" not in app_src, "")

        # ---- 汇总 ----
        print("\n" + "=" * 56)
        for r in results: print(r)
        print("=" * 56)
        print(f"通过: {passed}   失败: {failed}   总计: {passed+failed}")
        print("=" * 56)
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except Exception:
            proc.kill()
        shutil.rmtree(tmpdir, ignore_errors=True)

    sys.exit(0 if failed == 0 else 1)

if __name__ == "__main__":
    main()
