import { loadEnvFiles } from "./load-env.mjs";

loadEnvFiles();

const siteUrl = (process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const secret = process.env.OPENWA_WATCHDOG_SECRET;

if (!secret) {
  console.error("Falta OPENWA_WATCHDOG_SECRET en .env.local");
  process.exit(1);
}

const endpoint = `${siteUrl}/api/cron/openwa-watchdog?secret=${encodeURIComponent(secret)}`;

try {
  const response = await fetch(endpoint, { method: "POST" });
  const payload = await response.json();
  if (!response.ok) {
    console.error("Watchdog falló:", payload);
    process.exitCode = 1;
  } else {
    console.log("Watchdog OK:", payload.message ?? payload.action);
  }
} catch (error) {
  console.error("No fue posible llamar al watchdog:", error);
  process.exitCode = 1;
}
