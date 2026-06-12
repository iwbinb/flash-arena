import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ignoredDirectories = new Set([
  ".git",
  "dist",
  "node_modules",
  ".wrangler"
]);

const ignoredFiles = new Set([
  "package-lock.json"
]);

const blockedTerms = [
  "wu" + "binbin",
  "Clau" + "de",
  "Co" + "dex",
  "node" + "stake",
  "/" + "Users",
  "iwbinb" + "@" + "gmail.com"
];

const binaryExtensions = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".pdf",
  ".zip",
  ".gz",
  ".mp4",
  ".mov",
  ".woff",
  ".woff2"
]);

const fail = (message) => {
  console.error(`Privacy check failed: ${message}`);
  process.exit(1);
};

const isBinaryPath = (file) => {
  const lower = file.toLowerCase();
  return [...binaryExtensions].some((extension) => lower.endsWith(extension));
};

const walk = (directory) => {
  const files = [];

  for (const entry of readdirSync(directory)) {
    if (entry.startsWith(".") && entry !== ".env.example") {
      if (ignoredDirectories.has(entry)) continue;
    }

    const path = join(directory, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      if (!ignoredDirectories.has(entry)) {
        files.push(...walk(path));
      }
      continue;
    }

    if (!ignoredFiles.has(entry) && !isBinaryPath(path)) {
      files.push(path);
    }
  }

  return files;
};

const scannedFiles = walk(".");
const matches = [];

for (const file of scannedFiles) {
  const content = readFileSync(file, "utf8");
  for (const term of blockedTerms) {
    if (content.includes(term)) {
      matches.push(`${file}: contains blocked public-repo term`);
    }
  }
}

if (matches.length > 0) {
  fail(matches.join("\n"));
}

console.log(`Privacy check passed: scanned ${scannedFiles.length} public files with no blocked local, private, or unwanted attribution terms.`);
