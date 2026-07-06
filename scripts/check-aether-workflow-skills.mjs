import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const sourceRoot = ".skills/aether-workflow";
const targetRoots = [".codex/skills", ".cursor/skills"];
const managedPrefix = "aether-workflow-";
const ignoredNames = new Set([".DS_Store"]);

async function pathExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function listManagedSkills(root) {
  if (!(await pathExists(root))) {
    return [];
  }

  const entries = await readdir(root, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith(managedPrefix))
    .map((entry) => entry.name)
    .sort();
}

async function listFiles(root, relativeDir = "") {
  const dir = path.join(root, relativeDir);
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (ignoredNames.has(entry.name)) {
      continue;
    }

    const relativePath = path.join(relativeDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFiles(root, relativePath)));
      continue;
    }

    if (entry.isFile()) {
      files.push(relativePath);
    }
  }

  return files.sort();
}

function renderFile(content, skillName, relativePath) {
  const sourcePath = path.posix.join(
    sourceRoot,
    skillName,
    relativePath.split(path.sep).join(path.posix.sep),
  );
  const extension = path.extname(relativePath);

  if (extension === ".md") {
    const notice = `<!-- Generated from ${sourcePath}. Do not edit directly. Run pnpm skills:sync. -->\n\n`;
    const text = content.toString("utf8");

    if (text.startsWith("---\n")) {
      const frontmatterEnd = text.indexOf("\n---\n", 4);

      if (frontmatterEnd !== -1) {
        const splitAt = frontmatterEnd + "\n---\n".length;
        return Buffer.from(`${text.slice(0, splitAt)}\n${notice}${text.slice(splitAt)}`);
      }
    }

    return Buffer.from(`${notice}${text}`);
  }

  if (extension === ".yaml" || extension === ".yml") {
    return Buffer.concat([
      Buffer.from(
        `# Generated from ${sourcePath}.\n# Do not edit directly. Run pnpm skills:sync.\n\n`,
      ),
      content,
    ]);
  }

  return content;
}

async function checkSkill(targetRoot, skillName) {
  const sourceDir = path.join(sourceRoot, skillName);
  const targetDir = path.join(targetRoot, skillName);
  const problems = [];

  if (!(await pathExists(targetDir))) {
    return [`Missing mirror directory: ${targetDir}`];
  }

  const sourceFiles = await listFiles(sourceDir);
  const targetFiles = await listFiles(targetDir);
  const allFiles = new Set([...sourceFiles, ...targetFiles]);

  for (const relativePath of [...allFiles].sort()) {
    const inSource = sourceFiles.includes(relativePath);
    const inTarget = targetFiles.includes(relativePath);

    if (!inSource) {
      problems.push(`Unexpected mirror file: ${path.join(targetDir, relativePath)}`);
      continue;
    }

    if (!inTarget) {
      problems.push(`Missing mirror file: ${path.join(targetDir, relativePath)}`);
      continue;
    }

    const sourceContent = await readFile(path.join(sourceDir, relativePath));
    const targetContent = await readFile(path.join(targetDir, relativePath));
    const expectedContent = renderFile(sourceContent, skillName, relativePath);

    if (!targetContent.equals(expectedContent)) {
      problems.push(`Drifted mirror file: ${path.join(targetDir, relativePath)}`);
    }
  }

  return problems;
}

const sourceSkills = await listManagedSkills(sourceRoot);
const problems = [];

for (const targetRoot of targetRoots) {
  const targetSkills = await listManagedSkills(targetRoot);
  const staleSkills = targetSkills.filter((skillName) => !sourceSkills.includes(skillName));

  for (const skillName of staleSkills) {
    problems.push(`Unexpected mirror directory: ${path.join(targetRoot, skillName)}`);
  }

  for (const skillName of sourceSkills) {
    problems.push(...(await checkSkill(targetRoot, skillName)));
  }
}

if (problems.length > 0) {
  console.error("Aether workflow skill mirror check failed:");
  for (const problem of problems) {
    console.error(`- ${problem}`);
  }
  console.error("\nRun pnpm skills:sync to regenerate host mirrors.");
  process.exit(1);
}

console.log(`Aether workflow skill mirrors are in sync (${sourceSkills.length} skills).`);
