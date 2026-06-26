import JSZip from "jszip";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const zipName = "manifest-notebooky-review.zip";
const zipPath = path.join(rootDir, zipName);

const requiredFiles = [
  "README.md",
  "package.json",
  "package-lock.json",
  "index.html",
  "tsconfig.json",
  "vite.config.ts",
  "BUILD_RECEIPT_MANIFEST_NOTEBOOKY.md",
  "BUILD_LOG_MANIFEST_NOTEBOOKY.txt",
  "PACKAGE_VERIFY_MANIFEST_NOTEBOOKY.md",
];

const requiredDirectories = ["src", "scripts"];
const screenshotDirectory = "output/playwright";

const forbiddenSegments = new Set([
  "node_modules",
  "dist",
  ".git",
  ".vite",
  "coverage",
  ".cache",
  "cache",
  "caches",
  "tmp",
  "temp",
]);

const files = [];

for (const file of requiredFiles) {
  await addRequiredFile(file);
}

for (const directory of requiredDirectories) {
  await collectDirectory(directory, () => true);
}

await collectDirectory(screenshotDirectory, (entry) => entry.toLowerCase().endsWith(".png"));

files.sort((a, b) => a.entry.localeCompare(b.entry));
validateEntries(files.map((file) => file.entry));

const zip = new JSZip();
for (const file of files) {
  zip.file(file.entry, await readFile(path.join(rootDir, file.entry)));
}

const buffer = await zip.generateAsync({
  type: "nodebuffer",
  compression: "DEFLATE",
  compressionOptions: { level: 9 },
  platform: "UNIX",
});

await writeFile(zipPath, buffer);
const verification = await verifyZip(zipPath);

console.log(
  JSON.stringify(
    {
      zipPath,
      entries: verification.entryCount,
      backslashPaths: verification.backslashPaths,
      sha256: verification.sha256,
    },
    null,
    2,
  ),
);

async function addRequiredFile(relativePath) {
  const absolutePath = path.join(rootDir, relativePath);
  const fileStat = await stat(absolutePath).catch(() => null);
  if (!fileStat?.isFile()) {
    throw new Error(`Required review package file is missing: ${relativePath}`);
  }
  addFile(relativePath);
}

async function collectDirectory(relativeDirectory, allowFile) {
  const absoluteDirectory = path.join(rootDir, relativeDirectory);
  const directoryStat = await stat(absoluteDirectory).catch(() => null);
  if (!directoryStat?.isDirectory()) {
    throw new Error(`Required review package directory is missing: ${relativeDirectory}`);
  }

  const children = await readdir(absoluteDirectory, { withFileTypes: true });
  for (const child of children) {
    const childRelativePath = path.join(relativeDirectory, child.name);
    if (child.isDirectory()) {
      await collectDirectory(childRelativePath, allowFile);
      continue;
    }
    if (!child.isFile() || !allowFile(posixPath(childRelativePath))) continue;
    addFile(childRelativePath);
  }
}

function addFile(relativePath) {
  const entry = posixPath(relativePath);
  validateEntries([entry]);
  if (!files.some((file) => file.entry === entry)) {
    files.push({ entry });
  }
}

function posixPath(value) {
  return value.split(path.sep).join("/");
}

function validateEntries(entries) {
  const errors = [];
  for (const entry of entries) {
    const lowerEntry = entry.toLowerCase();
    const segments = entry.split("/");

    if (entry.includes("\\")) errors.push(`${entry}: contains a backslash`);
    if (entry.startsWith("/") || /^[a-z]:/i.test(entry) || entry.startsWith("//")) {
      errors.push(`${entry}: is absolute`);
    }
    if (segments.includes("..")) errors.push(`${entry}: contains traversal`);
    if (lowerEntry.endsWith(".zip")) errors.push(`${entry}: old ZIP/review ZIP files are excluded`);
    if (entry === "Instructions.txt" || segments.includes("Instructions.txt")) {
      errors.push(`${entry}: Instructions.txt is not public-review material`);
    }

    for (const segment of segments) {
      const lowerSegment = segment.toLowerCase();
      if (forbiddenSegments.has(lowerSegment) || lowerSegment.startsWith(".tmp")) {
        errors.push(`${entry}: contains forbidden segment ${segment}`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Review ZIP entry validation failed:\n${errors.join("\n")}`);
  }
}

async function verifyZip(archivePath) {
  const zipBuffer = await readFile(archivePath);
  const loadedZip = await JSZip.loadAsync(zipBuffer);
  const entries = Object.keys(loadedZip.files).filter((entry) => !loadedZip.files[entry].dir);
  validateEntries(entries);

  const backslashPaths = entries.filter((entry) => entry.includes("\\")).length;
  if (backslashPaths !== 0) {
    throw new Error(`Review ZIP contains ${backslashPaths} backslash paths.`);
  }

  return {
    entryCount: entries.length,
    backslashPaths,
    sha256: await sha256File(archivePath),
  };
}

async function sha256File(filePath) {
  const hash = createHash("sha256");
  await new Promise((resolve, reject) => {
    createReadStream(filePath)
      .on("data", (chunk) => hash.update(chunk))
      .on("error", reject)
      .on("end", resolve);
  });
  return hash.digest("hex");
}
