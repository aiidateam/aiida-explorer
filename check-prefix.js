import fs from "fs";
import path from "path";
// ---
// custom script to check for tailwind prefixing on src.
// ---

const prefix = "ae:";
const fileExtensions = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".html",
  ".vue",
  ".svelte",
];
const ignoreDirs = ["node_modules", "dist", "build", ".vite"];
const ignoreFiles = ["src/App.jsx"]; // files to skip

const classPattern = /class(Name)?=["'`]([^"'`]+)["'`]/g;

let filesScanned = 0;
let warningsFound = 0;

function checkFile(filePath) {
  // skip ignored files
  if (ignoreFiles.some((f) => path.resolve(f) === path.resolve(filePath)))
    return;

  const code = fs.readFileSync(filePath, "utf-8");
  const lines = code.split("\n");
  filesScanned++;

  lines.forEach((line, index) => {
    let match;
    while ((match = classPattern.exec(line))) {
      const classes = match[2].split(/\s+/);
      for (const c of classes) {
        if (
          c.length > 0 &&
          !c.startsWith(prefix) &&
          !c.startsWith("{") &&
          !c.startsWith("[") &&
          !c.startsWith("@") &&
          !c.startsWith("explorer") &&
          !c.startsWith("download")
        ) {
          console.warn(
            `⚠️ [PrefixCheck] Missing '${prefix}' in class '${c}' — ${filePath}:${index + 1}`
          );
          warningsFound++;
        }
      }
    }
  });
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignoreDirs.includes(entry.name)) walkDir(fullPath);
    } else if (fileExtensions.includes(path.extname(entry.name))) {
      checkFile(fullPath);
    }
  }
}

// run the check from src
// eslint-disable-next-line no-undef
walkDir(path.join(process.cwd(), "src"));

// summary
console.log("ae: tailwind prefix check completed!");
console.log(`Files scanned: ${filesScanned}`);
console.log(`Warnings found: ${warningsFound}`);
