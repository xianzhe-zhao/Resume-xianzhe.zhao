# -*- coding: utf-8 -*-
"""简历内容更新契约用例（spec 2026-11-23-resume-content-update C1-C12）
用法: python test/test_resume_content.py
依赖: 仅 Python 标准库；直接读 data/resume.json 做数据断言，不起服务器。
"""
# 用例名映射（供 check_spec.py 核销校验）:
# test_c1_projects_count_order -> C1 项目数4+序列+七字段
# test_c2_baobao_items_seven -> C2 baobao items 7+豹豹文档+设计规范
# test_c3_shipit_entry -> C3 ship-it title/badge/link/desc/items/stack
# test_c4_kb_entry_rag_planned -> C4 knowledge-base PARA+RAG数据收集阶段
# test_c5_aipro_unchanged -> C5 AiPro Bridge 不变
# test_c6_ai_summary -> C6 ai summary 编码发布工作流+个人知识库+实时协作文档
# test_c7_advantage_four_projects -> C7 优势 4个项目
# test_c8_skills_rag_mcp_prompt -> C8 技能 RAG/MCP/Prompt Engineering
# test_c9_certs_honors_unified -> C9 证书荣誉口径统一
# test_c10_token_placeholder -> C10 token 占位
# test_c11_en_mirror_sync -> C11 英文镜像同步
# test_c12_other_versions_unchanged -> C12 it/test/erp 不变
import json, os, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
RESUME = os.path.join(ROOT, "data", "resume.json")

passed = 0
failed = 0
results = []

def check(name, cond, detail=""):
    global passed, failed
    if cond:
        passed += 1
        results.append(f"  PASS {name}")
    else:
        failed += 1
        results.append(f"  FAIL {name}  {detail}")

def norm(s):
    return "".join(s.split()).lower()

with open(RESUME, encoding="utf-8") as f:
    d = json.load(f)

base = d["base"]
en_base = d["en"]["base"]
versions = d["versions"]
en_versions = d["en"]["versions"]

print("=" * 60)
print("简历内容更新契约用例 C1-C12（spec 2026-11-23）")
print("=" * 60)

# ---- C1 项目板块重组为 4 条 ----
print("\n[C1] 项目板块重组为 4 条")
ids = [p["id"] for p in base["projects"]]
check("C1 项目数=4", len(base["projects"]) == 4, f"got {len(ids)}")
check("C1 id 序列 baobao/ship-it/knowledge-base/aipro-bridge",
      ids == ["baobao", "ship-it", "knowledge-base", "aipro-bridge"], f"got {ids}")
check("C1 deskshare 已删除", "deskshare" not in ids, "deskshare 仍存在")
check("C1 ship-it 新增", "ship-it" in ids, "ship-it 缺失")
check("C1 knowledge-base 新增", "knowledge-base" in ids, "knowledge-base 缺失")
for p in base["projects"]:
    check(f"C1 {p['id']} 含七字段", all(k in p for k in ("id","title","badge","link","desc","items","stack")),
          f"缺 {set(('id','title','badge','link','desc','items','stack'))-set(p.keys())}")

# ---- C2 豹豹助手增补豹豹文档与设计规范沉淀 ----
print("\n[C2] 豹豹助手 items 5->7")
bb = base["projects"][0]
check("C2 baobao 是首位", bb["id"] == "baobao", bb["id"])
check("C2 items 数=7", len(bb["items"]) == 7, f"got {len(bb['items'])}")
check("C2 含豹豹文档条", any("豹豹文档" in it for it in bb["items"]), "缺豹豹文档")
check("C2 含设计规范沉淀条", any("设计规范沉淀" in it for it in bb["items"]), "缺设计规范沉淀")
check("C2 豹豹文档含 Yjs/TipTap", any("Yjs" in it and "TipTap" in it for it in bb["items"]), "缺 Yjs/TipTap")
check("C2 设计规范含 DESIGN.md", any("DESIGN.md" in it for it in bb["items"]), "缺 DESIGN.md")
check("C2 stack 含 Vue3/Yjs/TipTap/WebSocket",
      all(s in bb["stack"] for s in ("Vue3","Yjs","TipTap","WebSocket")), f"got {bb['stack']}")
