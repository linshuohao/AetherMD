import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const sourceRoot = ".skills/aether-workflow";
const targetRoots = [".codex/skills", ".cursor/skills"];
const managedPrefix = "aether-workflow-";
const ignoredNames = new Set([".DS_Store"]);

async function listManagedSkills() {
  const entries = await readdir(sourceRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith(managedPrefix))
    .map((entry) => entry.name)
    .sort();
}

async function copyDirectory(sourceDir, targetDir, skillName, relativeDir = "") {
  await mkdir(targetDir, { recursive: true });
  const entries = await readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    if (ignoredNames.has(entry.name)) {
      continue;
    }

    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    const relativePath = path.join(relativeDir, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath, skillName, relativePath);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const content = await readFile(sourcePath);
    await writeFile(targetPath, renderFile(content, skillName, relativePath));
  }
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

async function removeManagedTargets(targetRoot) {
  const entries = await readdir(targetRoot, { withFileTypes: true });
  await Promise.all(
    entries
      .filter((entry) => entry.isDirectory() && entry.name.startsWith(managedPrefix))
      .map((entry) =>
        rm(path.join(targetRoot, entry.name), { recursive: true, force: true }),
      ),
  );
}

const skills = await listManagedSkills();

for (const targetRoot of targetRoots) {
  await mkdir(targetRoot, { recursive: true });
  await removeManagedTargets(targetRoot);

  for (const skillName of skills) {
    await copyDirectory(
      path.join(sourceRoot, skillName),
      path.join(targetRoot, skillName),
      skillName,
    );
  }
}

console.log(
  `Synced ${skills.length} Aether workflow skills to ${targetRoots.join(", ")}.`,
);
