import { readFile } from "node:fs/promises";

const entrypoints = ["index.html", "congkhaitthc/index.html"];
const forbiddenTokens = ["YOUR_", "PLACEHOLDER", "TODO_REPLACE"];

for (const relativePath of entrypoints) {
  const html = await readFile(relativePath, "utf8");
  const normalized = html.toLowerCase();
  if (!normalized.includes("<!doctype html") || !normalized.includes("<html")) {
    throw new Error(`Invalid HTML entrypoint: ${relativePath}`);
  }
  if (!/<title>[^<]+<\/title>/i.test(html)) {
    throw new Error(`Missing title in HTML entrypoint: ${relativePath}`);
  }
  for (const token of forbiddenTokens) {
    if (html.includes(token)) {
      throw new Error(`Forbidden placeholder ${token} in ${relativePath}`);
    }
  }
  console.log(`validated ${relativePath}`);
}

console.log("STATIC PREVIEW VALIDATION: PASS");
