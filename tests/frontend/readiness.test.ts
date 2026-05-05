import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const repoRoot = process.cwd();

test("frontend app code has no console-only user actions", () => {
  const files = listFiles(join(repoRoot, "src", "app"), [".tsx", ".ts"]).concat(
    listFiles(join(repoRoot, "src", "components"), [".tsx", ".ts"])
  );

  const offenders = files.filter((file) => readFileSync(file, "utf8").includes("console.log"));

  assert.deepEqual(offenders, []);
});

test("dashboard shell enforces a frontend session before rendering protected content", () => {
  const source = readFileSync(join(repoRoot, "src", "components", "DashboardLayout.tsx"), "utf8");

  assert.match(source, /readFrontendSession/);
  assert.match(source, /router\.replace\(`\/login\?next=/);
  assert.match(source, /activeSession\.role !== role/);
  assert.match(source, /clearFrontendSession/);
});

test("auth pages create frontend sessions and route users to role dashboards", () => {
  const login = readFileSync(join(repoRoot, "src", "app", "login", "page.tsx"), "utf8");
  const register = readFileSync(join(repoRoot, "src", "app", "register", "page.tsx"), "utf8");

  assert.match(login, /saveFrontendSession/);
  assert.match(login, /dashboardPathForRole/);
  assert.match(register, /saveRegisteredUser/);
  assert.match(register, /saveFrontendSession/);
  assert.match(register, /dashboardPathForRole/);
});

test("artist artwork creation uses the pricing API instead of local pricing math", () => {
  const source = readFileSync(
    join(repoRoot, "src", "app", "dashboard", "artist", "artworks", "create", "page.tsx"),
    "utf8"
  );

  assert.match(source, /fetch\("\/api\/pricing"/);
  assert.doesNotMatch(source, /Mock AI pricing logic/);
});

test("virtual room exposes realistic controls and non-canvas review mode", () => {
  const source = readFileSync(join(repoRoot, "src", "app", "virtual-room", "page.tsx"), "utf8");
  const dataSource = readFileSync(join(repoRoot, "src", "lib", "frontend", "virtual-room-data.ts"), "utf8");

  assert.match(source, /ACESFilmicToneMapping/);
  assert.match(source, /createEnvironmentTexture/);
  assert.match(source, /createArtworkCanvas/);
  assert.match(source, /fixed bottom-5 right-5/);
  assert.match(source, /fixed bottom-20 left-5/);
  assert.match(source, /Show accessible artwork list/);
  assert.ok(source.includes("accessible artwork list"));
  assert.match(source, /RenewCanvas Africa/);
  assert.match(dataSource, /fallbackColor/);
});

function listFiles(root: string, extensions: string[]): string[] {
  return readdirSync(root).flatMap((entry) => {
    const fullPath = join(root, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      return listFiles(fullPath, extensions);
    }

    return extensions.some((extension) => fullPath.endsWith(extension)) ? [fullPath] : [];
  });
}
