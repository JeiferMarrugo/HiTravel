import { execSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

function run(command) {
  return execSync(command, { encoding: "utf8" }).trim();
}

function runInherit(command) {
  execSync(command, { stdio: "inherit" });
}

function defaultCommitMessage() {
  const stamp = new Date().toLocaleString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `Sync local changes (${stamp})`;
}

function resolveCommitMessage() {
  const fromEnv = process.env.COMMIT_MESSAGE?.trim();
  if (fromEnv) {
    return fromEnv;
  }

  const fromArgs = process.argv.slice(2).join(" ").trim();
  if (fromArgs) {
    return fromArgs;
  }

  return defaultCommitMessage();
}

function getCurrentBranch() {
  return run("git rev-parse --abbrev-ref HEAD");
}

function hasChanges() {
  return run("git status --porcelain").length > 0;
}

function assertSafeToCommit() {
  const blockedPatterns = [
    /^\.env\.local$/i,
    /^\.env\.docker$/i,
    /^\.env$/i,
  ];

  const staged = run("git diff --cached --name-only");
  if (!staged) {
    return;
  }

  const blocked = staged
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((file) => blockedPatterns.some((pattern) => pattern.test(file)));

  if (blocked.length) {
    console.error("\nBloqueado: no se suben archivos con secretos:");
    for (const file of blocked) {
      console.error(`  - ${file}`);
    }
    process.exit(1);
  }
}

try {
  run("git rev-parse --is-inside-work-tree");
} catch {
  console.error("Este directorio no es un repositorio git.");
  process.exit(1);
}

if (!hasChanges()) {
  console.log("No hay cambios para subir.");
  process.exit(0);
}

const branch = getCurrentBranch();
const message = resolveCommitMessage();

console.log(`\n--- git autopush (${branch}) ---\n`);
console.log(`Mensaje: ${message}\n`);

runInherit("git add -A");
assertSafeToCommit();

const msgFile = join(tmpdir(), `hitravel-commit-${Date.now()}.txt`);
writeFileSync(msgFile, message, "utf8");

try {
  runInherit(`git commit -F "${msgFile}"`);
} catch {
  console.error("\nEl commit falló. Revisa el mensaje de git arriba.");
  process.exit(1);
} finally {
  try {
    unlinkSync(msgFile);
  } catch {
    // ignore
  }
}

try {
  runInherit(`git push -u origin ${branch}`);
} catch {
  console.error("\nEl push falló. Verifica tu conexión y permisos en GitHub.");
  process.exit(1);
}

console.log("\nListo. Cambios subidos a origin/" + branch + ".\n");
