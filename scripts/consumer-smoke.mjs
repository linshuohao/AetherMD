#!/usr/bin/env node
/**
 * G8 consumer smoke: pack linked publish-target packages and import main entries
 * from a temporary npm consumer install (ADR 009 / M7).
 */
import { execSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const PACKAGES = [
  { name: "@aether-md/core", shortName: "core", exportName: "createEditor" },
  {
    name: "@aether-md/plugin-remark",
    shortName: "plugin-remark",
    exportName: "createRemarkParserAdapter",
  },
  {
    name: "@aether-md/plugin-prosemirror",
    shortName: "plugin-prosemirror",
    exportName: "createProseMirrorEngineAdapter",
  },
  { name: "@aether-md/preset-gfm", shortName: "preset-gfm", exportName: "createGfmPreset" },
  { name: "@aether-md/react", shortName: "react", exportName: "AetherEditorRoot" },
  { name: "@aether-md/vue", shortName: "vue", exportName: "useAetherEditor" },
];

function run(command, cwd = repoRoot) {
  execSync(command, { cwd, stdio: "inherit", shell: true });
}

function findTarball(packDir, shortName) {
  const prefix = `aether-md-${shortName}-`;
  const match = readdirSync(packDir).find(
    (file) => file.startsWith(prefix) && file.endsWith(".tgz"),
  );
  if (!match) {
    throw new Error(`No tarball found for aether-md-${shortName} in ${packDir}`);
  }
  return match;
}

console.log("consumer-smoke: building workspace...");
run("pnpm build");

const workDir = mkdtempSync(join(tmpdir(), "aether-consumer-smoke-"));
const packDir = join(workDir, "packs");
const consumerDir = join(workDir, "consumer");
mkdirSync(packDir, { recursive: true });
mkdirSync(consumerDir, { recursive: true });

try {
  for (const { name, shortName } of PACKAGES) {
    console.log(`consumer-smoke: packing ${name}...`);
    run(`pnpm --filter ${name} pack --pack-destination "${packDir}"`);
    if (!findTarball(packDir, shortName)) {
      throw new Error(`pack failed for ${name}`);
    }
  }

  writeFileSync(
    join(consumerDir, "package.json"),
    JSON.stringify({ name: "aether-consumer-smoke", private: true, type: "module" }, null, 2),
  );

  const importLines = PACKAGES.map(
    ({ name, exportName }) => `import { ${exportName} } from "${name}";`,
  ).join("\n");
  const checks = PACKAGES.map(
    ({ exportName, shortName }) =>
      `if (typeof ${exportName} !== "function") throw new Error("Expected ${exportName} export from ${shortName}");`,
  ).join("\n");
  writeFileSync(
    join(consumerDir, "smoke.mjs"),
    `${importLines}\n${checks}\nconsole.log("consumer-smoke: all package imports OK");\n`,
  );

  console.log("consumer-smoke: installing packed tarballs via npm...");
  run(
    `npm install ${packDir}/*.tgz react@^19 react-dom@^19 vue@^3 --legacy-peer-deps`,
    consumerDir,
  );

  console.log("consumer-smoke: running import assertions...");
  run("node smoke.mjs", consumerDir);

  console.log("consumer-smoke: PASS");
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
