import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const skillsRoot = ".skills";
const targetRoots = [".codex/skills", ".cursor/skills"];
const ignoredNames = new Set([".DS_Store"]);
const generatedNoticePattern = /Generated from \.skills\//;

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

async function listSourceSkills(relativeDir = "") {
  const dir = path.join(skillsRoot, relativeDir);
  const skillMd = path.join(dir, "SKILL.md");

  if (await pathExists(skillMd)) {
    const name = relativeDir.split(path.sep).at(-1);
    return [
      {
        name,
        sourceDir: path.posix.join(skillsRoot, relativeDir.split(path.sep).join(path.posix.sep)),
      },
    ];
  }

  const entries = await readdir(dir, { withFileTypes: true });
  const skills = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || ignoredNames.has(entry.name)) {
      continue;
    }

    skills.push(...(await listSourceSkills(path.join(relativeDir, entry.name))));
  }

  return skills;
}

async function copyDirectory(sourceDir, targetDir, skillSourceDir, relativeDir = "") {
  await mkdir(targetDir, { recursive: true });
  const entries = await readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    if (ignoredNames.has(entry.name)) {
      continue;
    }

    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    const nextRelativePath = path.join(relativeDir, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath, skillSourceDir, nextRelativePath);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const content = await readFile(sourcePath);
    await writeFile(targetPath, renderFile(content, skillSourceDir, nextRelativePath));
  }
}

function renderFile(content, sourceDir, relativePath) {
  const sourcePath = path.posix.join(
    sourceDir.split(path.sep).join(path.posix.sep),
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

async function isManagedMirror(targetDir) {
  const skillMd = path.join(targetDir, "SKILL.md");

  if (!(await pathExists(skillMd))) {
    return false;
  }

  const content = await readFile(skillMd, "utf8");
  return generatedNoticePattern.test(content);
}

async function removeManagedTargets(targetRoot, sourceSkillNames) {
  const entries = await readdir(targetRoot, { withFileTypes: true });
  await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const targetDir = path.join(targetRoot, entry.name);
        const shouldRemove =
          sourceSkillNames.includes(entry.name) || (await isManagedMirror(targetDir));

        if (shouldRemove) {
          await rm(targetDir, { recursive: true, force: true });
        }
      }),
  );
}

const skills = (await listSourceSkills()).sort((left, right) =>
  left.name.localeCompare(right.name),
);
const sourceSkillNames = skills.map((skill) => skill.name);

for (const targetRoot of targetRoots) {
  await mkdir(targetRoot, { recursive: true });
  await removeManagedTargets(targetRoot, sourceSkillNames);

  for (const skill of skills) {
    await copyDirectory(skill.sourceDir, path.join(targetRoot, skill.name), skill.sourceDir);
  }
}

console.log(`Synced ${skills.length} project skills to ${targetRoots.join(", ")}.`);
