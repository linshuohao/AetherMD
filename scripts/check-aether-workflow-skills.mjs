import { readdir, readFile, stat } from "node:fs/promises";
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
        sourceDir: path.posix.join(
          skillsRoot,
          relativeDir.split(path.sep).join(path.posix.sep),
        ),
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

async function listManagedTargetSkills(targetRoot) {
  if (!(await pathExists(targetRoot))) {
    return [];
  }

  const entries = await readdir(targetRoot, { withFileTypes: true });
  const skills = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const targetDir = path.join(targetRoot, entry.name);

    if (await isManagedMirror(targetDir)) {
      skills.push(entry.name);
    }
  }

  return skills.sort();
}

async function checkSkill(targetRoot, skill) {
  const sourceDir = skill.sourceDir;
  const targetDir = path.join(targetRoot, skill.name);
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
    const expectedContent = renderFile(sourceContent, sourceDir, relativePath);

    if (!targetContent.equals(expectedContent)) {
      problems.push(`Drifted mirror file: ${path.join(targetDir, relativePath)}`);
    }
  }

  return problems;
}

const sourceSkills = (await listSourceSkills()).sort((left, right) =>
  left.name.localeCompare(right.name),
);
const sourceSkillNames = sourceSkills.map((skill) => skill.name);
const problems = [];

for (const targetRoot of targetRoots) {
  const targetSkills = await listManagedTargetSkills(targetRoot);
  const staleSkills = targetSkills.filter((skillName) => !sourceSkillNames.includes(skillName));

  for (const skillName of staleSkills) {
    problems.push(`Unexpected mirror directory: ${path.join(targetRoot, skillName)}`);
  }

  for (const skill of sourceSkills) {
    problems.push(...(await checkSkill(targetRoot, skill)));
  }
}

if (problems.length > 0) {
  console.error("Project skill mirror check failed:");
  for (const problem of problems) {
    console.error(`- ${problem}`);
  }
  console.error("\nRun pnpm skills:sync to regenerate host mirrors.");
  process.exit(1);
}

console.log(`Project skill mirrors are in sync (${sourceSkills.length} skills).`);