check("C2 原5条保留(AI对话)", any("AI 对话" in it for it in bb["items"]), "丢失原 AI 对话条")
check("C2 原5条保留(智能家居)", any("智能家居" in it for it in bb["items"]), "丢失原智能家居条")

# ---- C3 新增 ship-it 项目条目 ----
print("\n[C3] ship-it 条目")
si = next(p for p in base["projects"] if p["id"] == "ship-it")
check("C3 title 含 ship-it", "ship-it" in si["title"], si["title"])
check("C3 badge=独立开发", si["badge"] == "独立开发", si["badge"])
check("C3 link=https://github.com/xianzhe-zhao/ship-it",
      si["link"] == "https://github.com/xianzhe-zhao/ship-it", si["link"])
check("C3 desc 含 9 步契约", "9 步契约" in si["desc"], "缺 9 步契约")
check("C3 desc 含 spec-first", "spec-first" in si["desc"], "缺 spec-first")
check("C3 desc 含 60+ spec", "60+" in si["desc"], "缺 60+")
check("C3 items 数=3", len(si["items"]) == 3, f"got {len(si['items'])}")
check("C3 items 含 9 步契约流程", any("9 步契约流程" in it for it in si["items"]), "缺 9 步契约流程")
check("C3 items 含 spec-first 机器校验", any("spec-first" in it and "check_spec" in it for it in si["items"]), "缺 spec-first 机器校验")
check("C3 items 含团队模式", any("团队模式" in it for it in si["items"]), "缺团队模式")
check("C3 stack 含 AI Agent/Claude Code/Spec-driven/Python",
      si["stack"] == ["AI Agent","Claude Code","Spec-driven","Python"], f"got {si['stack']}")

# ---- C4 新增个人知识库条目 ----
print("\n[C4] 个人知识库条目")
kb = next(p for p in base["projects"] if p["id"] == "knowledge-base")
check("C4 title 含 PARA", "PARA" in kb["title"], kb["title"])
check("C4 badge=独立开发", kb["badge"] == "独立开发", kb["badge"])
check("C4 link 为空", kb["link"] == "", repr(kb["link"]))
check("C4 desc 含 Obsidian PARA", "Obsidian" in kb["desc"] and "PARA" in kb["desc"], "缺 Obsidian/PARA")
check("C4 desc 含 RAG", "RAG" in kb["desc"], "缺 RAG")
check("C4 items 数=3", len(kb["items"]) == 3, f"got {len(kb['items'])}")
check("C4 items 含 PARA 四层", any("PARA 四层" in it for it in kb["items"]), "缺 PAR四层")
check("C4 items 含自动归档", any("自动归档" in it for it in kb["items"]), "缺自动归档")
rag_item = next(it for it in kb["items"] if "RAG" in it)
check("C4 RAG 表述为数据收集阶段(非规划中非已完成)",
      "数据收集" in rag_item and "规划中" not in rag_item and "已完成检索" not in rag_item,
      f"RAG 口径: {rag_item}")
check("C4 RAG 含 320+", "320" in rag_item, f"缺 320+: {rag_item}")
check("C4 stack 含 Obsidian/Git/Markdown/RAG",
      kb["stack"] == ["Obsidian","Git","Markdown","RAG"], f"got {kb['stack']}")

