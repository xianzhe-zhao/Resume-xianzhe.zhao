#!/bin/bash
# 自动生成 PR 描述（基于代码变更）
# 用法：./scripts/generate-pr.sh <target-branch>

set -e

TARGET_BRANCH=$1
CURRENT_BRANCH=$(git branch --show-current)

if [ -z "$TARGET_BRANCH" ]; then
    echo "用法：$0 <target-branch>"
    echo "示例：$0 test"
    exit 1
fi

echo "=== 生成 PR 描述（$CURRENT_BRANCH → $TARGET_BRANCH）==="
echo ""

# 获取变更统计
STATS=$(git diff --stat origin/$TARGET_BRANCH...HEAD 2>/dev/null || git diff --stat $TARGET_BRANCH...HEAD 2>/dev/null || echo "无变更统计")

# 获取提交历史
COMMITS=$(git log --oneline origin/$TARGET_BRANCH...HEAD 2>/dev/null || git log --oneline $TARGET_BRANCH...HEAD 2>/dev/null || echo "无提交历史")

# 获取变更文件列表
FILES=$(git diff --name-only origin/$TARGET_BRANCH...HEAD 2>/dev/null || git diff --name-only $TARGET_BRANCH...HEAD 2>/dev/null || echo "无文件变更")

# 分析变更类型
ADDED=$(echo "$FILES" | grep -c "^+" 2>/dev/null || echo "0")
MODIFIED=$(echo "$FILES" | wc -l | tr -d ' ')
DELETED=$(echo "$FILES" | grep -c "^-" 2>/dev/null || echo "0")

# 生成 PR 描述
cat << EOF
## 📋 变更摘要

$(echo "$STATS")

## 📝 提交历史

\`\`\`
$COMMITS
\`\`\`

## 📁 变更文件

共 $MODIFIED 个文件变更

\`\`\`
$FILES
\`\`\`

## 🔍 变更类型

- 新增文件：$ADDED
- 修改文件：$MODIFIED
- 删除文件：$DELETED

## ✅ 测试情况

- [ ] 本地测试通过
- [ ] 测试环境验证通过

## 📌 部署说明

- 合并到 \`$TARGET_BRANCH\` 后将自动部署到对应环境
EOF

echo ""
echo "=== PR 描述已生成 ==="
echo "可以使用以下命令创建 PR："
echo ""
echo "gh pr create --base $TARGET_BRANCH --head $CURRENT_BRANCH --title \"feat: 从 $CURRENT_BRANCH 合并到 $TARGET_BRANCH\" --body \"\$(./scripts/generate-pr.sh $TARGET_BRANCH)\""
