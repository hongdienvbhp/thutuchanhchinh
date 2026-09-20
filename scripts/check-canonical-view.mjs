import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
const banned = /(?:master[-_ ]?tthc|thu-tuc).*\.(?:json|xlsx|xls|csv)$/i;
const hits = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (banned.test(entry.name)) hits.push(full);
  }
}
await walk(".");
if (hits.length) throw new Error(`Consumer chứa Master TTHC riêng:\n${hits.join("\n")}`);
const source = await readFile("canonical-view.js", "utf8");
for (const required of ["BangNiemYetVinhBao/main/data/thu-tuc.json", "dataset_version", "source_commit", "priority51"]) {
  if (!source.includes(required)) throw new Error(`Canonical view thiếu ${required}`);
}
const index = await readFile("index.html", "utf8");
if (/<div class="card">/i.test(index) || /formalityId=/i.test(index)) {
  throw new Error("index.html còn chứa danh mục TTHC hard-code; consumer phải chỉ render từ canonical");
}
if (!index.includes('src="./canonical-view.js"')) {
  throw new Error("index.html chưa nạp canonical-view.js");
}
console.log("CANONICAL VIEW CONTRACT: PASS");
