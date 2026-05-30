import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const openWaDir = path.join(process.cwd(), "docker", "openwa");
const dockerfilePath = path.join(openWaDir, "Dockerfile");

if (fs.existsSync(dockerfilePath)) {
  console.log("OpenWA ya está listo en docker/openwa");
  process.exit(0);
}

if (fs.existsSync(openWaDir)) {
  console.log("Limpiando carpeta docker/openwa incompleta...");
  fs.rmSync(openWaDir, { recursive: true, force: true });
}

console.log("Clonando OpenWA en docker/openwa (solo la primera vez)...");
fs.mkdirSync(path.dirname(openWaDir), { recursive: true });

execSync("git clone --depth 1 https://github.com/rmyndharis/OpenWA.git docker/openwa", {
  stdio: "inherit",
});

console.log("OpenWA clonado correctamente.");