# ---- C5 AiPro Bridge 保持不变 ----
print("\n[C5] AiPro Bridge 不变")
ai_pro = next(p for p in base["projects"] if p["id"] == "aipro-bridge")
check("C5 aipro-bridge 在末位", base["projects"][-1]["id"] == "aipro-bridge", "不在末位")
check("C5 title 含 AiPro Bridge", "AiPro Bridge" in ai_pro["title"], ai_pro["title"])
check("C5 desc 含零依赖 Node.js", "零依赖" in ai_pro["desc"] and "Node.js" in ai_pro["desc"], "缺零依赖/Node.js")
check("C5 items 数=4", len(ai_pro["items"]) == 4, f"got {len(ai_pro['items'])}")
check("C5 stack 含 MCP/SSE", "MCP" in ai_pro["stack"] and "SSE" in ai_pro["stack"], f"got {ai_pro['stack']}")

# ---- C6 ai 版 summary 更新 ----
print("\n[C6] ai 版 summary")
summary = versions["ai"]["summary"]
check("C6 含编码发布工作流 Agent Skill", "编码发布工作流 Agent Skill" in summary, "缺编码发布工作流")
check("C6 含个人知识库系统", "个人知识库系统" in summary, "缺个人知识库系统")
check("C6 含 + 实时协作文档", "+ 实时协作文档" in summary, "缺 + 实时协作文档")
check("C6 保留 AWS 提及", "AWS Certified AI Practitioner" in summary, "丢 AWS 提及")
check("C6 保留豹豹助手", "豹豹助手" in summary, "丢豹豹助手")

# ---- C7 ai 版技术热情与自驱优势 ----
print("\n[C7] 技术热情与自驱优势")
adv3 = versions["ai"]["advantages"][3]
check("C7 含 4 个完整项目", "4 个完整项目" in adv3["text"], "缺 4 个完整项目")
check("C7 含开源 ship-it", "ship-it" in adv3["text"], "缺开源 ship-it")
check("C7 含学做沉淀闭环", "闭环" in adv3["text"], "缺学做沉淀闭环")
check("C7 不含 3 个项目", "3 个完整项目" not in adv3["text"], "仍写 3 个项目")

# ---- C8 技能栏 AI/云/系统补充 ----
print("\n[C8] 技能栏 AI/云/系统")
ai_skills = base["skills"]["AI / 云 / 系统"]
check("C8 含 6 项", len(ai_skills) == 6, f"got {len(ai_skills)}")
check("C8 含 AWS", "AWS" in ai_skills, "缺 AWS")
check("C8 含 LLM / Agent", "LLM / Agent" in ai_skills, "缺 LLM/Agent")
check("C8 含 Linux", "Linux" in ai_skills, "缺 Linux")
check("C8 含 RAG", "RAG" in ai_skills, "缺 RAG")
check("C8 含 MCP", "MCP" in ai_skills, "缺 MCP")
check("C8 含 Prompt Engineering", "Prompt Engineering" in ai_skills, "缺 Prompt Engineering")

# ---- C9 证书与荣誉口径统一 ----
print("\n[C9] 证书荣誉口径统一")
check("C9 certs 含 3 项", len(base["certs"]) == 3, f"got {len(base['certs'])}")
check("C9 certs 含 AWS", any("AWS Certified AI Practitioner" in c for c in base["certs"]), "certs 缺 AWS")
check("C9 certs 含三星 SW", any("三星 SW" in c for c in base["certs"]), "certs 缺三星 SW")
check("C9 certs 含计算机二级", any("计算机二级" in c for c in base["certs"]), "certs 缺计算机二级")
check("C9 honors 含 1 项", len(base["honors"]) == 1, f"got {len(base['honors'])}")
check("C9 honors 不含 AWS", not any("AWS" in h for h in base["honors"]), "honors 仍有 AWS")
check("C9 honors 含 SDSC", any("SDSC" in h for h in base["honors"]), "honors 缺 SDSC")
check("C9 summary 保留 AWS", "AWS Certified AI Practitioner" in versions["ai"]["summary"], "summary 丢 AWS")
check("C9 advantage[0] 保留 AWS", "AWS Certified AI Practitioner" in versions["ai"]["advantages"][0]["text"], "adv[0] 丢 AWS")

