import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";

const componentRoot = new URL("../src/components/ui/", import.meta.url);
const forbiddenColor = /#[0-9a-f]{3,8}\b|rgba?\s*\(/i;

async function sourceFiles(directoryUrl) {
  const entries = await readdir(directoryUrl, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryUrl = new URL(entry.name, directoryUrl);
    if (entry.isDirectory()) {
      files.push(
        ...(await sourceFiles(new URL(`${entry.name}/`, directoryUrl))),
      );
    } else if ([".vue", ".scss", ".css"].includes(extname(entry.name))) {
      files.push(entryUrl);
    }
  }
  return files;
}

const violations = [];
for (const fileUrl of await sourceFiles(componentRoot)) {
  const source = await readFile(fileUrl, "utf8");
  source.split("\n").forEach((line, index) => {
    if (forbiddenColor.test(line)) {
      violations.push(
        `${fileUrl.pathname}:${index + 1}: use a semantic design token instead of a raw color`,
      );
    }
  });
}

if (violations.length) {
  console.error(violations.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Shared UI components use semantic design tokens.");
}
