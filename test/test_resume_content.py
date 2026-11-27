# -*- coding: utf-8 -*-
"""简历内容更新契约用例（spec 2026-11-23-resume-content-update C1-C12）
用法: python test/test_resume_content.py
依赖: 仅 Python 标准库；直接读 data/resume.json 做数据断言，不起服务器。

用例名映射（spec 2026-11-27-v8-integrate-four-directions 核销）:
  test_resume_content_canon -> C10 test_resume_content 适配 canon
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
check("C2 items 数=6（3功能+3技术）", len(bb["items"]) == 6, f"got {len(bb['items'])}")
check("C2 含功能覆盖条", any("功能覆盖" in it for it in bb["items"]), "缺功能覆盖条")
check("C2 含三服务拆分条", any("三服务拆分" in it for it in bb["items"]), "缺三服务拆分条")
check("C2 含 Agent 编排层条", any("Agent 编排层" in it for it in bb["items"]), "缺 Agent 编排层条")
check("C2 含 ReAct 多轮条", any("ReAct" in it for it in bb["items"]), "缺 ReAct 条")
check("C2 含语义记忆条", any("语义记忆" in it for it in bb["items"]), "缺语义记忆条")
check("C2 含 28 个工具", any("28 个工具" in it for it in bb["items"]), "缺 28 个工具")
check("C2 含 BGE", any("BGE" in it for it in bb["items"]), "缺 BGE")
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
check("C3 desc 含 9 步", "9 步" in si["desc"], "缺 9 步")
check("C3 desc 含 spec 契约", "spec 契约" in si["desc"] or "契约" in si["desc"], "缺契约")
check("C3 items 数=2", len(si["items"]) == 2, f"got {len(si['items'])}")
check("C3 items 含 9 步流程", any("9 步" in it for it in si["items"]), "缺 9 步流程")
check("C3 items 含 契约核销", any("契约核销" in it for it in si["items"]), "缺契约核销")
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
rag_item = next((it for it in kb["items"] if "320" in it), None)
check("C4 RAG 含 320+ 条目", rag_item is not None, "缺含 320 的条目")
check("C4 RAG 表述为数据收集阶段", rag_item and "数据收集" in rag_item, f"RAG 口径: {rag_item}")
check("C4 RAG 含 320+", rag_item and "320" in rag_item, f"缺 320+")
check("C4 stack 含 Obsidian/Git/Markdown/RAG",
      kb["stack"] == ["Obsidian","Git","Markdown","RAG"], f"got {kb['stack']}")

# ---- C5 AiPro Bridge 保持不变 ----
print("\n[C5] AiPro Bridge 不变")
ai_pro = next(p for p in base["projects"] if p["id"] == "aipro-bridge")
check("C5 aipro-bridge 在末位", base["projects"][-1]["id"] == "aipro-bridge", "不在末位")
check("C5 title 含 AiPro Bridge", "AiPro Bridge" in ai_pro["title"], ai_pro["title"])
check("C5 desc 含零依赖 Node.js", "零依赖" in ai_pro["desc"] and "Node.js" in ai_pro["desc"], "缺零依赖/Node.js")
check("C5 items 数=2", len(ai_pro["items"]) == 2, f"got {len(ai_pro['items'])}")
check("C5 stack 含 MCP/SSE", "MCP" in ai_pro["stack"] and "SSE" in ai_pro["stack"], f"got {ai_pro['stack']}")

# ---- C6 ai 版 summary 更新 ----
print("\n[C6] ai 版 summary")
summary = versions["ai"]["summary"]
check("C6 含 AI 应用开发工程师", "AI 应用开发工程师" in summary, "缺求职目标")
check("C6 含 9 年工作经验", "9 年工作经验" in summary, "缺 9 年工作经验")
check("C6 含 Samsung SDS", "Samsung SDS" in summary, "缺 Samsung SDS")
check("C6 不含三星电子", "三星电子" not in summary, "仍含三星电子")
check("C6 保留 AWS 提及", "AWS Certified AI Practitioner" in summary, "丢 AWS 提及")
check("C6 保留豹豹助手", "豹豹助手" in summary, "丢豹豹助手")

# ---- C7 ai 版技术热情与自驱优势 ----
print("\n[C7] 技术热情与自驱优势")
adv3 = versions["ai"]["advantages"][3]
check("C7 第四条为安全合规与项目交付", "安全合规" in adv3["title"] or "项目交付" in adv3["title"], f"got {adv3['title']}")
check("C7 含加密整改", "加密" in adv3["text"], "缺加密整改")
check("C7 含 Next ERP 项目经理", "Next ERP" in adv3["text"], "缺 Next ERP")

# ---- C8 技能栏 AI/云/系统补充 ----
print("\n[C8] 技能栏 AI/云/系统")
ai_eng = base["skills"].get("AI 工程", [])
arch_ops = base["skills"].get("架构与运维", [])
check("C8 含 AI 工程组", len(ai_eng) > 0, "缺 AI 工程组")
check("C8 含架构与运维组", len(arch_ops) > 0, "缺架构与运维组")
check("C8 AI 工程 含 RAG", any("RAG" in s for s in ai_eng), "缺 RAG")
check("C8 AI 工程 含 Prompt", any("Prompt" in s for s in ai_eng), "缺 Prompt")
check("C8 架构运维 含 AWS", "AWS" in arch_ops, "缺 AWS")
check("C8 架构运维 含 Linux", "Linux" in arch_ops, "缺 Linux")

# ---- C9 证书与荣誉口径统一 ----
print("\n[C9] 证书荣誉口径统一")
check("C9 certs 含 3 项", len(base["certs"]) == 3, f"got {len(base['certs'])}")
check("C9 certs 含 AWS", any("AWS Certified AI Practitioner" in c for c in base["certs"]), "certs 缺 AWS")
check("C9 certs 含三星 SW", any("三星 SW" in c for c in base["certs"]), "certs 缺三星 SW")
check("C9 certs 含计算机等级考试", any("计算机等级考试" in c or "NCRE" in c for c in base["certs"]), "certs 缺 NCRE")
check("C9 honors 含 1 项", len(base["honors"]) == 1, f"got {len(base['honors'])}")
check("C9 honors 不含 AWS", not any("AWS" in h for h in base["honors"]), "honors 仍有 AWS")
check("C9 honors 含 SDSC", any("SDSC" in h for h in base["honors"]), "honors 缺 SDSC")
check("C9 summary 保留 AWS", "AWS Certified AI Practitioner" in versions["ai"]["summary"], "summary 丢 AWS")
check("C9 ai 版含 AWS（summary 或 advantage）", "AWS Certified AI Practitioner" in versions["ai"]["summary"] or any("AWS" in a["text"] for a in versions["ai"]["advantages"]), "ai 版丢 AWS")

# ---- C10 token 占位 ----
print("\n[C10] token 占位")
check("C10 未写入具体 token 数字(baobo desc 不含 M tokens)",
      "tokens" not in bb["desc"] and "M tokens" not in bb["desc"], "已写入 token 数字(应待用户提供)")
check("C10 未写入具体 token 数字(items 不含 tokens)",
      not any("tokens" in it for it in bb["items"]), "items 已写入 token(应待用户提供)")


# ---- C11 英文版（本轮不同步，仅校验结构存在）----
print("\n[C11] 英文版结构（本轮不同步）")
check("C11 en base 存在", "base" in d.get("en", {}), "缺 en.base")
check("C11 en versions 含 ai", "ai" in en_versions, "en 缺 ai 版")
check("C11 en projects 存在", len(en_base.get("projects", [])) > 0, "en 缺 projects")
check("C11 en skills 存在", len(en_base.get("skills", {})) > 0, "en 缺 skills")

# ---- C12 四方向重建（ai/fullstack/erp/pm）----
print("\n[C12] 四方向重建")
check("C12 versions 含四方向", set(versions.keys()) == {"ai","fullstack","erp","pm"}, f"got {set(versions.keys())}")
check("C12 旧版本 it/test 已删除", all(v not in versions for v in ("it","test")), "旧版本未删干净")
check("C12 en versions 仅 ai（本轮不同步）", "ai" in en_versions, "en 缺 ai")

print("\n" + "=" * 60)
print(f"通过: {passed}   失败: {failed}   总计: {passed+failed}")
print("=" * 60)
if failed:
    for r in results:
        if r.startswith("  FAIL"):
            print(r)
    sys.exit(1)
sys.exit(0)