# ---- C10 token 占位 ----
print("\n[C10] token 占位")
check("C10 未写入具体 token 数字(baobo desc 不含 M tokens)",
      "tokens" not in bb["desc"] and "M tokens" not in bb["desc"], "已写入 token 数字(应待用户提供)")
check("C10 未写入具体 token 数字(items 不含 tokens)",
      not any("tokens" in it for it in bb["items"]), "items 已写入 token(应待用户提供)")

# ---- C11 英文版镜像同步 ----
print("\n[C11] 英文版镜像同步")
en_ids = [p["id"] for p in en_base["projects"]]
check("C11 en 项目数=4", len(en_base["projects"]) == 4, f"got {len(en_ids)}")
check("C11 en id 序列与中文一致", en_ids == ids, f"en:{en_ids} zh:{ids}")
en_bb = en_base["projects"][0]
check("C11 en baobao items=7", len(en_bb["items"]) == 7, f"got {len(en_bb['items'])}")
check("C11 en baobao 含 Baobao Docs", any("Baobao Docs" in it for it in en_bb["items"]), "缺 Baobao Docs")
check("C11 en baobao 含 Design system", any("Design system" in it for it in en_bb["items"]), "缺 Design system")
en_si = next(p for p in en_base["projects"] if p["id"] == "ship-it")
check("C11 en ship-it link 一致", en_si["link"] == si["link"], f"en:{en_si['link']} zh:{si['link']}")
check("C11 en ship-it items=3", len(en_si["items"]) == 3, f"got {len(en_si['items'])}")
en_kb = next(p for p in en_base["projects"] if p["id"] == "knowledge-base")
check("C11 en kb items=3", len(en_kb["items"]) == 3, f"got {len(en_kb['items'])}")
en_rag_item = next(it for it in en_kb["items"] if "RAG" in it)
check("C11 en RAG 数据收集阶段", "data collection" in en_rag_item.lower(), f"en RAG: {en_rag_item}")
check("C11 en certs=3", len(en_base["certs"]) == 3, f"got {len(en_base['certs'])}")
check("C11 en honors=1", len(en_base["honors"]) == 1, f"got {len(en_base['honors'])}")
en_ai_skills = en_base["skills"]["AI / Cloud / Systems"]
check("C11 en AI skills=6", len(en_ai_skills) == 6, f"got {len(en_ai_skills)}")
check("C11 en AI skills 含 RAG/MCP/Prompt",
      all(s in en_ai_skills for s in ("RAG","MCP","Prompt Engineering")), f"got {en_ai_skills}")
check("C11 en ai summary 含 Four/coding-to-release/knowledge base",
      "coding-to-release" in en_versions["ai"]["summary"] and "knowledge base" in en_versions["ai"]["summary"],
      "en summary 缺关键词")
en_adv3 = en_versions["ai"]["advantages"][3]
check("C11 en adv[3] 含 4 complete + ship-it", "4 complete" in en_adv3["text"] and "ship-it" in en_adv3["text"], f"en adv3: {en_adv3['text'][:60]}")

# ---- C12 it/test/erp 已下线（单版本化，仅留 ai）----
print("\n[C12] it/test/erp 已下线（单版本化）")
check("C12 versions 仅含 ai", set(versions.keys()) == {"ai"}, f"多余版本: {set(versions.keys())}")
check("C12 en versions 仅含 ai", set(en_versions.keys()) == {"ai"}, f"en 多余版本: {set(en_versions.keys())}")
check("C12 it/test/erp 已删除", all(v not in versions for v in ("it","test","erp")), "旧版本未删干净")

print("\n" + "=" * 60)
print(f"通过: {passed}   失败: {failed}   总计: {passed+failed}")
print("=" * 60)
if failed:
    for r in results:
        if r.startswith("  FAIL"):
            print(r)
    sys.exit(1)
sys.exit(0)
