# -*- coding: utf-8 -*-
"""兴趣改写+图片+AI工具契约用例（spec 2026-11-24 C1-C9）
用法: python test/test_interest_images.py
"""
# 用例名映射（供 check_spec.py 核销校验）:
# test_c1_interests_rewrite -> C1 兴趣3条文案
# test_c2_proj_images -> C2 项目卡片图片
# test_c3_interest_images -> C3 兴趣卡片图片
# test_c4_svg_fallback -> C4 svgArt回退SVG
# test_c5_tech_desc_four -> C5 技术折腾4项目
# test_c6_no_external_img -> C6 无外部图片请求
# test_c7_en_interests_mirror -> C7 英文镜像
# test_c8_ai_agent_tools_group -> C8 AI Agent工具组
# test_c9_llm_models_group -> C9 LLM模型组
import json, os, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
APP_JS = os.path.join(ROOT, "public", "app.js")
RESUME = os.path.join(ROOT, "data", "resume.json")
IMG_DIR = os.path.join(ROOT, "public", "img")

passed = 0; failed = 0; results = []
def check(name, cond, detail=""):
    global passed, failed
    if cond: passed += 1; results.append(f"  PASS {name}")
    else: failed += 1; results.append(f"  FAIL {name}  {detail}")

app_src = open(APP_JS, encoding="utf-8").read()
d = json.load(open(RESUME, encoding="utf-8"))

print("=" * 60)
print("兴趣改写+图片+AI工具契约用例 C1-C9（spec 2026-11-24）")
print("=" * 60)

# C1 兴趣 3 条文案改写
print("\n[C1] 兴趣 3 条文案")
check("C1 interests 在 app.js", "interests:" in app_src, "")
check("C1 技术折腾 4 个项目", "4 个完整项目" in app_src, "缺 4 个完整项目")
check("C1 运动生活", "运动生活" in app_src and "羽毛球" in app_src, "缺运动生活")
check("C1 摄影爱好 A7C2", "摄影爱好" in app_src and "A7C2" in app_src, "缺摄影爱好")
check("C1 interests 无阅读思考标题", "title: '阅读思考'" not in app_src, "仍有阅读思考标题")
check("C1 不含运动健身(旧)", "title: '运动健身'" not in app_src, "仍有旧运动健身")

# C2 项目卡片配真实图片
print("\n[C2] 项目卡片图片")
check("C2 PROJ_IMGS 映射存在", "PROJ_IMGS" in app_src, "缺 PROJ_IMGS")
proj_files = {"baobao": "proj-baobao.jpg", "ship-it": "proj-shipit.jpg", "knowledge-base": "proj-kb.jpg", "aipro-bridge": "proj-aipro.jpg"}
for pid, fn in proj_files.items():
    check(f"C2 PROJ_IMGS 含 {pid}", f"'{pid}'" in app_src, f"缺 {pid}")
    check(f"C2 图片文件 {fn}", os.path.isfile(os.path.join(IMG_DIR, fn)), f"缺 {fn}")

# C3 兴趣卡片配真实图片
print("\n[C3] 兴趣卡片图片")
check("C3 INTEREST_IMGS 映射存在", "INTEREST_IMGS" in app_src, "缺 INTEREST_IMGS")
for fn in ["interest-tech.jpg", "interest-sport.jpg", "interest-photo.jpg"]:
    check(f"C3 图片文件 {fn}", os.path.isfile(os.path.join(IMG_DIR, fn)), f"缺 {fn}")

# C4 svgArt 无图回退 SVG
print("\n[C4] svgArt 回退")
check("C4 svgArt 函数存在", "function svgArt(" in app_src, "")
check("C4 cover-img class", "cover-img" in app_src, "缺 cover-img")
check("C4 campus 仍用 SVG(无图)", "campus:" in app_src, "campus SVG 丢失")
check("C4 rms 仍用 SVG(无图)", "rms:" in app_src, "rms SVG 丢失")

# C5 技术折腾 desc 4 项目
print("\n[C5] 技术折腾 4 项目")
check("C5 含 4 个完整项目", "4 个完整项目" in app_src, "")
check("C5 不含 3 个完整项目", "3 个完整项目" not in app_src, "仍 3 个")

# C6 图片本地路径无外部请求
print("\n[C6] 无外部图片请求")
import re
ext_imgs = re.findall(r'src="https?://[^"]*.(png|jpg|jpeg|gif|svg)', app_src)
check("C6 无外部图片 URL", len(ext_imgs) == 0, f"发现外部图: {ext_imgs}")

# C7 英文 interests 镜像
print("\n[C7] 英文 interests 镜像")
check("C7 en Tech Tinkering 4 projects", "Four complete solo projects" in app_src, "缺 Four complete")
check("C7 en Sports Life", "Sports Life" in app_src and "Badminton" in app_src, "缺 Sports Life")
check("C7 en Photography A7C2", "Photography" in app_src and "A7C2" in app_src, "缺 Photography")

# C8 技能栏 AI 编程工具组
print("\n[C8] AI 编程工具组")
skills = d["base"].get("skills", {})
check("C8 技能组数=9", len(skills) == 9, f"got {len(skills)}")
check("C8 含 AI 编程工具组", "AI 编程工具" in skills, "缺 AI 编程工具组")
ai_tools = skills.get("AI 编程工具", [])
check("C8 AI 编程工具 6 项", len(ai_tools) == 6, f"got {len(ai_tools)}")
for t in ["DSH", "Claude Code", "Codex", "灵光", "WorkBuddy", "Trae"]:
    check(f"C8 含 {t}", t in ai_tools, f"缺 {t}")

# C9 技能栏 LLM 模型组
print("\n[C9] LLM 模型组")
check("C9 含 模型组", "模型" in skills, "缺 模型组")
llm = skills.get("模型", [])
check("C9 模型 5 项", len(llm) == 5, f"got {len(llm)}")
for t in ["DeepSeek", "GLM", "Qwen", "BGE（ONNX Runtime 推理）"]:
    check(f"C9 含 {t}", t in llm, f"缺 {t}")
en_skills = d["en"]["base"].get("skills", {})
check("C9 en 技能组数>=7（en 本轮不同步）", len(en_skills) >= 7, f"got {len(en_skills)}")
check("C9 en AI Coding Tools", "AI Coding Tools" in en_skills, "缺 en AI Coding Tools")
check("C9 en LLM Models", "LLM Models" in en_skills, "缺 en LLM Models")

print("\n" + "=" * 60)
print(f"通过: {passed}   失败: {failed}   总计: {passed+failed}")
print("=" * 60)
if failed:
    for r in results:
        if r.startswith("  FAIL"): print(r)
    sys.exit(1)
sys.exit(0)
