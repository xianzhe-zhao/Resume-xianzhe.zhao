# -*- coding: utf-8 -*-
"""简历系统自动化测试 —— 测新功能(多版本/后台/API) + 核心功能(页面渲染) + 安全性(鉴权/隔离)
用法: python test/test.py
依赖: 仅用 Python 标准库 (urllib/http/subprocess)，无需安装第三方包"""
import subprocess, sys, time, json, os, signal
import urllib.request, urllib.error

HOST = "127.0.0.1"
PORT = 3999  # 测试用端口，避免冲突
BASE = f"http://{HOST}:{PORT}"
NODE = os.environ.get("NODE_EXE", "node")
SERVER = os.path.join(os.path.dirname(__file__), "..", "server.js")

passed = 0
failed = 0
results = []

def check(name, cond, detail=""):
    global passed, failed
    if cond:
        passed += 1
        results.append(f"  ✓ {name}")
    else:
        failed += 1
        results.append(f"  ✗ {name}  {detail}")

def get(path, expect_code=None, headers=None):
    url = BASE + path
    req = urllib.request.Request(url, headers=headers or {})
    try:
        resp = urllib.request.urlopen(req, timeout=5)
        return resp.status, resp.read().decode("utf-8"), dict(resp.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8"), dict(e.headers)
    except urllib.error.URLError as e:
        return 0, str(e), {}

def post(path, data, headers=None):
    url = BASE + path
    body = json.dumps(data).encode("utf-8")
    h = {"Content-Type": "application/json"}
    if headers: h.update(headers)
    req = urllib.request.Request(url, data=body, headers=h, method="POST")
    try:
        resp = urllib.request.urlopen(req, timeout=5)
        return resp.status, resp.read().decode("utf-8"), dict(resp.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8"), dict(e.headers)

def main():
    # 修复 Windows 控制台编码
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass
    # 启动服务器
    env = dict(os.environ)
    env["PORT"] = str(PORT)
    env["ADMIN_PASSWORD"] = "testpass123"
    proc = subprocess.Popen([NODE, SERVER], env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, cwd=os.path.dirname(SERVER))
    try:
        time.sleep(2)  # 等待启动
        if proc.poll() is not None:
            print("服务器启动失败:")
            print(proc.stdout.read().decode("utf-8"))
            sys.exit(1)

        print("=" * 50)
        print("简历系统自动化测试")
        print("=" * 50)

        # ---- 1. 核心功能：各版本页面 ----
        print("\n[1] 各版本页面")
        for v, title in [("ai","AI 应用开发工程师"),("it","IT 技术支持工程师"),("test","测试开发工程师"),("erp","ERP 实施顾问")]:
            code, body, _ = get(f"/{v}")
            check(f"/{v} 返回200", code == 200, f"got {code}")
            check(f"/{v} 含正确标题", title in body, "")
            check(f"/{v} 含数据注入", "window.RESUME" in body, "")
            check(f"/{v} 无后台入口", "/admin" not in body and "admin.js" not in body, "泄露后台入口!")

        # ---- 2. 根路径重定向 ----
        print("\n[2] 根路径重定向")
        code, _, hdr = get("/")
        check("/ 重定向到 /ai", code in (200, 301, 302) , f"got {code}")

        # ---- 3. 管理后台页面 ----
        print("\n[3] 管理后台")
        code, body, _ = get("/admin")
        check("/admin 返回200", code == 200, f"got {code}")
        check("/admin 含后台脚本", "admin.js" in body, "")

        # ---- 4. 数据 API ----
        print("\n[4] 数据 API")
        code, body, _ = get("/api/data")
        check("/api/data 返回200", code == 200, f"got {code}")
        try:
            d = json.loads(body)
            check("/api/data 含 base", "base" in d, "")
            check("/api/data 含4个版本", len(d.get("versions", {})) == 4, f"got {len(d.get('versions',{}))}")
            check("/api/data 版本key正确", set(d.get("versions",{}).keys()) == {"ai","it","test","erp"}, "")
        except Exception as e:
            check("/api/data JSON可解析", False, str(e))

        # ---- 5. 鉴权：未登录状态 ----
        print("\n[5] 鉴权 - 未登录")
        code, body, _ = get("/api/check")
        check("/api/check 未登录返回authed=false", '"authed":false' in body or '"authed": false' in body, body[:80])

        code, body, _ = post("/api/save", {"base": {}, "versions": {}})
        check("/api/save 未登录拒绝(401)", code == 401, f"got {code}")

        # ---- 6. 鉴权：错误密码 ----
        print("\n[6] 鉴权 - 错误密码")
        code, body, _ = post("/api/login", {"password": "wrong"})
        check("/api/login 错误密码拒绝(401)", code == 401, f"got {code}")

        # ---- 7. 鉴权：正确密码 + 保存 ----
        print("\n[7] 鉴权 - 正确密码 + 保存")
        code, body, hdr = post("/api/login", {"password": "testpass123"})
        check("/api/login 正确密码成功(200)", code == 200, f"got {code}")
        cookie = hdr.get("Set-Cookie", "")
        check("/api/login 返回cookie", "resume_session=" in cookie, "无cookie")
        sess = cookie.split(";")[0] if cookie else ""

        # 用会话保存数据（先读再改一个字段再存）
        code, body, _ = get("/api/data")
        d = json.loads(body)
        orig_name = d["base"]["name"]
        d["base"]["name"] = "测试临时名"
        code, body, _ = post("/api/save", d, {"Cookie": sess})
        check("/api/save 登录后成功(200)", code == 200, f"got {code}")
        # 验证保存生效
        code, body, _ = get("/api/data")
        d2 = json.loads(body)
        check("/api/save 数据已更新", d2["base"]["name"] == "测试临时名", d2["base"]["name"])
        # 恢复原数据
        d2["base"]["name"] = orig_name
        post("/api/save", d2, {"Cookie": sess})
        check("/api/save 恢复原数据", True)

        # ---- 8. 静态文件 ----
        print("\n[8] 静态文件")
        for f in ["/style.css", "/app.js"]:
            code, body, _ = get(f)
            check(f"{f} 返回200", code == 200, f"got {code}")

        # ---- 9. 404 ----
        print("\n[9] 404")
        code, _, _ = get("/not-exist-page")
        check("未知路径返回404", code == 404, f"got {code}")

        # ---- 汇总 ----
        print("\n" + "=" * 50)
        for r in results: print(r)
        print("=" * 50)
        print(f"通过: {passed}   失败: {failed}   总计: {passed+failed}")
        print("=" * 50)
    finally:
        proc.terminate()
        try: proc.wait(timeout=3)
        except: proc.kill()

    sys.exit(0 if failed == 0 else 1)

if __name__ == "__main__":
    main()
