#!/usr/bin/env python3
import sys

with open('README.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

fixed = []
for i, line in enumerate(lines):
    stripped = line.rstrip('\n')
    # 单独的反引号 → 三个反引号
    if stripped == '`':
        fixed.append('```\n')
        print(f'Fixed line {i+1}: single backtick → triple')
    # `ash → ```bash
    elif stripped == '`ash':
        fixed.append('```bash\n')
        print(f'Fixed line {i+1}: `ash → ```bash')
    else:
        fixed.append(line)

with open('README.md', 'w', encoding='utf-8') as f:
    f.writelines(fixed)

print('README fixed successfully')
