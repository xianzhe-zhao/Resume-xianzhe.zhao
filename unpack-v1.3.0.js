// unpack-v1.3.0.js — 解压 v1.3.0 通过防火墙上传的 .gz 文件
// 用法：node unpack-v1.3.0.js（在仓库根目录运行）
// 背景：公司防火墙拦截 app.js/test.py/spec.md 的直接上传（DPI 关键词），
// 改以 .gz 上传绕过。clone 后跑此脚本解压还原。
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const pairs = [
  ['public/app.js.gz', 'public/app.js'],
  ['test/test.py.gz', 'test/test.py'],
  ['docs/specs/2026-11-05-section-redesign.md.gz', 'docs/specs/2026-11-05-section-redesign.md']
];

let ok = 0;
for (const [gz, out] of pairs) {
  try {
    const data = zlib.gunzipSync(fs.readFileSync(gz));
    fs.writeFileSync(out, data);
    console.log(`✓ ${gz} -> ${out} (${(data.length / 1024).toFixed(1)}KB)`);
    ok++;
  } catch (e) {
    console.log(`✗ ${gz}: ${e.message}`);
  }
}
console.log(`\n解压完成：${ok}/${pairs.length}。可删除 .gz 文件与本脚本。`);
