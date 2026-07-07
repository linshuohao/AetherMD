#!/usr/bin/env node
import { execSync, spawn } from "node:child_process";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REACT_PORT = process.env.E2E_PORT ?? "4173";

const children = [];

function killPort(port) {
  try {
    execSync(`fuser -k ${port}/tcp`, { stdio: "ignore" });
  } catch {
    // Port already free.
  }
}

function spawnDev(filter, port) {
  const child = spawn("pnpm", ["--filter", filter, "dev", "--host", "127.0.0.1", "--port", port], {
    cwd: repoRoot,
    stdio: "inherit",
    shell: false,
  });
  children.push(child);
  return child;
}

function waitForUrl(url, timeoutMs) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const request = http.get(url, (response) => {
        response.resume();
        resolve();
      });
      request.on("error", () => {
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`Timed out waiting for ${url}`));
          return;
        }
        setTimeout(attempt, 250);
      });
    };
    attempt();
  });
}

function shutdown(code = 0) {
  for (const child of children) {
    child.kill("SIGTERM");
  }
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

killPort(REACT_PORT);

spawnDev("@aether-md/example-react", REACT_PORT);

try {
  await waitForUrl(`http://127.0.0.1:${REACT_PORT}/`, 120_000);
} catch (error) {
  console.error(error);
  shutdown(1);
}

await new Promise(() => {});
